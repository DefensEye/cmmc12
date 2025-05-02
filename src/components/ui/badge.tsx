import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

export function Badge({ 
  className = "", 
  variant = 'default', 
  ...props 
}: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantStyles = {
    default: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    outline: "text-gray-800 border border-gray-300 hover:bg-gray-100"
  };
  
  return (
    <span 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`} 
      {...props} 
    />
  );
}
