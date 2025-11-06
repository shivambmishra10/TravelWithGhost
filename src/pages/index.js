// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Navigation from '../components/Navigation';
import api from '../utils/api';
import '../styles/landing.css';

export default function Home() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCities() {
      try {
        const response = await api.get('/api/cities/');
        setCities(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setLoading(false);
      }
    }

    fetchCities();
  }, []);

  return (
    <div>
      <Head>
        <title>travelwithghost™ - Find Travel Buddies</title>
        <meta name="description" content="Find travel buddies for your next adventure" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      {/* Hero Section */}
      <div className="bg-primary text-white py-5" style={{ 
        background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">Discover New Places With New Friends</h1>
              <p className="lead mb-4">Join travel groups to your favorite destinations and create unforgettable memories with like-minded travelers.</p>
              <div className="d-flex gap-3">
                <Link href="/trips/create">
                  <Button variant="outline-light" size="lg" className="px-4">
                    Create New Trip
                  </Button>
                </Link>
                <Link href="#destinations">
                  <Button variant="light" size="lg" className="px-4">
                    Explore Destinations
                  </Button>
                </Link>
              </div>
            </Col>
            <Col lg={6}>
              <div className="position-relative">
                <Image 
                  src="http://localhost:8000/media/travel-traveling-symbolic-picture-vacation-background-4_1032298-2456.avif" 
                  alt="Travel Adventure" 
                  width={800}
                  height={500}
                  className="rounded-3 shadow-lg"
                  style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <div className="py-5">
        <Container>
        <h2 className="text-center mb-5" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "2.4rem", fontWeight: "500" }}>
  Why Choose <span style={{ fontFamily: "'Comic Neue', cursive", fontWeight: "700", color: "#1E88E5" }}>travelwithghost™</span>?
</h2>

          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-4 mb-3">🌍</div>
                  <h3 className="h5">Explore New Places</h3>
                  <p className="text-muted">Discover amazing destinations and connect with fellow travelers.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-4 mb-3">👥</div>
                  <h3 className="h5">Meet Travel Buddies</h3>
                  <p className="text-muted">Find like-minded travelers and create lasting friendships.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-4 mb-3">🎯</div>
                  <h3 className="h5">Plan Together</h3>
                  <p className="text-muted">Collaborate on itineraries and make your travel dreams come true.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Destinations Section */}
      <div id="destinations" className="py-5 bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-5">
            <h2>Popular Destinations</h2>
            <Link href="/trips/create">
              <Button variant="outline-primary">Create Your Own Trip</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Row className="g-4">
              {cities.map((city) => (
                <Col key={city.id} md={4} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm overflow-hidden">
                    <div className="position-relative">
                      <Card.Img 
                        variant="top" 
                        src={`http://localhost:8000${city.image}`} 
                        alt={city.name}
                        style={{ height: '250px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute bottom-0 start-0 w-100 p-3" 
                           style={{ 
                             background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                             color: 'white'
                           }}>
                        <h3 className="h4 mb-0">{city.name}</h3>
                      </div>
                    </div>
                    <Card.Body className="p-3">
                      <Link href={`/cities/${city.id}`}>
                        <Button variant="outline-primary" className="w-100">
                          View Trips
                        </Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
    </div>
  );
}
