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
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
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
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrev}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {pages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={clsx(
                  'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300',
                  page === currentPage
                    ? 'z-10 bg-primary-600 text-white focus-visible:outline-primary-600'
                    : 'text-gray-900 hover:bg-gray-50',
                  page === '...' && 'cursor-default'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
}