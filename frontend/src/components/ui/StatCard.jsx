import React from 'react';

const StatCard = ({ icon: Icon, title, label, value, subtitle, trend, iconBg = '#4A5FFF', className = '' }) => {
  return (
    <div 
      className={`p-6 rounded-2xl ${className}`}
      style={{
        backgroundColor: '#eef1f6',
        boxShadow: '5px 5px 10px #c9ced6, -5px -5px 10px #ffffff',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{title || label}</p>
          <p className="font-bold mt-2" style={{ color: '#374151', fontSize: '1.05rem' }}>{value}</p>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium`} style={{ color: trend.positive ? '#10b981' : '#ef4444' }}>
                {trend.value}
              </span>
              <span className="text-sm" style={{ color: '#6b7280' }}>{trend.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: '#eef1f6',
              boxShadow: '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff',
            }}
          >
            <Icon className="w-6 h-6" style={{ color: iconBg, strokeWidth: 2 }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
