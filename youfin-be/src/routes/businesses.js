const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Get all businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get nearby businesses
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, distance = 5000 } = req.query;
    const businesses = await Business.findNearby([parseFloat(lng), parseFloat(lat)], parseFloat(distance));
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get businesses by type
router.get('/type/:type', async (req, res) => {
  try {
    const businesses = await Business.findByType(req.params.type);
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active offers
router.get('/offers', async (req, res) => {
  try {
    const businesses = await Business.find({ 'offers.isActive': true });
    const activeOffers = businesses.map(business => ({
      businessId: business._id,
      businessName: business.name,
      offers: business.getActiveOffers()
    }));
    res.json(activeOffers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new business
router.post('/', async (req, res) => {
  const business = new Business({
    ...req.body,
    location: {
      type: 'Point',
      coordinates: [req.body.lng, req.body.lat]
    }
  });

  try {
    const newBusiness = await business.save();
    res.status(201).json(newBusiness);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add an offer to a business
router.post('/:id/offers', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const updatedBusiness = await business.addOffer(req.body);
    res.json(updatedBusiness);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Seed some initial Albanian businesses
router.post('/seed', async (req, res) => {
  try {
    const seedBusinesses = [
      {
        name: 'Tirana Coffee Shop',
        type: 'food',
        location: {
          type: 'Point',
          coordinates: [19.8187, 41.3275] // Tirana coordinates
        },
        address: {
          street: 'Rruga Myslym Shyri',
          city: 'Tirana',
          country: 'Albania'
        },
        description: 'Popular coffee shop in central Tirana',
        budget_category: 'dining',
        price_level: 2
      },
      {
        name: 'Raiffeisen Bank - Tirana Main',
        type: 'bank',
        location: {
          type: 'Point',
          coordinates: [19.8195, 41.3280]
        },
        address: {
          street: 'Bulevardi Bajram Curri',
          city: 'Tirana',
          country: 'Albania'
        },
        description: 'Main branch of Raiffeisen Bank',
        raiffeisen_info: 'Learn about student savings accounts and financial literacy programs'
      },
      {
        name: 'TEG Shopping Center',
        type: 'shopping',
        location: {
          type: 'Point',
          coordinates: [19.8450, 41.3200]
        },
        address: {
          street: 'Rruga e Elbasanit',
          city: 'Tirana',
          country: 'Albania'
        },
        description: 'Largest shopping mall in Tirana',
        budget_category: 'shopping',
        price_level: 3
      }
    ];

    await Business.insertMany(seedBusinesses);
    res.status(201).json({ message: 'Seed data inserted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Catch a deal
router.post('/catch-deal', async (req, res) => {
  try {
    const { businessId, offerId, userId, location } = req.body;
    
    // Find the business and offer
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const offer = business.offers.id(offerId);
    if (!offer || !offer.isActive) {
      return res.status(400).json({ message: 'Offer not available' });
    }

    // Check if user is within range
    const userLocation = location;
    const businessLocation = business.location.coordinates;
    const distance = calculateDistance(
      userLocation[0],
      userLocation[1],
      businessLocation[1],
      businessLocation[0]
    );

    if (distance > 100) { // 100 meters range
      return res.status(400).json({ message: 'Too far from the business to catch this deal' });
    }

    // Mark offer as caught
    offer.isActive = false;
    offer.claimedBy = userId;
    offer.claimedAt = new Date();
    await business.save();

    // Get user's spending history for AI analysis
    const Spending = require('../models/Spending');
    const userHistory = await Spending.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      message: 'Deal caught successfully!',
      offer,
      type: business.type,
      userHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analyze deal with AI
router.post('/analyze-deal', async (req, res) => {
  try {
    const { dealType, userHistory } = req.body;

    // Prepare context for AI
    const context = `
      Deal type: ${dealType}
      Recent spending history:
      ${userHistory.map(h => `- ${h.amount}€ on ${h.category}`).join('\n')}
      
      Analyze if this deal is good for the user and provide a recommendation.
    `;

    // Get AI recommendation
    const aiResponse = await hf.textGeneration({
      model: 'gpt2',
      inputs: context,
      parameters: {
        max_length: 100,
        num_return_sequences: 1
      }
    });

    res.json({
      recommendation: aiResponse.generated_text.trim()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

module.exports = router; 