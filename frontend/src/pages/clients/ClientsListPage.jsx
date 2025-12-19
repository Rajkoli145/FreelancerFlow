import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, UserCheck, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getClients, getAllClientsStats } from '../../api/clientApi';
import Loader from '../../components/ui/Loader';
import ClientRow from '../../components/clients/ClientRow';
import Pagination from '../../components/ui/Pagination';
import NeuInput from '../../components/ui/NeuInput';
import NeuButton from '../../components/ui/NeuButton';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/global/neumorphism.css';

const ClientsListPage = () => {
  const navigate = useNavigate();
  const { formatAmount } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [outstandingAmount, setOutstandingAmount] = useState(0);
  const itemsPerPage = 10;

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getClients();
        // Backend returns { success: true, data: [...] }
        const clientList = response.data || [];
        setClients(clientList);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err.response?.data?.error || err.message);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Fetch overall client stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getAllClientsStats();
        const data = response.data || {};
        setOutstandingAmount(data.outstandingAmount || 0);
      } catch (err) {
        console.error('Error fetching client stats:', err);
        setOutstandingAmount(0);
      }
    };

    fetchStats();
  }, []);

  // Calculate metrics
  const totalClients = clients.length;
  // Fix: Client status is 'Active' or 'Archived', not payment-related
  const activeClients = clients.filter((c) => c.status === 'Active').length;

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="neu-container space-y-6">
      {/* Header */}
      <PageHeader
        title="Clients"
        subtitle="Manage your client relationships, billing details, and contact info."
        actionLabel="Add Client"
        actionIcon={Plus}
        onActionClick={() => navigate('/clients/new')}
      />

      {/* Error Banner */}
      {error && (
        <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #f59e0b' }}>
          <p className="text-sm" style={{ color: '#92400e' }}>{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          title="Total Clients"
          value={totalClients}
          iconBg="#4A5FFF"
        />
        <StatCard
          icon={UserCheck}
          title="Active Clients"
          value={activeClients}
          iconBg="#22c55e"
        />
        <StatCard
          icon={DollarSign}
          title="Outstanding Amount"
          value={formatAmount(outstandingAmount)}
          iconBg="#f97316"
        />
      </div>

      {/* Filters and Search */}
      <div className="neu-card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <NeuInput
              icon={Search}
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="neu-input px-4"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="neu-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin" style={{ color: 'var(--neu-primary)' }}>
              <Loader />
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 neu-text-light mx-auto mb-4" />
            <h3 className="text-lg font-semibold neu-heading mb-2">No clients found</h3>
            <p className="neu-text">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first client'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="neu-card-inset">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                      Client Name
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                      Email
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                      Total Billed
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                      Outstanding
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: '1px solid var(--neu-dark)' }}>
                  {paginatedClients.map((client) => (
                    <ClientRow key={client._id} client={client} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4" style={{ borderTop: '1px solid var(--neu-dark)' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientsListPage;
