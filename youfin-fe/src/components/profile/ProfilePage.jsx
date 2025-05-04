import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' }
  ];

  return (
    <div className="pb-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="bg-gradient-to-r from-[#FFDE59] to-[#FFB74D] text-transparent bg-clip-text">
            My Profile
          </span>
        </h1>
        <p className="text-[#B0B0B0] mt-1">Manage your account settings and preferences</p>
      </motion.div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden mb-6"
      >
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-5">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FFDE59] to-[#FFB74D] flex items-center justify-center text-2xl font-bold text-black">
              {user?.username?.charAt(0) || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 bg-[#252525] hover:bg-[#333] text-white p-1.5 rounded-full border border-[#333] transition-colors duration-200">
              <UserIcon className="w-4 h-4" />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-white">{user?.username || 'User'}</h2>
            <p className="text-[#B0B0B0]">{user?.email || 'user@example.com'}</p>
            
            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FFDE59]/10 text-[#FFDE59]">
                <CheckBadgeIcon className="w-3 h-3 mr-1" />
                Premium Account
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#2EC4B6]/10 text-[#2EC4B6]">
                <SparklesIcon className="w-3 h-3 mr-1" />
                Level 3 Investor
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 md:self-start">
            <button className="p-2 rounded-lg bg-[#252525] hover:bg-[#333] text-white transition-colors duration-200">
              <EnvelopeIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={logout}
              className="p-2 rounded-lg bg-[#252525] hover:bg-[#333] text-white transition-colors duration-200"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex overflow-x-auto scrollbar-hide space-x-2 mb-6 p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-[#FFDE59] text-black font-medium'
                : 'bg-[#252525] text-[#B0B0B0] hover:bg-[#333] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <div>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333]">
                <h3 className="text-white font-medium">Personal Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#B0B0B0] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={user?.fullName || "User Name"}
                      className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#B0B0B0] mb-1">Username</label>
                    <input
                      type="text"
                      value={user?.username || "username"}
                      className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#B0B0B0] mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || "user@example.com"}
                      className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#B0B0B0] mb-1">Phone</label>
                    <input
                      type="tel"
                      value={user?.phone || "+1 (555) 123-4567"}
                      className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 text-white"
                      readOnly
                    />
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#FFDE59] text-black rounded-xl font-medium transition-colors duration-200 hover:bg-[#FFD42A]">
                  Edit Information
                </button>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333]">
                <h3 className="text-white font-medium">Linked Accounts</h3>
              </div>
              <div className="divide-y divide-[#333]">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Facebook</h4>
                      <p className="text-xs text-[#B0B0B0]">Connected</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-[#252525] hover:bg-[#333] text-white text-sm rounded-lg">
                    Disconnect
                  </button>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.92 12.62a12.14 12.14 0 0 0-.19-2.16H12v4.09h6.14a5.28 5.28 0 0 1-2.27 3.45v2.86h3.67c2.15-1.98 3.38-4.9 3.38-8.24z" fill="#4285F4" />
                        <path d="M12 23c3.06 0 5.63-1.01 7.5-2.74l-3.67-2.86c-1.02.68-2.32 1.08-3.83 1.08-2.94 0-5.44-1.99-6.33-4.66H1.9v2.95A11.98 11.98 0 0 0 12 23z" fill="#34A853" />
                        <path d="M5.67 13.82a7.18 7.18 0 0 1 0-4.6V6.27H1.9a11.97 11.97 0 0 0 0 10.76l3.77-3.21z" fill="#FBBC04" />
                        <path d="M12 5.47c1.66 0 3.14.57 4.32 1.68l3.24-3.24A11.95 11.95 0 0 0 12 .5a11.96 11.96 0 0 0-10.1 5.77l3.77 3.21C6.56 7.46 9.06 5.47 12 5.47z" fill="#EA4335" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Google</h4>
                      <p className="text-xs text-[#B0B0B0]">Not Connected</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-[#FFDE59] text-black text-sm rounded-lg">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333]">
                <h3 className="text-white font-medium">Account Security</h3>
              </div>
              <div className="divide-y divide-[#333]">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
                      <KeyIcon className="w-5 h-5 text-[#FFDE59]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Change Password</h4>
                      <p className="text-xs text-[#B0B0B0]">Last updated 3 months ago</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-[#B0B0B0]" />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 text-[#FFDE59]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                      <p className="text-xs text-[#B0B0B0]">Currently enabled</p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input
                      type="checkbox"
                      className="absolute w-6 h-6 opacity-0 cursor-pointer"
                      id="toggle"
                      defaultChecked
                    />
                    <label
                      htmlFor="toggle"
                      className="block h-full overflow-hidden rounded-full bg-[#252525] cursor-pointer"
                    >
                      <span className="block h-full w-1/2 rounded-full bg-[#FFDE59] transform translate-x-full"></span>
                    </label>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
                      <CreditCardIcon className="w-5 h-5 text-[#FFDE59]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Manage Connected Cards</h4>
                      <p className="text-xs text-[#B0B0B0]">2 cards connected</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-[#B0B0B0]" />
                </div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333]">
                <h3 className="text-white font-medium">Login Sessions</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-[#252525] rounded-xl border border-[#333]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium">Current Session</h4>
                      <p className="text-xs text-[#B0B0B0] mt-1">MacOS • Safari • United States</p>
                      <p className="text-xs text-[#B0B0B0]">IP: 192.168.1.1 • Last active: Just now</p>
                    </div>
                    <span className="px-2 py-1 bg-[#FFDE59]/20 text-[#FFDE59] text-xs rounded-full">
                      Active Now
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#252525] rounded-xl border border-[#333]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium">iPhone 13 Pro</h4>
                      <p className="text-xs text-[#B0B0B0] mt-1">iOS • Mobile App • United States</p>
                      <p className="text-xs text-[#B0B0B0]">IP: 192.168.1.2 • Last active: Yesterday</p>
                    </div>
                    <button className="text-xs text-red-500 hover:underline">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333]">
                <h3 className="text-white font-medium">Notification Settings</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
                      <BellIcon className="w-5 h-5 text-[#FFDE59]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Push Notifications</h4>
                      <p className="text-xs text-[#B0B0B0]">Receive alerts on your device</p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input
                      type="checkbox"
                      className="absolute w-6 h-6 opacity-0 cursor-pointer"
                      id="push-toggle"
                      defaultChecked
                    />
                    <label
                      htmlFor="push-toggle"
                      className="block h-full overflow-hidden rounded-full bg-[#252525] cursor-pointer"
                    >
                      <span className="block h-full w-1/2 rounded-full bg-[#FFDE59] transform translate-x-full"></span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
                      <EnvelopeIcon className="w-5 h-5 text-[#FFDE59]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Email Notifications</h4>
                      <p className="text-xs text-[#B0B0B0]">Receive updates via email</p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input
                      type="checkbox"
                      className="absolute w-6 h-6 opacity-0 cursor-pointer"
                      id="email-toggle"
                      defaultChecked
                    />
                    <label
                      htmlFor="email-toggle"
                      className="block h-full overflow-hidden rounded-full bg-[#252525] cursor-pointer"
                    >
                      <span className="block h-full w-1/2 rounded-full bg-[#FFDE59] transform translate-x-full"></span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#333]">
                  <h4 className="text-white font-medium mb-3">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#B0B0B0]">Transaction alerts</p>
                      <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          className="absolute w-5 h-5 opacity-0 cursor-pointer"
                          id="transaction-toggle"
                          defaultChecked
                        />
                        <label
                          htmlFor="transaction-toggle"
                          className="block h-full overflow-hidden rounded-full bg-[#252525] cursor-pointer"
                        >
                          <span className="block h-full w-1/2 rounded-full bg-[#FFDE59] transform translate-x-full"></span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#B0B0B0]">Budget alerts</p>
                      <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          className="absolute w-5 h-5 opacity-0 cursor-pointer"
                          id="budget-toggle"
                          defaultChecked
                        />
                        <label
                          htmlFor="budget-toggle"
                          className="block h-full overflow-hidden rounded-full bg-[#252525] cursor-pointer"
                        >
                          <span className="block h-full w-1/2 rounded-full bg-[#FFDE59] transform translate-x-full"></span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#B0B0B0]">Security alerts</p>
                      <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          className="absolute w-5 h-5 opacity-0 cursor-pointer"
                          id="security-toggle"
                          defaultChecked
                        />
                        <label
                          htmlFor="security-toggle"
                          className="block h-full overflow-hidden rounded-full bg-[#252525] cursor-pointer"
                        >
                          <span className="block h-full w-1/2 rounded-full bg-[#FFDE59] transform translate-x-full"></span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#B0B0B0]">Marketing & offers</p>
                      <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          className="absolute w-5 h-5 opacity-0 cursor-pointer"
                          id="marketing-toggle"
                        />
                        <label
                          htmlFor="marketing-toggle"
                          className="block h-full overflow-hidden rounded-full bg-[#252525] cursor-pointer"
                        >
                          <span className="block h-full w-1/2 rounded-full bg-[#FFDE59]"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333]">
                <h3 className="text-white font-medium">App Settings</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Currency</h4>
                    <p className="text-xs text-[#B0B0B0]">Change your preferred currency</p>
                  </div>
                  <select className="bg-[#252525] border border-[#333] rounded-lg py-2 px-3 text-white">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>JPY (¥)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Language</h4>
                    <p className="text-xs text-[#B0B0B0]">Change app language</p>
                  </div>
                  <select className="bg-[#252525] border border-[#333] rounded-lg py-2 px-3 text-white">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-[#333]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">AI Features</h4>
                      <p className="text-xs text-[#B0B0B0]">Use AI to analyze your finances</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                      <input
                        type="checkbox"
                        className="absolute w-6 h-6 opacity-0 cursor-pointer"
                        id="ai-toggle"
                        defaultChecked
                      />
                      <label
                        htmlFor="ai-toggle"
                        className="block h-full overflow-hidden rounded-full bg-[#252525] cursor-pointer"
                      >
                        <span className="block h-full w-1/2 rounded-full bg-[#FFDE59] transform translate-x-full"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 