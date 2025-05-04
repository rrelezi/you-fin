const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user
router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user
router.patch('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    Object.keys(req.body).forEach(key => {
      user[key] = req.body[key];
    });

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add child to parent
router.post('/:parentId/children', async (req, res) => {
  try {
    const parent = await User.findById(req.params.parentId);
    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({ message: 'Parent not found' });
    }

    const child = new User({
      ...req.body,
      role: 'child',
      parentId: parent._id
    });

    const savedChild = await child.save();
    parent.children.push(savedChild._id);
    await parent.save();

    res.status(201).json(savedChild);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get parent's children
router.get('/:parentId/children', async (req, res) => {
  try {
    const children = await User.findChildren(req.params.parentId);
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add goal for user
router.post('/:userId/goals', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await user.addGoal(req.body);
    res.status(201).json(updatedUser.goals[updatedUser.goals.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update goal progress
router.patch('/:userId/goals/:goalId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedGoal = await user.updateGoalProgress(req.params.goalId, req.body.amount);
    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Seed initial users
router.post('/seed', async (req, res) => {
  try {
    const seedUsers = [
      {
        name: 'Parent Demo',
        email: 'parent@demo.com',
        role: 'parent',
        budget: 1000
      },
      {
        name: 'Child Demo',
        email: 'child@demo.com',
        role: 'child',
        budget: 100,
        spent: 30,
        goals: [{
          name: 'New Phone',
          targetAmount: 500,
          currentAmount: 200,
          deadline: new Date('2024-06-01')
        }]
      },
      {
        name: 'Business Demo',
        email: 'business@demo.com',
        role: 'business'
      }
    ];

    const users = await User.insertMany(seedUsers);
    
    // Set up parent-child relationship
    const parent = users[0];
    const child = users[1];
    
    child.parentId = parent._id;
    parent.children.push(child._id);
    
    await Promise.all([
      parent.save(),
      child.save()
    ]);

    res.status(201).json({ message: 'Seed data inserted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 