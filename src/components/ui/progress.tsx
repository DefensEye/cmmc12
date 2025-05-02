import React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ 
  className = "", 
  value = 0, 
  ...props 
}: ProgressProps) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`} {...props}>
      <div 
        className="h-full w-full flex-1 bg-blue-600 transition-all" 
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}
