import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '../../api/clientApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

const AddClientPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

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
      setLoading(true);
      setError(null);

      // Call API
      await createClient(formData);

      setSuccess(true);
      
      // Navigate to clients list after short delay
      setTimeout(() => {
        navigate('/clients');
      }, 1000);
    } catch (err) {
      console.error('Error creating client:', err);
      setError(err.response?.data?.message || 'Failed to create client. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
          <p className="text-gray-600 mt-1">Create a new client record and store their billing details.</p>
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
          <p className="text-sm text-green-800">Client created successfully! Redirecting...</p>
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
            disabled={loading || success}
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
            disabled={loading || success}
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
            disabled={loading || success}
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
            disabled={loading || success}
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
            disabled={loading || success}
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
            disabled={loading || success}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={loading || success}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || success}
              className="min-w-[140px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : success ? (
                'Saved!'
              ) : (
                'Save Client'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientPage;
