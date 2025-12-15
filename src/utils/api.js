import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
});

// Add token to requests if it exists in localStorage (client-side only)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  }
}

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired/invalid)
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?redirect=${window.location.pathname}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;