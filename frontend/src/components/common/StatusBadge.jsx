import React from 'react';
import clsx from 'clsx';

const statusColors = {
  // Order statuses
  draft: 'badge-gray',
  quoted: 'badge-blue',
  confirmed: 'badge-blue',
  in_production: 'badge-yellow',
  quality_check: 'badge-yellow',
  ready_for_dispatch: 'badge-green',
  dispatched: 'badge-green',
  completed: 'badge-green',
  cancelled: 'badge-red',
  on_hold: 'badge-red',
  
  // Generic
  pending: 'badge-yellow',
  in_progress: 'badge-yellow',
  pass: 'badge-green',
  fail: 'badge-red',
  approved: 'badge-green',
  rejected: 'badge-red',
  
  // Priority
  low: 'badge-gray',
  normal: 'badge-blue',
  high: 'badge-yellow',
  urgent: 'badge-red',
};

export default function StatusBadge({ status, label }) {
  const colorClass = statusColors[status?.toLowerCase()] || 'badge-gray';
  const displayLabel = label || status?.replace(/_/g, ' ');

  return (
    <span className={clsx('badge capitalize', colorClass)}>
      {displayLabel}
    </span>
  );
}