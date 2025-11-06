// pages/trips/create.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import '../../styles/create-trip.css';

export default function CreateTrip() {
  const router = useRouter();
  const { city: cityId } = router.query;
  const { isAuthenticated } = useAuth();
  
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [itineraryDays, setItineraryDays] = useState(1);
  const [dateError, setDateError] = useState(false);
  const [formData, setFormData] = useState({
    group_name: '',
    destination: '',
    start_date: '',
    end_date: '',
    description: '',
    min_age: 18,
    max_age: 65,
    required_members: 2,
    itinerary: [{ day: 1, description: '' }]
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/trips/create');
      return;
    }
    
    async function fetchCities() {
      try {
        const response = await api.get('/api/cities/');
        setCities(response.data);
        
        if (cityId) {
          setFormData(prev => ({ ...prev, destination: cityId }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setLoading(false);
      }
    }

    fetchCities();
  }, [isAuthenticated, router, cityId]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔹 Updating form state
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };

      // 🔹 Check if end_date is less than start_date
      if (name === 'start_date' || name === 'end_date') {
        if (newFormData.start_date && newFormData.end_date) {
          setDateError(newFormData.start_date > newFormData.end_date);
        }
      }

      return newFormData;
    });
  };
  
  const handleItineraryChange = (day, value) => {
    const updatedItinerary = [...formData.itinerary];
    const index = updatedItinerary.findIndex(item => item.day === day);
    
    if (index !== -1) {
      updatedItinerary[index].description = value;
    } else {
      updatedItinerary.push({ day, description: value });
    }
    
    setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
  };

  const addItineraryDay = () => {
    setItineraryDays(prev => prev + 1);
  };

  const removeItineraryDay = () => {
    if (itineraryDays > 1) {
      setItineraryDays(prev => prev - 1);
      
      // Remove the last day from itinerary
      setFormData(prev => ({
        ...prev,
        itinerary: prev.itinerary.filter(item => item.day !== itineraryDays)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateError) return;
    setSubmitting(true);
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      alert("End date must be after start date.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/api/create-trip/', formData);
      router.push(`/trips/${response.data.id}`);
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Failed to create trip. Please try again.';
      
      if (errorData) {
        if (errorData.group_name) {
          errorMessage = 'Please provide a valid group name.';
        } else if (errorData.destination) {
          errorMessage = 'Please select a valid destination.';
        } else if (errorData.required_members) {
          errorMessage = 'Please specify a valid number of required members.';
        } else if (errorData.itinerary) {
          errorMessage = 'Please provide valid itinerary details.';
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }
      
      setError(errorMessage);
      setSubmitting(false);
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

  return (
    <div className="create-trip-container">
      <Head>
        <title>Create New Trip | travelwithghost™</title>
      </Head>

      <Navigation />

      <Container className="py-5">
        <Card className="create-trip-card animate-slide-in">
          <div className="create-trip-header">
            <h2>Create a New Trip</h2>
          </div>
          
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Group Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="group_name"
                      value={formData.group_name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Backpacking Adventure"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Destination</Form.Label>
                    <Form.Select
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a destination</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                {/* 🔹 End Date with Error Highlight */}
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                      style={{ borderColor: dateError ? 'red' : '' }} // 🔹 Highlights in red if invalid
                    />
                    {dateError && (
                      <small style={{ color: 'red' }}>
                        End date must be after start date.
                      </small>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-4">
                <Form.Label>Trip Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your trip plan, activities, and what makes this trip special..."
                />
              </Form.Group>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Minimum Age</Form.Label>
                    <Form.Control
                      type="number"
                      name="min_age"
                      value={formData.min_age}
                      onChange={handleChange}
                      required
                      min="18"
                      max="100"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Maximum Age</Form.Label>
                    <Form.Control
                      type="number"
                      name="max_age"
                      value={formData.max_age}
                      onChange={handleChange}
                      required
                      min="18"
                      max="100"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Required Members</Form.Label>
                    <Form.Control
                      type="number"
                      name="required_members"
                      value={formData.required_members}
                      onChange={handleChange}
                      required
                      min="2"
                      max="20"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="itinerary-section">
                <div className="itinerary-header">
                  <h3 className="mb-0">Trip Itinerary</h3>
                  <div className="itinerary-controls">
                    <Button
                      variant="outline-primary"
                      onClick={addItineraryDay}
                      disabled={itineraryDays >= 7}
                    >
                      Add Day
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={removeItineraryDay}
                      disabled={itineraryDays <= 1}
                    >
                      Remove Day
                    </Button>
                  </div>
                </div>

                {[...Array(itineraryDays)].map((_, index) => (
                  <div key={index + 1} className="itinerary-day">
                    <Form.Group>
                      <Form.Label>Day {index + 1}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.itinerary.find(item => item.day === index + 1)?.description || ''}
                        onChange={(e) => handleItineraryChange(index + 1, e.target.value)}
                        placeholder={`Describe the activities for Day ${index + 1}...`}
                      />
                    </Form.Group>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <Button
                  variant="outline-primary"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting|| dateError}
                >
                  {submitting ? 'Creating...' : 'Create Trip'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}