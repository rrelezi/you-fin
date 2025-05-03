import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Security, Lock, NoEncryption, Edit, Save } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import TwoFactorAuth from './TwoFactorAuth';

// Custom components
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';

const SecuritySettings = () => {
  const { user, updatePassword, disable2FA } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [disableCode, setDisableCode] = useState('');

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updatePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorButton = () => {
    if (user?.twoFactorAuth?.enabled) {
      // If 2FA is enabled, show dialog to disable it
      const code = prompt('Enter your 2FA verification code to disable two-factor authentication:');
      if (code) {
        handleDisable2FA(code);
      }
    } else {
      // If 2FA is not enabled, show loading feedback first
      setLoading(true);
      setError('');
      setSuccess('Loading 2FA setup...');
      
      // Small delay to show loading state
      setTimeout(() => {
        setLoading(false);
        setSuccess('');
        setShow2FASetup(true);
      }, 500);
    }
  };

  const handleDisable2FA = async (token) => {
    try {
      setLoading(true);
      setError('');
      
      await disable2FA(token);
      
      setSuccess('Two-factor authentication has been disabled successfully');
      
      // Update user object to reflect change
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = () => {
    setShow2FASetup(false);
    setSuccess('Two-factor authentication has been enabled successfully!');
  };

  if (show2FASetup) {
    return <TwoFactorAuth setupMode={true} onSuccess={handle2FASuccess} />;
  }

  return (
    <div className="bg-[#1E1E1E] rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-[#FFDE59] mb-4 flex items-center">
        <Security className="mr-2" />
        Security Settings
      </h2>

      {error && (
        <div className="bg-[rgba(255,75,75,0.1)] border border-[rgba(255,75,75,0.3)] rounded-lg p-3 mb-4 text-[#FF4B4B]">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.3)] rounded-lg p-3 mb-4 text-[#00C853]">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <motion.div 
          className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4 border border-[#333333]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Security className="text-[#FFDE59] mr-3" />
              <div>
                <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-[#B0B0B0]">
                  {user?.twoFactorAuth?.enabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
            </div>
            
            <Button
              variant={user?.twoFactorAuth?.enabled ? "danger" : "primary"}
              size="sm"
              onClick={handleTwoFactorButton}
              startIcon={user?.twoFactorAuth?.enabled ? <NoEncryption /> : <Security />}
            >
              {user?.twoFactorAuth?.enabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </motion.div>

        {/* Password Update */}
        <motion.div 
          className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4 border border-[#333333]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Lock className="text-[#FFDE59] mr-3" />
              <div>
                <h3 className="text-white font-medium">Password</h3>
                <p className="text-sm text-[#B0B0B0]">
                  Update your password regularly for better security
                </p>
              </div>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              startIcon={showPasswordForm ? <Save /> : <Edit />}
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </Button>
          </div>
          
          {showPasswordForm && (
            <motion.form 
              className="space-y-4 mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              onSubmit={handlePasswordUpdate}
            >
              <FormInput
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                showPassword={showCurrentPassword}
                togglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
              />
              
              <FormInput
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                showPassword={showNewPassword}
                togglePassword={() => setShowNewPassword(!showNewPassword)}
              />
              
              <FormInput
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                confirmPassword={true}
                passwordValue={newPassword}
              />
              
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={loading}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                >
                  Update Password
                </Button>
              </div>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SecuritySettings; 