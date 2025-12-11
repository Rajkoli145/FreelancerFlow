import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  FileText,
  CheckCircle,
  DollarSign,
  Eye,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { getInvoices } from "../../api/invoiceApi";

const InvoicesListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getInvoices();
        const invoiceList = Array.isArray(response) ? response : response.invoices || [];
        setInvoices(invoiceList);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err.message || 'Failed to load invoices');
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Calculate stats
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(
    (inv) => inv.status === "paid" || inv.status === "Paid"
  ).length;
  const outstandingAmount = invoices
    .filter((inv) => inv.status !== "paid" && inv.status !== "Paid")
    .reduce((sum, inv) => sum + (inv.amount || inv.totalAmount || 0), 0);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.clientId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || 
      invoice.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      paid: {
        label: "Paid",
        classes: "bg-green-100 text-green-700 border-green-200",
      },
      unpaid: {
        label: "Unpaid",
        classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      overdue: {
        label: "Overdue",
        classes: "bg-red-100 text-red-700 border-red-200",
      },
    };

    const config = statusConfig[status] || statusConfig.unpaid;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.classes}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">
            Manage all client invoices in one place.
          </p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => navigate("/invoices/new")}
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Total Invoices</p>
            <div className="bg-indigo-100 rounded-lg p-3">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalInvoices}</p>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{paidInvoices}</p>
        </div>

        {/* Outstanding Amount */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">
              Outstanding Amount
            </p>
            <div className="bg-orange-100 rounded-lg p-3">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${outstandingAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number or client name..."
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
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No invoices found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first invoice"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                    Invoice Number
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                    Issued On
                  </th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice._id || invoice.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {invoice.clientId?.name || 'No Client'}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                      ${(invoice.amount || invoice.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => navigate(`/invoices/${invoice._id || invoice.id}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 font-medium text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesListPage;
