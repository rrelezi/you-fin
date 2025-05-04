const crypto = require('crypto');

/**
 * Utility functions for authentication
 */

// Send token response with cookie
exports.sendTokenResponse = (user, statusCode, res) => {
  try {
    // Create token
    const token = user.generateAuthToken();

    // Set cookie options with safe fallback for missing JWT_COOKIE_EXPIRE
    // Make sure it's a valid number by using parseInt with fallback
    let cookieExpires = 1; // Default to 1 day if not set or not a valid number
    try {
      cookieExpires = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 1;
    } catch (err) {
      console.error('Invalid JWT_COOKIE_EXPIRE value:', process.env.JWT_COOKIE_EXPIRE);
    }

    const options = {
      expires: new Date(
        Date.now() + cookieExpires * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    // Secure in production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    // Remove sensitive data from user object
    user.password = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // If user has 2FA, remove secrets
    if (user.twoFactorAuth) {
      user.twoFactorAuth.secret = undefined;
      user.twoFactorAuth.tempSecret = undefined;
    }

    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user
      });
  } catch (error) {
    console.error('Error in sendTokenResponse:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate verification token
exports.generateVerificationToken = () => {
  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Hash the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Set expiration (24 hours)
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  
  return {
    token,
    hashedToken,
    expires
  };
}; 