import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const variants = {
  success: {
    icon: CheckCircleIcon,
    className: 'bg-emerald-50/80 text-emerald-800 border border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50',
    iconClassName: 'text-emerald-500 dark:text-emerald-400',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'bg-amber-50/80 text-amber-800 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50',
    iconClassName: 'text-amber-500 dark:text-amber-400',
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-red-50/80 text-red-800 border border-red-200/50 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50',
    iconClassName: 'text-red-500 dark:text-red-400',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'bg-primary-50/80 text-primary-800 border border-primary-200/50 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800/50',
    iconClassName: 'text-primary-500 dark:text-primary-400',
  },
};

export default function Alert({ variant = 'info', title, children }) {
  const { icon: Icon, className, iconClassName } = variants[variant];

  return (
    <div className={clsx('rounded-xl p-4 backdrop-blur-xs', className)}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Icon className={clsx('h-5 w-5', iconClassName)} />
        </div>
        <div className="flex-1">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {children && <div className="mt-1 text-sm">{children}</div>}
        </div>
      </div>
    </div>
  );
}