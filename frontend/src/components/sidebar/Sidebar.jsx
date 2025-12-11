import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Clock, 
  FileText, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Add logout logic here
    // Clear auth token, clear user data, etc.
    console.log('Logging out...');
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Briefcase, label: 'Projects', to: '/projects' },
    { icon: Users, label: 'Clients', to: '/clients' },
    { icon: Clock, label: 'Time Tracking', to: '/time' },
    { icon: FileText, label: 'Invoices', to: '/invoices', badge: '3' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FreelancerFlow</h1>
            <p className="text-xs text-gray-500">Manage your work</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              badge={item.badge}
            />
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
