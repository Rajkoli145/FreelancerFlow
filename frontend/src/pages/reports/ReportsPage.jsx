import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Download,
  DollarSign,
  TrendingDown,
  BarChart3,
  PieChart,
  Clock,
  Users,
  Briefcase,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  getFinancialReport,
  getTimeReport,
  getClientReport,
  getProjectReport,
  getTaxReport
} from '../../api/reportApi';
import Loader from '../../components/ui/Loader';
import StatCard from '../../components/ui/StatCard';
import NeuButton from '../../components/ui/NeuButton';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/global/neumorphism.css';

const ReportsPage = () => {
  const { formatAmount, currencySymbol } = useAuth();
  const [activeTab, setActiveTab] = useState('financial');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const tabs = [
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'time', label: 'Time Tracking', icon: Clock },
    { id: 'client', label: 'Client Analysis', icon: Users },
    { id: 'project', label: 'Project Profitability', icon: Briefcase },
    { id: 'tax', label: 'Tax Summary', icon: FileText }
  ];

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let response;

      switch (activeTab) {
        case 'financial':
          response = await getFinancialReport(dateRange);
          break;
        case 'time':
          response = await getTimeReport(dateRange);
          break;
        case 'client':
          response = await getClientReport(dateRange);
          break;
        case 'project':
          response = await getProjectReport();
          break;
        case 'tax':
          response = await getTaxReport({ year: new Date().getFullYear() });
          break;
        default:
          response = await getFinancialReport(dateRange);
      }

      setReportData(response.data || {});
    } catch (err) {
      console.error('Error fetching report:', err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Convert report data to CSV
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#4A5FFF', '#22c55e', '#f97316', '#ef4444', '#a855f7', '#3b82f6', '#ec4899'];

  return (
    <div className="neu-container space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive insights into your freelance business."
      />

      {/* Date Range Filter */}
      {activeTab !== 'project' && activeTab !== 'tax' && (
        <div className="neu-card">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="neu-input w-full"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="neu-input w-full"
              />
            </div>
            <NeuButton onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export Report
            </NeuButton>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="neu-card">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.id ? 'neu-button-primary' : 'neu-button'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      ) : (
        <>
          {activeTab === 'financial' && reportData && (
            <FinancialReport data={reportData} colors={COLORS} formatAmount={formatAmount} currencySymbol={currencySymbol} />
          )}
          {activeTab === 'time' && reportData && (
            <TimeReport data={reportData} colors={COLORS} formatAmount={formatAmount} />
          )}
          {activeTab === 'client' && reportData && (
            <ClientReport data={reportData} colors={COLORS} formatAmount={formatAmount} />
          )}
          {activeTab === 'project' && reportData && (
            <ProjectReport data={reportData} colors={COLORS} formatAmount={formatAmount} />
          )}
          {activeTab === 'tax' && reportData && (
            <TaxReport data={reportData} colors={COLORS} formatAmount={formatAmount} />
          )}
        </>
      )}
    </div>
  );
};

// Financial Report Component
const FinancialReport = ({ data, colors, formatAmount, currencySymbol }) => {
  const { summary = {}, monthlyTrend = [], expenseByCategory = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          title="Total Revenue"
          value={formatAmount(summary.totalRevenue)}
          subtitle={`${summary.invoiceCount} invoices`}
          iconBg="#22c55e"
        />
        <StatCard
          icon={TrendingDown}
          title="Total Expenses"
          value={formatAmount(summary.totalExpenses)}
          subtitle={`${summary.expenseCount} expenses`}
          iconBg="#ef4444"
        />
        <StatCard
          icon={DollarSign}
          title="Net Profit"
          value={formatAmount(summary.netProfit)}
          subtitle={`${summary.profitMargin}% margin`}
          iconBg={summary.netProfit >= 0 ? '#22c55e' : '#ef4444'}
        />
        <StatCard
          icon={FileText}
          title="Outstanding"
          value={formatAmount(summary.outstandingAmount)}
          subtitle={`${summary.outstandingCount} invoices`}
          iconBg="#f97316"
        />
      </div>

      {/* Monthly Trend Chart */}
      <div className="neu-card">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
          Revenue vs Expenses Trend
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d9e6" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#eef1f6', border: 'none', borderRadius: '12px' }}
              formatter={(value) => formatAmount(value)}
            />
            <Legend />
            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Revenue" />
            <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neu-card">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
            Expense by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={expenseByCategory}
                dataKey="total"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry._id}: ${formatAmount(entry.total)}`}
              >
                {expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatAmount(value)} />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        <div className="neu-card">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
            Top Expense Categories
          </h3>
          <div className="space-y-3">
            {expenseByCategory.slice(0, 5).map((cat, index) => (
              <div key={cat._id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#eef1f6' }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="font-medium" style={{ color: '#374151' }}>{cat._id}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: '#374151' }}>{formatAmount(cat.total)}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{cat.count} expenses</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Time Report Component
const TimeReport = ({ data, colors, formatAmount }) => {
  const { summary = {}, hoursByProject = [], hoursByClient = [], dailyTrend = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Clock}
          title="Total Hours"
          value={`${(summary.totalHours || 0).toFixed(1)}h`}
          subtitle={`${summary.totalEntries || 0} entries`}
          iconBg="#4A5FFF"
        />
        <StatCard
          icon={TrendingUp}
          title="Billed Hours"
          value={`${(summary.billedHours || 0).toFixed(1)}h`}
          subtitle={`${summary.billablePercentage || 0}% of total`}
          iconBg="#22c55e"
        />
        <StatCard
          icon={TrendingDown}
          title="Unbilled Hours"
          value={`${(summary.unbilledHours || 0).toFixed(1)}h`}
          iconBg="#f97316"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neu-card">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
            Hours by Project (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hoursByProject}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d9e6" />
              <XAxis dataKey="projectName" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#eef1f6', border: 'none', borderRadius: '12px' }}
                formatter={(value) => [`${Number(value).toFixed(1)}h`, 'Hours']}
              />
              <Bar dataKey="hours" fill="#4A5FFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neu-card">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
            Hours by Client (Top 10)
          </h3>
          <div className="space-y-2">
            {hoursByClient.map((client, index) => (
              <div key={client.clientId} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#eef1f6' }}>
                <span className="font-medium" style={{ color: '#374151' }}>{client.clientName}</span>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: '#374151' }}>{client.hours.toFixed(1)}h</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{client.entries} entries</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Client Report Component
const ClientReport = ({ data, colors, formatAmount }) => {
  const { revenueByClient = [], outstandingByClient = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neu-card">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
            Revenue by Client
          </h3>
          <div className="space-y-2">
            {revenueByClient.map((client, index) => (
              <div key={client.clientId} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#eef1f6' }}>
                <div>
                  <p className="font-medium" style={{ color: '#374151' }}>{client.clientName}</p>
                  {client.company && <p className="text-xs" style={{ color: '#6b7280' }}>{client.company}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: '#22c55e' }}>{formatAmount(client.revenue)}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{client.invoiceCount} invoices</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="neu-card">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
            Outstanding by Client
          </h3>
          <div className="space-y-2">
            {outstandingByClient.map((client, index) => (
              <div key={client.clientId} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#eef1f6' }}>
                <div>
                  <p className="font-medium" style={{ color: '#374151' }}>{client.clientName}</p>
                  {client.company && <p className="text-xs" style={{ color: '#6b7280' }}>{client.company}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: '#ef4444' }}>{formatAmount(client.outstanding)}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{client.invoiceCount} invoices</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Project Report Component
const ProjectReport = ({ data, colors, formatAmount }) => {
  const { projects = [], summary = {} } = data || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Briefcase}
          title="Total Projects"
          value={summary.totalProjects || 0}
          iconBg="#4A5FFF"
        />
        <StatCard
          icon={TrendingUp}
          title="Profitable Projects"
          value={summary.profitableProjects || 0}
          iconBg="#22c55e"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={formatAmount(summary.totalRevenue || 0)}
          iconBg="#3b82f6"
        />
        <StatCard
          icon={DollarSign}
          title="Total Profit"
          value={formatAmount(summary.totalProfit || 0)}
          iconBg={(summary.totalProfit || 0) >= 0 ? '#22c55e' : '#ef4444'}
        />
      </div>

      <div className="neu-card overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
          Project Profitability Analysis
        </h3>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #d1d9e6' }}>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#374151' }}>Project</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#374151' }}>Client</th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#374151' }}>Hours</th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#374151' }}>Revenue</th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#374151' }}>Expenses</th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#374151' }}>Profit</th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#374151' }}>Margin</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project.projectId} style={{ borderBottom: index < projects.length - 1 ? '1px solid #eef1f6' : 'none' }}>
                <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>{project.projectName}</td>
                <td className="px-4 py-3 text-sm" style={{ color: '#6b7280' }}>{project.clientName}</td>
                <td className="px-4 py-3 text-sm text-right" style={{ color: '#374151' }}>{project.hours.toFixed(1)}h</td>
                <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: '#22c55e' }}>{formatAmount(project.revenue)}</td>
                <td className="px-4 py-3 text-sm text-right" style={{ color: '#ef4444' }}>{formatAmount(project.expenses)}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: project.profit >= 0 ? '#22c55e' : '#ef4444' }}>
                  {formatAmount(project.profit)}
                </td>
                <td className="px-4 py-3 text-sm text-right" style={{ color: '#6b7280' }}>{project.profitMargin}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Tax Report Component
const TaxReport = ({ data, colors, formatAmount }) => {
  const { year = new Date().getFullYear(), summary = {}, deductibleExpenses = [], monthlyIncome = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Gross Income"
          value={formatAmount(summary.grossIncome || 0)}
          subtitle={`Year ${year}`}
          iconBg="#4A5FFF"
        />
        <StatCard
          icon={TrendingDown}
          title="Total Deductions"
          value={formatAmount(summary.totalDeductions || 0)}
          iconBg="#f97316"
        />
        <StatCard
          icon={FileText}
          title="Taxable Income"
          value={formatAmount(summary.taxableIncome || 0)}
          iconBg="#22c55e"
        />
        <StatCard
          icon={DollarSign}
          title="Tax Collected"
          value={formatAmount(summary.taxCollected || 0)}
          iconBg="#3b82f6"
        />
      </div>

      <div className="neu-card">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
          Monthly Income ({year})
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyIncome}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d9e6" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#eef1f6', border: 'none', borderRadius: '12px' }}
              formatter={(value) => formatAmount(value)}
            />
            <Bar dataKey="income" fill="#4A5FFF" name="Income" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="neu-card">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
          Tax Deductible Expenses by Category
        </h3>
        <div className="space-y-2">
          {deductibleExpenses.map((exp, index) => (
            <div key={exp._id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#eef1f6' }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="font-medium" style={{ color: '#374151' }}>{exp._id}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold" style={{ color: '#374151' }}>{formatAmount(exp.total)}</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>{exp.count} expenses</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
