import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  FilmIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 4500.00,
    totalExpenses: 2750.25,
    balance: 1749.75
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTransactions([
        {
          id: 1,
          type: 'expense',
          amount: -85.00,
          description: 'Groceries',
          merchant: 'Whole Foods',
          date: '2024-03-15',
          category: 'Food',
          icon: ShoppingBagIcon
        },
        {
          id: 2,
          type: 'income',
          amount: 3200.00,
          description: 'Salary',
          merchant: 'Company Inc.',
          date: '2024-03-14',
          category: 'Income',
          icon: BanknotesIcon
        },
        {
          id: 3,
          type: 'expense',
          amount: -15.99,
          description: 'Netflix Subscription',
          merchant: 'Netflix',
          date: '2024-03-13',
          category: 'Entertainment',
          icon: FilmIcon
        },
        {
          id: 4,
          type: 'expense',
          amount: -42.50,
          description: 'Restaurant',
          merchant: 'Local Bistro',
          date: '2024-03-12',
          category: 'Food',
          icon: ShoppingBagIcon
        },
        {
          id: 5,
          type: 'expense',
          amount: -35.75,
          description: 'Gas Station',
          merchant: 'Shell',
          date: '2024-03-11',
          category: 'Transportation',
          icon: TruckIcon
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'income', label: 'Income' },
    { id: 'expense', label: 'Expense' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-[#252525] border-t-[#FF6B00] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-[#A0A0A0]">Track your spending</p>
        </div>
        
        <button className="w-10 h-10 bg-[#151515] border border-[#2A2A2A] rounded-full flex items-center justify-center hover:border-[#FF6B00] transition-all duration-200">
          <ChartBarIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-[#151515] border border-[#2A2A2A] rounded-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-full bg-[#2D4B39] flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-4 h-4 text-[#4CAF50]" />
            </div>
            <span className="text-[#A0A0A0] text-sm">Income</span>
          </div>
          <p className="text-lg font-bold text-[#4CAF50]">
            ${stats.totalIncome.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 bg-[#151515] border border-[#2A2A2A] rounded-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-full bg-[#4B2D2D] flex items-center justify-center">
              <ArrowTrendingDownIcon className="w-4 h-4 text-[#FF5252]" />
            </div>
            <span className="text-[#A0A0A0] text-sm">Expenses</span>
          </div>
          <p className="text-lg font-bold text-[#FF5252]">
            ${stats.totalExpenses.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-4 bg-[#151515] border border-[#2A2A2A] rounded-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-full bg-[#252525] flex items-center justify-center">
              <BanknotesIcon className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <span className="text-[#A0A0A0] text-sm">Balance</span>
          </div>
          <p className="text-lg font-bold text-white">
            ${stats.balance.toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#151515] border border-[#2A2A2A] rounded-xl text-white placeholder-[#787878] focus:outline-none focus:border-[#FF6B00] transition-colors"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#787878]" />
        </div>
        
        <button className="p-3 bg-[#151515] border border-[#2A2A2A] rounded-xl hover:border-[#FF6B00] transition-all duration-200">
          <FunnelIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex space-x-2">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedFilter(option.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedFilter === option.id
                ? 'bg-[#FF6B00] text-white'
                : 'bg-[#151515] text-[#A0A0A0] border border-[#2A2A2A] hover:border-[#FF6B00]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between p-4 bg-[#151515] border border-[#2A2A2A] rounded-2xl hover:border-[#FF6B00] transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'income' 
                  ? 'bg-[#2D4B39] text-[#4CAF50]' 
                  : 'bg-[#4B2D2D] text-[#FF5252]'
              }`}>
                {transaction.type === 'income' ? 
                  <ArrowTrendingUpIcon className="w-5 h-5" /> : 
                  <ArrowTrendingDownIcon className="w-5 h-5" />
                }
              </div>
              <div className="ml-3">
                <p className="font-medium text-white">{transaction.description}</p>
                <p className="text-xs text-[#A0A0A0]">
                  {transaction.merchant} • {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className={`font-medium ${
              transaction.type === 'income' ? 'text-[#4CAF50]' : 'text-[#FF5252]'
            }`}>
              {transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Transactions; 