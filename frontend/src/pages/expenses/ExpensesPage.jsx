import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, TrendingDown, Calendar, Filter, Trash2, Edit } from 'lucide-react';
import { getExpenses, deleteExpense, getExpenseStats } from '../../api/expenseApi';
import Loader from '../../components/ui/Loader';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import NeuButton from '../../components/ui/NeuButton';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/global/neumorphism.css';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { formatAmount } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    thisMonth: 0,
    taxDeductible: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    'all',
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

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await getExpenses();
      setExpenses(response.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getExpenseStats();
      const data = response.data || {};
      setStats({
        totalExpenses: data.totalExpenses || 0,
        thisMonth: data.thisMonth || 0,
        taxDeductible: data.taxDeductible || 0
      });
    } catch (err) {
      console.error('Error fetching expense stats:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await deleteExpense(id);
      fetchExpenses();
      fetchStats();
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense');
    }
  };

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(exp => exp.category === filterCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="neu-container space-y-6">
      {/* Header */}
      <PageHeader
        title="Expenses"
        subtitle="Track and manage your business expenses."
        actionLabel="Add Expense"
        actionIcon={Plus}
        onActionClick={() => navigate('/expenses/new')}
      />

      {/* Error */}
      {error && (
        <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #f59e0b' }}>
          <p className="text-sm" style={{ color: '#92400e' }}>{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Expenses"
          value={formatAmount(stats.totalExpenses)}
          iconBg="#ef4444"
        />
        <StatCard
          icon={Calendar}
          title="This Month"
          value={formatAmount(stats.thisMonth)}
          iconBg="#f97316"
        />
        <StatCard
          icon={TrendingDown}
          title="Tax Deductible"
          value={formatAmount(stats.taxDeductible)}
          iconBg="#22c55e"
        />
      </div>

      {/* Filter */}
      <div className="neu-card">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4" style={{ color: '#6b7280' }} />
          <h3 className="font-semibold" style={{ color: '#374151' }}>Filter by Category</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterCategory === cat ? 'neu-button-primary' : 'neu-button'
                }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="neu-card text-center py-12">
          <DollarSign className="w-16 h-16 mx-auto mb-4" style={{ color: '#d1d9e6' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>
            No expenses found
          </h3>
          <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
            Start tracking your business expenses
          </p>
          <NeuButton onClick={() => navigate('/expenses/new')}>
            Add First Expense
          </NeuButton>
        </div>
      ) : (
        <div className="neu-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #d1d9e6' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#374151' }}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#374151' }}>Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#374151' }}>Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#374151' }}>Client/Project</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#374151' }}>Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: '#374151' }}>Tax Deductible</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense, index) => (
                  <tr
                    key={expense._id}
                    style={{ borderBottom: index < filteredExpenses.length - 1 ? '1px solid #eef1f6' : 'none' }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>
                      {expense.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: '#eef1f6', color: '#4A5FFF' }}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#6b7280' }}>
                      {expense.clientId?.name || expense.projectId?.title || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right" style={{ color: '#ef4444' }}>
                      {formatAmount(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {expense.taxDeductible ? (
                        <span className="text-green-600 text-xs">✓ Yes</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/expenses/edit/${expense._id}`)}
                          className="p-2 rounded-lg transition-all hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" style={{ color: '#3b82f6' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-2 rounded-lg transition-all hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
