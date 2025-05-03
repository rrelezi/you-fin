import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  SparklesIcon,
  ChevronRightIcon,
  ChatBubbleBottomCenterTextIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [stats, setStats] = useState({
    balance: 0,
    wallets: [],
    savings: 0,
    spending: 0,
    income: 0,
    savingsGoal: 1000,
    recentTransactions: []
  });

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setStats({
        balance: 450,
        wallets: ['Main Wallet', 'Savings', 'Investments'],
        savings: 750,
        spending: 350,
        income: 3200,
        savingsGoal: 1000,
        recentTransactions: [
          { id: 1, description: 'Groceries', amount: -85, date: '2023-07-01', category: 'Food' },
          { id: 2, description: 'Salary', amount: 3200, date: '2023-06-30', category: 'Income' },
          { id: 3, description: 'Netflix', amount: -15.99, date: '2023-06-29', category: 'Entertainment' },
          { id: 4, description: 'Restaurant', amount: -42.50, date: '2023-06-27', category: 'Food' },
          { id: 5, description: 'Gas Station', amount: -35.75, date: '2023-06-25', category: 'Transportation' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-[#333] border-t-[#FFDE59] rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const mainCategories = [
    { name: 'uFin GO', description: 'Explore the city and earn', icon: MapPinIcon, href: '/map', color: 'bg-[#1E1E1E]', spanClass: 'col-span-2' },
    { name: 'Wallet', icon: BanknotesIcon, href: '/wallet', color: 'bg-[#1E1E1E]' },
    { name: 'Purchase', description: 'Find best prices', icon: ShoppingBagIcon, href: '/purchase', color: 'bg-[#1E1E1E]' },
    { name: 'Earn', icon: SparklesIcon, href: '/earn', color: 'bg-[#1E1E1E]' },
    { name: 'Connections', icon: ChatBubbleBottomCenterTextIcon, href: '/connections', color: 'bg-[#1E1E1E]' }
  ];

  return (
    <div className="space-y-6 pb-6">
      <div className="px-2 pt-2 pb-6">
        <h2 className="text-center text-sm text-[#B0B0B0]">iPhone 14 & 15 Pro - 8</h2>
      </div>
      
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mb-4"
      >
        <div className="bg-[#1A1A1A] rounded-3xl overflow-hidden p-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-4">
              {/* Placeholder for avatar or icon */}
            </div>
            <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-[#FFDE59] flex items-center justify-center text-black font-medium text-sm">
              41
            </div>
          </div>
          
          {/* Balance */}
          <div className="text-center">
            <h3 className="text-[#B0B0B0] mb-2">Total Balance</h3>
            <h2 className="text-4xl font-bold mb-2">{stats.balance.toLocaleString()} USD</h2>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-sm text-[#B0B0B0]">All wallets</span>
              <button className="text-sm text-[#FFDE59]">change</button>
            </div>
          </div>
          
          {/* Pagination Indicators */}
          <div className="flex space-x-2">
            {stats.wallets.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all ${i === activeSlide ? 'w-10 bg-white' : 'w-6 bg-[#333]'}`}
                onClick={() => setActiveSlide(i)}
              ></div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Categories Grid */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {mainCategories.map((category, index) => (
          <Link
            key={category.name}
            to={category.href}
            className={`flex flex-col p-5 rounded-3xl ${category.color} border border-[#333] hover:border-[#FFDE59] transition-all duration-200 ${category.spanClass || ''}`}
          >
            <h3 className="text-white font-medium text-lg mb-1">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-[#B0B0B0]">{category.description}</p>
            )}
          </Link>
        ))}
      </div>
      
      {/* Transactions (Hidden on Mobile, Shown on Larger Screens) */}
      <div className="hidden md:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="rounded-2xl bg-[#1E1E1E] border border-[#333] overflow-hidden mt-8"
        >
          <div className="flex items-center justify-between p-6 border-b border-[#333]">
            <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
            <Link to="/transactions" className="flex items-center text-sm text-[#FFDE59] font-medium">
              View All <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="divide-y divide-[#333]">
            {stats.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 md:p-6 hover:bg-[#252525] transition-colors duration-200">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.amount > 0 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {transaction.amount > 0 ? <ArrowTrendingUpIcon className="w-5 h-5" /> : <ArrowTrendingDownIcon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-white">{transaction.description}</p>
                    <p className="text-xs text-[#B0B0B0]">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`font-medium ${
                  transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
