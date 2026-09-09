import React from 'react';
import { Sun } from 'lucide-react';

const LoadingSpinner = ({ text = 'Analyzing solar data...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="relative">
        <Sun className={`${sizeClasses[size] || sizeClasses.md} text-brand-green animate-spin`} />
        <div className="absolute inset-0 rounded-full border-2 border-brand-green/30 border-t-transparent animate-spin"></div>
      </div>
      {text && <p className="text-body font-medium text-light-muted dark:text-dark-muted animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
