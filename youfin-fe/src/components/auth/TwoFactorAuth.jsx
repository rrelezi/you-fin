import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Security, Check, Info } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Custom components
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import AuthCard from '../ui/AuthCard';

const TwoFactorAuth = ({ userId, onSuccess, setupMode = false }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { validate2FAToken, generate2FASecret, verify2FA } = useAuth();
  const [loadingMessage, setLoadingMessage] = useState('');
  const [setupStep, setSetupStep] = useState(0);

  // If in setup mode, generate a new 2FA secret
  useEffect(() => {
    if (setupMode) {
      setLoadingMessage('Preparing 2FA setup...');
      setSetupStep(1);
      console.log("Generating 2FA secret in setup mode");
      generateSecret();
    }
  }, [setupMode]);

  const generateSecret = async () => {
    try {
      setIsLoading(true);
      setError('');
      setLoadingMessage('Generating secure secret...');
      console.log("Calling generate2FASecret API");
      
      // Add a slight delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await generate2FASecret();
      console.log("2FA Secret response:", response);
      
      if (!response || !response.dataURL) {
        throw new Error('Failed to generate QR code');
      }
      
      setQrCode(response.dataURL);
      
      // Extract the secret from otpURL or use provided secret
      const secretValue = response.secret || 
        (response.otpURL && response.otpURL.includes('secret=') ? 
          response.otpURL.split('secret=')[1].split('&')[0] : 
          "Secret not available");
          
      setSecret(secretValue);
      
      setLoadingMessage('');
      setSetupStep(2);
      setIsLoading(false);
    } catch (err) {
      console.error("Error generating 2FA secret:", err);
      setError(err.message || 'Failed to generate 2FA secret');
      setLoadingMessage('');
      setIsLoading(false);
    }
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setError('');
    setIsLoading(true);
    setLoadingMessage('Verifying code...');

    try {
      if (setupMode) {
        // Verify and enable 2FA
        console.log("Verifying 2FA code:", verificationCode);
        await verify2FA(verificationCode);
        setSuccess('Two-factor authentication has been enabled successfully!');
        setLoadingMessage('');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        // Validate 2FA token during login
        await validate2FAToken(userId, verificationCode);
        setLoadingMessage('');
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      setError(err.message || 'Invalid verification code');
      setLoadingMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="p-6 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[rgba(255,222,89,0.1)] rounded-full flex items-center justify-center text-[#FFDE59]">
              <Security style={{ fontSize: 36 }} />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-[#FFDE59] tracking-tight">
            {setupMode ? 'Enable Two-Factor Authentication' : 'Two-Factor Verification'}
          </h1>
          <p className="text-sm text-[#B0B0B0] mt-1">
            {setupMode 
              ? 'Enhance your account security' 
              : 'Enter the verification code from your authenticator app'}
          </p>
          
          {/* Bypass code hint for testing/development */}
          <div className="mt-2 text-xs text-[#FFDE59]/70">
            For testing, you can use <span className="font-mono bg-black/30 px-1 py-0.5 rounded">111111</span> as a bypass code
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-[rgba(255,75,75,0.1)] text-[#FF4B4B] rounded-xl border border-[rgba(255,75,75,0.3)] text-sm"
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-[rgba(46,196,182,0.1)] text-[#2EC4B6] rounded-xl border border-[rgba(46,196,182,0.3)] text-sm"
          >
            <div className="flex items-center">
              <Check className="mr-2" />
              {success}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          {!isLoading || setupStep === 2 ? (
            <div>
              {setupMode && setupStep === 2 && (
                <div className="mb-6">
                  <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-[#333333] mb-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-white mb-2">Scan this QR Code</h3>
                      <p className="text-sm text-[#B0B0B0]">
                        Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code.
                      </p>
                    </div>
                    
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-2 rounded-lg">
                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                    </div>
                    
                    <div className="text-center text-sm bg-[rgba(255,222,89,0.1)] p-3 rounded-lg border border-[rgba(255,222,89,0.3)]">
                      <div className="flex items-start text-left">
                        <Info className="text-[#FFDE59] mr-2 flex-shrink-0 mt-0.5" fontSize="small" />
                        <p className="text-[#B0B0B0]">
                          If you can't scan the QR code, you can manually enter this secret key in your authenticator app: 
                          <span className="font-mono text-[#FFDE59] block mt-1 p-1 bg-black/40 rounded">
                            {secret}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleValidate}>
                <div className="space-y-4">
                  <FormInput
                    label="Enter Verification Code"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(value);
                      // Clear error when user starts typing again
                      if (error && value) {
                        setError('');
                      }
                    }}
                    placeholder="Enter 6-digit code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    startIcon={<Security fontSize="small" />}
                    helperText={verificationCode.length > 0 && verificationCode.length < 6 ? 
                      `${6 - verificationCode.length} more digits needed` : 
                      "Enter the 6-digit code from your authenticator app"}
                  />
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    disabled={verificationCode.length !== 6 || isLoading}
                  >
                    {setupMode ? 'Verify and Enable 2FA' : 'Verify Code'}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center py-10 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFDE59]"></div>
              {loadingMessage && (
                <p className="text-[#B0B0B0] text-sm">{loadingMessage}</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AuthCard>
  );
};

export default TwoFactorAuth; 