import React from 'react';
import clsx from 'clsx';

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, color = 'primary' }) {
  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-primary-500 to-primary-600',
      text: 'text-primary-600',
      light: 'bg-primary-50 dark:bg-primary-900/30',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      text: 'text-emerald-600',
      light: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      text: 'text-amber-600',
      light: 'bg-amber-50 dark:bg-amber-900/30',
    },
    red: {
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      text: 'text-red-600',
      light: 'bg-red-50 dark:bg-red-900/30',
    },
    blue: {
      bg: 'bg-gradient-to-br from-sky-500 to-sky-600',
      text: 'text-sky-600',
      light: 'bg-sky-50 dark:bg-sky-900/30',
    },
  };

  const colorConfig = colorClasses[color];

  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-accent-600 dark:text-accent-400 mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-accent-900 dark:text-white">
                {value}
              </span>
              {trend && (
                <span
                  className={clsx(
                    'text-sm font-semibold',
                    trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {trend}
                </span>
              )}
            </div>
          </div>
          {Icon && (
            <div className={clsx('flex-shrink-0 rounded-xl p-3', colorConfig.light)}>
              <Icon className={clsx('h-6 w-6', colorConfig.text)} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}