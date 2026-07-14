import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primaryHover",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-300 text-textPrimary hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-textPrimary"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
