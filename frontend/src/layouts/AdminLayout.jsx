import React from 'react';
import { ShieldCheck, LogOut, LayoutDashboard, Monitor } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f4f8' }}>
            {/* Admin Top Navbar */}
            <nav className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm z-50">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">FreelancerFlow <span className="text-indigo-600">Admin</span></h2>
                        <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">System Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-semibold text-gray-600 uppercase">Server Online</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </nav>

            <div className="flex flex-1">
                {/* Admin Sidebar - Minimalist */}
                <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-8 gap-8 shadow-sm">
                    <button
                        onClick={() => navigate('/admin')}
                        className={`p-3 rounded-xl transition-all ${location.pathname === '/admin' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                        title="Dashboard"
                    >
                        <LayoutDashboard className="w-6 h-6" />
                    </button>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
