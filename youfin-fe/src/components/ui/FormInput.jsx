import React, { useState, useRef } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  startIcon,
  required = false,
  showPassword,
  togglePassword,
  placeholder,
  helperText,
  error,
  fullWidth = true,
  autoFocus = false,
  disabled = false,
  multiline = false,
  rows = 1,
  validations,
  confirmPassword = false,
  passwordValue, // Only needed for confirm password
  className = '',
  style = {}
}) => {
  const isPassword = type === 'password';
  const isDate = type === 'date';
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleFocus = () => {
    setIsFocused(true);
    if (isPassword && validations) {
      setShowTooltip(true);
    }
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    setShowTooltip(false);
  };
  
  // For confirm password validation
  const isConfirmValid = confirmPassword && passwordValue === value && value !== '';

  return (
    <div className="mb-5 relative">
      {label && (
        <label 
          htmlFor={name} 
          className="block mb-2 text-sm font-medium text-[#FFDE59]"
        >
          {label} {required && <span className="text-[#FF4B4B]">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFDE59] z-10">
            {startIcon}
          </div>
        )}
        
        <input
          ref={inputRef}
          id={name}
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={style}
          className={`
            w-full 
            py-4 
            px-4 
            ${startIcon ? 'pl-10' : 'pl-4'} 
            pr-${isPassword ? '12' : '4'} 
            bg-[rgba(255,255,255,0.05)] 
            border-2
            ${isFocused ? 'border-[#FFDE59]' : 'border-[#333333]'}
            ${confirmPassword && value ? (isConfirmValid ? 'border-[#00C853]' : 'border-[#FF4B4B]') : ''}
            focus-visible:outline-none
            focus:ring-2
            focus:ring-[#FFDE59] 
            focus:ring-opacity-30
            text-white
            rounded-xl
            transition-all
            duration-200
            placeholder:text-[#777777]
            ${error ? 'border-[#FF4B4B] focus:border-[#FF4B4B] focus:ring-[#FF4B4B]' : ''}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            ${isDate && 'calendar-white'}
            ${className}
          `}
        />
        
        {isPassword && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <button
              type="button"
              onClick={togglePassword}
              className="text-[#AAAAAA] hover:text-[#FFDE59] transition-colors duration-200 p-1 focus:outline-none"
            >
              {showPassword ? (
                <VisibilityOff className="w-5 h-5" />
              ) : (
                <Visibility className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
        
        {/* Password requirements tooltip */}
        {isPassword && validations && showTooltip && (
          <div className="absolute z-30 mt-2 w-full bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg p-3 text-sm">
            <div className="text-[#FFDE59] font-medium mb-2">Password requirements:</div>
            <ul className="space-y-1.5">
              {Object.entries(validations).map(([key, valid]) => (
                <li key={key} className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${valid ? 'bg-[#00C853]' : 'bg-[#FF4B4B]'}`}></span>
                  <span className={valid ? 'text-[#00C853]' : 'text-white'}>
                    {key === 'minLength' && 'At least 8 characters'}
                    {key === 'hasNumber' && 'At least one number'}
                    {key === 'hasSpecial' && 'At least one special character'}
                    {key === 'hasUppercase' && 'At least one uppercase letter'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirm password indicator */}
        {confirmPassword && value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isConfirmValid ? 'text-[#00C853]' : 'bg-[#FF4B4B]/20 text-[#FF4B4B]'}`}>
              {isConfirmValid ? '' : '✕'}
            </div>
          </div>
        )}
      </div>
      
      {helperText && !React.isValidElement(helperText) && (
        <p className={`mt-1 text-xs ${error ? 'text-[#FF4B4B]' : helperText.includes("join") ? 'text-[#FFDE59] font-medium' : 'text-[#AAAAAA]'}`}>
          {helperText}
        </p>
      )}
      
      {helperText && React.isValidElement(helperText) && (
        <div className="mt-1">{helperText}</div>
      )}
      
      {error && !helperText && (
        <p className="mt-1 text-xs text-[#FF4B4B]">
          {error}
        </p>
      )}
      
      {confirmPassword && value && (
        <p className={`mt-1 text-xs ${isConfirmValid ? 'text-[#00C853]' : 'text-[#FF4B4B]'}`}>
          {isConfirmValid ? 'Passwords match' : 'Passwords do not match'}
        </p>
      )}
    </div>
  );
};

export default FormInput; 