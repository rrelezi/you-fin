const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['food', 'shopping', 'entertainment', 'education', 'bank'],
    required: true
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
  address: {
    street: String,
    city: String,
    country: {
      type: String,
      default: 'Albania'
    }
  },
  description: {
    type: String,
    trim: true
  },
  budget_category: String,
  offers: [{
    title: String,
    description: String,
    discount: String,
    validUntil: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  raiffeisen_info: {
    type: String,
    default: null
  },
  operating_hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  price_level: {
    type: Number,
    min: 1,
    max: 3,
    default: 1
  }
});

// Index for geospatial queries
businessSchema.index({ location: '2dsphere' });

// Method to find nearby businesses
businessSchema.statics.findNearby = function(coordinates, maxDistance = 5000) {
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
  });
};

// Method to add an offer
businessSchema.methods.addOffer = async function(offer) {
  this.offers.push(offer);
  await this.save();
  return this;
};

// Method to get active offers
businessSchema.methods.getActiveOffers = function() {
  return this.offers.filter(offer => 
    offer.isActive && offer.validUntil > new Date()
  );
};

// Static method to find businesses by type
businessSchema.statics.findByType = function(type) {
  return this.find({ type });
};

// Populate with some Albanian cities' coordinates
businessSchema.statics.ALBANIAN_CITIES = {
  TIRANA: [41.3275, 19.8187],
  DURRES: [41.3233, 19.4417],
  VLORE: [40.4667, 19.4833],
  SHKODER: [42.0683, 19.5126],
  ELBASAN: [41.1125, 20.0822],
  KORCE: [40.6167, 20.7833],
  FIER: [40.7239, 19.5567]
};

const Business = mongoose.model('Business', businessSchema);

module.exports = Business; 