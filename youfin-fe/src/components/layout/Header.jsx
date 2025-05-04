import React from 'react';
import { Menu, X } from '@heroicons/react/24/outline';

const Header = ({ isMenuOpen, setIsMenuOpen, role }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-white">💰 YouFin</span>
            </div>
          </div>

          {/* Role Badge - Desktop */}
          <div className="hidden md:flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {role === 'child' && '👶 Child Mode'}
              {role === 'parent' && '👨‍👩‍👧‍👦 Parent Mode'}
              {role === 'business' && '🏪 Business Mode'}
            </span>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Role Badge */}
      <div className="md:hidden bg-blue-700 py-2">
        <div className="max-w-7xl mx-auto px-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {role === 'child' && '👶 Child Mode'}
            {role === 'parent' && '👨‍👩‍👧‍👦 Parent Mode'}
            {role === 'business' && '🏪 Business Mode'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header; 