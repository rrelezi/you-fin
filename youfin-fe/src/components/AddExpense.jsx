import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  CameraIcon, 
  MicrophoneIcon, 
  ChevronDownIcon,
  CheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CurrencyDollarIcon, ReceiptRefundIcon } from '@heroicons/react/24/solid';

const AddExpense = ({ isOpen, onClose, onAddExpense }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState('');

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

  // Check for speech recognition support
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setRecognitionSupported(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opened
      setStep(1);
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('');
      setReceiptImage(null);
      setImagePreview(null);
      setAmountError('');
    }
  }, [isOpen]);

  const handleCategorySelect = (categoryId) => {
    setCategory(categoryId);
    setShowCategories(false);
    
    // If all required fields are filled, move to step 2
    if (amount && categoryId) {
      setStep(2);
    }
  };

  const handlePaymentMethodSelect = (methodId) => {
    setPaymentMethod(methodId);
    setShowPaymentMethods(false);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    // Only allow numbers and decimal point
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
      setAmountError('');
    }
  };

  const handleSubmit = () => {
    // Validate form
    if (!amount) {
      setAmountError('Please enter an amount');
      return;
    }

    setIsSubmitting(true);

    // Create expense object
    const expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
      description: description || `${getCategoryName(category)} expense`,
      date,
      paymentMethod: paymentMethod || 'creditcard',
      receiptImage: imagePreview
    };

    // Simulate API call
    setTimeout(() => {
      onAddExpense(expense);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const startListening = () => {
    if (!recognitionSupported) return;
    
    setIsListening(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      
      // Try to extract amount and category from voice input
      processVoiceInput(transcript);
      
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
      setIsListening(false);
    };
    
    recognition.start();
  };

  const processVoiceInput = (transcript) => {
    console.log('Processing voice input:', transcript);
    
    // Extract amount using regex (looking for numbers with optional decimal)
    const amountRegex = /\$?(\d+(\.\d{1,2})?)/g;
    const amountMatches = transcript.match(amountRegex);
    
    if (amountMatches && amountMatches.length > 0) {
      // Take the first match and remove any $ sign
      const extractedAmount = amountMatches[0].replace('$', '');
      setAmount(extractedAmount);
    }
    
    // Try to identify category from keywords
    const lowerTranscript = transcript.toLowerCase();
    
    // Check each category for keywords
    for (const cat of categories) {
      if (lowerTranscript.includes(cat.name.toLowerCase()) || 
          lowerTranscript.includes(cat.id.toLowerCase())) {
        setCategory(cat.id);
        break;
      }
    }
    
    // Set description from remaining text if we found an amount
    if (amountMatches && amountMatches.length > 0) {
      // Clean up the transcript: remove the amount and some common phrases
      let desc = transcript
        .replace(amountMatches[0], '')
        .replace(/spent|paid|for|on|about|approximately|around|i spent|i paid/gi, '')
        .trim();
      
      // Capitalize first letter
      if (desc.length > 0) {
        desc = desc.charAt(0).toUpperCase() + desc.slice(1);
        setDescription(desc);
      }
    } else {
      // If no amount found, just use the whole thing as description
      setDescription(transcript);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setReceiptImage(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // In a real app, this would upload and process the receipt using OCR
    setIsProcessingReceipt(true);
    
    // Simulate receipt processing
    setTimeout(() => {
      // Mock extracted data from receipt
      setAmount('42.99');
      setCategory('food');
      setDescription('Grocery store purchase');
      setIsProcessingReceipt(false);
      
      // Move to step 2 after processing
      setStep(2);
    }, 2000);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#9E9E9E';
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '📝';
  };

  const getPaymentMethodName = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.name : 'Credit Card';
  };

  const getPaymentMethodIcon = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.icon : '💳';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-md bg-[#1A1A1A] rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
              <h2 className="text-lg font-semibold text-white">Add Expense</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#333] text-[#B0B0B0] transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Indicator */}
            <div className="px-4 pt-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-[#FFDE59] font-medium">
                  Step {step} of 2: {step === 1 ? 'Basic Info' : 'Additional Details'}
                </span>
                <span className="text-xs text-[#777]">
                  {step === 1 ? '* Required fields' : 'Almost done!'}
                </span>
              </div>
              <div className="w-full h-1 bg-[#333] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FFDE59] transition-all duration-300 ease-in-out"
                  style={{ width: `${step === 1 ? '50%' : '100%'}` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4">
              {/* Step 1: Amount and Category */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Amount Field */}
                  <div className="relative">
                    <label className="block text-xs text-[#B0B0B0] mb-1.5">
                      Amount <span className="text-[#FF4B4B]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="w-5 h-5 text-[#FFDE59]" />
                      </div>
                      <input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className={`w-full pl-10 pr-4 py-3 bg-[#252525] border ${
                          amountError ? 'border-[#FF4B4B]' : 'border-[#333]'
                        } rounded-xl text-white focus:outline-none focus:border-[#FFDE59] transition-colors`}
                      />
                    </div>
                    {amountError && (
                      <p className="mt-1 text-xs text-[#FF4B4B]">{amountError}</p>
                    )}
                  </div>
                  
                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs text-[#B0B0B0] mb-1.5">
                      Category <span className="text-[#FF4B4B]">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCategories(!showCategories)}
                        className={`w-full px-4 py-3 bg-[#252525] border ${
                          category ? 'border-[#444]' : 'border-[#333]'
                        } rounded-xl text-left flex items-center justify-between focus:outline-none focus:border-[#FFDE59] transition-colors`}
                      >
                        {category ? (
                          <div className="flex items-center">
                            <span 
                              className="inline-block w-6 h-6 mr-2 rounded-full text-center"
                              style={{ backgroundColor: `${getCategoryColor(category)}30` }}
                            >
                              {getCategoryIcon(category)}
                            </span>
                            <span className="text-white">{getCategoryName(category)}</span>
                          </div>
                        ) : (
                          <span className="text-[#777]">Select a category</span>
                        )}
                        <ChevronDownIcon className="w-5 h-5 text-[#B0B0B0]" />
                      </button>
                      
                      {/* Category Dropdown */}
                      <AnimatePresence>
                        {showCategories && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 mt-1 w-full bg-[#252525] border border-[#333] rounded-xl shadow-lg max-h-64 overflow-y-auto"
                          >
                            <div className="py-1">
                              {categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => handleCategorySelect(cat.id)}
                                  className="w-full px-4 py-2.5 text-left hover:bg-[#333] flex items-center transition-colors"
                                >
                                  <span 
                                    className="inline-block w-6 h-6 mr-3 rounded-full flex-shrink-0 text-center"
                                    style={{ backgroundColor: `${cat.color}30` }}
                                  >
                                    {cat.icon}
                                  </span>
                                  <span className="text-white">{cat.name}</span>
                                  {category === cat.id && (
                                    <CheckIcon className="w-5 h-5 ml-auto text-[#FFDE59]" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Quick Add Helpers */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={startListening}
                      disabled={isListening || !recognitionSupported}
                      className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center text-sm ${
                        isListening
                          ? 'bg-[#FF4B4B] text-white'
                          : 'bg-[#252525] text-[#B0B0B0] hover:bg-[#333]'
                      } transition-colors`}
                    >
                      <MicrophoneIcon className="w-5 h-5 mr-2" />
                      {isListening ? 'Listening...' : 'Voice Input'}
                    </button>
                    
                    <label className="flex-1 py-2.5 px-3 rounded-xl bg-[#252525] text-[#B0B0B0] hover:bg-[#333] flex items-center justify-center cursor-pointer text-sm transition-colors">
                      <CameraIcon className="w-5 h-5 mr-2" />
                      Scan Receipt
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  
                  {/* Receipt Processing Indicator */}
                  {isProcessingReceipt && (
                    <div className="mt-3 p-3 bg-[#252525] rounded-xl">
                      <div className="flex items-center">
                        <div className="mr-3 w-6 h-6 border-2 border-[#FFDE59] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-white">Processing receipt...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Receipt Image Preview */}
                  {imagePreview && !isProcessingReceipt && (
                    <div className="mt-3">
                      <div className="relative group">
                        <img 
                          src={imagePreview} 
                          alt="Receipt" 
                          className="w-full h-32 object-cover rounded-xl border border-[#333]"
                        />
                        <button
                          onClick={() => {
                            setReceiptImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-[#252525]/80 hover:bg-[#333] rounded-full flex items-center justify-center text-[#B0B0B0]"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!amount || !category}
                      className={`px-6 py-2.5 rounded-xl flex items-center text-sm font-medium ${
                        amount && category
                          ? 'bg-[#FFDE59] text-black'
                          : 'bg-[#333] text-[#777] cursor-not-allowed'
                      }`}
                    >
                      Next
                      <PaperAirplaneIcon className="w-4 h-4 ml-2 rotate-90" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Additional Details */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Description Field */}
                  <div>
                    <label className="block text-xs text-[#B0B0B0] mb-1.5">
                      Description
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DocumentTextIcon className="w-5 h-5 text-[#B0B0B0]" />
                      </div>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What was this expense for?"
                        className="w-full pl-10 pr-4 py-3 bg-[#252525] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#FFDE59] transition-colors"
                      />
                    </div>
                  </div>
                  
                  {/* Date Field */}
                  <div>
                    <label className="block text-xs text-[#B0B0B0] mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#252525] border border-[#333] rounded-xl text-white focus:outline-none focus:border-[#FFDE59] transition-colors"
                    />
                  </div>
                  
                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs text-[#B0B0B0] mb-1.5">
                      Payment Method
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                        className="w-full px-4 py-3 bg-[#252525] border border-[#333] rounded-xl text-left flex items-center justify-between focus:outline-none focus:border-[#FFDE59] transition-colors"
                      >
                        {paymentMethod ? (
                          <div className="flex items-center">
                            <span className="mr-2">{getPaymentMethodIcon(paymentMethod)}</span>
                            <span className="text-white">{getPaymentMethodName(paymentMethod)}</span>
                          </div>
                        ) : (
                          <span className="text-[#777]">Select payment method</span>
                        )}
                        <ChevronDownIcon className="w-5 h-5 text-[#B0B0B0]" />
                      </button>
                      
                      {/* Payment Method Dropdown */}
                      <AnimatePresence>
                        {showPaymentMethods && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 mt-1 w-full bg-[#252525] border border-[#333] rounded-xl shadow-lg max-h-48 overflow-y-auto"
                          >
                            <div className="py-1">
                              {paymentMethods.map((method) => (
                                <button
                                  key={method.id}
                                  type="button"
                                  onClick={() => handlePaymentMethodSelect(method.id)}
                                  className="w-full px-4 py-2.5 text-left hover:bg-[#333] flex items-center transition-colors"
                                >
                                  <span className="mr-3">{method.icon}</span>
                                  <span className="text-white">{method.name}</span>
                                  {paymentMethod === method.id && (
                                    <CheckIcon className="w-5 h-5 ml-auto text-[#FFDE59]" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 bg-[#252525] text-white rounded-xl hover:bg-[#333] transition-colors text-sm"
                    >
                      Back
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !amount || !category}
                      className="px-6 py-2.5 bg-[#FFDE59] text-black rounded-xl font-medium flex items-center text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Expense
                          <CheckIcon className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddExpense; 