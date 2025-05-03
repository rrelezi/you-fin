import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  BanknotesIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

const AIAssistant = ({ user }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your personal financial assistant. How can I help you today?' }
  ]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'How much have I spent this month?',
    'Give me a budget plan',
    'Analyze my spending habits',
    'Show me saving opportunities',
    'Where should I invest?'
  ]);
  const [loadingInitialData, setLoadingInitialData] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
    
    // Fetch user data and financial insights on initial load
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when new messages are added
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchInitialData = async () => {
    try {
      setLoadingInitialData(true);
      
      // In production, uncomment and use this API call
      // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      // const response = await axios.get(`${API_URL}/api/ai/insights/user/1`);
      
      // Simulated delay and response for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = {
        insights: [
          "Your spending increased by 15% compared to last month",
          "You've reached 85% of your monthly grocery budget",
          "You could save $75 by optimizing subscriptions"
        ]
      };
      
      // Add insights to chat
      if (mockResponse.insights && mockResponse.insights.length) {
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: "Based on your recent financial activity, here are some insights:",
            insights: mockResponse.insights
          }
        ]);
      }

      setLoadingInitialData(false);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      setLoadingInitialData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Clear input and show typing indicator
    const userMessage = message;
    setMessage('');
    setIsTyping(true);
    
    try {
      // In production, uncomment and use this API call
      // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      // const response = await axios.post(`${API_URL}/api/ai/chat`, {
      //   message: userMessage,
      //   userId: user?.id || '1'
      // });
      
      // Simulated AI response for development
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let response = "I'm analyzing your financial data...";
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes('spent') || lowerMsg.includes('spending')) {
        response = "This month, you've spent $1,285.75 in total. Your top spending categories are Groceries ($350), Entertainment ($275), and Dining Out ($220). This is about 12% less than your average monthly spending.";
      } else if (lowerMsg.includes('budget') || lowerMsg.includes('plan')) {
        response = "Based on your income and spending patterns, I recommend this monthly budget: Housing (30%): $1,200, Food (15%): $600, Transportation (10%): $400, Savings (20%): $800, Discretionary (25%): $1,000. Would you like me to set up automatic budget tracking for you?";
      } else if (lowerMsg.includes('analyze') || lowerMsg.includes('habits')) {
        response = "I've analyzed your spending habits and noticed a few patterns. You tend to spend more on weekends, particularly at restaurants and entertainment venues. Your grocery shopping is efficient at $85/week, below the average. However, your subscription services ($65/month) are higher than recommended for your income level.";
      } else if (lowerMsg.includes('save') || lowerMsg.includes('saving')) {
        response = "I found several saving opportunities! You could save about $125/month by: 1) Consolidating your streaming subscriptions ($35), 2) Switching to a different cell phone plan ($40), 3) Using the 'Happy Hour' deals at your regular coffee shop ($50). Would you like me to help with any of these?";
      } else if (lowerMsg.includes('invest') || lowerMsg.includes('investment')) {
        response = "Based on your financial profile and goals, I recommend a balanced investment approach: 60% in low-cost index funds, 20% in bonds for stability, 15% in growth stocks aligned with your interests, and 5% in crypto if you're comfortable with high risk. Before investing, make sure you have 3-6 months of expenses saved for emergencies.";
      } else {
        response = "Based on your financial data, I can help with budgeting, spending analysis, saving opportunities, and investment guidance. Feel free to ask me specific questions about your finances!";
      }
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      // Generate new suggested questions based on conversation
      generateSuggestedQuestions(userMessage, response);
      
      setIsTyping(false);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error processing your request. Please try again."
      }]);
      setIsTyping(false);
    }
  };

  const generateSuggestedQuestions = (userMessage, aiResponse) => {
    const lowerMsg = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    let newQuestions = [];
    
    // Tailor follow-up questions based on conversation context
    if (lowerMsg.includes('spent') || lowerMsg.includes('spending')) {
      newQuestions = [
        'Where can I reduce my spending?',
        'How does this compare to last month?',
        'What is my biggest unnecessary expense?'
      ];
    } else if (lowerMsg.includes('budget') || lowerMsg.includes('plan')) {
      newQuestions = [
        'Help me stick to this budget',
        'Is this budget realistic?',
        'Can I save more with this income?'
      ];
    } else if (lowerMsg.includes('save') || lowerResponse.includes('save')) {
      newQuestions = [
        'How can I save for a vacation?',
        'What is the best saving strategy for me?',
        'Should I pay down debt or save more?'
      ];
    } else if (lowerMsg.includes('invest') || lowerResponse.includes('invest')) {
      newQuestions = [
        'What stocks should I consider?',
        'Is now a good time to invest?',
        'How much risk should I take?'
      ];
    } else {
      newQuestions = [
        'What are my spending patterns?',
        'How can I improve my finances?',
        'Should I focus on saving or investing?',
        'Help me create a budget'
      ];
    }
    
    setSuggestedQuestions(newQuestions);
  };

  const handleSuggestedQuestion = (question) => {
    setMessage(question);
  };

  return (
    <div className="h-[calc(100vh-9rem)] md:h-[calc(100vh-5rem)] flex flex-col bg-[#1E1E1E] rounded-xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-[#333] flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center">
          <SparklesIcon className="w-5 h-5 mr-2 text-[#FFDE59]" />
          Financial Assistant
        </h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchInitialData}
            className="p-2 rounded-lg hover:bg-[#252525] transition-colors duration-200 text-[#B0B0B0]"
            aria-label="Refresh insights"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingInitialData && (
          <div className="flex justify-center my-4">
            <div className="w-8 h-8 border-4 border-[#333] border-t-[#FFDE59] rounded-full animate-spin"></div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#FFDE59] text-black flex items-center justify-center mr-2 flex-shrink-0">
                <SparklesIcon className="w-5 h-5" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-[#FFDE59] text-black rounded-tr-none' 
                : 'bg-[#252525] text-white rounded-tl-none'
            }`}>
              <div className="p-3">
                <p className="text-sm">{msg.content}</p>
                
                {/* Render insights if available */}
                {msg.insights && msg.insights.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.insights.map((insight, i) => (
                      <div key={i} className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-[#FFDE59]/20 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <LightBulbIcon className="w-3 h-3 text-[#FFDE59]" />
                        </div>
                        <p className="text-xs text-[#B0B0B0] flex-1">{insight}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#333] text-white flex items-center justify-center ml-2 flex-shrink-0">
                {user?.username?.charAt(0) || 'U'}
              </div>
            )}
          </motion.div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-[#FFDE59] text-black flex items-center justify-center mr-2 flex-shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="max-w-[80%] p-3 rounded-2xl bg-[#252525] text-white rounded-tl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#B0B0B0] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#B0B0B0] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-[#B0B0B0] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="bg-[#252525] px-4 py-3 border-t border-[#333]">
          <p className="text-xs text-[#B0B0B0] mb-2 flex items-center">
            <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1 inline" />
            Suggested Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs bg-[#333] hover:bg-[#444] text-white py-1.5 px-3 rounded-full transition-colors duration-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#333] flex items-center space-x-2">
        <button
          type="button"
          className="p-2 rounded-full bg-[#252525] hover:bg-[#333] transition-colors duration-200 text-[#B0B0B0]"
        >
          <MicrophoneIcon className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me about your finances..."
          className="flex-1 bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white placeholder-[#B0B0B0] focus:outline-none focus:border-[#FFDE59]"
        />
        
        <button
          type="submit"
          disabled={!message.trim() || isTyping}
          className={`p-2 rounded-full ${
            !message.trim() || isTyping
              ? 'bg-[#252525] text-[#B0B0B0]'
              : 'bg-[#FFDE59] text-black hover:bg-[#FFD42A]'
          } transition-colors duration-200`}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant; 