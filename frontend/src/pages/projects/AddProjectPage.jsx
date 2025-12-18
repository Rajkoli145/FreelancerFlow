import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NeuButton from '../../components/ui/NeuButton';
import NeuInput from '../../components/ui/NeuInput';
import { createProject } from '../../api/projectApi';
import { getClients } from '../../api/clientApi';
import '../../styles/global/neumorphism.css';

const AddProjectPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    projectTitle: '',
    client: '',
    billingType: 'Hourly',
    hourlyRate: '',
    fixedPrice: '',
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
        const clientList = response.data || [];
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
    if (formData.billingType === 'Hourly') {
      if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
        newErrors.hourlyRate = 'Please enter a valid hourly rate';
      }
    } else if (formData.billingType === 'Fixed') {
      if (!formData.fixedPrice || parseFloat(formData.fixedPrice) <= 0) {
        newErrors.fixedPrice = 'Please enter a valid fixed price';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const projectData = {
        title: formData.projectTitle,
        clientId: formData.client,
        billingType: formData.billingType,
        hourlyRate: formData.billingType === 'Hourly' ? parseFloat(formData.hourlyRate) : undefined,
        fixedPrice: formData.billingType === 'Fixed' ? parseFloat(formData.fixedPrice) : undefined,
        startDate: formData.startDate || undefined,
        deadline: formData.dueDate || undefined,
        description: formData.notes || undefined,
        status: 'active'
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
    <div className="neu-container">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="neu-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="neu-button p-2.5 rounded-xl transition-all duration-200"
              style={{ boxShadow: '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff' }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.boxShadow = 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff';
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#6b7280' }} />
            </button>
            <div>
              <h1 className="text-3xl font-bold neu-heading">Add New Project</h1>
              <p className="neu-text-light mt-1">Create a new project entry to track time and invoices.</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="neu-card">
          {errors.submit && (
            <div className="mb-6 neu-card-inset p-4" style={{ borderLeft: '4px solid #ef4444' }}>
              <p className="text-sm" style={{ color: '#991b1b' }}>{errors.submit}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Project Title *</label>
            <NeuInput
              name="projectTitle"
              type="text"
              placeholder="Enter project name"
              value={formData.projectTitle}
              onChange={handleChange}
            />
            {errors.projectTitle && (
              <p className="mt-1.5 text-sm" style={{ color: '#ef4444' }}>{errors.projectTitle}</p>
            )}
          </div>

          {/* Client Dropdown */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Client *</label>
            <select
              name="client"
              value={formData.client}
              onChange={handleChange}
              disabled={loadingClients}
              className="neu-input w-full"
            >
              <option value="">{loadingClients ? "Loading clients..." : "Select a client"}</option>
              {clientOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.client && (
              <p className="mt-1.5 text-sm" style={{ color: '#ef4444' }}>{errors.client}</p>
            )}
            <button
              type="button"
              onClick={() => navigate('/clients/new')}
              className="mt-2 text-sm font-medium"
              style={{ color: '#4A5FFF' }}
            >
              + Add New Client
            </button>
          </div>

          {/* Billing Type */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Billing Type *</label>
            <select
              name="billingType"
              value={formData.billingType}
              onChange={handleChange}
              className="neu-input w-full"
              style={{
                backgroundColor: '#eef1f6',
                boxShadow: 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff',
                border: 'none',
                outline: 'none',
                color: '#374151',
                padding: '0.75rem 1rem',
                borderRadius: '12px'
              }}
            >
              <option value="Hourly">Hourly Rate</option>
              <option value="Fixed">Fixed Price</option>
            </select>
          </div>

          {/* Conditional: Hourly Rate or Fixed Price */}
          {formData.billingType === 'Hourly' ? (
            <div>
              <label className="block text-sm font-medium neu-text mb-2">Hourly Rate *</label>
              <NeuInput
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.hourlyRate}
                onChange={handleChange}
              />
              {errors.hourlyRate && (
                <p className="mt-1.5 text-sm" style={{ color: '#ef4444' }}>{errors.hourlyRate}</p>
              )}
              <p className="mt-1.5 text-sm neu-text-light">Enter your billing rate per hour</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium neu-text mb-2">Fixed Price *</label>
              <NeuInput
                name="fixedPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.fixedPrice}
                onChange={handleChange}
              />
              {errors.fixedPrice && (
                <p className="mt-1.5 text-sm" style={{ color: '#ef4444' }}>{errors.fixedPrice}</p>
              )}
              <p className="mt-1.5 text-sm neu-text-light">Total project price</p>
            </div>
          )}

          {/* Date Fields - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium neu-text mb-2">Start Date</label>
              <NeuInput
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium neu-text mb-2">Due Date</label>
              <NeuInput
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Notes</label>
            <textarea
              name="notes"
              placeholder="Add project description, requirements, or any additional notes..."
              value={formData.notes}
              onChange={handleChange}
              rows={5}
              maxLength={500}
              className="neu-input w-full resize-none"
              style={{
                backgroundColor: '#eef1f6',
                boxShadow: 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff',
                border: 'none',
                outline: 'none',
                color: '#374151'
              }}
            />
            <p className="mt-1.5 text-sm neu-text-light">Optional project details</p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6" style={{ borderTop: '1px solid var(--neu-dark)' }}>
            <NeuButton
              type="button"
              variant="default"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </NeuButton>
            <NeuButton
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Project'}
            </NeuButton>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddProjectPage;

