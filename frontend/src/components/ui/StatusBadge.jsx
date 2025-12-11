import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusStyles = {
    Active: 'bg-green-100 text-green-700 border-green-200',
    Completed: 'bg-gray-100 text-gray-700 border-gray-200',
    'On Hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Overdue: 'bg-red-100 text-red-700 border-red-200',
    Paid: 'bg-green-100 text-green-700 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    Cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const statusClass = statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const sizeClass = sizeStyles[size];

  return (
    <span 
      className={`inline-flex items-center font-semibold rounded-full border ${statusClass} ${sizeClass}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
