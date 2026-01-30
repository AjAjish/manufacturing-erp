import React from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';

export default function EmptyState({
  icon: Icon = FolderIcon,
  title = 'No data',
  description = 'Get started by creating a new item.',
  action,
}) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}