const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Process voice input for expenses using AI
router.post('/process-expense', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Use BERT-based model for expense classification
    const classification = await hf.textClassification({
      model: 'ProsusAI/finbert',
      inputs: text
    });

    // Extract amount using regex
    const amountMatch = text.match(/(\d+(?:\.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    // Use GPT-2 for generating description
    const enhancedDescription = await hf.textGeneration({
      model: 'gpt2',
      inputs: `Expense description: ${text}`,
      parameters: {
        max_length: 50,
        num_return_sequences: 1
      }
    });

    // Categorize expense based on keywords and AI classification
    let category = 'other';
    const keywords = {
      food: ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee'],
      shopping: ['shop', 'store', 'mall', 'buy', 'purchase'],
      entertainment: ['movie', 'cinema', 'game', 'fun', 'entertainment'],
      education: ['book', 'course', 'class', 'study'],
      transport: ['bus', 'taxi', 'transport', 'travel']
    };

    const lowercaseText = text.toLowerCase();
    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(word => lowercaseText.includes(word))) {
        category = cat;
        break;
      }
    }

    res.json({
      amount,
      category,
      description: enhancedDescription.generated_text.trim(),
      confidence: classification[0].score,
      processed_text: text
    });
  } catch (error) {
    console.error('AI Processing Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get AI-powered financial advice
router.get('/advice/:userId', async (req, res) => {
  try {
    const Spending = require('../models/Spending');
    const User = require('../models/User');

    const userId = req.params.userId;
    
    // Get user's spending history
    const spendingHistory = await Spending.find({ userId })
      .sort({ timestamp: -1 })
      .limit(30);

    // Calculate spending patterns
    const spendingByCategory = {};
    let totalSpent = 0;

    spendingHistory.forEach(spend => {
      spendingByCategory[spend.category] = (spendingByCategory[spend.category] || 0) + spend.amount;
      totalSpent += spend.amount;
    });

    // Get user's budget
    const user = await User.findById(userId);
    const budget = user?.budget || 0;

    // Generate context for AI
    const context = `
      User spending summary:
      - Total spent: ${totalSpent}€
      - Budget: ${budget}€
      - Top expenses: ${Object.entries(spendingByCategory)
        .sort(([,a], [,b]) => b - a)
        .map(([cat, amt]) => `${cat}: ${amt}€`)
        .join(', ')}
      
      Generate personalized financial advice.
    `;

    // Use GPT-2 for generating personalized advice
    const aiAdvice = await hf.textGeneration({
      model: 'gpt2',
      inputs: context,
      parameters: {
        max_length: 150,
        num_return_sequences: 1
      }
    });

    // Structure the advice
    const advice = {
      summary: "Based on AI analysis of your spending patterns:",
      recommendations: [],
      savingTips: []
    };

    // Process AI-generated advice
    const aiText = aiAdvice.generated_text;
    const sentences = aiText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Categorize sentences into recommendations and tips
    sentences.forEach((sentence, i) => {
      if (i < sentences.length / 2) {
        advice.recommendations.push(sentence.trim());
      } else {
        advice.savingTips.push(sentence.trim());
      }
    });

    // Add category-specific recommendations
    Object.entries(spendingByCategory).forEach(([category, amount]) => {
      const percentage = (amount / totalSpent) * 100;
      if (percentage > 30) {
        advice.recommendations.push(
          `Your ${category} expenses (${percentage.toFixed(1)}%) seem high. Consider setting a category budget.`
        );
      }
    });

    res.json(advice);
  } catch (error) {
    console.error('AI Advice Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get AI-powered spending predictions
router.get('/predictions/:userId', async (req, res) => {
  try {
    const Spending = require('../models/Spending');
    
    const userId = req.params.userId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get current month's spending
    const currentMonthSpending = await Spending.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Prepare data for AI prediction
    const spendingData = currentMonthSpending.map(({ _id, total }) => 
      `${_id}: ${total}€`
    ).join('\n');

    // Use GPT-2 for spending predictions
    const aiPrediction = await hf.textGeneration({
      model: 'gpt2',
      inputs: `Based on current month spending:\n${spendingData}\n\nPredict next month's spending and provide recommendations.`,
      parameters: {
        max_length: 100,
        num_return_sequences: 1
      }
    });

    // Process spending data
    let totalSpent = 0;
    const categorySpending = {};

    currentMonthSpending.forEach(({ _id: category, total }) => {
      categorySpending[category] = total;
      totalSpent += total;
    });

    // Structure predictions
    const predictions = {
      nextMonth: {
        expectedSpending: Math.round(totalSpent * 1.1), // 10% buffer
        topCategories: Object.entries(categorySpending)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([category]) => category),
        savingsPotential: Math.round(totalSpent * 0.2)
      },
      recommendations: []
    };

    // Process AI predictions
    const aiText = aiPrediction.generated_text;
    predictions.recommendations = aiText
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());

    res.json(predictions);
  } catch (error) {
    console.error('AI Prediction Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 