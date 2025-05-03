import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Email, ArrowBack, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Custom components
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import AuthCard from '../ui/AuthCard';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEmailValid()) {
      setError('Please enter a valid email address');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess('Password reset instructions have been sent to your email');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isEmailValid = () => {
    return email.includes('@') && email.includes('.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 bg-[#121212]">
      <AuthCard
        title="Reset Password"
        subtitle="Enter your email address and we'll send you instructions"
        error={error}
        success={success}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            autoFocus
            startIcon={<Email fontSize="small" />}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              endIcon={<ArrowForward />}
              disabled={!isEmailValid()}
            >
              Send Reset Instructions
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login">
            <Button
              variant="transparent"
              size="md"
              startIcon={<ArrowBack />}
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthCard>
      
      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute -z-10 top-40 left-20 w-32 h-32 bg-[#FFDE59] rounded-full blur-3xl"
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute -z-10 bottom-40 right-20 w-40 h-40 bg-[#2EC4B6] rounded-full blur-3xl"
      />
    </div>
  );
};

export default ForgotPassword; 