import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { createExpense } from '../../api/expenseApi';
import { getClients } from '../../api/clientApi';
import { getProjects } from '../../api/projectApi';
import NeuButton from '../../components/ui/NeuButton';
import NeuInput from '../../components/ui/NeuInput';
import PageHeader from '../../components/ui/PageHeader';
import '../../styles/neumorphism.css';

const AddExpensePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    category: 'Software & Tools',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Other',
    clientId: '',
    projectId: '',
    taxDeductible: true,
    notes: ''
  });

  const categories = [
    'Software & Tools',
    'Hardware & Equipment',
    'Marketing & Advertising',
    'Office Supplies',
    'Travel & Transportation',
    'Meals & Entertainment',
    'Professional Services',
    'Utilities & Internet',
    'Training & Education',
    'Subscriptions',
    'Taxes & Fees',
    'Other'
  ];

  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Other'];

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await getClients();
      setClients(response.data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        clientId: formData.clientId || undefined,
        projectId: formData.projectId || undefined
      };
      
      await createExpense(submitData);
      navigate('/expenses');
    } catch (err) {
      console.error('Error creating expense:', err);
      alert(err.response?.data?.error || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-container space-y-6">
      <PageHeader 
        title="Add Expense"
        subtitle="Record a new business expense."
        actionLabel="Back"
        actionIcon={ArrowLeft}
        onActionClick={() => navigate('/expenses')}
      />

      <form onSubmit={handleSubmit} className="neu-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="neu-input w-full"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Amount <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <NeuInput
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <NeuInput
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What was this expense for?"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <NeuInput
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="neu-input w-full"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Client (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Client (Optional)
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className="neu-input w-full"
            >
              <option value="">None</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.name} {client.company ? `(${client.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Project (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Project (Optional)
            </label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="neu-input w-full"
            >
              <option value="">None</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tax Deductible */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="taxDeductible"
                checked={formData.taxDeductible}
                onChange={handleChange}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#4A5FFF' }}
              />
              <span className="text-sm font-medium" style={{ color: '#374151' }}>
                This expense is tax deductible
              </span>
            </label>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about this expense..."
              rows={3}
              className="neu-input w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-6">
          <NeuButton type="submit" disabled={loading}>
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Expense'}
          </NeuButton>
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="neu-button"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpensePage;
