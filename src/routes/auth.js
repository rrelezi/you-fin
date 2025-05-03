const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getMe,
  getChildren,
  updateAllowance,
  updateSpendingLimits,
  updatePassword,
  forgotPassword,
  resetPassword,
  generate2FASecret,
  verify2FA,
  validate2FAToken,
  disable2FA,
  checkEmail
} = require('../controllers/authController');

// Environment-specific middleware
const conditionalAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // In development, allow unauthenticated access for easier testing
    return next();
  }
  // In production, require authentication
  return protect(req, res, next);
};

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/validate-2fa', validate2FAToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/check-email', checkEmail);

// 2FA routes with conditional authentication
router.post('/2fa/generate', conditionalAuth, generate2FASecret);
router.post('/2fa/verify', conditionalAuth, verify2FA);
router.post('/2fa/disable', conditionalAuth, disable2FA);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.get('/children', getChildren);
router.post('/logout', logout);
router.put('/update-password', updatePassword);
router.patch('/update-allowance', updateAllowance);
router.patch('/update-spending-limits', updateSpendingLimits);

module.exports = router; 