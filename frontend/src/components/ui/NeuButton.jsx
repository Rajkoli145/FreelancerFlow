import React, { useState } from 'react';

const NeuButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon: Icon,
  className = '',
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getStyles = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: '#4A5FFF',
        color: 'white',
        boxShadow: isPressed 
          ? 'inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.05)'
          : '5px 5px 10px #c9ced6, -5px -5px 10px #ffffff',
      };
    }
    return {
      backgroundColor: '#eef1f6',
      color: '#374151',
      boxShadow: isPressed 
        ? 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff'
        : '5px 5px 10px #c9ced6, -5px -5px 10px #ffffff',
    };
  };

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${className}`}
      style={{
        ...getStyles(),
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
      }}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

export default NeuButton;
