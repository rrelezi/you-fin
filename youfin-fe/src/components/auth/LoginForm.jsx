import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Email, Lock, ArrowForward } from '@mui/icons-material';
import TwoFactorAuth from './TwoFactorAuth';
import { motion } from 'framer-motion';

// Custom components
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import AuthCard from '../ui/AuthCard';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(formData);
      if (response?.requires2FA) {
        setRequires2FA(true);
        setUserId(response.user.id);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.email.includes('@') && formData.password.trim() !== '';
  };

  if (requires2FA) {
    return <TwoFactorAuth userId={userId} onSuccess={() => navigate('/dashboard')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 bg-[#121212]">
      <AuthCard
        title="Welcome Back"
        subtitle="Sign in to your YouFin account"
        error={error}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            autoFocus
            startIcon={<Email fontSize="small" />}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            startIcon={<Lock fontSize="small" />}
            showPassword={showPassword}
            togglePassword={() => setShowPassword(!showPassword)}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              endIcon={<ArrowForward />}
              disabled={!isFormValid()}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-8 space-y-5">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1E1E1E] text-[#B0B0B0]">
                OR
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/forgot-password">
              <Button
                variant="secondary"
                size="md"
                fullWidth
              >
                Forgot Password?
              </Button>
            </Link>
            
            <div className="text-center">
              <span className="text-sm text-[#B0B0B0]">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-[#FFDE59] font-medium hover:underline transition-all"
                >
                  Sign Up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </AuthCard>
      
      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute -z-10 top-20 right-20 w-32 h-32 bg-[#FFDE59] rounded-full blur-3xl"
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute -z-10 bottom-20 left-20 w-40 h-40 bg-[#2EC4B6] rounded-full blur-3xl"
      />
    </div>
  );
};

export default LoginForm; 