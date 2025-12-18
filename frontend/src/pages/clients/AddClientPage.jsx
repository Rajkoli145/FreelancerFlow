import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '../../api/clientApi';
import NeuButton from '../../components/ui/NeuButton';
import NeuInput from '../../components/ui/NeuInput';
import '../../styles/global/neumorphism.css';

const AddClientPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    clientType: 'Individual',
    name: '',
    email: '',
    company: '',
    phone: '',
    website: '',
    // Billing Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    // Financial
    taxId: '',
    currency: 'INR',
    defaultHourlyRate: '',
    // Other
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
    
    if (formData.clientType === 'Company' && !formData.company.trim()) {
      newErrors.company = 'Company name is required for company clients';
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

      // Prepare client data with nested billingAddress
      const clientData = {
        clientType: formData.clientType,
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        billingAddress: {
          street: formData.street || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          country: formData.country || 'India'
        },
        taxId: formData.taxId || undefined,
        currency: formData.currency || 'INR',
        defaultHourlyRate: formData.defaultHourlyRate ? parseFloat(formData.defaultHourlyRate) : undefined,
        notes: formData.notes || undefined
      };

      // Call API
      await createClient(clientData);

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
    <div className="neu-container">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="neu-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/clients')}
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
              <h1 className="text-3xl font-bold neu-heading">Add New Client</h1>
              <p className="neu-text-light mt-1">Create a new client record and store their billing details.</p>
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
            <p className="text-sm" style={{ color: '#166534' }}>Client created successfully! Redirecting...</p>
          </div>
        )}

        {/* Form Card */}
        <div className="neu-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Type */}
            <div>
              <label className="block text-sm font-medium neu-text mb-2">Client Type *</label>
              <select
                name="clientType"
                value={formData.clientType}
                onChange={handleChange}
                disabled={loading || success}
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
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
              </select>
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                {formData.clientType === 'Company' ? 'Contact Person Name *' : 'Client Name *'}
              </label>
              <NeuInput
                name="name"
                type="text"
                placeholder="Enter client's full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading || success}
              />
              {errors.name && (
                <p className="mt-1.5 text-sm" style={{ color: '#ef4444' }}>{errors.name}</p>
              )}
            </div>

            {/* Company Name (required if clientType = Company) */}
            {formData.clientType === 'Company' && (
              <div>
                <label className="block text-sm font-medium neu-text mb-2">Company Name *</label>
                <NeuInput
                  name="company"
                  type="text"
                  placeholder="Enter company name"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={loading || success}
                />
                {errors.company && (
                  <p className="mt-1.5 text-sm" style={{ color: '#ef4444' }}>{errors.company}</p>
                )}
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium neu-text mb-2">Email Address *</label>
              <NeuInput
                name="email"
                type="email"
                placeholder="client@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || success}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm" style={{ color: '#ef4444' }}>{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium neu-text mb-2">Phone Number</label>
                <NeuInput
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium neu-text mb-2">Website</label>
                <NeuInput
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--neu-dark)' }}>
              <h3 className="text-lg font-semibold neu-heading mb-4">Billing Address</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium neu-text mb-2">Street Address</label>
                  <NeuInput
                    name="street"
                    type="text"
                    placeholder="123 Main Street, Apt 4B"
                    value={formData.street}
                    onChange={handleChange}
                    disabled={loading || success}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium neu-text mb-2">City</label>
                    <NeuInput
                      name="city"
                      type="text"
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={loading || success}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium neu-text mb-2">State</label>
                    <NeuInput
                      name="state"
                      type="text"
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={loading || success}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium neu-text mb-2">ZIP Code</label>
                    <NeuInput
                      name="zipCode"
                      type="text"
                      placeholder="400001"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={loading || success}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium neu-text mb-2">Country</label>
                    <NeuInput
                      name="country"
                      type="text"
                      placeholder="India"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={loading || success}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--neu-dark)' }}>
              <h3 className="text-lg font-semibold neu-heading mb-4">Financial Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium neu-text mb-2">Tax ID / GST Number</label>
                  <NeuInput
                    name="taxId"
                    type="text"
                    placeholder="GSTIN or PAN"
                    value={formData.taxId}
                    onChange={handleChange}
                    disabled={loading || success}
                  />
                  <p className="mt-1.5 text-sm neu-text-light">GST, PAN, or tax identification number</p>
                </div>

                <div>
                  <label className="block text-sm font-medium neu-text mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    disabled={loading || success}
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
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium neu-text mb-2">Default Hourly Rate</label>
                <NeuInput
                  name="defaultHourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.defaultHourlyRate}
                  onChange={handleChange}
                  disabled={loading || success}
                />
                <p className="mt-1.5 text-sm neu-text-light">
                  Default rate for projects with this client (optional)
                </p>
              </div>
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
                disabled={loading || success}
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
            <div className="flex items-center justify-end gap-3 pt-6" style={{ borderTop: '1px solid var(--neu-dark)' }}>
              <NeuButton
                type="button"
                variant="default"
                onClick={handleCancel}
                disabled={loading || success}
              >
                Cancel
              </NeuButton>
              <NeuButton
                type="submit"
                variant="primary"
                disabled={loading || success}
              >
                {loading ? 'Saving...' : success ? 'Saved!' : 'Save Client'}
              </NeuButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClientPage;
