const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * @route   GET api/rewards/nearby
 * @desc    Get nearby rewards based on location
 * @access  Private
 */
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ msg: 'Location coordinates are required' });
    }

    // In a production environment, you would query a database 
    // for rewards near the provided coordinates
    // This is a simplified example returning mock data
    
    // Example of how this would work with MongoDB:
    /*
    const rewards = await Reward.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 5000 // 5km radius
        }
      },
      isActive: true
    }).limit(10);
    */
    
    // Mock data for demonstration
    const rewards = [
      {
        id: 1,
        name: "Starbucks Coffee",
        type: "Cafe",
        address: "123 Main St",
        distance: "0.2 km",
        rewards: [
          { type: "cashback", value: "5%" },
          { type: "points", value: "2x" }
        ],
        lat: parseFloat(lat) + 0.001,
        lng: parseFloat(lng) + 0.001
      },
      {
        id: 2,
        name: "Target",
        type: "Retail",
        address: "456 Market St",
        distance: "0.5 km",
        rewards: [
          { type: "cashback", value: "3%" },
          { type: "points", value: "1.5x" }
        ],
        lat: parseFloat(lat) - 0.001,
        lng: parseFloat(lng) - 0.001
      },
      {
        id: 3,
        name: "Whole Foods",
        type: "Grocery",
        address: "789 Oak St",
        distance: "0.8 km",
        rewards: [
          { type: "cashback", value: "4%" },
          { type: "points", value: "2x" }
        ],
        lat: parseFloat(lat) + 0.002,
        lng: parseFloat(lng) - 0.002
      },
      {
        id: 4,
        name: "Apple Store",
        type: "Tech",
        address: "1 Infinite Loop",
        distance: "1.2 km",
        rewards: [
          { type: "cashback", value: "2%" },
          { type: "points", value: "3x" }
        ],
        lat: parseFloat(lat) - 0.002,
        lng: parseFloat(lng) + 0.003
      },
      {
        id: 5,
        name: "Gym Plus",
        type: "Fitness",
        address: "42 Exercise Way",
        distance: "1.5 km",
        rewards: [
          { type: "cashback", value: "10%" }
        ],
        lat: parseFloat(lat) + 0.003,
        lng: parseFloat(lng) - 0.001
      }
    ];
    
    res.json(rewards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST api/rewards/redeem
 * @desc    Redeem a reward
 * @access  Private
 */
router.post('/redeem', auth, async (req, res) => {
  try {
    const { rewardId } = req.body;
    
    if (!rewardId) {
      return res.status(400).json({ msg: 'Reward ID is required' });
    }
    
    // In production, you would:
    // 1. Check if the reward exists
    // 2. Check if the user has already redeemed it
    // 3. Apply the reward to the user's account
    // 4. Save a record of the redemption
    
    // Update user record with the redeemed reward
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Add the reward to the user's redeemedRewards array
    // This is just an example - modify based on your actual User model
    if (!user.redeemedRewards) {
      user.redeemedRewards = [];
    }
    
    // Check if already redeemed
    if (user.redeemedRewards.includes(rewardId)) {
      return res.status(400).json({ msg: 'Reward already redeemed' });
    }
    
    user.redeemedRewards.push(rewardId);
    await user.save();
    
    res.json({ 
      success: true, 
      msg: 'Reward successfully redeemed',
      rewardId
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/rewards/redeemed
 * @desc    Get user's redeemed rewards
 * @access  Private
 */
router.get('/redeemed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Return the list of redeemed rewards
    // In production, you'd likely want to join with the Rewards collection
    // to get the full details of each redeemed reward
    
    res.json({
      redeemedRewards: user.redeemedRewards || []
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 