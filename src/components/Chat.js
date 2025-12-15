// components/Chat.js
import { useState, useEffect, useRef } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import '../styles/chat.css';

const Chat = ({ tripId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesResponse, tripResponse] = await Promise.all([
          api.get(`/api/trips/${tripId}/chat/`),
          api.get(`/api/trips/${tripId}/`)
        ]);
        
        setMessages(messagesResponse.data);
        setTrip(tripResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Unable to load chat messages. Please refresh the page.');
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling for new messages
    const intervalId = setInterval(() => {
      api.get(`/api/trips/${tripId}/chat/`)
        .then(response => setMessages(response.data))
        .catch(error => console.error('Error fetching messages:', error));
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [tripId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      const response = await api.post(`/api/trips/${tripId}/chat/`, {
        message: newMessage
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(''), 3000); // Clear error after 3 seconds
    } finally {
      setSending(false);
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // If less than 24 hours ago
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    // If less than 7 days ago
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Otherwise show date
    return date.toLocaleDateString([], { 
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card className="chat-card">
      {trip && (
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-group-info">
              <div className="chat-group-name">{trip.group_name}</div>
              <div className="chat-group-meta">
                <i className="fas fa-map-marker-alt me-1"></i>
                {trip.destination.name}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="chat-messages">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-comments"></i>
            </div>
            <h3 className="mb-3">No messages yet</h3>
            <p>Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-item ${msg.user.id === user.id ? 'sent' : 'received'}`}
              >
                {msg.user.id !== user.id && (
                  <div className="message-sender">
                    {msg.user.name || msg.user.username}
                  </div>
                )}
                <div className={`message-bubble ${msg.user.id === user.id ? 'sent' : 'received'}`}>
                  {msg.message}
                </div>
                <div className={`message-meta ${msg.user.id === user.id ? 'sent' : 'received'}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="chat-input-container">
        <Form onSubmit={handleSubmit} className="chat-form">
          <Form.Control
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
            disabled={sending}
          />
          <Button 
            type="submit" 
            className="send-button"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Sending...</span>
              </div>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </Form>
      </div>
    </Card>
  );
};

export default Chat;