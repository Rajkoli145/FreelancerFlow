import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  FileText, 
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { getProjects, getProjectStats } from '../../api/projectApi';
import { getInvoices } from '../../api/invoiceApi';
import { getTimeLogs } from '../../api/timeApi';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEarnings: 0,
      thisMonth: 0,
      hoursLogged: 0,
      pendingInvoices: 0,
      activeProjects: 0
    },
    earningsData: [],
    productivityData: [],
    recentInvoices: [],
    recentTimeLogs: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [projectsRes, invoicesRes, timeLogsRes, statsRes] = await Promise.all([
          getProjects().catch(() => ({ projects: [] })),
          getInvoices().catch(() => ({ invoices: [] })),
          getTimeLogs().catch(() => ({ timeLogs: [] })),
          getProjectStats().catch(() => ({ total: 0, active: 0, hoursThisMonth: 0 }))
        ]);

        const projects = Array.isArray(projectsRes) ? projectsRes : projectsRes.projects || [];
        const invoices = Array.isArray(invoicesRes) ? invoicesRes : invoicesRes.invoices || [];
        const timeLogs = Array.isArray(timeLogsRes) ? timeLogsRes : timeLogsRes.timeLogs || [];

        // Calculate stats
        const totalEarnings = invoices
          .filter(inv => inv.status === 'paid' || inv.status === 'Paid')
          .reduce((sum, inv) => sum + (inv.amount || inv.totalAmount || 0), 0);

        const now = new Date();
        const thisMonthEarnings = invoices
          .filter(inv => {
            const invDate = new Date(inv.createdAt || inv.createdDate);
            return (inv.status === 'paid' || inv.status === 'Paid') &&
              invDate.getMonth() === now.getMonth() &&
              invDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, inv) => sum + (inv.amount || inv.totalAmount || 0), 0);

        const pendingInvoicesCount = invoices.filter(inv => 
          inv.status !== 'paid' && inv.status !== 'Paid'
        ).length;

        // Generate earnings chart data (last 6 months)
        const earningsData = generateEarningsData(invoices);
        
        // Generate productivity data (last 4 weeks)
        const productivityData = generateProductivityData(timeLogs);

        // Get recent invoices and time logs
        const recentInvoices = invoices
          .sort((a, b) => new Date(b.createdAt || b.createdDate) - new Date(a.createdAt || a.createdDate))
          .slice(0, 3);

        const recentTimeLogs = timeLogs
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);

        setDashboardData({
          stats: {
            totalEarnings,
            thisMonth: thisMonthEarnings,
            hoursLogged: statsRes.hoursThisMonth || 0,
            pendingInvoices: pendingInvoicesCount,
            activeProjects: statsRes.active || 0
          },
          earningsData,
          productivityData,
          recentInvoices,
          recentTimeLogs
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateEarningsData = (invoices) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt || inv.createdDate);
        return (inv.status === 'paid' || inv.status === 'Paid') &&
          invDate.getMonth() === date.getMonth() &&
          invDate.getFullYear() === date.getFullYear();
      });
      
      const amount = monthInvoices.reduce((sum, inv) => sum + (inv.amount || inv.totalAmount || 0), 0);
      data.push({ month: months[date.getMonth()], amount });
    }

    return data;
  };

  const generateProductivityData = (timeLogs) => {
    const now = new Date();
    const data = [];

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekLogs = timeLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd;
      });

      const hours = weekLogs.reduce((sum, log) => sum + (log.hours || 0), 0);
      data.push({ week: `W${4 - i}`, hours: Math.round(hours * 10) / 10 });
    }

    return data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  const { stats, earningsData, productivityData, recentInvoices, recentTimeLogs } = dashboardData;

  // Calculate percentage changes (mock for now - could store historical data)
  const statsConfig = [
    { 
      title: 'Total Earnings', 
      value: `$${stats.totalEarnings.toLocaleString()}`, 
      change: '+12.5%', 
      trend: 'up', 
      icon: DollarSign,
      color: 'indigo'
    },
    { 
      title: 'This Month', 
      value: `$${stats.thisMonth.toLocaleString()}`, 
      change: '+8.2%', 
      trend: 'up', 
      icon: Calendar,
      color: 'green'
    },
    { 
      title: 'Hours Logged', 
      value: `${stats.hoursLogged}h`, 
      change: '+5.3%', 
      trend: 'up', 
      icon: Clock,
      color: 'blue'
    },
    { 
      title: 'Pending Invoices', 
      value: stats.pendingInvoices.toString(), 
      change: stats.pendingInvoices > 0 ? `${stats.pendingInvoices}` : '0', 
      trend: stats.pendingInvoices > 0 ? 'up' : 'down', 
      icon: FileText,
      color: 'orange'
    },
    { 
      title: 'Active Projects', 
      value: stats.activeProjects.toString(), 
      change: '+' + Math.max(0, stats.activeProjects - 10), 
      trend: 'up', 
      icon: Briefcase,
      color: 'purple'
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Overdue': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Good afternoon, {user?.fullName?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your financial and productivity overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsConfig.map((stat, index) => (
          <Card key={index} padding="default" className="hover:scale-105 transition-transform duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Overview */}
        <Card 
          title="Earnings Overview" 
          subtitle="Monthly revenue trend"
          icon={TrendingUp}
          headerAction={
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Productivity */}
        <Card 
          title="Weekly Productivity" 
          subtitle="Hours logged this week"
          icon={Clock}
          headerAction={
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="week" 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value} hours`, 'Time Logged']}
                />
                <Bar 
                  dataKey="hours" 
                  fill="url(#colorHours)" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card 
          title="Recent Invoices" 
          subtitle="Latest billing activity"
          icon={FileText}
          headerAction={
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View all
            </button>
          }
        >
          <div className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent invoices</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div key={invoice._id || invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{invoice.invoiceNumber || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{invoice.clientId?.name || 'No Client'}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-semibold text-gray-900">${(invoice.amount || invoice.totalAmount || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(invoice.createdAt || invoice.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Time Logs */}
        <Card 
          title="Recent Time Logs" 
          subtitle="Latest tracked time"
          icon={Clock}
          headerAction={
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View all
            </button>
          }
        >
          <div className="space-y-3">
            {recentTimeLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent time logs</p>
            ) : (
              recentTimeLogs.map((log, index) => (
                <div key={log._id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{log.projectId?.name || 'No Project'}</p>
                    <p className="text-sm text-gray-500">{log.description || 'No description'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600">{log.hours}h</p>
                    <p className="text-xs text-gray-500">
                      {(() => {
                        const logDate = new Date(log.date);
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        
                        if (logDate.toDateString() === today.toDateString()) return 'Today';
                        if (logDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
                        return logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      })()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

