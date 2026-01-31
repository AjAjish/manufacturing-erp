import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < totalPages - 2;

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (showEllipsisStart) pages.push('...');
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (showEllipsisEnd) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-between border-t border-accent-100 dark:border-accent-800/50 px-4 py-4 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="btn-secondary"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="btn-secondary"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent-700 dark:text-accent-300">
            Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-lg shadow-soft border border-accent-200 dark:border-accent-700 bg-white/50 dark:bg-accent-900/30 overflow-hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrev}
              className={clsx(
                'relative inline-flex items-center px-2 py-2 text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
              )}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {pages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={clsx(
                  'relative inline-flex items-center px-3 py-2 text-sm font-semibold transition-colors',
                  page === currentPage
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'text-accent-700 dark:text-accent-300 hover:bg-accent-100 dark:hover:bg-accent-800/50',
                  page === '...' && 'cursor-default hover:bg-transparent dark:hover:bg-transparent'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
              className={clsx(
                'relative inline-flex items-center px-2 py-2 text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
              )}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
}