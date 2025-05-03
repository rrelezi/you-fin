const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { catchAsync } = require('../utils/catchAsync');
const rateLimit = require('express-rate-limit');

// Protect routes
exports.protect = catchAsync(async (req, res, next) => {
  // For development mode, allow bypassing auth when needed
  if (process.env.NODE_ENV === 'development' && req.headers['x-dev-bypass-auth'] === 'true') {
    console.log('⚠️ Development mode: Authentication bypassed');
    
    // Use a mock user for development or find the first admin user
    let devUser = await User.findOne({ role: 'parent' });
    
    if (!devUser) {
      // If no user found, create a mock user object
      req.user = { 
        id: '000000000000000000000000',
        role: 'parent',
        firstName: 'Dev',
        lastName: 'User'
      };
    } else {
      req.user = devUser;
    }
    
    return next();
  }

  let token;

  // Get token from header or cookies
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    throw new AppError('Not authorized to access this route', 401);
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(`User role ${req.user.role} is not authorized to access this route`, 403);
    }
    next();
  };
};

// Rate limiting middleware
exports.rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
}); 