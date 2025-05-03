import React, { useState } from 'react';
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

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const { updatePassword } = useAuth();

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
      confirmPassword: password === formData.confirmNewPassword
    }));
    return Object.values(validations).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'currentPassword') {
      if (value.length > 0) {
        setActiveStep(1);
      } else {
        setActiveStep(0);
      }
    }
    if (name === 'newPassword') {
      validatePassword(value);
      if (value.length > 0) {
        setActiveStep(2);
      } else {
        setActiveStep(1);
      }
    }
    if (name === 'confirmNewPassword') {
      setValidations(prev => ({
        ...prev,
        confirmPassword: value === formData.newPassword
      }));
      if (value.length > 0) {
        setActiveStep(3);
      } else {
        setActiveStep(2);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate new password
    if (!validatePassword(formData.newPassword)) {
      setError('Please meet all password requirements');
      return;
    }

    // Validate password confirmation
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(formData.currentPassword, formData.newPassword);
      setSuccess('Password updated successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setActiveStep(0);
    } catch (err) {
      setError(err.message || 'Failed to update password');
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
      label: 'Current Password',
      description: 'Enter your current password to proceed.',
      content: (
        <TextField
          fullWidth
          label="Current Password"
          name="currentPassword"
          type={showCurrentPassword ? 'text' : 'password'}
          value={formData.currentPassword}
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
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )
    },
    {
      label: 'Create New Password',
      description: 'Choose a strong password that meets all requirements.',
      content: (
        <TextField
          fullWidth
          label="New Password"
          name="newPassword"
          type={showNewPassword ? 'text' : 'password'}
          value={formData.newPassword}
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
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )
    },
    {
      label: 'Verify Requirements',
      description: 'Ensure your new password meets all security requirements.',
      content: renderPasswordRequirements()
    },
    {
      label: 'Confirm New Password',
      description: 'Re-enter your new password to confirm.',
      content: (
        <TextField
          fullWidth
          label="Confirm New Password"
          name="confirmNewPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmNewPassword}
          onChange={handleChange}
          required
          error={!validations.confirmPassword && formData.confirmNewPassword !== ''}
          helperText={
            !validations.confirmPassword && formData.confirmNewPassword !== ''
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
          Update Password
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Please follow the steps below to update your password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
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
            disabled={
              isLoading || 
              !formData.currentPassword ||
              !validations.confirmPassword || 
              !Object.values(validations.password).every(Boolean)
            }
            sx={{ mt: 4 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Update Password'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UpdatePassword; 