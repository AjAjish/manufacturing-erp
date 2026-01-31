import React from 'react';
import clsx from 'clsx';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-accent-200 dark:border-accent-700 border-t-primary-600 dark:border-t-primary-500',
          sizeClasses[size]
        )}
      />
    </div>
  );
}