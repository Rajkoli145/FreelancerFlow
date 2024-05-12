import React, { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    Briefcase,
    DollarSign,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { getAdminMetrics } from '../../api/adminApi';
import StatCard from '../../components/ui/StatCard';
import Loader from '../../components/ui/Loader';
import '../../styles/global/neumorphism.css';

const AdminDashboardPage = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const response = await getAdminMetrics();
                // response is { success: true, data: { stats, recentUsers } }
                setMetrics(response.data);
            } catch (err) {
                console.error('Error fetching admin metrics:', err);
                setError(err.response?.data?.error || 'Failed to load admin metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) return <Loader fullScreen title="Loading Admin Panel..." />;

    if (error) {
        return (
            <div className="neu-container flex items-center justify-center min-h-[60vh]">
                <div className="neu-card text-center max-w-md">
                    <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold neu-heading mb-2">Access Denied</h2>
                    <p className="neu-text-light">{error}</p>
                </div>
            </div>
        );
    }

    const { stats, recentUsers } = metrics;

    return (
        <div className="neu-container space-y-6">
            {/* Page Header */}
            <div className="neu-card border-l-4 border-indigo-600">
                <div className="flex items-center gap-4">
                    <div className="neu-icon-inset p-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold neu-heading text-indigo-700">Platform Administrator</h1>
                        <p className="neu-text-light mt-1">Global oversight of FreelancerFlow platform metrics.</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    title="Total Freelancers"
                    value={stats.totalUsers.toString()}
                    iconBg="#4F46E5"
                />
                <StatCard
                    icon={Briefcase}
                    title="Active Projects"
                    value={stats.totalProjects.toString()}
                    iconBg="#10B981"
                />
                <StatCard
                    icon={FileText}
                    title="Invoices Generated"
                    value={stats.totalInvoices.toString()}
                    iconBg="#F59E0B"
                />
                <StatCard
                    icon={DollarSign}
                    title="Platform Revenue"
                    value={`₹${stats.totalPlatformRevenue.toLocaleString()}`}
                    iconBg="#EC4899"
                />
            </div>

            {/* Recent Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Signups */}
                <div className="neu-card">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold neu-heading">Recent Freelancer Signups</h3>
                    </div>
                    <div className="space-y-4">
                        {recentUsers.map((user) => (
                            <div key={user._id} className="neu-card-inset p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold neu-heading">{user.fullName}</p>
                                    <p className="text-sm neu-text-light">{user.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs neu-text-light">Joined</p>
                                    <p className="text-sm font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentUsers.length === 0 && (
                            <p className="text-center neu-text-light py-8">No recent signups found.</p>
                        )}
                    </div>
                </div>

                {/* System Status */}
                <div className="neu-card">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold neu-heading">System Integrity</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="neu-card-inset p-6 text-center">
                            <p className="text-sm neu-text-light mb-1">API Status</p>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-bold text-green-600">Operational</span>
                            </div>
                        </div>
                        <div className="neu-card-inset p-6 text-center">
                            <p className="text-sm neu-text-light mb-1">Database</p>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="font-bold text-green-600">Connected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
