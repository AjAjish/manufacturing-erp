import React from 'react';
import clsx from 'clsx';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={clsx(
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium',
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-900'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}