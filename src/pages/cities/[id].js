// pages/cities/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import '../../styles/trip-details.css';

export default function CityTrips() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();

  const [city, setCity] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinStatus, setJoinStatus] = useState({});
  const [error, setError] = useState('');
  const [showActiveTrips, setShowActiveTrips] = useState(true); // Toggle for active/past trips

  useEffect(() => {
    if (!id) return;
    
    async function fetchCityTrips() {
      try {
        const cityResponse = await api.get(`/api/cities/${id}/`);
        const tripsResponse = await api.get(`/api/cities/${id}/trips/`);
        
        setCity(cityResponse.data);
        setTrips(tripsResponse.data);
        
        // Fetch join status for each trip if user is authenticated
        if (isAuthenticated) {
          const statusPromises = tripsResponse.data.map(trip => 
            api.get(`/api/trips/${trip.id}/join-status/`)
              .then(response => ({
                tripId: trip.id,
                status: response.data.status
              }))
              .catch(error => {
                console.error(`Error fetching status for trip ${trip.id}:`, error);
                return { tripId: trip.id, status: null };
              })
          );
          
          const statuses = await Promise.all(statusPromises);
          const statusMap = {};
          statuses.forEach(({ tripId, status }) => {
            statusMap[tripId] = status;
          });
          console.log(statusMap);
          setJoinStatus(statusMap);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorData = error.response?.data;
        let errorMessage = 'Failed to load trips.';
        
        if (errorData) {
          if (errorData.city_not_found) {
            errorMessage = 'This city could not be found.';
          } else if (errorData.city_inactive) {
            errorMessage = 'This city is currently not available for trips.';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    }

    fetchCityTrips();
  }, [id, isAuthenticated]);

  const handleApply = async (tripId) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/cities/${id}`);
      return;
    }
    const trip = trips.find(t => t.id === tripId);
    if (trip && trip.current_members_count >= trip.required_members) {
      return;
    }
    setError('');
    try {
      await api.post(`/api/trips/${tripId}/join-request/`);
      setJoinStatus(prevStatus => ({ ...prevStatus, [tripId]: 'pending' }));
    } catch (error) {
      console.error('Error sending join request:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to send join request. Please try again.');
      }
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

  if (!city) {
    return (
      <div>
        <Navigation />
        <Container className="py-5 text-center">
          <p>City not found</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="trip-container">
      <Head>
        <title>Trips to {city.name} | travelwithghost™</title>
      </Head>

      <Navigation />

      <div className="city-header">
        <Container>
          <h1>Trips to {city.name}</h1>
          <p className="city-description">
            Discover amazing adventures and connect with fellow travelers heading to {city.name}. 
            Join a group trip and make unforgettable memories together.
          </p>
          
          <div className="city-stats">
            <div className="city-stat">
              <div className="city-stat-value">
                {trips.filter(trip => new Date(trip.start_date) >= new Date()).length}
              </div>
              <div className="city-stat-label">Active Trips</div>
            </div>
            <div className="city-stat">
              <div className="city-stat-value">
                {trips.filter(trip => new Date(trip.start_date) < new Date()).length}
              </div>
              <div className="city-stat-label">Past Trips</div>
            </div>
            <div className="city-stat">
              <div className="city-stat-value">
                {trips.reduce((acc, trip) => acc + trip.current_members_count, 0)}
              </div>
              <div className="city-stat-label">Total Travelers</div>
            </div>
          </div>

          <Link href={`/trips/create?city=${city.id}`}>
            <Button variant="light" size="lg" className="mt-3">
              Create Trip to {city.name}
            </Button>
          </Link>
        </Container>
      </div>

      <Container className="py-5">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {trips.length === 0 ? (
          <div className="empty-state animate-slide-in">
            <div className="empty-state-icon">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h3 className="mb-3">No trips available yet</h3>
            <p className="empty-state-text">
              Be the first to create a trip to {city.name} and start your adventure! 
              Connect with fellow travelers and make unforgettable memories together.
            </p>
            <Link href={`/trips/create?city=${city.id}`}>
              <Button variant="primary" size="lg">
                Create First Trip
              </Button>
            </Link>
          </div>
        ) : (
          <div className="trips-section">
            <div className="d-flex justify-content-center mb-4">
              <div className="btn-group" role="group" aria-label="Trip type toggle">
                <Button
                  variant={showActiveTrips ? "primary" : "outline-primary"}
                  onClick={() => setShowActiveTrips(true)}
                >
                  Active Trips ({trips.filter(trip => new Date(trip.start_date) >= new Date()).length})
                </Button>
                <Button
                  variant={!showActiveTrips ? "primary" : "outline-primary"}
                  onClick={() => setShowActiveTrips(false)}
                >
                  Past Trips ({trips.filter(trip => new Date(trip.start_date) < new Date()).length})
                </Button>
              </div>
            </div>

            <div className="trip-grid">
              {trips
                .filter(trip => showActiveTrips 
                  ? new Date(trip.start_date) >= new Date()
                  : new Date(trip.start_date) < new Date()
                )
                .sort((a, b) => showActiveTrips
                  ? new Date(a.start_date) - new Date(b.start_date)
                  : new Date(b.start_date) - new Date(a.start_date)
                )
                .map((trip) => (
                  <Card 
                    key={trip.id} 
                    className={`trip-card animate-slide-in ${showActiveTrips ? 'active-trip' : 'past-trip'}`}
                  >
                    <Card.Body className="p-4">
                      <h3 className="h4 mb-3">{trip.group_name}</h3>
                      <div className="d-flex gap-2 mb-3">
                        <Badge bg={showActiveTrips ? "info" : "secondary"} className="trip-badge">
                          {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                        </Badge>
                        <Badge bg="secondary" className="trip-badge">
                          {trip.current_members_count}/{trip.required_members} Members
                        </Badge>
                      </div>
                      <p className="trip-description mb-4">
                        {trip.description.length > 150 
                          ? `${trip.description.substring(0, 150)}...` 
                          : trip.description}
                      </p>
                      <div className="d-flex gap-2">
                        <Link href={`/trips/${trip.id}`}>
                          <Button 
                            variant={showActiveTrips ? "outline-primary" : "outline-secondary"} 
                            className="flex-grow-1"
                          >
                            View Details
                          </Button>
                        </Link>
                        {showActiveTrips ? (
                          joinStatus[trip.id] === 'member' ? (
                            <Button variant="secondary" disabled className="flex-grow-1">
                              Member
                            </Button>
                          ) :
                          joinStatus[trip.id] === 'host' ? (
                            <Button variant="secondary" disabled className="flex-grow-1">
                              Host Trip
                            </Button>
                          ) :
                          trip.current_members_count >= trip.required_members ? (
                            <Button variant="secondary" disabled className="flex-grow-1">
                              No Slot Available
                            </Button>
                          ) : 
                          joinStatus[trip.id] === 'pending' ? (
                            <Button variant="secondary" disabled className="flex-grow-1">
                              Request Pending
                            </Button>
                          ) : joinStatus[trip.id] === 'rejected' ? (
                            <Button variant="danger" disabled className="flex-grow-1">
                              Rejected
                            </Button>
                          ) : (
                            <Button 
                              variant="primary" 
                              className="flex-grow-1"
                              onClick={() => handleApply(trip.id)}
                            >
                              Apply Now
                            </Button>
                          )
                        ) : (
                          <Button variant="secondary" disabled className="flex-grow-1">
                            Trip Completed
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              {trips.filter(trip => 
                showActiveTrips 
                  ? new Date(trip.start_date) >= new Date()
                  : new Date(trip.start_date) < new Date()
              ).length === 0 && (
                <div className={`empty-state ${showActiveTrips ? 'active-empty-state' : 'past-empty-state'}`}>
                  <div className="empty-state-icon">
                    {showActiveTrips ? (
                      <i className="fas fa-plane-departure"></i>
                    ) : (
                      <i className="fas fa-history"></i>
                    )}
                  </div>
                  <h3 className="mb-3">
                    {showActiveTrips 
                      ? 'No Active Trips' 
                      : 'No Past Adventures Yet'}
                  </h3>
                  <p className="empty-state-text">
                    {showActiveTrips 
                      ? `Be the first to create a trip to ${city.name} and start your adventure!` 
                      : `Stay tuned for completed trips to ${city.name}! Once travelers complete their journeys, you'll find their past adventures here.`}
                  </p>
                  {showActiveTrips && (
                    <Link href={`/trips/create?city=${city.id}`}>
                      <Button variant="primary" size="lg" className="mt-3">
                        Create New Trip
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
