import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  // Normalize status to lowercase for comparison
  const normalizedStatus = status?.toLowerCase() || 'active';
  
  const statusStyles = {
    active: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-200',
    on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
    paid: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    viewed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const statusClass = statusStyles[normalizedStatus] || 'bg-gray-100 text-gray-700 border-gray-200';
  const sizeClass = sizeStyles[size];
  
  // Display text: capitalize first letter, replace underscores with spaces
  const displayStatus = normalizedStatus
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

  return (
    <span 
      className={`inline-flex items-center font-semibold rounded-full border ${statusClass} ${sizeClass}`}
    >
      {displayStatus}
    </span>
  );
};

export default StatusBadge;
