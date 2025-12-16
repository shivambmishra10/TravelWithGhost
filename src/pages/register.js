import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { redirect } = router.query;
  const { register, googleLogin, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect || '/');
    }
  }, [isAuthenticated, router, redirect]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password1 !== password2) {
      return setError('Passwords do not match. Please try again.');
    }

    if (password1.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    setLoading(true);

    try {
      await register(email, password1, password2);
      router.push(redirect || '/profile');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleError('');
    setLoading(true);
    
    try {
      const idToken = credentialResponse.credential;
      await googleLogin(idToken);
      router.push(redirect || '/profile');
    } catch (error) {
      setGoogleError(error.message || 'Google sign up failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google sign up failed. Please try again.');
  };
  
  return (
    <div>
      <Head>
        <title>Register | travelwithghost™</title>
      </Head>
      
      <Navigation />
      
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">Create an Account</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {googleError && <Alert variant="danger">{googleError}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password1}
                      onChange={(e) => setPassword1(e.target.value)}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      required
                    />
                  </Form.Group>
                  
                  <div className="d-grid mb-3">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                  </div>
                </Form>

                <div className="my-3 text-center position-relative">
                  <span className="bg-white px-2 text-muted" style={{ position: 'relative', zIndex: 1 }}>or</span>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid #ccc', zIndex: 0 }}></div>
                </div>

                <div className="d-grid mb-3">
                  <div className="d-flex justify-content-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      text="signup_with"
                      size="large"
                    />
                  </div>
                </div>
                  
                <div className="text-center">
                  <p>
                    Already have an account?{' '}
                    <Link href={`/login${redirect ? `?redirect=${redirect}` : ''}`}>
                      Login
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}