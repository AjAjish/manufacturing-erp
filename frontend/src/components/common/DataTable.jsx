import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
  onRowClick,
  bordered = true,
}) {
  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-accent-500 dark:text-accent-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-accent-100 dark:border-accent-800/50">
      <table className="min-w-full divide-y divide-accent-100 dark:divide-accent-800/50">
        <thead className="bg-accent-50/50 dark:bg-accent-900/30">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="table-header"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-accent-100 dark:divide-accent-800/50 bg-white/50 dark:bg-accent-900/20">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'table-row-hover cursor-pointer' : 'transition-colors duration-200'}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="table-cell"
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}