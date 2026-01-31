import React from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';

export default function EmptyState({
  icon: Icon = FolderIcon,
  title = 'No data',
  description = 'Get started by creating a new item.',
  action,
}) {
  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-accent-100 dark:bg-accent-900/40 p-4">
          <Icon className="h-8 w-8 text-accent-600 dark:text-accent-400" />
        </div>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-accent-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-accent-600 dark:text-accent-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}