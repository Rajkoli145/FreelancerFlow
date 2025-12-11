import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Clock, DollarSign, FileText, Plus, Loader } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import TimeLogTable from '../../components/projects/TimeLogTable';
import InvoiceTable from '../../components/projects/InvoiceTable';
import { getProjectById } from '../../api/projectApi';
import { getTimeLogs } from '../../api/timeApi';
import { getInvoices } from '../../api/invoiceApi';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch project details
        const projectResponse = await getProjectById(id);
        const projectData = projectResponse.project || projectResponse;
        setProject(projectData);

        // Fetch time logs for this project
        try {
          const timeLogsResponse = await getTimeLogs({ projectId: id });
          const logsData = Array.isArray(timeLogsResponse) ? timeLogsResponse : timeLogsResponse.timeLogs || [];
          setTimeLogs(logsData);
        } catch (err) {
          console.error('Error fetching time logs:', err);
          setTimeLogs([]);
        }

        // Fetch invoices for this project
        try {
          const invoicesResponse = await getInvoices({ projectId: id });
          const invoicesData = Array.isArray(invoicesResponse) ? invoicesResponse : invoicesResponse.invoices || [];
          setInvoices(invoicesData);
        } catch (err) {
          console.error('Error fetching invoices:', err);
          setInvoices([]);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Project</h3>
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalHours = timeLogs.reduce((sum, log) => sum + (log.hours || 0), 0);
  const totalEarned = totalHours * (project.hourlyRate || 0);
  const pendingInvoices = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'Paid')
    .reduce((sum, inv) => sum + (inv.amount || inv.totalAmount || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{project.name || project.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                {project.clientId?.name?.substring(0, 2).toUpperCase() || project.client?.name?.substring(0, 2).toUpperCase() || 'CL'}
              </div>
              <span className="text-sm text-gray-600">{project.clientId?.name || project.client?.name || 'No Client'}</span>
            </div>
            <span className="text-gray-300">•</span>
            <StatusBadge status={project.status} />
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-600">{totalHours.toFixed(1)}h logged</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate(`/projects/${id}/edit`)}
        >
          <Edit className="w-4 h-4" />
          Edit Project
        </Button>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Client Name</label>
            <p className="text-gray-900">{project.clientId?.name || project.client?.name || 'No Client'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Hourly Rate</label>
            <p className="text-gray-900 font-semibold">${project.hourlyRate || 0}/hour</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
            <p className="text-gray-900">{formatDate(project.startDate)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
            <p className="text-gray-900">{formatDate(project.dueDate || project.deadline)}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Project Notes</label>
            <p className="text-gray-600 leading-relaxed">{project.notes || project.description || 'No notes available'}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Clock}
          label="Total Hours Logged"
          value={`${totalHours.toFixed(1)}h`}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total Earned"
          value={`$${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={FileText}
          label="Pending Invoices"
          value={`$${pendingInvoices.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Time Logs Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Time Logs</h2>
        </div>
        <div className="p-6">
          <TimeLogTable timeLogs={timeLogs} />
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Related Invoices</h2>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
        </div>
        <div className="p-6">
          <InvoiceTable invoices={invoices} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button 
          variant="primary" 
          className="flex items-center gap-2"
          onClick={() => navigate(`/time/new?projectId=${id}`)}
        >
          <Clock className="w-4 h-4" />
          Add Time Entry
        </Button>
        <Button 
          variant="primary" 
          className="flex items-center gap-2"
          onClick={() => navigate(`/invoices/new?projectId=${id}`)}
        >
          <FileText className="w-4 h-4" />
          Generate Invoice
        </Button>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
