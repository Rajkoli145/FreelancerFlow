import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Eye, Loader as LoaderIcon, Clock, Calendar, AlertCircle, Search } from "lucide-react";
import Loader from "../../components/ui/Loader";
import NeuInput from "../../components/ui/NeuInput";
import NeuButton from "../../components/ui/NeuButton";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import { getTimeLogs } from "../../api/timeApi";
import '../../styles/global/neumorphism.css';

const TimeLogsPage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTimeLogs();
        const logsData = response.data || [];
        setTimeLogs(logsData);
      } catch (err) {
        console.error('Error fetching time logs:', err);
        setError(err.message || 'Failed to load time logs');
        setTimeLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeLogs();
  }, []);

  // Calculate stats from real data
  const totalHours = timeLogs.reduce((sum, log) => sum + (log.hours || 0), 0);
  const thisMonth = timeLogs
    .filter(log => {
      const logDate = new Date(log.date);
      const now = new Date();
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, log) => sum + (log.hours || 0), 0);
  const unbilledHours = timeLogs
    .filter(log => !log.invoiced)
    .reduce((sum, log) => sum + (log.hours || 0), 0);

  const stats = {
    totalHours: totalHours.toFixed(1),
    thisMonth: thisMonth.toFixed(1),
    unbilledHours: unbilledHours.toFixed(1),
  };

  return (
    <div className="neu-container space-y-6">
      {/* Header Section */}
      <PageHeader 
        title="Time Tracking"
        subtitle="View all time entries for your projects."
        actionLabel="Add Time Entry"
        actionIcon={Plus}
        onActionClick={() => navigate("/time/new")}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard 
          icon={Clock}
          title="Total Hours"
          value={stats.totalHours}
          subtitle="All time"
          iconBg="#4A5FFF"
        />
        <StatCard 
          icon={Calendar}
          title="This Month"
          value={stats.thisMonth}
          subtitle="December 2025"
          iconBg="#22c55e"
        />
        <StatCard 
          icon={AlertCircle}
          title="Unbilled Hours"
          value={stats.unbilledHours}
          subtitle="Ready to invoice"
          iconBg="#f97316"
        />
      </div>

      {/* Search Bar */}
      <NeuInput 
        icon={Search}
        placeholder="Search time logs by project or description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Error Banner */}
      {error && (
        <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #ef4444' }}>
          <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
        </div>
      )}

      {/* Time Logs Table */}
      <div className="neu-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin" style={{ color: 'var(--neu-primary)' }}>
              <Loader />
            </div>
          </div>
        ) : timeLogs.length === 0 ? (
          <div className="text-center py-12 px-4">
            <LoaderIcon className="w-12 h-12 neu-text-light mx-auto mb-4" />
            <h3 className="text-lg font-semibold neu-heading mb-2">No time logs found</h3>
            <p className="neu-text">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first time entry'}
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="neu-card-inset">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold neu-text">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold neu-text">
                  Project
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold neu-text">
                  Description
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold neu-text">
                  Hours
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold neu-text">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid var(--neu-dark)' }}>
              {timeLogs
                .filter(log => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    (log.projectId?.title || log.projectId?.name || '').toLowerCase().includes(query) ||
                    (log.description || '').toLowerCase().includes(query)
                  );
                })
                .map((log) => (
                <tr
                  key={log._id || log.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--neu-dark)' }}
                >
                  <td className="py-3 px-4 neu-text">
                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium neu-heading">
                      {log.projectId?.title || log.projectId?.name || 'No Project'}
                    </span>
                  </td>
                  <td className="py-3 px-4 neu-text">
                    {log.description}
                  </td>
                  <td className="py-3 px-4 text-right font-medium neu-heading">
                    {log.hours} hrs
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/time/${log._id || log.id}/edit`)}
                        className="neu-button p-1.5"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 neu-text-light" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default TimeLogsPage;
