import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronRightIcon,
  QrCodeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCardIcon,
  UserGroupIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  ShoppingBagIcon,
  CloudIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState({
    balance: 3480.50,
    cards: [
      {
        id: 1,
        type: 'Virtual Card',
        number: '**** **** **** 4589',
        expiryDate: '12/25',
        balance: 2850.75,
        bgColor: 'from-[#FF6B00] to-[#FF9F1C]'
      },
      {
        id: 2,
        type: 'Physical Card',
        number: '**** **** **** 7823',
        expiryDate: '09/24',
        balance: 629.75,
        bgColor: 'from-[#34C759] to-[#30D158]'
      }
    ],
    recentTransactions: [
      {
        id: 1,
        type: 'expense',
        amount: -85.00,
        description: 'Groceries',
        merchant: 'Whole Foods',
        date: '2024-03-15',
        category: 'Food'
      },
      {
        id: 2,
        type: 'income',
        amount: 3200.00,
        description: 'Salary',
        merchant: 'Company Inc.',
        date: '2024-03-14',
        category: 'Income'
      },
      {
        id: 3,
        type: 'expense',
        amount: -15.99,
        description: 'Netflix Subscription',
        merchant: 'Netflix',
        date: '2024-03-13',
        category: 'Entertainment'
      }
    ]
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-[#252525] border-t-[#FF6B00] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Wallet</h1>
          <p className="text-[#A0A0A0]">Manage your finances</p>
        </div>
        
        <div className="flex space-x-2">
          <button className="h-10 w-10 bg-[#151515] border border-[#2A2A2A] rounded-full flex items-center justify-center text-[#A0A0A0] hover:border-[#FF6B00] transition-all duration-200">
            <PlusIcon className="w-5 h-5" />
          </button>
          <button className="h-10 w-10 bg-[#151515] border border-[#2A2A2A] rounded-full flex items-center justify-center text-[#A0A0A0] hover:border-[#FF6B00] transition-all duration-200">
            <CreditCardIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[#A0A0A0] text-sm">Total Balance</p>
            <h2 className="text-2xl font-bold text-white">${walletData.balance.toLocaleString()}</h2>
          </div>
          
          <div className="flex space-x-2">
            <Link 
              to="/wallet/send" 
              className="flex items-center justify-center h-10 w-10 bg-[#FF6B00] rounded-full"
            >
              <ArrowUpIcon className="w-5 h-5 text-white" />
            </Link>
            <Link
              to="/wallet/request"
              className="flex items-center justify-center h-10 w-10 bg-[#252525] rounded-full"
            >
              <ArrowDownIcon className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Your Cards</h2>
          <Link to="/wallet/cards" className="text-[#FF6B00] text-sm font-medium flex items-center">
            View All <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="space-y-4">
          {walletData.cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-br ${card.bgColor} rounded-xl overflow-hidden p-5 text-white`}
            >
              <div className="flex flex-col h-44 justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-white/70">{card.type}</p>
                    <p className="font-bold mt-1">${card.balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <CreditCardIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2">{card.number}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white/70">Valid Until</p>
                      <p className="text-sm font-medium">{card.expiryDate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-white/30 rounded-full"></div>
                      <div className="w-5 h-5 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Link
            to="/wallet/send"
            className="flex flex-col items-center justify-center p-3 bg-[#151515] border border-[#2A2A2A] rounded-xl hover:border-[#FF6B00] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center mb-2">
              <ArrowUpIcon className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <span className="text-xs font-medium text-white">Send</span>
          </Link>

          <Link
            to="/wallet/request"
            className="flex flex-col items-center justify-center p-3 bg-[#151515] border border-[#2A2A2A] rounded-xl hover:border-[#FF6B00] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center mb-2">
              <ArrowDownIcon className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <span className="text-xs font-medium text-white">Request</span>
          </Link>

          <Link
            to="/wallet/qr"
            className="flex flex-col items-center justify-center p-3 bg-[#151515] border border-[#2A2A2A] rounded-xl hover:border-[#FF6B00] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center mb-2">
              <QrCodeIcon className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <span className="text-xs font-medium text-white">QR Pay</span>
          </Link>

          <Link
            to="/wallet/split"
            className="flex flex-col items-center justify-center p-3 bg-[#151515] border border-[#2A2A2A] rounded-xl hover:border-[#FF6B00] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center mb-2">
              <UserGroupIcon className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <span className="text-xs font-medium text-white">Split</span>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-[#FF6B00] text-sm font-medium flex items-center">
            See All <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="space-y-3">
          {walletData.recentTransactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between p-4 bg-[#151515] border border-[#2A2A2A] rounded-xl"
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' 
                    ? 'bg-[#34C759]/10 text-[#34C759]' 
                    : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                }`}>
                  {transaction.type === 'income' ? 
                    <ArrowTrendingUpIcon className="w-5 h-5" /> : 
                    <ShoppingBagIcon className="w-5 h-5" />
                  }
                </div>
                <div className="ml-3">
                  <p className="font-medium text-white">{transaction.description}</p>
                  <p className="text-xs text-[#A0A0A0]">
                    {transaction.merchant} • <ClockIcon className="w-3 h-3 inline" /> {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className={`font-medium ${
                transaction.type === 'income' ? 'text-[#34C759]' : 'text-[#FF3B30]'
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
    </div>
  );
};

export default Wallet; 