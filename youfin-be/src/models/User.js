const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  username: {
    type: String,
    sparse: true,  // This allows null values without enforcing uniqueness on them
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['business', 'parent', 'child'],
    required: [true, 'Role is required'],
  },
  // Business fields
  businessName: {
    type: String,
    trim: true,
    required: function() { return this.role === 'business'; }
  },
  businessType: {
    type: String,
    enum: ['retail', 'food', 'entertainment', 'education', 'other'],
    required: function() { return this.role === 'business'; }
  },
  address: {
    street: {
      type: String,
      required: function() { return this.role === 'business'; }
    },
    city: {
      type: String,
      required: function() { return this.role === 'business'; }
    },
    state: {
      type: String,
      required: function() { return this.role === 'business'; }
    },
    zipCode: {
      type: String,
      required: function() { return this.role === 'business'; }
    },
    country: {
      type: String,
      required: function() { return this.role === 'business'; }
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    required: function() { return this.role === 'business'; }
  },
  // Parent/Child fields
  dateOfBirth: {
    type: Date,
    required: function() { return this.role === 'child'; }
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.role === 'child'; }
  },
  // 2FA fields
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: {
      type: String,
      select: false
    },
    tempSecret: {
      type: String,
      select: false
    },
    dataURL: String,
    otpURL: String,
    _id: false // Prevent Mongoose from creating an _id for this subdocument
  },
  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Parent-Child relationship
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Child specific fields
  allowance: {
    amount: {
      type: Number,
      default: 0
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly'
    },
    lastPaid: Date
  },
  spendingLimit: {
    daily: {
      type: Number,
      default: 0
    },
    weekly: {
      type: Number,
      default: 0
    },
    monthly: {
      type: Number,
      default: 0
    }
  },
  // Common fields
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update lastLogin
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Generate JWT Token
userSchema.methods.generateAuthToken = function() {
  // Use a default value if JWT_EXPIRES_IN is invalid
  let expiresIn = '1d';
  
  // Valid formats are like '1d', '2h', '30m', or numbers (seconds)
  const validFormat = /^(\d+)([smhdw])$/;
  const isNumeric = /^\d+$/;
  
  if (process.env.JWT_EXPIRES_IN) {
    if (validFormat.test(process.env.JWT_EXPIRES_IN) || 
        isNumeric.test(process.env.JWT_EXPIRES_IN)) {
      expiresIn = process.env.JWT_EXPIRES_IN;
    } else {
      console.warn(`Invalid JWT_EXPIRES_IN format: ${process.env.JWT_EXPIRES_IN}, using default: 1d`);
    }
  }
  
  return jwt.sign(
    { 
      id: this._id,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Generate verification token
userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  return token;
};

// Check if user is a parent
userSchema.methods.isParent = function() {
  return this.role === 'parent';
};

// Check if user is a child
userSchema.methods.isChild = function() {
  return this.role === 'child';
};

// Check if user is a business
userSchema.methods.isBusiness = function() {
  return this.role === 'business';
};

// Get children for parent
userSchema.methods.getChildren = async function() {
  if (!this.isParent()) {
    throw new Error('Only parents can access children');
  }
  return await this.model('User').find({ parentId: this._id });
};

// Virtual populate for parent
userSchema.virtual('parent', {
  ref: 'User',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true
});

// Method to update spent amount
userSchema.methods.updateSpent = async function(amount) {
  this.spent += amount;
  await this.save();
  return this;
};

// Method to add a new goal
userSchema.methods.addGoal = async function(goal) {
  this.goals.push(goal);
  await this.save();
  return this;
};

// Method to update goal progress
userSchema.methods.updateGoalProgress = async function(goalId, amount) {
  const goal = this.goals.id(goalId);
  if (!goal) throw new Error('Goal not found');
  goal.currentAmount += amount;
  await this.save();
  return goal;
};

// Static method to find children of a parent
userSchema.statics.findChildren = function(parentId) {
  return this.find({ parentId });
};

const User = mongoose.model('User', userSchema);

module.exports = User; 