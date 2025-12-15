import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import Navigation from '../../components/Navigation';
import api from '../../utils/api';
import '../../styles/user-profile.css';

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!id) return;
    
    async function fetchUserProfile() {
      try {
        const profileResponse = await api.get(`/api/users/${id}/`);
        const tripsResponse = await api.get(`/api/users/${id}/trips/`);
        
        setProfile(profileResponse.data);
        setTrips(tripsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [id]);
  
  if (loading) {
    return (
      <div>
        <Navigation />
        <Container className="py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div>
        <Navigation />
        <Container className="py-5 text-center">
          <p>User not found</p>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="user-profile-container">
      <Head>
        <title>{profile.name || profile.username} | travelwithghost™</title>
      </Head>
      
      <Navigation />
      
      <div className="user-profile-header">
        <Container>
          <h1>{profile.profile?.name || profile.username}</h1>
          <p className="lead">
            {profile.profile?.profession || 'Adventure Seeker'}
          </p>
        </Container>
      </div>
      
      <Container className="py-5">
        <Row>
          <Col lg={4}>
            <Card className="profile-card animate-slide-in">
              <Card.Body className="text-center p-4">
                <div className="profile-photo-container">
                  <Image 
                    src={profile.profile?.photos || '/default-avatar.svg'} 
                    alt={profile.profile?.name || profile.username}
                    width={150}
                    height={150}
                    className="profile-photo"
                    style={{ objectFit: 'cover', backgroundColor: '#E2E8F0' }}
                  />
                </div>
                
                <h2 className="profile-name">{profile.profile?.name || profile.username}</h2>
                {profile.profile?.current_location && (
                  <p className="profile-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {profile.profile.current_location}
                  </p>
                )}
              </Card.Body>
            </Card>
            
            <Card className="profile-card mt-4 animate-slide-in">
              <Card.Body className="profile-info">
                <h5 className="mb-4">About</h5>
                
                {profile.profile?.age && (
                  <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{profile.profile.age} years</span>
                  </div>
                )}
                
                {profile.profile?.gender && (
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{profile.profile.gender}</span>
                  </div>
                )}
                
                {profile.profile?.profession && (
                  <div className="info-item">
                    <span className="info-label">Profession</span>
                    <span className="info-value">{profile.profile.profession}</span>
                  </div>
                )}
                
                <div className="info-item">
                  <span className="info-label">Member since</span>
                  <span className="info-value">
                    {new Date(profile.date_joined).toLocaleDateString()}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={8}>
            <div className="trips-section animate-slide-in">
              <div className="section-title mb-4 pb-2 border-bottom">
                <h3 className="mb-0">Trip History</h3>
              </div>
              {trips.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="fas fa-map-marked-alt"></i>
                  </div>
                  <h3 className="mb-3">No trips yet</h3>
                  <p className="empty-state-text">
                    {profile.profile?.name || profile.username} hasn&apos;t created or joined any trips yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Active Trips Section */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4 section-header">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-plane-departure text-primary me-2"></i>
                        <h4 className="mb-0">Active Trips</h4>
                      </div>
                      <Badge bg="success" className="ms-2" pill>
                        {trips.filter(trip => new Date(trip.start_date) >= new Date()).length}
                      </Badge>
                    </div>
                    {trips
                      .filter(trip => new Date(trip.start_date) >= new Date())
                      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                      .map(trip => (
                        <div key={trip.id} className="trip-card">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="trip-name">{trip.group_name}</h5>
                              <p className="trip-destination">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {trip.destination.name}
                              </p>
                              <div className="mb-3">
                                <Badge bg="info" className="trip-badge">
                                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                                </Badge>
                                {profile.id === trip.host.id && (
                                  <Badge bg="primary" className="trip-badge ms-2">Host</Badge>
                                )}
                                {new Date(trip.start_date) <= new Date() && new Date(trip.end_date) >= new Date() && (
                                  <Badge bg="warning" className="trip-badge ms-2">In Progress</Badge>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="primary"
                              className="btn-view-trip"
                              onClick={() => router.push(`/trips/${trip.id}`)}
                            >
                              View Trip
                            </Button>
                          </div>
                        </div>
                      ))}
                    {trips.filter(trip => new Date(trip.start_date) >= new Date()).length === 0 && (
                      <p className="text-muted text-center">No active trips</p>
                    )}
                  </div>

                  {/* Past Trips Section */}
                  <div>
                    <div className="d-flex align-items-center mb-4 section-header">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-history text-secondary me-2"></i>
                        <h4 className="mb-0">Past Trips</h4>
                      </div>
                      <Badge bg="secondary" className="ms-2" pill>
                        {trips.filter(trip => new Date(trip.start_date) < new Date()).length}
                      </Badge>
                    </div>
                    {trips
                      .filter(trip => new Date(trip.start_date) < new Date())
                      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
                      .map(trip => (
                        <div key={trip.id} className="trip-card">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="trip-name">{trip.group_name}</h5>
                              <p className="trip-destination">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {trip.destination.name}
                              </p>
                              <div className="mb-3">
                                <Badge bg="secondary" className="trip-badge">
                                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                                </Badge>
                                {profile.id === trip.host.id && (
                                  <Badge bg="primary" className="trip-badge ms-2">Host</Badge>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="outline-secondary"
                              className="btn-view-trip"
                              onClick={() => router.push(`/trips/${trip.id}`)}
                            >
                              View Trip
                            </Button>
                          </div>
                        </div>
                      ))}
                    {trips.filter(trip => new Date(trip.start_date) < new Date()).length === 0 && (
                      <p className="text-muted text-center">No past trips</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}