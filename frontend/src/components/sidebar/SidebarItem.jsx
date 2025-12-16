import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, to, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const [isHovered, setIsHovered] = useState(false);

  const getStyles = () => {
    if (isActive) {
      return {
        backgroundColor: '#eef1f6',
        boxShadow: 'inset 6px 6px 10px #c9ced6, inset -6px -6px 10px #ffffff',
        color: '#4f46e5',
        transform: 'scale(1)'
      };
    }
    if (isHovered) {
      return {
        backgroundColor: '#eef1f6',
        boxShadow: 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff',
        color: '#374151',
        transform: 'scale(0.98)'
      };
    }
    return {
      backgroundColor: '#eef1f6',
      boxShadow: '6px 6px 12px #c9ced6, -6px -6px 12px #ffffff',
      color: '#6b7280',
      transform: 'scale(1)'
    };
  };

  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm"
      style={getStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon 
        className="w-5 h-5" 
        style={{ color: isActive ? '#4f46e5' : '#6b7280' }}
      />
      <span className="flex-1" style={{ color: isActive ? '#4f46e5' : '#374151' }}>
        {label}
      </span>
      {badge && (
        <span 
          className="px-2 py-0.5 text-[10px] font-semibold rounded-lg text-white"
          style={{
            backgroundColor: '#4f46e5',
            boxShadow: '2px 2px 4px #c9ced6, -2px -2px 4px #ffffff'
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;
