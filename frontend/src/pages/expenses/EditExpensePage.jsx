import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { getExpenseById, updateExpense } from '../../api/expenseApi';
import { getClients } from '../../api/clientApi';
import { getProjects } from '../../api/projectApi';
import NeuButton from '../../components/ui/NeuButton';
import NeuInput from '../../components/ui/NeuInput';
import PageHeader from '../../components/ui/PageHeader';
import Loader from '../../components/ui/Loader';
import '../../styles/neumorphism.css';

const EditExpensePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expenseRes, clientsRes, projectsRes] = await Promise.all([
        getExpenseById(id),
        getClients(),
        getProjects()
      ]);
      
      const expense = expenseRes.data;
      setFormData({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: new Date(expense.date).toISOString().split('T')[0],
        paymentMethod: expense.paymentMethod || 'Other',
        clientId: expense.clientId?._id || '',
        projectId: expense.projectId?._id || '',
        taxDeductible: expense.taxDeductible,
        notes: expense.notes || ''
      });
      
      setClients(clientsRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      console.error('Error fetching expense:', err);
      alert('Failed to load expense');
      navigate('/expenses');
    } finally {
      setLoading(false);
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
      setSaving(true);
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        clientId: formData.clientId || undefined,
        projectId: formData.projectId || undefined
      };
      
      await updateExpense(id, submitData);
      navigate('/expenses');
    } catch (err) {
      console.error('Error updating expense:', err);
      alert(err.response?.data?.error || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="neu-container space-y-6">
      <PageHeader 
        title="Edit Expense"
        subtitle="Update expense details."
        actionLabel="Back"
        actionIcon={ArrowLeft}
        onActionClick={() => navigate('/expenses')}
      />

      <form onSubmit={handleSubmit} className="neu-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="flex items-center gap-4 mt-6">
          <NeuButton type="submit" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Update Expense'}
          </NeuButton>
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="neu-button"
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExpensePage;
