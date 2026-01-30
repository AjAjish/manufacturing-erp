import React from 'react';
import clsx from 'clsx';

export default function Card({ title, subtitle, children, className, actions }) {
  return (
    <div className={clsx('bg-white shadow rounded-lg', className)}>
      {(title || actions) && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
}