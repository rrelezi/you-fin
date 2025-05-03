import React from 'react';
import { Alert } from '@mui/material';
import { motion } from 'framer-motion';

const AuthCard = ({
  children,
  title,
  subtitle,
  error,
  success,
  headerImage,
  footer,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full max-w-md mx-auto ${className || ''}`}
    >
      <div className="relative">
        {headerImage && (
          <div className="relative h-32 sm:h-44 overflow-hidden rounded-t-2xl">
            <img 
              src={headerImage} 
              alt="Header" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.8)]"></div>
            <div className="absolute bottom-0 left-0 w-full p-4 text-white text-center">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
            </div>
          </div>
        )}
        
        <div className={`bg-[#1E1E1E] ${!headerImage ? 'rounded-2xl' : 'rounded-b-2xl'} 
          shadow-[0_8px_32px_rgba(0,0,0,0.5)] 
          border border-[rgba(255,255,255,0.05)]
          p-6 sm:p-8
        `}>
          {!headerImage && (
            <div className="text-center mb-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl font-bold text-[#FFDE59] tracking-tight"
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-sm text-[#B0B0B0] mt-1"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert 
                severity="error" 
                className="mb-6 border border-[rgba(255,75,75,0.3)] rounded-xl" 
                sx={{ 
                  padding: '10px 16px',
                  backgroundColor: 'rgba(255, 75, 75, 0.1)',
                  color: '#FF4B4B',
                  '& .MuiAlert-icon': {
                    color: '#FF4B4B',
                    opacity: 0.9
                  }
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert 
                severity="success" 
                className="mb-6 border border-[rgba(0,200,83,0.3)] rounded-xl" 
                sx={{ 
                  padding: '10px 16px',
                  backgroundColor: 'rgba(0, 200, 83, 0.1)',
                  color: '#00C853',
                  '& .MuiAlert-icon': {
                    color: '#00C853',
                    opacity: 0.9
                  }
                }}
              >
                {success}
              </Alert>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 24
            }}
          >
            {children}
          </motion.div>
          
          {footer && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6"
            >
              {footer}
            </motion.div>
          )}
        </div>
        
        {/* Decorative element */}
        <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-3xl opacity-20 bg-gradient-to-r from-[#FFDE59] to-[#2EC4B6]"></div>
      </div>
    </motion.div>
  );
};

export default AuthCard; 