import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  KeyIcon,
  UserCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New reward available',
      description: 'You have earned a new cashback reward!',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      title: 'Security alert',
      description: 'New device logged into your account',
      time: '1 day ago',
      unread: false
    }
  ]);

  const menuItems = [
    {
      title: 'Account',
      items: [
        {
          name: 'Personal Information',
          icon: UserCircleIcon,
          href: '/profile/personal',
          badge: null,
          color: 'text-[#FF6B00]',
          bgColor: 'bg-[#FF6B00]/10'
        },
        {
          name: 'Notifications',
          icon: BellIcon,
          href: '/profile/notifications',
          badge: '2',
          color: 'text-[#FF9500]',
          bgColor: 'bg-[#FF9500]/10'
        },
        {
          name: 'Security',
          icon: ShieldCheckIcon,
          href: '/profile/security',
          badge: null,
          color: 'text-[#34C759]',
          bgColor: 'bg-[#34C759]/10'
        }
      ]
    },
    {
      title: 'Payments',
      items: [
        {
          name: 'Payment Methods',
          icon: CreditCardIcon,
          href: '/profile/payment-methods',
          badge: null,
          color: 'text-[#FF6B00]',
          bgColor: 'bg-[#FF6B00]/10'
        },
        {
          name: 'Bank Accounts',
          icon: BanknotesIcon,
          href: '/profile/bank-accounts',
          badge: null,
          color: 'text-[#5E5CE6]',
          bgColor: 'bg-[#5E5CE6]/10'
        }
      ]
    },
    {
      title: 'More',
      items: [
        {
          name: 'Appearance',
          icon: SparklesIcon,
          href: '/profile/appearance',
          badge: null,
          color: 'text-[#FF6B00]',
          bgColor: 'bg-[#FF6B00]/10'
        },
        {
          name: 'Help & Support',
          icon: QuestionMarkCircleIcon,
          href: '/help',
          badge: null,
          color: 'text-[#34C759]',
          bgColor: 'bg-[#34C759]/10'
        },
        {
          name: 'About',
          icon: InformationCircleIcon,
          href: '/about',
          badge: null,
          color: 'text-[#5E5CE6]',
          bgColor: 'bg-[#5E5CE6]/10'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-[#A0A0A0]">Manage your settings</p>
        </div>
        
        <Link to="/settings" className="w-10 h-10 bg-[#151515] border border-[#2A2A2A] rounded-full flex items-center justify-center hover:border-[#FF6B00] transition-all duration-200">
          <Cog6ToothIcon className="w-5 h-5 text-white" />
        </Link>
      </div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-5 bg-[#151515] border border-[#2A2A2A] rounded-xl"
      >
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B00] to-[#FF9F1C] rounded-full flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-white">{user?.firstName?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-white">
              {user?.firstName} {user?.lastName || 'User'}
            </h2>
            <p className="text-[#A0A0A0]">{user?.email || 'user@example.com'}</p>
          </div>
          <div className="ml-auto">
            <Link to="/profile/edit" className="px-4 py-2 bg-[#252525] text-white text-sm rounded-full hover:bg-[#333333] transition-colors">
              Edit
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Menu Sections */}
      {menuItems.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-[#A0A0A0] text-sm font-medium px-1">{section.title}</h3>
          <div className="space-y-3">
            {section.items.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center justify-between p-4 bg-[#151515] border border-[#2A2A2A] rounded-xl hover:border-[#FF6B00] transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="font-medium text-white">{item.name}</span>
                </div>
                <div className="flex items-center">
                  {item.badge && (
                    <span className="mr-2 px-2 py-0.5 bg-[#FF6B00] text-white text-xs font-medium rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRightIcon className="w-5 h-5 text-[#A0A0A0]" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 p-4 bg-[#151515] border border-[#2A2A2A] rounded-xl hover:border-[#FF3B30] hover:bg-[#FF3B30]/5 transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-[#FF3B30]" />
          <span className="font-medium text-[#FF3B30]">Log Out</span>
        </button>
      </motion.div>

      {/* App Version */}
      <div className="text-center">
        <p className="text-sm text-[#A0A0A0]">YouFin v1.0.0</p>
      </div>
    </div>
  );
};

export default Profile; 