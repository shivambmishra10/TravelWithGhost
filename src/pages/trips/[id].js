// pages/trips/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert } from 'react-bootstrap';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import '../../styles/trip-details.css';

export default function TripDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinRequestStatus, setJoinRequestStatus] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    async function fetchTripDetails() {
      try {
        const tripResponse = await api.get(`/api/trips/${id}/`);
        setTrip(tripResponse.data);
        
        if (isAuthenticated) {
          const statusResponse = await api.get(`/api/trips/${id}/join-status/`);
          setJoinRequestStatus(statusResponse.data.status);
          
          // If user is host, fetch pending requests
          if (user.id === tripResponse.data.host.id) {
            const requestsResponse = await api.get(`/api/trips/${id}/pending-requests/`);
            setPendingRequests(requestsResponse.data);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trip details:', error);
        setError('Failed to load trip details');
        setLoading(false);
      }
    }

    fetchTripDetails();
  }, [id, isAuthenticated, user]);

  const handleJoinRequest = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/trips/${id}`);
      return;
    }
    
    setSubmitLoading(true);
    setError('');
    
    try {
      await api.post(`/api/trips/${id}/join-request/`);
      setJoinRequestStatus('pending');
    } catch (error) {
      console.error('Error sending join request:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Failed to send join request. Please try again.';
      
      if (errorData) {
        if (errorData.age_restriction) {
          errorMessage = 'You do not meet the age requirements for this trip.';
        } else if (errorData.already_member) {
          errorMessage = 'You are already a member of this trip.';
        } else if (errorData.trip_full) {
          errorMessage = 'This trip is already full.';
        } else if (errorData.pending_request) {
          errorMessage = 'You already have a pending request for this trip.';
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      
      await api.post(`/api/trip-requests/${requestId}/approve/`);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error approving request:', error.response?.status, error.response?.data);
    }
  };

  const handleReject = async (requestId) => {
    try {
      
      await api.post(`/api/trip-requests/${requestId}/reject/`);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error.response?.status, error.response?.data);
    }
  };

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

  if (!trip) {
    return (
      <div>
        <Navigation />
        <Container className="py-5 text-center">
          <p>Trip not found</p>
        </Container>
      </div>
    );
  }

  const isMember = isAuthenticated && (
    user.id === trip.host.id || 
    trip.members.some(member => member.id === user.id)
  );

  return (
    <div className="trip-container">
      <Head>
        <title>{trip.group_name} | travelwithghost&trade;</title>
      </Head>

      <Navigation />

      <Container className="py-5">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Row>
          <Col lg={8}>
            <Card className="trip-card animate-slide-in">
              <div className="trip-header">
                <h2>{trip.group_name}</h2>
                <div className="d-flex gap-2 mt-3">
                  <span className="trip-badge">
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                  <span className="trip-badge">
                    {trip.destination.name}
                  </span>
                </div>
              </div>
              
              <Card.Body className="p-4">
                <div className="trip-stats">
                  <div className="stat-item">
                    <div className="stat-value">{trip.current_members_count}/{trip.required_members}</div>
                    <div className="stat-label">Members</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{trip.min_age}-{trip.max_age}</div>
                    <div className="stat-label">Age Range</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{trip.itinerary_items.length}</div>
                    <div className="stat-label">Days</div>
                  </div>
                </div>

                <h5 className="mb-3">Description</h5>
                <p className="trip-description">{trip.description}</p>

                <div className="itinerary-section">
                  <h5 className="mb-4">Trip Itinerary</h5>
                  {trip.itinerary_items.map((item) => (
                    <div key={item.id} className="itinerary-item">
                      <strong>Day {item.day}:</strong> {item.description}
                    </div>
                  ))}
                </div>

                {isMember && (
                  <div className="mt-4">
                    <Link href={`/trips/${id}/chat`}>
                      <Button variant="success" className="w-100">
                        Open Group Chat
                      </Button>
                    </Link>
                  </div>
                )}

                {!isMember && (
                  <div className="mt-4">
                    {joinRequestStatus === 'pending' && (
                      <Alert variant="info">
                        Your request to join this trip is pending approval.
                      </Alert>
                    )}
                    {joinRequestStatus === 'accepted' && (
                      <Alert variant="success">
                        You&apos;ve been accepted to this trip!
                      </Alert>
                    )}
                    {joinRequestStatus === 'rejected' && (
                      <Alert variant="danger">
                        Your request to join this trip was declined.
                      </Alert>
                    )}
                    {!joinRequestStatus && (
                      <Button 
                        variant="primary" 
                        className="w-100"
                        onClick={handleJoinRequest}
                        disabled={submitLoading}
                      >
                        {submitLoading ? 'Processing...' : 'Request to Join Trip'}
                      </Button>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="trip-card mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Trip Details</h5>
                <div className="mb-4">
                  <strong>Host:</strong>{' '}
                  <Link href={`/users/${trip.host.id}`} className="text-decoration-none">
                    {trip.host.profile?.name || trip.host.username}
                  </Link>
                </div>
                <div className="mb-4">
                  <strong>Members:</strong> {trip.current_members_count}/{trip.required_members}
                </div>
                <div className="mb-4">
                  <strong>Age Criteria:</strong> {trip.min_age} - {trip.max_age} years
                </div>
              </Card.Body>
            </Card>

            <Card className="trip-card">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h5 className="mb-0">Group Members</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="members-section">
                  <div className="member-item">
                    <Link href={`/users/${trip.host.id}`} className="d-flex align-items-center text-decoration-none">
                      <div className="d-flex align-items-center">
                        <div className="member-avatar">
                          <Image
                            src={trip.host.profile?.photos || '/default-avatar.svg'}
                            alt={trip.host.profile?.name || trip.host.username}
                            width={40}
                            height={40}
                            className="rounded-circle"
                            style={{ objectFit: 'cover', backgroundColor: '#E2E8F0' }}
                          />
                        </div>
                        <div className="ms-2">
                          <div className="fw-bold">{trip.host.profile?.name}</div>
                          {!trip.host.profile?.is_profile_complete && (
                            <small className="text-muted">Profile not completed</small>
                          )}
                        </div>
                      </div>
                      <Badge bg="primary" className="ms-2">Host</Badge>
                    </Link>
                  </div>
                  {trip.members.map((member) => (
                    <div key={member.id} className="member-item">
                      <Link href={`/users/${member.id}`} className="d-flex align-items-center text-decoration-none">
                        <div className="member-avatar">
                          <Image
                            src={member.profile?.photos || '/default-avatar.svg'}
                            alt={member.profile?.name || member.username}
                            width={40}
                            height={40}
                            className="rounded-circle"
                            style={{ objectFit: 'cover', backgroundColor: '#E2E8F0' }}
                          />
                        </div>
                        <div className="ms-2">
                          <div>{member.profile?.name}</div>
                          {!member.profile?.is_profile_complete && (
                            <small className="text-muted">Profile not completed</small>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {isMember && pendingRequests.length > 0 && (
              <Card className="trip-card mt-4">
                <Card.Header className="bg-white border-0 p-4 pb-0">
                  <h5 className="mb-0">Pending Requests</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="members-section">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="member-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <Link href={`/users/${request.user.id}`} className="text-decoration-none">
                              {request.user.profile?.name || request.user.username}
                            </Link>
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(request.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
