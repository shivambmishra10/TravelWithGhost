import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { redirect } = router.query;
  const { login, isAuthenticated } = useAuth();
  
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
                  
                  <div className="text-center">
                    <p>
                      Don&apos;t have an account?{' '}
                      <Link href={`/register${redirect ? `?redirect=${redirect}` : ''}`}>
                        Sign Up
                      </Link>
                    </p>
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




// // pages/login.js
// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import Head from 'next/head';
// import Link from 'next/link';
// import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
// import { GoogleLogin } from 'react-google-login';
// import { useAuth } from '../contexts/AuthContext';
// import Navigation from '../components/Navigation';

// export default function Login() {
//   const router = useRouter();
//   const { redirect } = router.query;
//   const { login, googleLogin, isAuthenticated } = useAuth();
  
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Redirect if already logged in
//   if (isAuthenticated) {
//     router.push(redirect || '/');
//     return null;
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
    
//     try {
//       await login(email, password);
//       router.push(redirect || '/');
//     } catch (error) {
//       console.error('Login error:', error);
//       setError('Invalid email or password. Please try again.');
//       setLoading(false);
//     }
//   };

//   const handleGoogleSuccess = async (response) => {
//     setLoading(true);
//     setError('');
    
//     try {
//       await googleLogin(response.accessToken);
//       router.push(redirect || '/');
//     } catch (error) {
//       console.error('Google login error:', error);
//       setError('Google login failed. Please try again.');
//       setLoading(false);
//     }
//   };

//   const handleGoogleFailure = (error) => {
//     console.error('Google login error:', error);
//     setError('Google login failed. Please try again.');
//   };

//   return (
//     <div>
//       <Head>
//         <title>Login | Circulus</title>
//       </Head>

//       <Navigation />

//       <Container className="py-5">
//         <Row className="justify-content-center">
//           <Col md={6} lg={5}>
//             <Card className="shadow-sm">
//               <Card.Body className="p-4">
//                 <h2 className="text-center mb-4">Login</h2>
//                 </Card.Body>
//                 </Card>
//                 </Col>
//                 </Row>
//                 </Container>
//                 </div>
//   )};

  