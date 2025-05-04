import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

const Signup = () => {
  const { user, loading } = useAuth();

  // Redirect if user is already logged in
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RegisterForm />;
};

export default Signup; 