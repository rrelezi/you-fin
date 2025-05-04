import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  BanknotesIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentChartBarIcon,
  ArchiveBoxIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import AddExpense from './AddExpense';

const mockExpenses = [
  {
    id: '1',
    amount: 42.75,
    category: 'food',
    description: 'Grocery shopping',
    date: '2023-06-10',
    paymentMethod: 'creditcard'
  },
  {
    id: '2',
    amount: 12.99,
    category: 'entertainment',
    description: 'Movie ticket',
    date: '2023-06-08',
    paymentMethod: 'cash'
  },
  {
    id: '3',
    amount: 35.50,
    category: 'transportation',
    description: 'Gas station',
    date: '2023-06-05',
    paymentMethod: 'debitcard'
  },
  {
    id: '4',
    amount: 124.99,
    category: 'shopping',
    description: 'New headphones',
    date: '2023-06-01',
    paymentMethod: 'creditcard'
  },
  {
    id: '5',
    amount: 9.99,
    category: 'bills',
    description: 'Music subscription',
    date: '2023-05-28',
    paymentMethod: 'banktransfer'
  }
];

const categories = [
  { id: 'food', name: 'Food & Dining', color: '#4CAF50', icon: '🍔' },
  { id: 'transportation', name: 'Transportation', color: '#2196F3', icon: '🚗' },
  { id: 'entertainment', name: 'Entertainment', color: '#9C27B0', icon: '🎬' },
  { id: 'shopping', name: 'Shopping', color: '#F44336', icon: '🛍️' },
  { id: 'housing', name: 'Housing', color: '#607D8B', icon: '🏠' },
  { id: 'bills', name: 'Bills & Utilities', color: '#FF9800', icon: '📱' },
  { id: 'healthcare', name: 'Healthcare', color: '#E91E63', icon: '💊' },
  { id: 'education', name: 'Education', color: '#3F51B5', icon: '📚' },
  { id: 'travel', name: 'Travel', color: '#00BCD4', icon: '✈️' },
  { id: 'other', name: 'Other', color: '#9E9E9E', icon: '📝' }
];

const paymentMethods = [
  { id: 'creditcard', name: 'Credit Card', icon: '💳' },
  { id: 'debitcard', name: 'Debit Card', icon: '💲' },
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'banktransfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'mobilepayment', name: 'Mobile Payment', icon: '📱' }
];

const getCategoryInfo = (categoryId) => {
  return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
};

const getPaymentMethodInfo = (methodId) => {
  return paymentMethods.find(method => method.id === methodId) || paymentMethods[0];
};

const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const ExpenseCard = ({ expense, onClick }) => {
  const category = getCategoryInfo(expense.category);
  const paymentMethod = getPaymentMethodInfo(expense.paymentMethod);
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-[#252525] rounded-xl border border-[#333] overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full mr-3 flex items-center justify-center"
              style={{ backgroundColor: `${category.color}30` }}
            >
              <span className="text-lg">{category.icon}</span>
            </div>
            <div>
              <h3 className="text-white font-medium">{expense.description}</h3>
              <div className="flex items-center text-xs text-[#B0B0B0]">
                <span>{formatDate(expense.date)}</span>
                <span className="mx-1.5">•</span>
                <span className="flex items-center">
                  <span className="mr-1">{paymentMethod.icon}</span>
                  {paymentMethod.name}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">{formatCurrency(expense.amount)}</p>
            <p className="text-xs text-[#B0B0B0]">{category.name}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showPaymentFilter, setShowPaymentFilter] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call to fetch expenses
    const fetchExpenses = async () => {
      setIsLoading(true);
      
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setExpenses(mockExpenses);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExpenses();
  }, []);
  
  const handleAddExpense = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };
  
  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  const filteredAndSortedExpenses = expenses
    // Filter by search query
    .filter(expense => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        expense.description.toLowerCase().includes(query) ||
        getCategoryInfo(expense.category).name.toLowerCase().includes(query) ||
        getPaymentMethodInfo(expense.paymentMethod).name.toLowerCase().includes(query)
      );
    })
    // Filter by category
    .filter(expense => {
      if (!selectedCategory) return true;
      return expense.category === selectedCategory;
    })
    // Filter by payment method
    .filter(expense => {
      if (!selectedPaymentMethod) return true;
      return expense.paymentMethod === selectedPaymentMethod;
    })
    // Filter by time
    .filter(expense => {
      if (timeFilter === 'all') return true;
      
      const today = new Date();
      const expenseDate = new Date(expense.date);
      
      switch (timeFilter) {
        case 'today':
          return (
            expenseDate.getDate() === today.getDate() &&
            expenseDate.getMonth() === today.getMonth() &&
            expenseDate.getFullYear() === today.getFullYear()
          );
        case 'week':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          return expenseDate >= oneWeekAgo;
        case 'month':
          return (
            expenseDate.getMonth() === today.getMonth() &&
            expenseDate.getFullYear() === today.getFullYear()
          );
        case 'year':
          return expenseDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    })
    // Sort expenses
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }
      
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Sort by string
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  
  // Calculate summary data
  const totalAmount = filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Get category spending breakdown
  const categoryBreakdown = filteredAndSortedExpenses.reduce((acc, expense) => {
    const categoryId = expense.category;
    
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    
    acc[categoryId] += expense.amount;
    return acc;
  }, {});
  
  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#333]">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Expenses</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#FFDE59] text-black px-4 py-2 rounded-lg flex items-center font-medium transition-transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-1.5" />
            Add Expense
          </button>
        </div>
        
        {/* Summary */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px] bg-[#252525] rounded-lg p-3">
            <div className="flex items-center mb-1">
              <BanknotesIcon className="w-4 h-4 text-[#FFDE59] mr-1.5" />
              <span className="text-xs text-[#B0B0B0]">Total Expenses</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {formatCurrency(totalAmount)}
            </div>
          </div>
          
          <div className="flex-1 min-w-[140px] bg-[#252525] rounded-lg p-3">
            <div className="flex items-center mb-1">
              <ChartPieIcon className="w-4 h-4 text-[#FFDE59] mr-1.5" />
              <span className="text-xs text-[#B0B0B0]">Top Category</span>
            </div>
            <div className="text-sm font-semibold text-white flex items-center">
              {Object.keys(categoryBreakdown).length > 0 ? (
                <>
                  <span className="mr-1.5">
                    {getCategoryInfo(
                      Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'other'
                    ).icon}
                  </span>
                  {getCategoryInfo(
                    Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'other'
                  ).name}
                </>
              ) : (
                "No data"
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-[140px] bg-[#252525] rounded-lg p-3">
            <div className="flex items-center mb-1">
              <DocumentChartBarIcon className="w-4 h-4 text-[#FFDE59] mr-1.5" />
              <span className="text-xs text-[#B0B0B0]">This Month</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {formatCurrency(
                expenses
                  .filter(expense => {
                    const today = new Date();
                    const expenseDate = new Date(expense.date);
                    return (
                      expenseDate.getMonth() === today.getMonth() &&
                      expenseDate.getFullYear() === today.getFullYear()
                    );
                  })
                  .reduce((sum, expense) => sum + expense.amount, 0)
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="p-4 border-b border-[#333] space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-[#777]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full bg-[#252525] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-white placeholder-[#777] focus:outline-none focus:border-[#FFDE59]"
          />
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Time Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTimeFilter(!showTimeFilter);
                setShowCategoryFilter(false);
                setShowPaymentFilter(false);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                timeFilter !== 'all'
                  ? 'bg-[#FFDE59]/20 text-[#FFDE59] border border-[#FFDE59]/30'
                  : 'bg-[#252525] text-[#B0B0B0] border border-[#333]'
              }`}
            >
              <ArchiveBoxIcon className="w-4 h-4 mr-1.5" />
              {timeFilter === 'all' && 'All Time'}
              {timeFilter === 'today' && 'Today'}
              {timeFilter === 'week' && 'This Week'}
              {timeFilter === 'month' && 'This Month'}
              {timeFilter === 'year' && 'This Year'}
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </button>
            
            {showTimeFilter && (
              <div className="absolute z-10 mt-1 w-36 bg-[#252525] border border-[#333] rounded-lg shadow-lg">
                <button
                  onClick={() => {
                    setTimeFilter('all');
                    setShowTimeFilter(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] ${
                    timeFilter === 'all' ? 'text-[#FFDE59]' : 'text-white'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => {
                    setTimeFilter('today');
                    setShowTimeFilter(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] ${
                    timeFilter === 'today' ? 'text-[#FFDE59]' : 'text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    setTimeFilter('week');
                    setShowTimeFilter(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] ${
                    timeFilter === 'week' ? 'text-[#FFDE59]' : 'text-white'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => {
                    setTimeFilter('month');
                    setShowTimeFilter(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] ${
                    timeFilter === 'month' ? 'text-[#FFDE59]' : 'text-white'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => {
                    setTimeFilter('year');
                    setShowTimeFilter(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] ${
                    timeFilter === 'year' ? 'text-[#FFDE59]' : 'text-white'
                  }`}
                >
                  This Year
                </button>
              </div>
            )}
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryFilter(!showCategoryFilter);
                setShowTimeFilter(false);
                setShowPaymentFilter(false);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                selectedCategory
                  ? 'bg-[#FFDE59]/20 text-[#FFDE59] border border-[#FFDE59]/30'
                  : 'bg-[#252525] text-[#B0B0B0] border border-[#333]'
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-1.5" />
              {selectedCategory 
                ? `${getCategoryInfo(selectedCategory).icon} ${getCategoryInfo(selectedCategory).name}`
                : 'All Categories'
              }
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </button>
            
            {showCategoryFilter && (
              <div className="absolute z-10 mt-1 w-48 bg-[#252525] border border-[#333] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setShowCategoryFilter(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] ${
                    !selectedCategory ? 'text-[#FFDE59]' : 'text-white'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowCategoryFilter(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] flex items-center ${
                      selectedCategory === cat.id ? 'text-[#FFDE59]' : 'text-white'
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Payment Method Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPaymentFilter(!showPaymentFilter);
                setShowTimeFilter(false);
                setShowCategoryFilter(false);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                selectedPaymentMethod
                  ? 'bg-[#FFDE59]/20 text-[#FFDE59] border border-[#FFDE59]/30'
                  : 'bg-[#252525] text-[#B0B0B0] border border-[#333]'
              }`}
            >
              <BanknotesIcon className="w-4 h-4 mr-1.5" />
              {selectedPaymentMethod 
                ? `${getPaymentMethodInfo(selectedPaymentMethod).icon} ${getPaymentMethodInfo(selectedPaymentMethod).name}`
                : 'All Payment Methods'
              }
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </button>
            
            {showPaymentFilter && (
              <div className="absolute z-10 mt-1 w-48 bg-[#252525] border border-[#333] rounded-lg shadow-lg">
                <button
                  onClick={() => {
                    setSelectedPaymentMethod('');
                    setShowPaymentFilter(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] ${
                    !selectedPaymentMethod ? 'text-[#FFDE59]' : 'text-white'
                  }`}
                >
                  All Payment Methods
                </button>
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedPaymentMethod(method.id);
                      setShowPaymentFilter(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] flex items-center ${
                      selectedPaymentMethod === method.id ? 'text-[#FFDE59]' : 'text-white'
                    }`}
                  >
                    <span className="mr-2">{method.icon}</span>
                    {method.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Sort Button */}
          <button
            onClick={toggleSort}
            className="px-3 py-1.5 text-sm bg-[#252525] text-[#B0B0B0] rounded-lg border border-[#333] flex items-center ml-auto"
          >
            Sort
            {sortOrder === 'asc' ? (
              <ArrowUpIcon className="w-4 h-4 ml-1.5" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 ml-1.5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Expenses List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          // Loading Skeleton
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-[#252525] rounded-xl overflow-hidden animate-pulse">
                <div className="p-4">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#333] rounded-full mr-3"></div>
                      <div>
                        <div className="h-5 bg-[#333] rounded w-32 mb-2"></div>
                        <div className="h-3 bg-[#333] rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-5 bg-[#333] rounded w-20 mb-2"></div>
                      <div className="h-3 bg-[#333] rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedExpenses.length > 0 ? (
          <div className="space-y-3">
            {filteredAndSortedExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onClick={() => {
                  // View expense details
                  console.log('View expense details:', expense);
                }}
              />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center mb-4">
              <ArchiveBoxIcon className="w-8 h-8 text-[#B0B0B0]" />
            </div>
            <h3 className="text-white font-medium mb-1">No expenses found</h3>
            <p className="text-[#B0B0B0] text-sm max-w-xs">
              {searchQuery || selectedCategory || selectedPaymentMethod || timeFilter !== 'all'
                ? "Try adjusting your filters to see more results"
                : "Start by adding your first expense using the 'Add Expense' button"}
            </p>
            {(searchQuery || selectedCategory || selectedPaymentMethod || timeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedPaymentMethod('');
                  setTimeFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-[#252525] text-[#FFDE59] rounded-lg text-sm hover:bg-[#333]"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Add Expense Modal */}
      <AddExpense
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddExpense={handleAddExpense}
      />
      
      {/* FAB for Mobile */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-20 right-4 md:hidden bg-[#FFDE59] text-black w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-10"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Expenses; 