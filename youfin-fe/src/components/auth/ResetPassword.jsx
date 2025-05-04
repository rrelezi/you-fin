import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle
} from '@mui/icons-material';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword } = useAuth();

  const [validations, setValidations] = useState({
    password: {
      minLength: false,
      hasNumber: false,
      hasSpecial: false,
      hasUppercase: false,
    },
    confirmPassword: false
  });

  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
    };
    setValidations(prev => ({
      ...prev,
      password: validations,
      confirmPassword: password === formData.confirmPassword
    }));
    return Object.values(validations).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      validatePassword(value);
      if (value.length > 0) {
        setActiveStep(1);
      } else {
        setActiveStep(0);
      }
    }
    if (name === 'confirmPassword') {
      setValidations(prev => ({
        ...prev,
        confirmPassword: value === formData.password
      }));
      if (value.length > 0) {
        setActiveStep(2);
      } else {
        setActiveStep(1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password
    if (!validatePassword(formData.password)) {
      setError('Please meet all password requirements');
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, formData.password);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordRequirements = () => (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" color="textSecondary">
        Password Requirements:
      </Typography>
      <FormHelperText
        error={!validations.password.minLength}
        sx={{ 
          color: validations.password.minLength ? 'success.main' : 'error.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {validations.password.minLength && <CheckCircle fontSize="small" color="success" />}
        • Minimum 8 characters
      </FormHelperText>
      <FormHelperText
        error={!validations.password.hasNumber}
        sx={{ 
          color: validations.password.hasNumber ? 'success.main' : 'error.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {validations.password.hasNumber && <CheckCircle fontSize="small" color="success" />}
        • At least one number
      </FormHelperText>
      <FormHelperText
        error={!validations.password.hasSpecial}
        sx={{ 
          color: validations.password.hasSpecial ? 'success.main' : 'error.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {validations.password.hasSpecial && <CheckCircle fontSize="small" color="success" />}
        • At least one special character
      </FormHelperText>
      <FormHelperText
        error={!validations.password.hasUppercase}
        sx={{ 
          color: validations.password.hasUppercase ? 'success.main' : 'error.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {validations.password.hasUppercase && <CheckCircle fontSize="small" color="success" />}
        • At least one uppercase letter
      </FormHelperText>
    </Box>
  );

  const steps = [
    {
      label: 'Create Password',
      description: 'Choose a strong password that meets all requirements.',
      content: (
        <TextField
          fullWidth
          label="New Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )
    },
    {
      label: 'Verify Requirements',
      description: 'Ensure your password meets all security requirements.',
      content: renderPasswordRequirements()
    },
    {
      label: 'Confirm Password',
      description: 'Re-enter your password to confirm.',
      content: (
        <TextField
          fullWidth
          label="Confirm New Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          error={!validations.confirmPassword && formData.confirmPassword !== ''}
          helperText={
            !validations.confirmPassword && formData.confirmPassword !== ''
              ? 'Passwords do not match'
              : ''
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )
    }
  ];

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Please follow the steps below to reset your password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="subtitle1">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  {step.content}
                </StepContent>
              </Step>
            ))}
          </Stepper>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || !validations.confirmPassword || !Object.values(validations.password).every(Boolean)}
            sx={{ mt: 4 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Reset Password'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword; 