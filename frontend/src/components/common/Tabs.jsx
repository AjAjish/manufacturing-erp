import React from 'react';
import clsx from 'clsx';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-accent-100 dark:border-accent-800/50 bg-white/50 dark:bg-accent-900/20 rounded-t-xl">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={clsx(
              'relative whitespace-nowrap py-4 px-1 text-sm font-semibold transition-colors',
              activeTab === tab.key
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-accent-600 dark:text-accent-400 hover:text-accent-900 dark:hover:text-accent-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'ml-2 rounded-full py-0.5 px-2.5 text-xs font-semibold',
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'bg-accent-100 text-accent-700 dark:bg-accent-800/50 dark:text-accent-300'
                )}
              >
                {tab.count}
              </span>
            )}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-primary-500 rounded-t-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}