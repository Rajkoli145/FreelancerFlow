import React from 'react';

export default function ClientStatusBadge({ status }) {
  const statusConfig = {
    paid: {
      label: 'Paid',
      classes: 'bg-green-100 text-green-700 border-green-200',
    },
    pending: {
      label: 'Pending',
      classes: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    overdue: {
      label: 'Overdue',
      classes: 'bg-red-100 text-red-700 border-red-200',
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
