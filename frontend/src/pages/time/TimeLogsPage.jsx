import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Eye, Loader as LoaderIcon } from "lucide-react";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { getTimeLogs } from "../../api/timeApi";

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
        const logsData = Array.isArray(response) ? response : response.timeLogs || [];
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

  const StatCard = ({ label, value, subtitle }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-gray-500 mt-1">
              View all time entries for your projects.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate("/time/new")}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Time Entry
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6">
          <StatCard
            label="Total Hours"
            value={stats.totalHours}
            subtitle="All time"
          />
          <StatCard
            label="This Month"
            value={stats.thisMonth}
            subtitle="December 2025"
          />
          <StatCard
            label="Unbilled Hours"
            value={stats.unbilledHours}
            subtitle="Ready to invoice"
          />
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Search time logs by project or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Time Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : timeLogs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <LoaderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No time logs found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first time entry'}
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Hours
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {timeLogs
                  .filter(log => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      (log.projectId?.name || '').toLowerCase().includes(query) ||
                      (log.description || '').toLowerCase().includes(query)
                    );
                  })
                  .map((log) => (
                  <tr
                    key={log._id || log.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {log.projectId?.name || 'No Project'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {log.hours} hrs
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/time/${log._id || log.id}/edit`)}
                          className="p-1.5 text-gray-600 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
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
    </div>
  );
};

export default TimeLogsPage;
