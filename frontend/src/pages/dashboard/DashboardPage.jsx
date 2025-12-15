import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  FileText, 
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Maximize,
  X
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
import StatCard from '../../components/ui/StatCard';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../api/dashboardApi';
import '../../styles/neumorphism.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, currencySymbol, formatAmount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [earningsMenuOpen, setEarningsMenuOpen] = useState(false);
  const [productivityMenuOpen, setProductivityMenuOpen] = useState(false);
  const [earningsTimeRange, setEarningsTimeRange] = useState('6months');
  const [productivityTimeRange, setProductivityTimeRange] = useState('4weeks');
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const earningsMenuRef = useRef(null);
  const productivityMenuRef = useRef(null);
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
        
        // Fetch from new dashboard stats endpoint
        const response = await getDashboardStats();
        const data = response.data || response;
        
        setDashboardData({
          stats: data.stats || {
            totalEarnings: 0,
            thisMonth: 0,
            hoursLogged: 0,
            pendingInvoices: 0,
            activeProjects: 0
          },
          earningsData: data.earningsData || [],
          productivityData: data.productivityData || [],
          recentInvoices: data.recentInvoices || [],
          recentTimeLogs: data.recentTimeLogs || []
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (earningsMenuRef.current && !earningsMenuRef.current.contains(event.target)) {
        setEarningsMenuOpen(false);
      }
      if (productivityMenuRef.current && !productivityMenuRef.current.contains(event.target)) {
        setProductivityMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  const { stats, earningsData, productivityData, recentInvoices, recentTimeLogs } = dashboardData;

  const iconColors = {
    'indigo': '#4A5FFF',
    'green': '#22c55e',
    'blue': '#3b82f6',
    'orange': '#f97316',
    'purple': '#a855f7'
  };

  const statsConfig = [
    { 
      title: 'Total Earnings', 
      value: formatAmount(stats.totalEarnings), 
      icon: DollarSign,
      iconBg: iconColors.indigo
    },
    { 
      title: 'This Month Revenue', 
      value: formatAmount(stats.thisMonth), 
      icon: TrendingUp,
      iconBg: iconColors.green
    },
    { 
      title: 'This Month Expenses', 
      value: formatAmount(stats.expenses || 0), 
      icon: TrendingDown,
      iconBg: iconColors.orange
    },
    { 
      title: 'Net Profit', 
      value: formatAmount(stats.netProfit || 0), 
      icon: DollarSign,
      iconBg: (stats.netProfit || 0) >= 0 ? iconColors.green : '#ef4444'
    },
    { 
      title: 'Hours Logged', 
      value: `${stats.hoursLogged}h`, 
      icon: Clock,
      iconBg: iconColors.blue
    },
    { 
      title: 'Active Projects', 
      value: stats.activeProjects.toString(), 
      icon: Briefcase,
      iconBg: iconColors.purple
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
    <div className="neu-container space-y-6">
      {/* Page Header */}
      <div className="neu-card">
        <h1 className="text-3xl font-bold neu-heading">
          Good afternoon, {user?.fullName?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="neu-text-light mt-2">
          Here's your financial and productivity overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statsConfig.map((stat, index) => (
          <StatCard 
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            iconBg={stat.iconBg}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Overview */}
        <div className="neu-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="neu-icon-inset">
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--neu-primary)' }} />
              </div>
              <div>
                <h3 className="font-semibold neu-heading">Earnings Overview</h3>
                <p className="text-sm neu-text-light">Monthly revenue trend</p>
              </div>
            </div>
            <div className="relative" ref={earningsMenuRef}>
              <button 
                onClick={() => setEarningsMenuOpen(!earningsMenuOpen)}
                className="neu-button p-2"
              >
                <MoreVertical className="w-5 h-5 neu-text-light" />
              </button>
              {earningsMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl z-10"
                  style={{
                    backgroundColor: '#ecf0f3',
                    boxShadow: '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff'
                  }}
                >
                  <div className="py-2">
                    <div className="px-3 py-1 text-xs font-semibold neu-text-light">Time Range</div>
                    <button
                      onClick={() => {
                        setEarningsTimeRange('1month');
                        setEarningsMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/40 ${
                        earningsTimeRange === '1month' ? 'font-semibold' : ''
                      }`}
                      style={{ color: earningsTimeRange === '1month' ? 'var(--neu-primary)' : '#6b7280' }}
                    >
                      Last Month
                    </button>
                    <button
                      onClick={() => {
                        setEarningsTimeRange('6months');
                        setEarningsMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/40 ${
                        earningsTimeRange === '6months' ? 'font-semibold' : ''
                      }`}
                      style={{ color: earningsTimeRange === '6months' ? 'var(--neu-primary)' : '#6b7280' }}
                    >
                      Last 6 Months
                    </button>
                    <button
                      onClick={() => {
                        setEarningsTimeRange('1year');
                        setEarningsMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/40 ${
                        earningsTimeRange === '1year' ? 'font-semibold' : ''
                      }`}
                      style={{ color: earningsTimeRange === '1year' ? 'var(--neu-primary)' : '#6b7280' }}
                    >
                      Last Year
                    </button>
                    <div className="border-t border-gray-300 my-2"></div>
                    <button
                      onClick={() => {
                        setFullscreenChart('earnings');
                        setEarningsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-white/40 flex items-center gap-2"
                      style={{ color: '#6b7280' }}
                    >
                      <Maximize className="w-4 h-4" />
                      Full Screen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {earningsData && earningsData.length > 0 ? (
          <ResponsiveContainer width="100%" aspect={2.2}>
            <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B70E2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4B70E2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  stroke="#a0a5a8" 
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#a0a5a8" 
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${currencySymbol}${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ecf0f3',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff'
                  }}
                  formatter={(value) => [`${currencySymbol}${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4B70E2" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 neu-text-light">
              No earnings data available
            </div>
          )}
        </div>

        {/* Weekly Productivity */}
        <div className="neu-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="neu-icon-inset">
                <Clock className="w-5 h-5" style={{ color: 'var(--neu-primary)' }} />
              </div>
              <div>
                <h3 className="font-semibold neu-heading">Weekly Productivity</h3>
                <p className="text-sm neu-text-light">Hours logged this week</p>
              </div>
            </div>
            <div className="relative" ref={productivityMenuRef}>
              <button 
                onClick={() => setProductivityMenuOpen(!productivityMenuOpen)}
                className="neu-button p-2"
              >
                <MoreVertical className="w-5 h-5 neu-text-light" />
              </button>
              {productivityMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl z-10"
                  style={{
                    backgroundColor: '#ecf0f3',
                    boxShadow: '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff'
                  }}
                >
                  <div className="py-2">
                    <div className="px-3 py-1 text-xs font-semibold neu-text-light">Time Range</div>
                    <button
                      onClick={() => {
                        setProductivityTimeRange('4weeks');
                        setProductivityMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/40 ${
                        productivityTimeRange === '4weeks' ? 'font-semibold' : ''
                      }`}
                      style={{ color: productivityTimeRange === '4weeks' ? 'var(--neu-primary)' : '#6b7280' }}
                    >
                      Last 4 Weeks
                    </button>
                    <button
                      onClick={() => {
                        setProductivityTimeRange('12weeks');
                        setProductivityMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/40 ${
                        productivityTimeRange === '12weeks' ? 'font-semibold' : ''
                      }`}
                      style={{ color: productivityTimeRange === '12weeks' ? 'var(--neu-primary)' : '#6b7280' }}
                    >
                      Last 12 Weeks
                    </button>
                    <div className="border-t border-gray-300 my-2"></div>
                    <button
                      onClick={() => {
                        setFullscreenChart('productivity');
                        setProductivityMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-white/40 flex items-center gap-2"
                      style={{ color: '#6b7280' }}
                    >
                      <Maximize className="w-4 h-4" />
                      Full Screen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {productivityData && productivityData.length > 0 ? (
          <ResponsiveContainer width="100%" aspect={2.2}>
            <BarChart data={productivityData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B70E2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6b8aed" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="week" 
                  stroke="#a0a5a8" 
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#a0a5a8" 
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ecf0f3',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff'
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
          ) : (
            <div className="flex items-center justify-center h-48 neu-text-light">
              No productivity data available
            </div>
          )}
          </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="neu-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="neu-icon-inset">
                <FileText className="w-5 h-5" style={{ color: 'var(--neu-primary)' }} />
              </div>
              <div>
                <h3 className="font-semibold neu-heading">Recent Invoices</h3>
                <p className="text-sm neu-text-light">Latest billing activity</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/invoices')} 
              className="text-sm font-medium hover:underline" 
              style={{ color: 'var(--neu-primary)' }}
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="neu-text-light text-center py-4">No recent invoices</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div key={invoice._id || invoice.id} className="neu-card-inset p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium neu-heading">{invoice.invoiceNumber || 'N/A'}</p>
                      <p className="text-sm neu-text-light">{invoice.clientId?.name || 'No Client'}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-semibold neu-heading">{formatAmount(invoice.amount || invoice.totalAmount || 0)}</p>
                      <p className="text-xs neu-text-light">
                        {new Date(invoice.createdAt || invoice.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`neu-badge ${invoice.status === 'Paid' ? 'neu-badge-success' : invoice.status === 'Pending' ? 'neu-badge-warning' : 'neu-badge-danger'}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Time Logs */}
        <div className="neu-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="neu-icon-inset">
                <Clock className="w-5 h-5" style={{ color: 'var(--neu-primary)' }} />
              </div>
              <div>
                <h3 className="font-semibold neu-heading">Recent Time Logs</h3>
                <p className="text-sm neu-text-light">Latest tracked time</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/time')} 
              className="text-sm font-medium hover:underline" 
              style={{ color: 'var(--neu-primary)' }}
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentTimeLogs.length === 0 ? (
              <p className="neu-text-light text-center py-4">No recent time logs</p>
            ) : (
              recentTimeLogs.map((log, index) => (
                <div key={log._id || index} className="neu-card-inset p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium neu-heading">{log.projectId?.title || 'No Project'}</p>
                      <p className="text-sm neu-text-light">{log.description || 'No description'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: 'var(--neu-primary)' }}>{log.hours}h</p>
                      <p className="text-xs neu-text-light">
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Chart Modal */}
      {fullscreenChart && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setFullscreenChart(null)}
        >
          <div 
            className="w-full max-w-6xl neu-card p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="neu-icon-inset">
                  {fullscreenChart === 'earnings' ? (
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--neu-primary)' }} />
                  ) : (
                    <Clock className="w-5 h-5" style={{ color: 'var(--neu-primary)' }} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold neu-heading">
                    {fullscreenChart === 'earnings' ? 'Earnings Overview' : 'Weekly Productivity'}
                  </h3>
                  <p className="text-sm neu-text-light">
                    {fullscreenChart === 'earnings' ? 'Monthly revenue trend' : 'Hours logged this week'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setFullscreenChart(null)}
                className="neu-button p-2"
              >
                <X className="w-6 h-6 neu-text-light" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={500}>
              {fullscreenChart === 'earnings' ? (
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="colorAmountFull" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B70E2" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4B70E2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="#a0a5a8" 
                    style={{ fontSize: '14px' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#a0a5a8" 
                    style={{ fontSize: '14px' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${currencySymbol}${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ecf0f3',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff'
                    }}
                    formatter={(value) => [`${currencySymbol}${value}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#4B70E2" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmountFull)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={productivityData}>
                  <defs>
                    <linearGradient id="colorHoursFull" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B70E2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6b8aed" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="week" 
                    stroke="#a0a5a8" 
                    style={{ fontSize: '14px' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#a0a5a8" 
                    style={{ fontSize: '14px' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ecf0f3',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff'
                    }}
                    formatter={(value) => [`${value} hours`, 'Time Logged']}
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="url(#colorHoursFull)" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

