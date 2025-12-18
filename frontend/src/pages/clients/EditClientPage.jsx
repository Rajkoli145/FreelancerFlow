import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { getClientById, updateClient, deleteClient } from '../../api/clientApi';
import NeuButton from '../../components/ui/NeuButton';
import NeuInput from '../../components/ui/NeuInput';
import Loader from '../../components/ui/Loader';
import '../../styles/global/neumorphism.css';

const EditClientPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    currency: 'INR',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch client details on mount
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getClientById(id);
        const client = response.data || response;
        
        setFormData({
          name: client.name || '',
          email: client.email || '',
          company: client.company || '',
          phone: client.phone || '',
          address: client.address || '',
          currency: client.currency || 'INR',
          notes: client.notes || '',
        });
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Unable to load client details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

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
    // Clear page-level error
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Call API
      await updateClient(id, formData);

      setSuccess(true);
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate(`/clients/${id}`);
      }, 1000);
    } catch (err) {
      console.error('Error updating client:', err);
      setError(err.message || 'Failed to update client. Please try again.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      await deleteClient(id);

      // Navigate back immediately after successful delete
      navigate('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err.message || 'Unable to delete client. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    navigate(`/clients/${id}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="neu-container space-y-6">
        <div className="neu-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/clients')}
              className="neu-button p-2.5 rounded-xl"
              style={{ boxShadow: '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff' }}
            >
              <ArrowLeft className="w-5 h-5 neu-text" />
            </button>
            <div>
              <h1 className="text-3xl font-bold neu-heading">Edit Client</h1>
              <p className="neu-text-light mt-1">Update this client's information and billing details.</p>
            </div>
          </div>
        </div>

        <div className="neu-card p-12 flex items-center justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="neu-container space-y-6">
      {/* Header */}
      <div className="neu-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="neu-button p-2.5 rounded-xl"
            style={{ boxShadow: '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff' }}
          >
            <ArrowLeft className="w-5 h-5 neu-text" />
          </button>
          <div>
            <h1 className="text-3xl font-bold neu-heading">Edit Client</h1>
            <p className="neu-text-light mt-1">Update this client's information and billing details.</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #ef4444' }}>
          <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #22c55e' }}>
          <p className="text-sm" style={{ color: '#166534' }}>Client updated successfully! Redirecting...</p>
        </div>
      )}

      {/* Form Card */}
      <div className="neu-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Client Name *</label>
            <NeuInput
              name="name"
              type="text"
              placeholder="Enter client's full name"
              value={formData.name}
              onChange={handleChange}
              disabled={saving || success || deleting}
            />
            {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Email Address *</label>
            <NeuInput
              name="email"
              type="email"
              placeholder="client@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={saving || success || deleting}
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Company Name</label>
            <NeuInput
              name="company"
              type="text"
              placeholder="Client's company (optional)"
              value={formData.company}
              onChange={handleChange}
              disabled={saving || success || deleting}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Phone Number</label>
            <NeuInput
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              disabled={saving || success || deleting}
            />
            <p className="mt-1.5 text-sm neu-text-light">Optional contact number</p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Address</label>
            <textarea
              name="address"
              placeholder="Street address, city, state, ZIP code..."
              value={formData.address}
              onChange={handleChange}
              rows={3}
              disabled={saving || success || deleting}
              className="neu-input w-full resize-none"
              style={{
                backgroundColor: '#eef1f6',
                boxShadow: 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff',
                border: 'none',
                outline: 'none',
                color: '#374151'
              }}
            />
            <p className="mt-1.5 text-sm neu-text-light">Client's billing address (optional)</p>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              disabled={saving || success || deleting}
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
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">Notes</label>
            <textarea
              name="notes"
              placeholder="Add any additional notes about this client..."
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              disabled={saving || success || deleting}
              className="neu-input w-full resize-none"
              style={{
                backgroundColor: '#eef1f6',
                boxShadow: 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff',
                border: 'none',
                outline: 'none',
                color: '#374151'
              }}
            />
            <p className="mt-1.5 text-sm neu-text-light">Optional notes or special instructions</p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid var(--neu-dark)' }}>
            {/* Delete Button (Left) */}
            <NeuButton
              type="button"
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving || success || deleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Client
            </NeuButton>

            {/* Save/Cancel Buttons (Right) */}
            <div className="flex items-center gap-3">
              <NeuButton
                type="button"
                variant="default"
                onClick={handleCancel}
                disabled={saving || success || deleting}
              >
                Cancel
              </NeuButton>
              <NeuButton
                type="submit"
                variant="primary"
                disabled={saving || success || deleting}
                className="min-w-[140px]"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : success ? (
                  'Saved!'
                ) : (
                  'Save Changes'
                )}
              </NeuButton>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neu-card max-w-md w-full p-6" style={{ boxShadow: '12px 12px 24px var(--neu-dark), -12px -12px 24px var(--neu-light)' }}>
            <h3 className="text-xl font-bold neu-heading mb-2">Delete Client</h3>
            <p className="neu-text mb-6">
              Are you sure you want to delete this client? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex items-center justify-end gap-3">
              <NeuButton
                variant="default"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </NeuButton>
              <NeuButton
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
                className="min-w-[120px]"
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </NeuButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditClientPage;
