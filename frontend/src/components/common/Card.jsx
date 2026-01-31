import React from 'react';
import clsx from 'clsx';

export default function Card({ title, subtitle, children, className, actions, variant = 'default' }) {
  const variants = {
    default: 'card',
    elevated: 'card-elevated',
    hover: 'card-hover',
  };

  return (
    <div className={clsx(variants[variant], className)}>
      {(title || actions) && (
        <div className="px-6 py-5 sm:px-8 border-b border-accent-100 dark:border-accent-800/50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-accent-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-accent-600 dark:text-accent-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-3">{actions}</div>}
        </div>
      )}
      <div className="px-6 py-6 sm:p-8">{children}</div>
    </div>
  );
}