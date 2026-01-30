import React from 'react';
import clsx from 'clsx';

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={clsx('flex-shrink-0 rounded-md p-3', colorClasses[color])}>
            {Icon && <Icon className="h-6 w-6 text-white" aria-hidden="true" />}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div
                    className={clsx(
                      'ml-2 flex items-baseline text-sm font-semibold',
                      trendUp ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {trend}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}