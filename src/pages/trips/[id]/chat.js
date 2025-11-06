import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Button } from 'react-bootstrap';
import Navigation from '../../../components/Navigation';
import Chat from '../../../components/Chat';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import '../../../styles/chat.css';

export default function TripChat() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!id || !isAuthenticated) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=/trips/${id}/chat`);
      }
      return;
    }
    
    async function fetchTripDetails() {
      try {
        const response = await api.get(`/api/trips/${id}/`);
        setTrip(response.data);
        
        // Check if user is a member of this trip
        const isMember = response.data.host.id === user.id || 
                        response.data.members.some(member => member.id === user.id);
        
        if (!isMember) {
          setError('You are not a member of this trip.');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trip details:', error);
        setError('Failed to load trip details');
        setLoading(false);
      }
    }

    fetchTripDetails();
  }, [id, isAuthenticated, router, user]);
  
  if (loading) {
    return (
      <div className="chat-container">
        <Navigation />
        <Container className="py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="chat-container">
        <Navigation />
        <Container className="py-5">
          <div className="alert alert-danger">{error}</div>
          <div className="text-center mt-3">
            <Link href={`/trips/${id}`}>
              <Button variant="primary">Back to Trip Details</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="chat-container">
        <Navigation />
        <Container className="py-5 text-center">
          <p>Trip not found</p>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="chat-container">
      <Head>
        <title>{trip.group_name} Chat | travelwithghost™</title>
      </Head>
      
      <Navigation />
      
      <Container>
        <div className="d-flex align-items-center mb-3">
          <Link href={`/trips/${id}`} className="me-3">
            <Button variant="link" className="p-0 text-dark">
              <i className="fas fa-arrow-left"></i>
            </Button>
          </Link>
        </div>
        <Chat tripId={id} />
      </Container>
    </div>
  );
}