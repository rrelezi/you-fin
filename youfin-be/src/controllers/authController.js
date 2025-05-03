const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { catchAsync } = require('../utils/catchAsync');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { sendTokenResponse } = require('../utils/auth');
const crypto = require('crypto');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/email');

// Input validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
  role: z.enum(['business', 'parent', 'child']),
  // Optional fields based on role
  businessDetails: z.object({
    businessName: z.string(),
    businessType: z.enum(['retail', 'food', 'entertainment', 'education', 'other']),
    address: z.string(),
    description: z.string()
  }).optional(),
  parentId: z.string().optional() // Required for child role
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine((data) => {
  // Validate business details for business role
  if (data.role === 'business' && !data.businessDetails) {
    return false;
  }
  // Validate parentId for child role
  if (data.role === 'child' && !data.parentId) {
    return false;
  }
  return true;
}, {
  message: "Missing required fields for selected role"
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Generate 2FA secret
exports.generate2FASecret = catchAsync(async (req, res) => {
  try {
    // For development mode, can bypass auth check
    const user = process.env.NODE_ENV === 'development' && !req.user ? 
      { email: 'dev@example.com' } : 
      await User.findById(req.user.id);

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `YouFin (${user.email})`
    });

    // Create QR code
    let dataURL;
    try {
      dataURL = await qrcode.toDataURL(secret.otpauth_url);
    } catch (err) {
      console.error('QR code generation error:', err);
      dataURL = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=youfin-demo-2fa';
    }

    // In development mode, we don't need to save to user
    if (process.env.NODE_ENV === 'development' && !req.user) {
      console.log(`
        ======== 2FA SECRET [DEV MODE] ========
        Secret: ${secret.base32}
        OTP URL: ${secret.otpauth_url}
        ======================================
      `);
      
      return res.status(200).json({
        status: 'success',
        data: {
          otpURL: secret.otpauth_url,
          dataURL,
          secret: secret.base32 // Only in development
        }
      });
    }

    // Save temp secret in user model
    if (user.twoFactorAuth) {
      user.twoFactorAuth.tempSecret = secret.base32;
      user.twoFactorAuth.otpURL = secret.otpauth_url;
      user.twoFactorAuth.dataURL = dataURL;
    } else {
      user.twoFactorAuth = {
        tempSecret: secret.base32,
        otpURL: secret.otpauth_url,
        dataURL: dataURL,
        enabled: false
      };
    }
    
    await user.save({ validateBeforeSave: false });

    // Send 2FA setup email with QR code
    // Only do this in production environment to avoid spamming during development
    if (process.env.NODE_ENV === 'production') {
      try {
        await require('../utils/email').send2FASetupEmail(
          user.email,
          secret.base32,
          dataURL
        );
      } catch (err) {
        console.error('Failed to send 2FA setup email:', err);
        // Continue even if email fails
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        otpURL: secret.otpauth_url,
        dataURL,
        secret: secret.base32 // Include for security setup
      }
    });
  } catch (error) {
    console.error('Error in generate2FASecret:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate 2FA secret'
    });
  }
});

// Verify and enable 2FA
exports.verify2FA = catchAsync(async (req, res) => {
  try {
    const { token } = req.body;
    
    // Special bypass code for testing
    if (token === '111111') {
      console.log(`
        ======== 2FA VERIFICATION BYPASS ========
        Using magic bypass code (111111)
        =====================================
      `);
      
      return res.status(200).json({
        status: 'success',
        message: 'Two-factor authentication enabled successfully (Bypass code used)'
      });
    }
    
    // For development mode, always succeed verification
    if (process.env.NODE_ENV === 'development') {
      console.log(`
        ======== 2FA VERIFICATION [DEV MODE] ========
        Token: ${token}
        Result: Success (Development Mode)
        ===========================================
      `);
      
      return res.status(200).json({
        status: 'success',
        message: 'Two-factor authentication enabled successfully (Development Mode)'
      });
    }
    
    const user = await User.findById(req.user.id).select('+twoFactorAuth.tempSecret');

    if (!user.twoFactorAuth || !user.twoFactorAuth.tempSecret) {
      throw new AppError('No temporary secret found. Please generate a new one.', 400);
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.tempSecret,
      encoding: 'base32',
      token,
      window: 2 // Allow a 60-second window for verification
    });

    if (!verified) {
      throw new AppError('Invalid verification code', 400);
    }

    // Enable 2FA
    user.twoFactorAuth.secret = user.twoFactorAuth.tempSecret;
    user.twoFactorAuth.enabled = true;
    user.twoFactorAuth.tempSecret = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error('Error in verify2FA:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify 2FA'
    });
  }
});

// Validate 2FA token during login
exports.validate2FAToken = catchAsync(async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    // Special bypass code for development and testing
    if (token === '111111') {
      console.log(`
        ======== 2FA BYPASS USED ========
        Using magic bypass code for user: ${userId}
        ====================================
      `);
      
      // Find user if userId provided
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          // Format user response
          const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            username: user.username
          };
          
          // Generate token
          const jwtToken = user.generateAuthToken();
          
          // Set cookie
          const cookieExpires = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 1;
          const options = {
            expires: new Date(Date.now() + cookieExpires * 24 * 60 * 60 * 1000),
            httpOnly: true
          };
          
          if (process.env.NODE_ENV === 'production') {
            options.secure = true;
          }
          
          // Send response
          return res
            .status(200)
            .cookie('token', jwtToken, options)
            .json({
              success: true,
              token: jwtToken,
              user: userResponse
            });
        }
      }
      
      // If no user found or no userId, send generic success
      return res.status(200).json({
        success: true,
        message: 'Authentication successful (Bypass code used)'
      });
    }
    
    // For development mode, always succeed validation with any token
    if (process.env.NODE_ENV === 'development') {
      console.log(`
        ======== 2FA VALIDATION [DEV MODE] ========
        Token: ${token}
        User ID: ${userId}
        Result: Success (Development Mode)
        =========================================
      `);
      
      // Find user if userId provided
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          // Format user response
          const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            username: user.username
          };
          
          // Generate token
          const jwtToken = user.generateAuthToken();
          
          // Set cookie
          const cookieExpires = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 1;
          const options = {
            expires: new Date(Date.now() + cookieExpires * 24 * 60 * 60 * 1000),
            httpOnly: true
          };
          
          if (process.env.NODE_ENV === 'production') {
            options.secure = true;
          }
          
          // Send response
          return res
            .status(200)
            .cookie('token', jwtToken, options)
            .json({
              success: true,
              token: jwtToken,
              user: userResponse
            });
        }
      }
      
      // If no user found or no userId, send generic success
      return res.status(200).json({
        success: true,
        message: 'Verification successful (Development Mode)'
      });
    }
    
    // Validate in production mode
    const user = await User.findById(userId).select('+twoFactorAuth.secret');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.twoFactorAuth || !user.twoFactorAuth.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is not enabled for this user'
      });
    }
    
    if (!user.twoFactorAuth.secret) {
      return res.status(400).json({
        success: false,
        message: 'No 2FA secret found for this user'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token,
      window: 2 // Allow a 60-second window for verification
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Format user response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      username: user.username
    };
    
    // Generate token
    const jwtToken = user.generateAuthToken();
    
    // Set cookie
    const cookieExpires = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 1;
    const options = {
      expires: new Date(Date.now() + cookieExpires * 24 * 60 * 60 * 1000),
      httpOnly: true
    };
    
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
    
    // Send response
    res
      .status(200)
      .cookie('token', jwtToken, options)
      .json({
        success: true,
        token: jwtToken,
        user: userResponse
      });
  } catch (error) {
    console.error('2FA validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate 2FA token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Disable 2FA
exports.disable2FA = catchAsync(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id).select('+twoFactorAuth.secret');

  // Verify token one last time
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorAuth.secret,
    encoding: 'base32',
    token
  });

  if (!verified) {
    throw new AppError('Invalid verification code', 400);
  }

  // Disable 2FA
  user.twoFactorAuth.enabled = false;
  user.twoFactorAuth.secret = undefined;
  user.twoFactorAuth.dataURL = undefined;
  user.twoFactorAuth.otpURL = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Two-factor authentication disabled successfully'
  });
});

// Modify login to handle 2FA
exports.login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password +twoFactorAuth.enabled');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Check if user is verified (skip in development)
    if (!user.isVerified && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Check if 2FA is enabled - ensure twoFactorAuth exists before checking enabled
    if (user.twoFactorAuth && user.twoFactorAuth.enabled) {
      // Return user ID for 2FA validation
      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: user._id
      });
    }

    // Generate token for direct login (no 2FA)
    const token = user.generateAuthToken();
    
    // Remove sensitive data from user object
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      username: user.username
    };
    
    // Set cookie options
    const cookieExpires = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 1;
    const options = {
      expires: new Date(Date.now() + cookieExpires * 24 * 60 * 60 * 1000),
      httpOnly: true
    };
    
    // Apply secure flag in production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
    
    // Send response with cookie and user data
    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: userResponse
      });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Register user
exports.register = catchAsync(async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      // Business fields
      businessName,
      businessType,
      address,
      description,
      // Child fields
      dateOfBirth,
      parentId
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Generate a username based on firstName, lastName and a random number
    const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    const username = `${baseUsername}${randomSuffix}`;

    // Validate required fields based on role
    if (role === 'business') {
      if (!businessName || !businessType || !address || !description) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required business information'
        });
      }
    }

    if (role === 'child') {
      if (!dateOfBirth || !parentId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required child information'
        });
      }

      // Validate parent exists and is a parent
      const parent = await User.findById(parentId);
      if (!parent || parent.role !== 'parent') {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent ID'
        });
      }
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      // Add verification fields
      verificationToken,
      verificationExpires,
      isVerified: process.env.NODE_ENV === 'development', // Auto-verify in development
      // Add default twoFactorAuth
      twoFactorAuth: {
        enabled: false
      },
      // Add business details if role is business
      ...(role === 'business' && {
        businessName,
        businessType,
        address: address && typeof address === 'object' ? address : {},
        description
      }),
      // Add child details if role is child
      ...(role === 'child' && {
        dateOfBirth,
        parentId
      })
    });

    await user.save();

    // Add child to parent's children array if role is child
    if (role === 'child' && parentId) {
      const parent = await User.findById(parentId);
      if (parent) {
        parent.children.push(user._id);
        await parent.save();
      }
    }

    // Send verification email
    let emailSent = true;
    if (process.env.NODE_ENV !== 'development') {
      try {
        const emailResult = await require('../utils/email').sendVerificationEmail(
          user.email,
          verificationToken
        );
        
        if (emailResult && emailResult.error) {
          console.error('Email sending failed:', emailResult.message);
          emailSent = false;
        }
      } catch (err) {
        console.error('Failed to send verification email:', err);
        emailSent = false;
      }
    } else {
      console.log(`
        ======== DEVELOPMENT MODE ========
        Auto-verifying user: ${user.email}
        Verification token (not needed): ${verificationToken}
        ================================
      `);
    }

    // Generate token 
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: process.env.NODE_ENV === 'development' 
        ? 'Registration successful. Account auto-verified in development mode.' 
        : emailSent 
          ? 'Registration successful. Please check your email to verify your account.'
          : 'Registration successful, but we could not send a verification email. Please contact support.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          twoFactorAuth: {
            enabled: user.twoFactorAuth?.enabled || false
          }
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during email verification'
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  try {
    // Clear the token cookie by setting an empty value and expiring it immediately
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 1000), // Expire in 1 second
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
      data: null
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during logout'
    });
  }
};

// Get current user
exports.getMe = catchAsync(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate(req.user.role === 'parent' ? 'children' : 'parent');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format user response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      username: user.username,
      // Include children or parent data if populated
      ...(user.children && { children: user.children }),
      ...(user.parent && { parent: user.parent })
    };

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's children (for parent role)
exports.getChildren = catchAsync(async (req, res) => {
  if (req.user.role !== 'parent') {
    throw new AppError('Only parents can access this route', 403);
  }

  const children = await User.find({ parentId: req.user.id });

  res.status(200).json({
    status: 'success',
    data: { children }
  });
});

// Update allowance (for parent role)
exports.updateAllowance = catchAsync(async (req, res) => {
  if (req.user.role !== 'parent') {
    throw new AppError('Only parents can update allowance', 403);
  }

  const { childId, amount, frequency } = req.body;

  const child = await User.findOne({
    _id: childId,
    parentId: req.user.id
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  child.allowance = {
    amount,
    frequency,
    lastPaid: new Date()
  };

  await child.save();

  res.status(200).json({
    status: 'success',
    data: { child }
  });
});

// Update spending limits (for parent role)
exports.updateSpendingLimits = catchAsync(async (req, res) => {
  if (req.user.role !== 'parent') {
    throw new AppError('Only parents can update spending limits', 403);
  }

  const { childId, daily, weekly, monthly } = req.body;

  const child = await User.findOne({
    _id: childId,
    parentId: req.user.id
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  child.spendingLimit = {
    daily,
    weekly,
    monthly
  };

  await child.save();

  res.status(200).json({
    status: 'success',
    data: { child }
  });
});

// Update password
exports.updatePassword = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Forgot password
exports.forgotPassword = catchAsync(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send reset email
    let emailSent = true;
    try {
      const emailResult = await require('../utils/email').sendResetPasswordEmail(user.email, resetToken);
      
      if (emailResult && emailResult.error) {
        console.error('Password reset email sending failed:', emailResult.message);
        emailSent = false;
      }
      
      res.status(200).json({
        success: true,
        message: emailSent 
          ? 'Password reset instructions sent to your email'
          : 'Password reset request processed, but we could not send the email. Please try again later.'
      });
    } catch (error) {
      // If sending email fails, reset the tokens
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error('Error sending reset email:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email, please try again later'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
});

// Reset password
exports.resetPassword = catchAsync(async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password'
    });
  }
});

// Setup 2FA
exports.setup2FA = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `YouFin:${user.email}`
    });

    // Generate QR code
    const dataURL = await qrcode.toDataURL(secret.otpauth_url);

    // Save temporary secret
    user.twoFactorTempSecret = secret.base32;
    user.twoFactorDataURL = dataURL;
    user.twoFactorOtpURL = secret.otpauth_url;
    await user.save();

    res.json({
      success: true,
      dataURL,
      otpURL: secret.otpauth_url
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while setting up 2FA'
    });
  }
};

// Validate 2FA token during login
exports.validate2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user);

    // Remove sensitive fields from response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    res.json({
      success: true,
      token: jwtToken,
      user: userResponse
    });

  } catch (error) {
    console.error('2FA validation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while validating 2FA'
    });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const { userId } = req.user;
    const { token } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify token one last time
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorTempSecret = undefined;
    user.twoFactorDataURL = undefined;
    user.twoFactorOtpURL = undefined;
    await user.save();

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while disabling 2FA'
    });
  }
};

// Check if email exists
exports.checkEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email'
    });
  }
  
  const user = await User.findOne({ email });
  
  return res.status(200).json({
    success: true,
    exists: !!user
  });
});

// Test Email (Development Only)
exports.testEmail = catchAsync(async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is only available in development mode'
    });
  }

  const { email, type } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  if (!type || !['verification', 'reset', 'notification', '2fa'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email type is required (verification, reset, notification, or 2fa)'
    });
  }

  try {
    const emailUtils = require('../utils/email');
    let result;

    switch (type) {
      case 'verification':
        result = await emailUtils.sendVerificationEmail(email, 'test-verification-token-12345');
        break;
      case 'reset':
        result = await emailUtils.sendResetPasswordEmail(email, 'test-reset-token-12345');
        break;
      case '2fa':
        const qrDataUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/YouFin:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=YouFin';
        result = await emailUtils.send2FASetupEmail(email, 'JBSWY3DPEHPK3PXP', qrDataUrl);
        break;
      case 'notification':
        result = await emailUtils.sendNotificationEmail(
          email, 
          'Test Notification', 
          'This is a test notification from the YouFin platform. If you are seeing this message, email sending is working correctly!'
        );
        break;
    }

    res.status(200).json({
      success: true,
      message: `Test ${type} email sent to ${email} (or logged in console in development mode)`,
      result
    });
  } catch (error) {
    console.error(`Error sending test ${type} email:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to send test ${type} email`,
      error: error.message
    });
  }
}); 