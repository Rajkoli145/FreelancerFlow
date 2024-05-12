import React from 'react';

const NeuInput = ({ 
  type = 'text', 
  placeholder, 
  icon: Icon, 
  value, 
  onChange,
  className = '',
  ...props 
}) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 10 }}>
          <Icon className="w-5 h-5" style={{ color: '#9ca3af' }} />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl py-3.5 text-sm font-medium transition-all duration-200 ${Icon ? 'pl-12 pr-4' : 'px-4'} ${className}`}
        style={{
          backgroundColor: '#eef1f6',
          boxShadow: 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff',
          border: 'none',
          outline: 'none',
          color: '#374151'
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = 'inset 4px 4px 8px #c9ced6, inset -4px -4px 8px #ffffff';
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff';
        }}
        {...props}
      />
    </div>
  );
};

export default NeuInput;
