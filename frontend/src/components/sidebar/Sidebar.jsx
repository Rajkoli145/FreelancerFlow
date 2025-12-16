import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Clock, 
  FileText, 
  Settings, 
  LogOut,
  Zap,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import { useAuth } from '../../context/AuthContext';
import { getInvoiceStats } from '../../api/invoiceApi';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoiceBadge, setInvoiceBadge] = useState(null);

  // Fetch invoice stats for badge
  useEffect(() => {
    const fetchInvoiceStats = async () => {
      try {
        const response = await getInvoiceStats();
        const stats = response.data || response;
        // Show urgent count (overdue + partial)
        if (stats.urgent > 0) {
          setInvoiceBadge(stats.urgent.toString());
        } else {
          setInvoiceBadge(null);
        }
      } catch (err) {
        console.error('Error fetching invoice stats:', err);
        setInvoiceBadge(null);
      }
    };

    fetchInvoiceStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchInvoiceStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Briefcase, label: 'Projects', to: '/projects' },
    { icon: Users, label: 'Clients', to: '/clients' },
    { icon: Clock, label: 'Time Tracking', to: '/time' },
    { icon: FileText, label: 'Invoices', to: '/invoices', badge: invoiceBadge },
    { icon: TrendingDown, label: 'Expenses', to: '/expenses' },
    { icon: BarChart3, label: 'Reports', to: '/reports' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <aside 
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-30"
      style={{ backgroundColor: '#eef1f6' }}
    >
      {/* Logo Section */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: '#4f46e5',
              boxShadow: '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff'
            }}
          >
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800 leading-tight">FreelancerFlow</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Manage your work</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="mx-4 mb-6">
        <div 
          className="p-4 rounded-2xl"
          style={{
            backgroundColor: '#eef1f6',
            boxShadow: '6px 6px 12px #c9ced6, -6px -6px 12px #ffffff'
          }}
        >
          <div className="flex items-center gap-3">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover"
                style={{
                  boxShadow: '3px 3px 6px #c9ced6, -3px -3px 6px #ffffff'
                }}
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '3px 3px 6px #c9ced6, -3px -3px 6px #ffffff'
                }}
              >
                {getInitials(user?.fullName)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.fullName || 'User'}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-2">
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
      <div className="px-4 pb-6 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 font-medium text-sm transition-all duration-200"
          style={{
            backgroundColor: '#eef1f6',
            boxShadow: '6px 6px 12px #c9ced6, -6px -6px 12px #ffffff'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #c9ced6, inset -4px -4px 8px #ffffff';
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '6px 6px 12px #c9ced6, -6px -6px 12px #ffffff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
