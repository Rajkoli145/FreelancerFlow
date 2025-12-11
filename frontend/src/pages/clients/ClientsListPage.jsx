import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, UserCheck, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getClients } from '../../api/clientApi';
import Button from '../../components/ui/Button';
import SummaryCard from '../../components/ui/SummaryCard';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/ui/Loader';
import ClientRow from '../../components/clients/ClientRow';

const ClientsListPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data fallback
  const mockClients = [
    {
      _id: '1',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      totalBilled: 45000,
      outstandingAmount: 5000,
      status: 'pending',
    },
    {
      _id: '2',
      name: 'Tech Startup Inc.',
      email: 'hello@techstartup.io',
      totalBilled: 32000,
      outstandingAmount: 0,
      status: 'paid',
    },
    {
      _id: '3',
      name: 'Global Solutions LLC',
      email: 'info@globalsolutions.com',
      totalBilled: 68000,
      outstandingAmount: 12000,
      status: 'overdue',
    },
    {
      _id: '4',
      name: 'Creative Agency Co.',
      email: 'team@creativeagency.com',
      totalBilled: 28500,
      outstandingAmount: 0,
      status: 'paid',
    },
    {
      _id: '5',
      name: 'Digital Marketing Pro',
      email: 'contact@digitalmarketing.com',
      totalBilled: 19000,
      outstandingAmount: 3500,
      status: 'pending',
    },
  ];

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getClients();
        const clientList = Array.isArray(response) ? response : response.clients || [];
        setClients(clientList);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(`Using mock data. API Error: ${err.message}`);
        setClients(mockClients);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Calculate metrics
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status !== 'paid').length;
  const outstandingAmount = clients.reduce((sum, c) => sum + (c.outstandingAmount || 0), 0);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage your client relationships, billing details, and contact info.
          </p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => navigate('/clients/new')}
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Clients"
          value={totalClients}
          icon={Users}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <SummaryCard
          title="Active Clients"
          value={activeClients}
          icon={UserCheck}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <SummaryCard
          title="Outstanding Amount"
          value={`$${outstandingAmount.toLocaleString()}`}
          icon={DollarSign}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first client'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                      Client Name
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                      Total Billed
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                      Outstanding
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClients.map((client) => (
                    <ClientRow key={client._id} client={client} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4">
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
