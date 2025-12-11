import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { getClientById, updateClient, deleteClient } from '../../api/clientApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/ui/Loader';

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
        const client = response.client || response;
        
        setFormData({
          name: client.name || '',
          email: client.email || '',
          company: client.company || '',
          phone: client.phone || '',
          address: client.address || '',
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
            <p className="text-gray-600 mt-1">Update this client's information and billing details.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
          <p className="text-gray-600 mt-1">Update this client's information and billing details.</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">Client updated successfully! Redirecting...</p>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Name */}
          <Input
            label="Client Name"
            name="name"
            type="text"
            placeholder="Enter client's full name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            disabled={saving || success || deleting}
          />

          {/* Email Address */}
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="client@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            disabled={saving || success || deleting}
          />

          {/* Company Name */}
          <Input
            label="Company Name"
            name="company"
            type="text"
            placeholder="Client's company (optional)"
            value={formData.company}
            onChange={handleChange}
            error={errors.company}
            disabled={saving || success || deleting}
          />

          {/* Phone Number */}
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            helperText="Optional contact number"
            disabled={saving || success || deleting}
          />

          {/* Address */}
          <Textarea
            label="Address"
            name="address"
            placeholder="Street address, city, state, ZIP code..."
            value={formData.address}
            onChange={handleChange}
            rows={3}
            helperText="Client's billing address (optional)"
            disabled={saving || success || deleting}
          />

          {/* Notes */}
          <Textarea
            label="Notes"
            name="notes"
            placeholder="Add any additional notes about this client..."
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            helperText="Optional notes or special instructions"
            disabled={saving || success || deleting}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {/* Delete Button (Left) */}
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving || success || deleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Client
            </Button>

            {/* Save/Cancel Buttons (Right) */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={saving || success || deleting}
              >
                Cancel
              </Button>
              <Button
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
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Client</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this client? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
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
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditClientPage;
