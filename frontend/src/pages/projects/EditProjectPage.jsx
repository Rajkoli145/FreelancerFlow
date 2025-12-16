import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/ui/Loader';
import { getProjectById, updateProject } from '../../api/projectApi';
import { getClients } from '../../api/clientApi';

const EditProjectPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    projectTitle: '',
    client: '',
    hourlyRate: '',
    startDate: '',
    dueDate: '',
    status: 'active',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch project and clients in parallel
        const [projectRes, clientsRes] = await Promise.all([
          getProjectById(id),
          getClients()
        ]);
        
        const project = projectRes.data || projectRes;
        const clientsData = clientsRes.data || [];
        
        setClients(clientsData);
        setLoadingClients(false);
        
        // Pre-fill form
        setFormData({
          projectTitle: project.title || project.name || '',
          client: project.clientId?._id || project.clientId || '',
          hourlyRate: project.hourlyRate?.toString() || '',
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          dueDate: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
          status: project.status || 'active',
          notes: project.description || '',
        });
        
        // Set metadata
        setMetadata({
          createdOn: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A',
          lastUpdated: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A',
          totalHours: project.totalHours || 0,
          totalEarnings: project.totalEarnings || 0,
        });
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const clientOptions = clients.map(client => ({
    value: client._id || client.id,
    label: client.name
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project title is required';
    if (!formData.client) newErrors.client = 'Please select a client';
    if (!formData.hourlyRate || formData.hourlyRate <= 0) newErrors.hourlyRate = 'Valid hourly rate is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      const projectData = {
        title: formData.projectTitle,
        clientId: formData.client,
        hourlyRate: parseFloat(formData.hourlyRate),
        startDate: formData.startDate,
        deadline: formData.dueDate,
        status: formData.status,
        description: formData.notes,
      };
      
      await updateProject(id, projectData);
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error && !formData.projectTitle) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Project</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
          <p className="text-gray-600 mt-1">Update project information and details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <Input
                label="Project Title"
                name="projectTitle"
                type="text"
                placeholder="Enter project name"
                value={formData.projectTitle}
                onChange={handleChange}
                error={errors.projectTitle}
                required
              />

              {/* Client Dropdown */}
              <div>
                <Select
                  label="Client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  options={clientOptions}
                  placeholder="Select a client"
                  error={errors.client}
                  required
                />
                <button
                  type="button"
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + Add New Client
                </button>
              </div>

              {/* Hourly Rate */}
              <Input
                label="Hourly Rate"
                name="hourlyRate"
                type="number"
                placeholder="0.00"
                value={formData.hourlyRate}
                onChange={handleChange}
                error={errors.hourlyRate}
                helperText="Enter your billing rate per hour"
                required
              />

              {/* Date Fields - Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  required
                />

                <Input
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  error={errors.dueDate}
                  helperText="Optional"
                />
              </div>

              {/* Project Status */}
              <Select
                label="Project Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                placeholder="Select status"
                error={errors.status}
                required
              />

              {/* Notes */}
              <Textarea
                label="Project Notes"
                name="notes"
                placeholder="Add project description, requirements, or any additional notes..."
                value={formData.notes}
                onChange={handleChange}
                rows={5}
                maxLength={500}
                helperText="Update the project description or requirements"
              />

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Metadata</h3>
            
            {metadata && (
              <div className="space-y-4">
                {/* Created On */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created On</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{metadata.createdOn}</p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{metadata.lastUpdated}</p>
                  </div>
                </div>

                {/* Total Hours */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Hours Logged</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{metadata.totalHours} hrs</p>
                  </div>
                </div>

                {/* Total Earnings */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Earnings</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">${metadata.totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectPage;
