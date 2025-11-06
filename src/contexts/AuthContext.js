// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          api.defaults.headers.common['Authorization'] = `Token ${token}`;
          const response = await api.get('/api/auth/user/');
          setUser(response.data);
          console.log("success user:",response.data)
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }
      
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login/', {username: email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      setUser(user);
      return user;
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Login failed.';
      
      if (errorData) {
        if (errorData.non_field_errors) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const register = async (email, password1, password2) => {
    try {
      const response = await api.post('/api/auth/register/', {
        email,
        username: email,
        password1,
        password2
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      setUser(user);
      return user;
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Registration failed.';
      
      if (errorData) {
        if (errorData.email) {
          errorMessage = 'This email is already registered. Please use a different email or login.';
        } else if (errorData.password1) {
          errorMessage = Array.isArray(errorData.password1) 
            ? errorData.password1[0]
            : 'Password must be at least 8 characters and include numbers and letters.';
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : 'Please check your registration details.';
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const googleLogin = async (accessToken) => {
    const response = await api.post('/api/auth/google/', { access_token: accessToken });
    
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
    
    setUser(user);
    return user;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout,
        googleLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
