import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { createProject } from '../../api/projectApi';
import { getClients } from '../../api/clientApi';

const AddProjectPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    projectTitle: '',
    client: '',
    hourlyRate: '',
    startDate: '',
    dueDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getClients();
        const clientList = Array.isArray(response) ? response : response.clients || [];
        setClients(clientList);
      } catch (err) {
        console.error('Error fetching clients:', err);
        // Use empty array if fetch fails
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  // Mock client data - will be replaced with API call
  const clientOptions = clients.map(client => ({
    value: client._id || client.id,
    label: client.name || client.companyName
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
    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required';
    }
    if (!formData.client) {
      newErrors.client = 'Please select a client';
    }
    if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
      newErrors.hourlyRate = 'Please enter a valid hourly rate';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const projectData = {
        name: formData.projectTitle,
        clientId: formData.client,
        hourlyRate: parseFloat(formData.hourlyRate),
        startDate: formData.startDate || undefined,
        deadline: formData.dueDate || undefined,
        description: formData.notes || undefined,
        status: 'Active'
      };

      await createProject(projectData);
      navigate('/projects');
    } catch (err) {
      console.error('Error creating project:', err);
      setErrors({
        submit: err.error || err.message || 'Failed to create project. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Project</h1>
          <p className="text-gray-600 mt-1">Create a new project entry to track time and invoices.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
        
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
              placeholder={loadingClients ? "Loading clients..." : "Select a client"}
              error={errors.client}
              disabled={loadingClients}
              required
            />
            <button
              type="button"
              onClick={() => navigate('/clients/new')}
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
            />

            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              error={errors.dueDate}
            />
          </div>

          {/* Notes */}
          <Textarea
            label="Notes"
            name="notes"
            placeholder="Add project description, requirements, or any additional notes..."
            value={formData.notes}
            onChange={handleChange}
            rows={5}
            maxLength={500}
            helperText="Optional project details"
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectPage;

