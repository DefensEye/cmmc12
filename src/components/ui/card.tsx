import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`} {...props} />
  );
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return (
    <div className={`p-4 border-b ${className}`} {...props} />
  );
}

export function CardContent({ className = "", ...props }: CardProps) {
  return (
    <div className={`p-4 ${className}`} {...props} />
  );
}

export function CardTitle({ className = "", ...props }: CardProps) {
  return (
    <h3 className={`text-lg font-medium ${className}`} {...props} />
  );
}
