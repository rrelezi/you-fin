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

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      // Business fields (only if role is business)
      ...(role === 'business' && {
        businessName,
        businessType,
        address,
        description
      }),
      // Child fields (only if role is child)
      ...(role === 'child' && {
        dateOfBirth,
        parentId
      }),
      verificationToken,
      verificationExpires,
      // Auto-verify in development mode
      isVerified: process.env.NODE_ENV === 'development'
    });

    // If user is a child, add them to parent's children array
    if (role === 'child') {
      await User.findByIdAndUpdate(parentId, {
        $push: { children: user._id }
      });
    }

    // Send verification email (only in production)
    if (process.env.NODE_ENV !== 'development') {
      await sendVerificationEmail(user.email, verificationToken);
    } else {
      console.log(`
        ======== DEVELOPMENT MODE ========
        Auto-verifying user: ${user.email}
        Verification token (not needed): ${verificationToken}
        ================================
      `);
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove sensitive fields from response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    res.status(201).json({
      success: true,
      message: process.env.NODE_ENV === 'development' 
        ? 'Registration successful. Account auto-verified in development mode.' 
        : 'Registration successful. Please check your email to verify your account.',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
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
    return next(new AppError('Please verify your email before logging in', 401));
  }

  // If 2FA is enabled, return success with requires2FA flag
  if (user.twoFactorAuth && user.twoFactorAuth.enabled) {
    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`
        ======== 2FA REQUIRED ========
        User: ${user.email}
        UserID: ${user._id}
        =============================
      `);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Two-factor authentication required',
      requires2FA: true,
      userId: user._id
    });
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // If 2FA not enabled, send token response
  sendTokenResponse(user, 200, res);
});

// Validate 2FA token during login
exports.validate2FAToken = catchAsync(async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    if (!token) {
      return res.status(400).json({
        status: 'fail',
        message: 'Verification code is required'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId).select('+twoFactorAuth.secret');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({
        status: 'fail',
        message: 'Two-factor authentication is not enabled for this user'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token,
      window: 2 // Allow a 60-second window for code verification
    });

    if (!verified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid verification code. Please try again.'
      });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Send token response with detailed success message
    const jwtToken = user.generateAuthToken();
    
    // Remove sensitive data from user object
    user.password = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    if (user.twoFactorAuth) {
      user.twoFactorAuth.secret = undefined;
      user.twoFactorAuth.tempSecret = undefined;
    }
    
    // Log successful verification in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`
        ======== 2FA VERIFICATION SUCCESSFUL ========
        User: ${user.email}
        UserID: ${user._id}
        Time: ${new Date().toISOString()}
        ============================================
      `);
    }

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication successful',
      token: jwtToken,
      user
    });
  } catch (error) {
    console.error('2FA validation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during 2FA validation'
    });
  }
});

// Generate 2FA secret
exports.generate2FASecret = async (req, res) => {
  try {
    console.log("Generate 2FA Secret endpoint hit");
    
    // Always allow in development mode
    if (process.env.NODE_ENV === 'development') {
      // Create a test secret for development
      const secret = speakeasy.generateSecret({
        name: `YouFin (test@example.com)`
      });
      
      // Generate QR code
      const dataURL = await qrcode.toDataURL(secret.otpauth_url);
      
      console.log(`
        ======== 2FA SETUP [DEV MODE] ========
        Secret: ${secret.base32}
        OTP URL: ${secret.otpauth_url}
        =====================================
      `);
      
      return res.status(200).json({
        status: 'success',
        data: {
          otpURL: secret.otpauth_url,
          dataURL,
          secret: secret.base32
        }
      });
    }
    
    // Production mode with auth check
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required'
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `YouFin (${user.email})`
    });

    console.log("Generated 2FA secret");

    // Save temp secret
    if (!user.twoFactorAuth) {
      user.twoFactorAuth = {
        enabled: false,
        tempSecret: null,
        dataURL: null,
        otpURL: null
      };
    }
    
    user.twoFactorAuth.tempSecret = secret.base32;
    user.twoFactorAuth.otpURL = secret.otpauth_url;
    
    // Generate QR code
    const dataURL = await qrcode.toDataURL(secret.otpauth_url);
    user.twoFactorAuth.dataURL = dataURL;
    
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        otpURL: secret.otpauth_url,
        dataURL,
        secret: secret.base32
      }
    });
  } catch (error) {
    console.error("Error in generate2FASecret:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate 2FA secret',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify and enable 2FA
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    
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
    
    // For production, require authentication
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required'
      });
    }
    
    const user = await User.findById(req.user.id).select('+twoFactorAuth.tempSecret');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    if (!user.twoFactorAuth || !user.twoFactorAuth.tempSecret) {
      return res.status(400).json({
        status: 'fail',
        message: 'No temporary secret found. Please generate a new one.'
      });
    }
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.tempSecret,
      encoding: 'base32',
      token,
      window: 2 // Allow a 60-second window for verification
    });
    
    if (!verified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid verification code'
      });
    }
    
    // Enable 2FA
    user.twoFactorAuth.secret = user.twoFactorAuth.tempSecret;
    user.twoFactorAuth.enabled = true;
    user.twoFactorAuth.tempSecret = undefined;
    await user.save({ validateBeforeSave: false });

    // Log success
    console.log(`
      ======== 2FA ENABLED ========
      User: ${user.email}
      =============================
    `);

    res.status(200).json({
      status: 'success',
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error("Error in verify2FA:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify 2FA',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Check if email exists
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is required'
      });
    }
    
    // Check if user with this email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    // Log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`
        ======== EMAIL CHECK ========
        Email: ${email}
        Exists: ${!!existingUser}
        ===========================
      `);
    }
    
    return res.status(200).json({
      status: 'success',
      exists: !!existingUser
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check email'
    });
  }
}; 