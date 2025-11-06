// pages/profile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import '../styles/profile.css';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    current_location: '',
    age: '',
    gender: '',
    profession: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
      return;
    }
    
    async function fetchProfile() {
      try {
        const response = await api.get('/api/profile/');
        if (response.data) {
          setProfile(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
    // NEW: Function to update photo preview instantly
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file); // Debug log
      
      // Just set the preview - validation will be handled by the server
      setError('');
      setPreviewPhoto(URL.createObjectURL(file));
      
      // Log the selected file
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError('');
    
    try {
      // Basic validation
      if (!profile.name?.trim()) throw new Error('Name is required');
      if (!profile.current_location?.trim()) throw new Error('Current location is required');
      if (!profile.age || profile.age < 18 || profile.age > 100) throw new Error('Please enter a valid age between 18 and 100');
      if (!profile.gender) throw new Error('Please select your gender');

      // Create form data
      const formData = new FormData();
      
      // Handle file if present
      const fileInput = e.target.querySelector('input[type="file"]');
      const file = fileInput?.files[0];
      
      if (file) {
        console.log('File being submitted:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
        formData.append('photos', file);
      }
      
      // Prepare and append other fields
      const fields = {
        name: profile.name?.trim(),
        current_location: profile.current_location?.trim(),
        age: profile.age ? parseInt(profile.age, 10) : '',
        gender: profile.gender,
        profession: profile.profession?.trim()
      };
      
      // Append non-empty values to formData
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      
      // Log the form data being sent
      console.log('Form data being sent:', {
        name: formData.get('name'),
        current_location: formData.get('current_location'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        profession: formData.get('profession'),
        hasPhoto: formData.has('photos')
      });

      const response = await api.post('/api/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (response.data) {
        setProfile(response.data);
        setSuccess(true);
        if (previewPhoto) {
          URL.revokeObjectURL(previewPhoto); // Clean up the preview URL
          setPreviewPhoto(null);
        }
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      console.log('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      // Handle network errors
      if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      // Handle specific HTTP status codes
      else if (error.response.status === 400) {
        const errorData = error.response.data;
        console.log('Server validation errors:', errorData);
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          // Extract all error messages from the response
          const errorMessages = [];
          Object.entries(errorData).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errorMessages.push(`${field}: ${errors[0]}`);
            } else if (typeof errors === 'string') {
              errorMessages.push(`${field}: ${errors}`);
            }
          });
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('\n');
          }
          
          // Specific field errors
          if (errorData.photos) {
            errorMessage = Array.isArray(errorData.photos) 
              ? errorData.photos[0] 
              : 'Invalid image file. Please use a JPG, PNG or JPEG file under 5MB.';
          } else if (errorData.name) {
            errorMessage = Array.isArray(errorData.name)
              ? errorData.name[0]
              : 'Please enter a valid name.';
          } else if (errorData.current_location) {
            errorMessage = 'Please enter a valid location.';
          } else if (errorData.age) {
            errorMessage = 'Please enter a valid age between 18 and 100.';
          } else if (errorData.gender) {
            errorMessage = 'Please select a valid gender option.';
          } else if (errorData.profession) {
            errorMessage = 'Please enter a valid profession (optional).';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
      } else if (error.response.status === 413) {
        errorMessage = 'The uploaded file is too large. Please choose a smaller image (max 5MB).';
      } else if (error.response.status === 415) {
        errorMessage = 'Invalid file type. Please upload only JPG, PNG or JPEG images.';
      } else if (error.response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        // Optionally redirect to login
        router.push('/login?redirect=/profile');
      }
      
      console.log('Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
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
    <div className="profile-container">
      <Head>
        <title>Your Profile | travelwithghost™</title>
      </Head>

      <Navigation />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="profile-card animate-slide-in">
              <div className="profile-header">
                <h2>Your Profile</h2>
              </div>
              
              <Card.Body className="p-4">
                {success && (
                  <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
                    Profile updated successfully!
                  </Alert>
                )}
                
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="profile-photo-section">
                    <div className="profile-photo-container">
                    <div style={{ width: '150px', height: '150px', overflow: 'hidden', position: 'relative' }}>
                      <Image
                        src={previewPhoto || profile.photos || '/default-avatar.svg'}
                        alt="Profile Preview"
                        fill
                        style={{ objectFit: 'cover', backgroundColor: '#E2E8F0' }}
                        className="profile-photo"
                      />
                    </div>
                    </div>
                    <Form.Label className="photo-upload-label">
                      Change Photo
                      <Form.Control
                        type="file"
                        name="photos"
                        accept="image/jpeg,image/png,image/jpg"
                        className="photo-upload-input"
                        onChange={handlePhotoChange}
                      />
                    </Form.Label>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Current Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="current_location"
                      value={profile.current_location}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Goa, India"
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Age</Form.Label>
                        <Form.Control
                          type="number"
                          name="age"
                          value={profile.age}
                          onChange={handleChange}
                          required
                          min="18"
                          max="100"
                          placeholder="Enter your age"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={profile.gender}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Profession</Form.Label>
                    <Form.Control
                      type="text"
                      name="profession"
                      value={profile.profession}
                      onChange={handleChange}
                      placeholder="e.g., Software Engineer"
                    />
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}