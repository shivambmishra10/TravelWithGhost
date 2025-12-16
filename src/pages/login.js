import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  
  const router = useRouter();
  const { redirect } = router.query;
  const { login, googleLogin, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect || '/');
    }
  }, [isAuthenticated, router, redirect]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      router.push(redirect || '/');
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleError('');
    setLoading(true);
    
    try {
      const idToken = credentialResponse.credential;
      await googleLogin(idToken);
      router.push(redirect || '/');
    } catch (error) {
      setGoogleError(error.message || 'Google login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google login failed. Please try again.');
  };
  
  return (
    <div>
      <Head>
        <title>Login | travelwithghost™</title>
      </Head>
      
      <Navigation />
      
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">Login</h2>
                
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
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                      {loading ? 'Logging in...' : 'Login'}
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
                      text="signin_with"
                      size="large"
                    />
                  </div>
                </div>
                  
                <div className="text-center">
                  <p>
                    Don&apos;t have an account?{' '}
                    <Link href={`/register${redirect ? `?redirect=${redirect}` : ''}`}>
                      Sign Up
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