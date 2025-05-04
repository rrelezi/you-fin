const mongoose = require('mongoose');

const spendingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['food', 'shopping', 'entertainment', 'education', 'transport', 'other'],
    default: 'other'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital'],
    default: 'cash'
  },
  isApprovedByParent: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  receipt: {
    url: String,
    uploadedAt: Date
  }
});

// Index for geospatial queries
spendingSchema.index({ location: '2dsphere' });

// Method to get spending by category
spendingSchema.statics.getSpendingByCategory = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    }
  ]);
};

// Method to get daily spending
spendingSchema.statics.getDailySpending = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        total: { $sum: '$amount' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

// Method to get spending near location
spendingSchema.statics.getSpendingNearLocation = function(coordinates, maxDistance = 1000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  }).populate('businessId');
};

const Spending = mongoose.model('Spending', spendingSchema);

module.exports = Spending; 