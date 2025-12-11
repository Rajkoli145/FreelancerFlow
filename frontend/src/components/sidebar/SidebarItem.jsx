import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, to, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
        ${isActive 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <Icon 
        className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}`} 
      />
      <span className="font-medium text-sm flex-1">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-600">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;
