const express = require('express');
const router = express.Router();

// Mock AI responses for the hackathon
const aiSuggestions = {
  'How much can I spend today?': (user) => {
    const dailyBudget = (user.budget - user.spent) / 30;
    return {
      suggestion: `Based on your monthly budget of ${user.budget}€ and current spending of ${user.spent}€, you can spend around ${dailyBudget.toFixed(2)}€ today to stay on track.`,
    };
  },
  'Where should I save money?': (user) => ({
    suggestion: 'Based on your spending patterns, you could save money by:\n1. Bringing lunch from home\n2. Using public transport more\n3. Looking for student discounts\n4. Setting aside 10% of your allowance automatically',
  }),
  'Analyze my spending habits': (user) => ({
    suggestion: `You've spent ${user.spent}€ out of ${user.budget}€ this month. Most of your spending seems to be on food and entertainment. Consider setting specific limits for each category.`,
  }),
  'Suggest a budget plan': (user) => ({
    suggestion: `Here's a suggested monthly budget breakdown:\n- Essential food: 30% (${(user.budget * 0.3).toFixed(2)}€)\n- Transport: 15% (${(user.budget * 0.15).toFixed(2)}€)\n- Entertainment: 20% (${(user.budget * 0.2).toFixed(2)}€)\n- Savings: 25% (${(user.budget * 0.25).toFixed(2)}€)\n- Emergency: 10% (${(user.budget * 0.1).toFixed(2)}€)`,
  }),
};

// AI suggestion endpoint
router.post('/suggest', (req, res) => {
  const { message, userId, budget, spent } = req.body;
  
  // Check for exact matches in predefined responses
  const exactMatch = aiSuggestions[message];
  if (exactMatch) {
    return res.json(exactMatch({ budget, spent }));
  }

  // Process other types of questions
  if (message.toLowerCase().includes('buy') || message.toLowerCase().includes('spend')) {
    const amount = message.match(/\d+/) ? parseInt(message.match(/\d+/)[0]) : null;
    
    if (amount) {
      const remainingBudget = budget - spent;
      const isGoodIdea = amount < remainingBudget * 0.2; // Less than 20% of remaining budget
      
      const response = {
        suggestion: isGoodIdea
          ? `Yes, spending ${amount}€ seems reasonable given your current budget. You still have ${remainingBudget}€ left this month.`
          : `I'd be careful about spending ${amount}€ right now. It's ${((amount/remainingBudget)*100).toFixed(1)}% of your remaining budget (${remainingBudget}€).`,
        transaction: isGoodIdea ? {
          userId,
          amount,
          description: `AI Approved: ${message}`,
          timestamp: new Date()
        } : null
      };
      
      return res.json(response);
    }
  }

  // Default response for unhandled questions
  res.json({
    suggestion: "I understand you're asking about your finances. Could you be more specific about what you'd like to know about your spending or budget?"
  });
});

module.exports = router; 