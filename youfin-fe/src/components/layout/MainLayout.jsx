import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  MapIcon,
  ChartBarIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Map', href: '/map', icon: MapIcon },
  { name: 'AI Chat', href: '/ai-chat', icon: ChatBubbleBottomCenterTextIcon },
  { name: 'Wallet', href: '/wallet', icon: BanknotesIcon },
  { name: 'Purchase', href: '/purchase', icon: ShoppingBagIcon },
  { name: 'Earn', href: '/earn', icon: SparklesIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const MainLayout = ({ children }) => {
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    // Close mobile menu when location changes
    setIsMobileMenuOpen(false);
    
    // Adjust for mobile screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsDesktopMenuOpen(false);
      } else {
        setIsDesktopMenuOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <AnimatePresence>
        {isDesktopMenuOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:flex flex-col fixed h-screen z-20 bg-[#1E1E1E] border-r border-[#333]"
          >
            {/* Logo */}
            <div className="p-4 flex items-center space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FFDE59] to-[#FFB74D] flex items-center justify-center"
              >
                <span className="text-black font-bold text-lg">YF</span>
              </motion.div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-[#FFDE59] to-[#FFB74D] text-transparent bg-clip-text">
                YouFin
              </span>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-[#333] mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
                  {user?.username?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.username || 'User'}</span>
                  <span className="text-xs text-[#B0B0B0]">{user?.email || 'user@example.com'}</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-3">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-[#FFDE59] text-black font-medium'
                            : 'text-[#B0B0B0] hover:bg-[#2D2D2D] hover:text-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom Menu */}
            <div className="p-4 border-t border-[#333]">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-[#B0B0B0] hover:bg-[#2D2D2D] hover:text-white transition-all duration-200"
                  >
                    <CogIcon className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#B0B0B0] hover:bg-[#2D2D2D] hover:text-white transition-all duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className={`flex-1 flex flex-col ${isDesktopMenuOpen ? 'md:ml-60' : ''} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-[#1E1E1E]/80 backdrop-blur-lg border-b border-[#333] h-16 flex items-center px-4">
          <div className="flex items-center justify-between w-full">
            {/* Mobile Logo or Menu Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                className="hidden md:block text-[#B0B0B0] hover:text-white p-2 rounded-lg"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              <div className="md:hidden flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#FFDE59] to-[#FFB74D] flex items-center justify-center">
                  <span className="text-black font-bold text-xs">YF</span>
                </div>
                <span className="text-lg font-display font-bold bg-gradient-to-r from-[#FFDE59] to-[#FFB74D] text-transparent bg-clip-text">
                  YouFin
                </span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-[#B0B0B0] hover:text-white p-2 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-x-0 top-16 z-40 md:hidden bg-[#1E1E1E] border-b border-[#333]"
            >
              <div className="py-2">
                {/* User Info */}
                <div className="p-4 border-b border-[#333] mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
                      {user?.username?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.username || 'User'}</span>
                      <span className="text-xs text-[#B0B0B0]">{user?.email || 'user@example.com'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Links */}
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-4 ${
                        isActive
                          ? 'bg-[#FFDE59] text-black font-medium'
                          : 'text-[#B0B0B0] hover:bg-[#2D2D2D] hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Settings & Logout */}
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-4 text-[#B0B0B0] hover:bg-[#2D2D2D] hover:text-white"
                >
                  <CogIcon className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-4 text-[#B0B0B0] hover:bg-[#2D2D2D] hover:text-white text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.4 }}
            className="container mx-auto px-4 py-6"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#1E1E1E]/90 backdrop-blur-lg border-t border-[#333] z-10">
          <div className="grid grid-cols-5 h-16">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center justify-center space-y-1 ${
                    isActive
                      ? 'text-[#FFDE59]'
                      : 'text-[#B0B0B0] hover:text-white'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MainLayout; 