import React from 'react';
import { CircularProgress } from '@mui/material';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  startIcon,
  endIcon,
  className,
  ...props
}) => {
  const baseClasses = `
    relative
    flex
    items-center
    justify-center
    font-medium
    transition-all
    duration-300
    focus:outline-none
    overflow-hidden
    ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg active:transform active:scale-95'}
  `;

  const variantClasses = {
    primary: `
      bg-[#FFDE59] 
      text-black
      hover:bg-[#FFE082]
      active:bg-[#FFC107]
      shadow-[0_0_15px_rgba(255,222,89,0.25)]
      hover:shadow-[0_0_20px_rgba(255,222,89,0.35)]
    `,
    secondary: `
      bg-transparent
      text-white
      border-2
      border-[#FFDE59]
      hover:bg-[rgba(255,222,89,0.1)]
      hover:text-[#FFDE59]
    `,
    dark: `
      bg-[#1E1E1E]
      text-white
      border
      border-[#333333]
      hover:bg-[#2D2D2D]
    `,
    danger: `
      bg-[#FF4B4B]
      text-white
      hover:bg-[#FF3333]
    `,
    transparent: `
      bg-transparent
      text-[#FFDE59]
      hover:bg-[rgba(255,222,89,0.1)]
    `
  };

  const sizeClasses = {
    sm: 'text-xs py-2 px-4 rounded-lg',
    md: 'text-sm py-3 px-6 rounded-xl',
    lg: 'text-base py-4 px-8 rounded-xl font-semibold'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className || ''}
      `}
      {...props}
    >
      {isLoading && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {variant === 'primary' ? (
            <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
          ) : (
            <div className="animate-spin w-5 h-5 border-2 border-[#FFDE59] border-t-transparent rounded-full"></div>
          )}
        </div>
      )}
      
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : ''}`}>
        {startIcon && <span className="flex-shrink-0">{startIcon}</span>}
        {children}
        {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
      </span>
    </button>
  );
};

export default Button; 