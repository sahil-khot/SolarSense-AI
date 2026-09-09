import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-card p-3.5 flex items-start gap-3 my-3 text-body">
      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
      <div className="flex-1 font-medium">
        {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-helper bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 px-2.5 py-1 rounded-btn font-medium transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
