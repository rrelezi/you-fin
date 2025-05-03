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
  checkEmail,
  testEmail
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/check-email', checkEmail);
router.post('/validate-2fa', validate2FAToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Development only routes
if (process.env.NODE_ENV === 'development') {
  router.post('/test-email', testEmail);
}

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.get('/children', getChildren);
router.patch('/update-password', updatePassword);
router.patch('/update-allowance', updateAllowance);
router.patch('/update-spending-limits', updateSpendingLimits);

// 2FA routes
router.post('/2fa/generate', generate2FASecret);
router.post('/2fa/verify', verify2FA);
router.post('/2fa/disable', disable2FA);

module.exports = router; 