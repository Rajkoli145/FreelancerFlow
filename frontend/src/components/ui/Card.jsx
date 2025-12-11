import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  className = '',
  headerAction,
  padding = 'default',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {(title || Icon || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
