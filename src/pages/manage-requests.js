import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Container, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function ManageRequests() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/manage-requests');
      return;
    }
    
    async function fetchRequests() {
      try {
        const response = await api.get('/api/trip-requests/');
        setRequests(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError('Failed to load join requests');
        setLoading(false);
      }
    }

    fetchRequests();
  }, [isAuthenticated, router]);
  
  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);
    setError('');
    setSuccess('');
    
    try {
      await api.post(`/api/trip-requests/${requestId}/${action}/`);
      
      // Update the local state
      setRequests(requests.filter(req => req.id !== requestId));
      setSuccess(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      setError(`Failed to ${action} request. Please try again.`);
    }
    
    setActionLoading(null);
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
    <div>
      <Head>
        <title>Manage Join Requests | travelwithghost™</title>
      </Head>
      
      <Navigation />
      
      <Container className="py-5">
        <h2 className="mb-4">Manage Join Requests</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {requests.length === 0 ? (
          <Card className="shadow-sm">
            <Card.Body className="text-center p-5">
              <p className="mb-0">No pending join requests</p>
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Trip</th>
                    <th>Requested On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id}>
                      <td>
                        <div>{request.user.name || request.user.username}</div>
                        <small className="text-muted">{request.user.email}</small>
                      </td>
                      <td>
                        <div>{request.trip.group_name}</div>
                        <small className="text-muted">
                          {new Date(request.trip.start_date).toLocaleDateString()} to {new Date(request.trip.end_date).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex">
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleAction(request.id, 'approve')}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleAction(request.id, 'reject')}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? 'Processing...' : 'Reject'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
}