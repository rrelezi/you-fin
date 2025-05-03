import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('parent'); // Default role is parent
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize axios with credentials
  axios.defaults.withCredentials = true;
  const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Updated to use port 8002 directly
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/me');
      
      // Handle different response formats
      if (data.data && data.data.user) {
        // Old format: { data: { user: {...} } }
        setUser(data.data.user);
        // Set role if provided, otherwise default to 'parent'
        setUserRole(data.data.user.role || 'parent');
      } else if (data.user) {
        // New format: { user: {...} }
        setUser(data.user);
        // Set role if provided, otherwise default to 'parent'
        setUserRole(data.user.role || 'parent');
      } else {
        console.error('Invalid auth response format:', data);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setError(null);
      
      // Show loading state
      setLoading(true);
      
      // Add username derived from firstName and lastName if not provided
      if (!formData.username) {
        const baseUsername = `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`;
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        formData.username = `${baseUsername}${randomSuffix}`;
      }
      
      console.log("Registering user with data:", { ...formData, password: "[REDACTED]" });
      
      const { data } = await api.post('/auth/register', formData);
      
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Set user data from response
      if (data.data && data.data.user) {
        setUser(data.data.user);
        
        // Set token if provided
        if (data.data.token) {
          localStorage.setItem('token', data.data.token);
        }
        
        navigate('/dashboard');
      }
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      console.error("Registration error:", errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/login', formData);
      
      // Check if response requires 2FA
      if (data.requires2FA) {
        return {
          requires2FA: true,
          userId: data.userId
        };
      }
      
      // Handle normal login response
      if (data.user) {
        setUser(data.user);
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        navigate('/dashboard');
      } else {
        console.error('Login response missing user data:', data);
        setError('Invalid server response. Please try again.');
        throw new Error('Invalid server response structure');
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      // Clean up
      setUser(null);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server call fails, clear local state
      setUser(null);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email');
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset failed');
      throw error;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const { data } = await api.put('/auth/update-password', {
        currentPassword,
        newPassword
      });
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Password update failed');
      throw error;
    }
  };

  const validate2FAToken = async (userId, token) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/validate-2fa', { userId, token });
      
      // Successfully authenticated with 2FA
      if (data.success) {
        // Save token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Set user if provided
        if (data.user) {
          setUser(data.user);
          navigate('/dashboard');
        }
      } else {
        throw new Error(data.message || 'Failed to validate 2FA token');
      }
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to validate 2FA token';
      console.error('2FA validation error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const generate2FASecret = async () => {
    try {
      setError(null);
      const { data } = await api.post('/auth/2fa/generate');
      
      if (data.success && data.data) {
        return data.data;
      } else if (data.status === 'success' && data.data) {
        // Handle old format
        return data.data;
      } else {
        console.error('Invalid 2FA secret response:', data);
        throw new Error('Failed to generate 2FA secret');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate 2FA secret';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verify2FA = async (token) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/2fa/verify', { token });
      
      if (data.success) {
        return data;
      } else if (data.status === 'success') {
        // Handle old format
        return data;
      } else {
        console.error('Invalid 2FA verification response:', data);
        throw new Error('Failed to verify 2FA token');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Invalid verification code';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const disable2FA = async (token) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/2fa/disable', { token });
      
      if (data.success) {
        return data;
      } else if (data.status === 'success') {
        // Handle old format
        return data;
      } else {
        console.error('Invalid disable 2FA response:', data);
        throw new Error('Failed to disable 2FA');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Invalid verification code';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Switch user role (for development and testing purposes)
  const switchUserRole = (role) => {
    if (role === 'parent' || role === 'youth') {
      setUserRole(role);
      // If user exists, update their role
      if (user) {
        setUser({
          ...user,
          role
        });
      }
      // Redirect to the dashboard after role change
      navigate('/dashboard');
    } else {
      console.error('Invalid role:', role);
    }
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
    validate2FAToken,
    generate2FASecret,
    verify2FA,
    disable2FA,
    switchUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 