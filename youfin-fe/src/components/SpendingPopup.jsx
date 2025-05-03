import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SpendingPopup = ({ amount, category, timestamp, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2"
      >
        <div className="bg-white rounded-lg shadow-lg p-3 relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
          >
            ×
          </button>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-red-500">-{amount}€</span>
            <span className="text-sm text-gray-600 capitalize">{category}</span>
            <span className="text-xs text-gray-400">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpendingPopup; 