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
    className: 'bg-green-50 text-green-800 border-green-200',
    iconClassName: 'text-green-400',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    iconClassName: 'text-yellow-400',
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-red-50 text-red-800 border-red-200',
    iconClassName: 'text-red-400',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'bg-blue-50 text-blue-800 border-blue-200',
    iconClassName: 'text-blue-400',
  },
};

export default function Alert({ variant = 'info', title, children }) {
  const { icon: Icon, className, iconClassName } = variants[variant];

  return (
    <div className={clsx('rounded-md border p-4', className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={clsx('h-5 w-5', iconClassName)} />
        </div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {children && <div className="mt-1 text-sm">{children}</div>}
        </div>
      </div>
    </div>
  );
}