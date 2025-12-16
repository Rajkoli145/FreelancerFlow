import React from 'react';
import NeuButton from './NeuButton';

const PageHeader = ({ 
  title, 
  subtitle,
  actionLabel, 
  actionIcon: ActionIcon, 
  onActionClick,
  children 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1f2937' }}>{title}</h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{subtitle}</p>
        )}
      </div>
      {(actionLabel || children) && (
        <div className="flex items-center gap-3">
          {children}
          {actionLabel && (
            <NeuButton 
              variant="primary" 
              icon={ActionIcon}
              onClick={onActionClick}
            >
              {actionLabel}
            </NeuButton>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
