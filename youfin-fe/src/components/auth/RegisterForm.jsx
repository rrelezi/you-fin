import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  Person,
  Email,
  Lock,
  Business,
  LocationOn,
  Description,
  Cake,
  ArrowForward,
  ArrowBack,
  QrCode2,
  Security,
  Check,
  KeyboardDoubleArrowDown,
  School,
  EmojiEvents
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, MenuItem, useMediaQuery } from '@mui/material';

// Custom components
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import AuthCard from '../ui/AuthCard';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [direction, setDirection] = useState(1); // Track animation direction
  const isMobile = useMediaQuery('(max-width:640px)');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'parent',
    // Business fields
    businessName: '',
    businessType: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    description: '',
    // Child fields
    dateOfBirth: '',
    parentId: '',
    // 2FA
    twoFactorEnabled: false,
  });

  const [validations, setValidations] = useState({
    password: {
      minLength: false,
      hasNumber: false,
      hasSpecial: false,
      hasUppercase: false,
    },
  });

  const businessTypes = [
    'retail',
    'food',
    'entertainment',
    'education',
    'other'
  ];

  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
    };
    setValidations(prev => ({
      ...prev,
      password: validations
    }));
    return Object.values(validations).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (name === 'password') {
      validatePassword(value);
    }
  };

  // Check if email exists when email field is blurred
  const checkEmailExists = async (email) => {
    if (!email || !email.includes('@')) return;
    
    setIsCheckingEmail(true);
    setEmailExists(false);
    setEmailChecked(false);
    
    try {
      // Either call an API endpoint or do a simple check
      const response = await axios.post('http://localhost:8000/api/auth/check-email', { email });
      setEmailExists(response.data.exists);
      setEmailChecked(true);
    } catch (error) {
      // If the endpoint doesn't exist, assume email is valid
      console.error('Email check failed:', error);
      setEmailChecked(true);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailBlur = (e) => {
    const { value } = e.target;
    checkEmailExists(value);
  };

  const canProceedToNextStep = () => {
    // Validation for each step
    switch (currentStep) {
      case 0:
        return formData.role !== '';
      case 1:
        // Basic validation for step 2
        return (
          formData.firstName.trim() !== '' &&
          formData.lastName.trim() !== '' &&
          formData.email.includes('@') &&
          formData.password !== '' &&
          confirmPassword !== '' &&
          formData.password === confirmPassword &&
          Object.values(validations.password).every(Boolean) &&
          !emailExists // Don't allow proceeding if email exists
        );
      case 2:
        if (formData.role === 'business') {
          return (
            formData.businessName.trim() !== '' &&
            formData.businessType !== '' &&
            formData.address.street.trim() !== '' &&
            formData.address.city.trim() !== '' &&
            formData.address.state.trim() !== '' &&
            formData.address.zipCode.trim() !== '' &&
            formData.address.country.trim() !== ''
          );
        } else if (formData.role === 'child') {
          return formData.dateOfBirth !== '' && formData.parentId.trim() !== '';
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep()) {
      setDirection(1); // Moving forward
      setCurrentStep((prev) => prev + 1);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError("Please complete all required fields before proceeding.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleBack = () => {
    setDirection(-1); // Moving backward
    setCurrentStep((prev) => prev - 1);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (step) => {
    if (step < currentStep) {
      setDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEnable2FA = async () => {
    try {
      setIs2FALoading(true);
      setError('');
      
      // In registration flow, we'll just show a mock QR code
      // since we can't generate a real one until the user is registered
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=youfin-demo-2fa');
      
      // In a real implementation, this would call the API to generate a 2FA secret
      // const response = await generate2FASecret();
      // setQrCode(response.dataURL);
      
      setFormData(prev => ({ 
        ...prev, 
        twoFactorEnabled: true 
      }));
    } catch (err) {
      setError(err.message || 'Failed to initialize 2FA setup');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canProceedToNextStep()) {
      setError("Please complete all required fields before submitting.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      // Process 2FA setup if enabled
      const userData = { ...formData };
      
      // If 2FA verification code was entered but not yet completed on the backend
      // We're handling as a demo in the registration flow
      if (userData.twoFactorEnabled && verificationCode) {
        userData.setupTwoFactor = true;
        userData.twoFactorToken = verificationCode;
      }
      
      console.log("Submitting registration with data:", { ...userData, password: "[REDACTED]" });
      
      // Register user
      await register(userData);
      
      // Navigate to dashboard will be handled by the register function
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine appropriate content height
  const getContentHeight = () => {
    if (formData.role === 'business' && currentStep === 2) {
      return 'min-h-[450px] sm:min-h-[500px]';
    } else if (currentStep === 1) {
      return 'min-h-[400px] sm:min-h-[450px]';
    } else {
      return 'min-h-[350px] sm:min-h-[400px]';
    }
  };

  // Updated slide variants for better animation
  const slideVariants = {
    enter: () => ({
      y: 50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1
    },
    exit: () => ({
      zIndex: 0,
      y: -50,
      opacity: 0,
      position: 'absolute',
      width: '100%'
    })
  };

  // Function to get youth-friendly term based on date of birth
  const getYouthTerm = () => {
    if (!formData.dateOfBirth) return "Youth";
    
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 10) return "Kid Explorer";
    if (age < 13) return "Money Navigator";
    if (age < 18) return "Teen Investor";
    return "Finance Apprentice";
  };

  // Calculate youth level and badges
  const getYouthDetails = () => {
    if (!formData.dateOfBirth) return { level: 1, badges: ["Starter"] };
    
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    let level = 1;
    let badges = ["Starter"];
    
    if (age < 10) {
      level = 1;
      badges = ["Explorer", "Curious Mind"];
    } else if (age < 13) {
      level = 2;
      badges = ["Navigator", "Growing Saver"];
    } else if (age < 16) {
      level = 3;
      badges = ["Planner", "Smart Spender"];
    } else {
      level = 4;
      badges = ["Investor", "Future Builder"];
    }
    
    return { level, badges };
  };

  const steps = [
    {
      title: "Choose Your Account Type",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { 
                value: 'business', 
                icon: <Business fontSize="large" />, 
                title: 'Business', 
                desc: 'For merchants and service providers',
                gradient: 'from-blue-500 to-purple-500'
              },
              { 
                value: 'parent', 
                icon: <Person fontSize="large" />, 
                title: 'Parent', 
                desc: 'Manage your children\'s finances',
                gradient: 'from-green-500 to-teal-500'
              },
              { 
                value: 'child', 
                icon: <School fontSize="large" />, 
                title: 'Youth', 
                desc: 'Learn financial skills & independence',
                gradient: 'from-yellow-400 to-orange-500'
              }
            ].map((option) => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={option.value}
                className={`
                  cursor-pointer 
                  p-5 
                  rounded-2xl 
                  transition-all 
                  duration-300
                  border-2
                  ${formData.role === option.value 
                    ? 'bg-[rgba(255,222,89,0.2)] border-[#FFDE59]' 
                    : 'bg-[rgba(30,30,30,0.8)] border-transparent'}
                  hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]
                  ${formData.role === option.value && 'shadow-[0_0_15px_rgba(255,222,89,0.3)]'}
                `}
                onClick={() => setFormData(prev => ({ ...prev, role: option.value }))}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`
                    mb-3 text-3xl p-3 rounded-full 
                    ${formData.role === option.value 
                      ? 'text-[#FFDE59] bg-[rgba(255,222,89,0.1)]' 
                      : 'text-white opacity-70 bg-[rgba(255,255,255,0.05)]'}
                    transition-all duration-300
                  `}>
                    {option.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-[#B0B0B0]">{option.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Personal Information",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Your first name"
              required
              startIcon={<Person fontSize="small" />}
            />
            
            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Your last name"
              required
              startIcon={<Person fontSize="small" />}
            />
          </div>
          
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailBlur}
            placeholder="Your email address"
            required
            startIcon={<Email fontSize="small" />}
            error={emailExists ? "This email is already registered" : ""}
            helperText={
              isCheckingEmail 
                ? "Checking email..." 
                : emailExists 
                  ? "Please use a different email address" 
                  : emailChecked && formData.email 
                    ? "Email is available" 
                    : ""
            }
          />
          
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            startIcon={<Lock fontSize="small" />}
            showPassword={showPassword}
            togglePassword={() => setShowPassword(!showPassword)}
            validations={validations.password}
          />
          
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            startIcon={<Lock fontSize="small" />}
            showPassword={showConfirmPassword}
            togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            confirmPassword={true}
            passwordValue={formData.password}
          />
        </div>
      )
    },
    {
      title: formData.role === 'business' ? "Business Details" : formData.role === 'child' ? "Youth Journey" : "2FA Setup",
      content: formData.role === 'business' ? (
        <div className="space-y-4">
          <FormInput
            label="Business Name"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Your business name"
            required
            startIcon={<Business fontSize="small" />}
          />
          
          <div className="relative">
            <label 
              htmlFor="businessType" 
              className="block mb-2 text-sm font-medium text-[#FFDE59]"
            >
              Business Type <span className="text-[#FF4B4B]">*</span>
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
              className="w-full py-4 px-4 bg-[rgba(255,255,255,0.05)] border border-[#333333] focus:border-[#FFDE59] focus:ring-2 focus:ring-[#FFDE59] focus:ring-opacity-20 focus:outline-none text-white rounded-xl transition-all duration-200 appearance-none"
            >
              <option value="" disabled>Select business type</option>
              {businessTypes.map((type) => (
                <option key={type} value={type} className="bg-[#1E1E1E]">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-[42px] pointer-events-none text-[#FFDE59]">
              <ArrowForward style={{ transform: 'rotate(90deg)' }} />
            </div>
          </div>
          
          <FormInput
            label="Street Address"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            placeholder="Street address"
            required
            startIcon={<LocationOn fontSize="small" />}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="City"
              required
            />
            
            <FormInput
              label="State/Province"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="State or province"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="ZIP/Postal Code"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              placeholder="ZIP or postal code"
              required
            />
            
            <FormInput
              label="Country"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              placeholder="Country"
              required
            />
          </div>
          
          <div className="relative">
            <label 
              htmlFor="description" 
              className="block mb-2 text-sm font-medium text-[#FFDE59]"
            >
              Business Description <span className="text-[#FF4B4B]">*</span>
            </label>
            <div className="absolute left-3 top-11 text-[#FFDE59]">
              <Description fontSize="small" />
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your business"
              required
              rows={4}
              className="w-full py-4 px-4 pl-10 bg-[rgba(255,255,255,0.05)] border border-[#333333] focus:border-[#FFDE59] focus:ring-2 focus:ring-[#FFDE59] focus:ring-opacity-20 focus:outline-none text-white rounded-xl transition-all duration-200 placeholder:text-[#777777]"
            />
          </div>
        </div>
      ) : formData.role === 'child' ? (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-xl border border-[#FF9F1C] bg-gradient-to-br from-[#1E1E1E] to-[#2D2D2D]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFDE59] to-[#FF9F1C] opacity-20 rounded-full blur-xl transform translate-x-10 -translate-y-10"></div>
            
            <div className="relative p-5 z-10">
              <div className="flex items-center mb-3">
                <EmojiEvents className="text-[#FFDE59] mr-2" />
                <h3 className="youth-gradient text-xl font-bold">Youth Financial Journey</h3>
              </div>
              
              <p className="text-sm text-white/80 mb-4">
                Start your financial adventure! Learn to save, spend wisely, and grow your money while having fun.
              </p>
              
              {formData.dateOfBirth && (
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Your Path:</span>
                    <span className="achievement-badge">
                      <EmojiEvents style={{ fontSize: '14px', marginRight: '4px' }} />
                      {getYouthTerm()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#FFDE59] to-[#FF9F1C] h-full rounded-full" 
                      style={{ width: `${getYouthDetails().level * 25}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getYouthDetails().badges.map((badge, index) => (
                      <span key={index} className="text-xs py-1 px-2 bg-white/10 rounded-full text-[#FFDE59]">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-[#333333]">
            <FormInput
              className="bg-[#1E1E1E] text-white"
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              startIcon={<Cake style={{ color: 'white' }} fontSize="small" />}
              helperText={formData.dateOfBirth && `You'll join as a ${getYouthTerm()}!`}
            />
            
            <FormInput
              label="Parent's ID"
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              placeholder="Your parent's ID"
              required
              helperText="Connect with your parent's account for guidance"
            />
            
            {formData.dateOfBirth && formData.parentId && (
              <motion.div 
                className="mt-4 p-3 bg-[#FFDE59]/10 rounded-lg border border-[#FFDE59]/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm text-white">
                  <span className="font-semibold text-[#FFDE59]">Ready for takeoff!</span> Your financial journey is about to begin. You'll earn badges, level up your skills, and learn to manage money like a pro!
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <QrCode2 className="text-[#FFDE59]" style={{ fontSize: 80 }} />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Two-Factor Authentication</h3>
            <p className="text-[#B0B0B0] text-sm">
              Enhance your account security by enabling two-factor authentication
            </p>
          </div>
          
          {qrCode ? (
            <>
              <div className="my-6 mx-auto max-w-[200px]">
                <img src={qrCode} alt="2FA QR Code" className="w-full h-auto" />
              </div>
              
              <FormInput
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => {
                  // Only allow numbers and limit to 6 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                placeholder="Enter 6-digit code"
                startIcon={<Security fontSize="small" />}
                helperText="Enter the 6-digit code from your authenticator app"
              />
            </>
          ) : (
            <div className="my-6">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleEnable2FA}
                isLoading={is2FALoading}
              >
                Enable 2FA
              </Button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 bg-[#121212]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl mx-auto"
      >
        <div className="bg-[#1E1E1E] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.05)] p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#FFDE59] tracking-tight">Create Your Account</h1>
            <p className="text-sm text-[#B0B0B0] mt-1">Join YouFin and start your financial journey</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[rgba(255,75,75,0.1)] text-[#FF4B4B] rounded-xl border border-[rgba(255,75,75,0.3)]">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="relative flex items-center justify-center mb-6">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className="flex items-center"
                >
                  <div 
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                      ${currentStep >= index 
                        ? 'bg-[#FFDE59] text-black' 
                        : 'bg-[#333333] text-[#B0B0B0]'}
                      transition-all duration-300
                      ${index < currentStep ? 'cursor-pointer hover:brightness-110' : ''}
                    `}
                    onClick={() => index < currentStep ? goToStep(index) : null}
                  >
                    {currentStep > index ? <Check fontSize="small" /> : (index + 1)}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="w-12 sm:w-24 h-[2px] mx-1 sm:mx-3 flex-shrink-0 bg-[#333333]">
                      <div 
                        className="h-full bg-[#FFDE59] transition-all duration-500" 
                        style={{ width: currentStep > index ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#FFDE59] mb-4">
                {steps[currentStep].title}
                <motion.div 
                  animate={{ y: [0, 5, 0] }} 
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block ml-2 text-[#FFDE59]"
                >
                  <KeyboardDoubleArrowDown fontSize="small" />
                </motion.div>
              </h2>
            </div>
            
            <div className={`${getContentHeight()} relative overflow-hidden`}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    y: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 }
                  }}
                  className="w-full"
                >
                  <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-4 sm:p-6 border border-[#333333]">
                    {steps[currentStep].content}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Step indicators below the content */}
            <div className="flex justify-center space-x-2 mt-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => index < currentStep ? goToStep(index) : null}
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${currentStep === index 
                      ? 'bg-[#FFDE59] w-5' 
                      : index < currentStep 
                        ? 'bg-[#FFDE59] opacity-50 cursor-pointer' 
                        : 'bg-[#333333] cursor-default'}
                  `}
                  aria-label={`Go to step ${index + 1}`}
                  disabled={index > currentStep}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="secondary"
              size="md"
              onClick={handleBack}
              disabled={currentStep === 0 || isLoading}
              startIcon={<ArrowBack />}
              className={currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}
            >
              Back
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                isLoading={isLoading}
                endIcon={<ArrowForward />}
              >
                Complete
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                disabled={!canProceedToNextStep()}
              >
                Continue
              </Button>
            )}
          </div>
          
          {currentStep === 0 && (
            <div className="mt-6 text-center">
              <span className="text-sm text-[#B0B0B0]">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-[#FFDE59] font-medium hover:underline transition-all"
                >
                  Sign In
                </Link>
              </span>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute -z-10 top-40 right-20 w-40 h-40 bg-[#FFDE59] rounded-full blur-3xl"
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute -z-10 bottom-40 left-20 w-48 h-48 bg-[#2EC4B6] rounded-full blur-3xl"
      />
    </div>
  );
};

export default RegisterForm; 