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
import Loader from "../../components/ui/Loader";
import NeuInput from "../../components/ui/NeuInput";
import NeuButton from "../../components/ui/NeuButton";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import { getInvoices } from "../../api/invoiceApi";
import { useAuth } from '../../context/AuthContext';
import '../../styles/neumorphism.css';

const InvoicesListPage = () => {
  const navigate = useNavigate();
  const { formatAmount } = useAuth();
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
        const invoiceList = response.data || [];
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
        classes: "neu-badge-success",
      },
      unpaid: {
        label: "Unpaid",
        classes: "neu-badge-warning",
      },
      overdue: {
        label: "Overdue",
        classes: "neu-badge-danger",
      },
    };

    const config = statusConfig[status] || statusConfig.unpaid;

    return (
      <span className={config.classes}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="neu-container space-y-6">
      {/* Header */}
      <PageHeader 
        title="Invoices"
        subtitle="Manage all client invoices in one place."
        actionLabel="Create Invoice"
        actionIcon={Plus}
        onActionClick={() => navigate("/invoices/new")}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={FileText}
          title="Total Invoices"
          value={totalInvoices}
          iconBg="#4A5FFF"
        />
        <StatCard 
          icon={CheckCircle}
          title="Paid Invoices"
          value={paidInvoices}
          iconBg="#22c55e"
        />
        <StatCard 
          icon={DollarSign}
          title="Outstanding Amount"
          value={formatAmount(outstandingAmount)}
          iconBg="#f97316"
        />
      </div>

      {/* Filters Bar */}
      <div className="neu-card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <NeuInput 
              icon={Search}
              placeholder="Search by invoice number or client name..."
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
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="neu-input px-4"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #ef4444' }}>
          <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
        </div>
      )}

      {/* Invoices Table */}
      <div className="neu-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin" style={{ color: 'var(--neu-primary)' }}>
              <Loader />
            </div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 neu-text-light mx-auto mb-4" />
            <h3 className="text-lg font-semibold neu-heading mb-2">
              No invoices found
            </h3>
            <p className="neu-text">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first invoice"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="neu-card-inset">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                    Invoice Number
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                    Client
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                    Amount
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold neu-text">
                    Issued On
                  </th>
                  <th className="text-right py-3 px-6 text-sm font-semibold neu-text">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid var(--neu-dark)' }}>
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice._id || invoice.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--neu-dark)' }}
                  >
                    <td className="py-4 px-6 text-sm font-medium neu-heading">
                      {invoice.invoiceNumber || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm neu-text">
                      {invoice.clientId?.name || 'No Client'}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold neu-heading">
                      {formatAmount(invoice.amount || invoice.totalAmount || 0)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="py-4 px-6 text-sm neu-text">
                      {new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => navigate(`/invoices/${invoice._id || invoice.id}`)}
                        className="neu-button inline-flex items-center gap-2 px-3 py-1.5"
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
