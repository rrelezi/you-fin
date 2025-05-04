const express = require('express');
const router = express.Router();
const Spending = require('../models/Spending');
const User = require('../models/User');
const Business = require('../models/Business');

// Get user's spending history
router.get('/user/:userId', async (req, res) => {
  try {
    const spending = await Spending.find({ userId: req.params.userId })
      .populate('businessId')
      .sort({ timestamp: -1 });
    res.json(spending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get spending by category
router.get('/user/:userId/categories', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const spending = await Spending.getSpendingByCategory(
      req.params.userId,
      new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(endDate || Date.now())
    );
    res.json(spending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get daily spending
router.get('/user/:userId/daily', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const spending = await Spending.getDailySpending(req.params.userId, parseInt(days));
    res.json(spending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new spending
router.post('/', async (req, res) => {
  try {
    const { userId, businessId, amount, description, category } = req.body;

    // Get business location
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Create spending record
    const spending = new Spending({
      userId,
      businessId,
      amount,
      description,
      category: category || business.type,
      location: business.location
    });

    // Update user's spent amount
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is a child, check if spending needs parent approval
    if (user.role === 'child' && amount > 20) { // Threshold for parent approval
      spending.isApprovedByParent = false;
    } else {
      spending.isApprovedByParent = true;
      await user.updateSpent(amount);
    }

    const savedSpending = await spending.save();
    
    // If parent approval is needed, notify parent (implement notification later)
    if (!spending.isApprovedByParent && user.parentId) {
      // TODO: Send notification to parent
      console.log(`Spending approval needed for user ${userId}`);
    }

    res.status(201).json(savedSpending);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Parent approve spending
router.post('/:spendingId/approve', async (req, res) => {
  try {
    const spending = await Spending.findById(req.params.spendingId);
    if (!spending) {
      return res.status(404).json({ message: 'Spending not found' });
    }

    const user = await User.findById(spending.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify that the requesting user is the parent
    if (user.parentId.toString() !== req.body.parentId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    spending.isApprovedByParent = true;
    await spending.save();
    await user.updateSpent(spending.amount);

    res.json(spending);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get spending near location
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, distance = 1000 } = req.query;
    const spending = await Spending.getSpendingNearLocation(
      [parseFloat(lng), parseFloat(lat)],
      parseFloat(distance)
    );
    res.json(spending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 