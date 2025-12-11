import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, DollarSign, Clock, Calendar, Eye } from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";

const PaymentsPage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");

  const stats = {
    totalReceived: 45800,
    pendingAmount: 12600,
    lastPaymentDate: "Dec 10, 2025",
  };

  const payments = [
    {
      id: 1,
      date: "Dec 10, 2025",
      invoiceNo: "INV-2025-RS-0001",
      client: "Client One",
      method: "Bank Transfer",
      reference: "TXN-001234",
      amount: 3250,
      status: "paid",
    },
    {
      id: 2,
      date: "Dec 9, 2025",
      invoiceNo: "INV-2025-RS-0002",
      client: "Acme Corp",
      method: "UPI",
      reference: "UPI-567890",
      amount: 5000,
      status: "paid",
    },
    {
      id: 3,
      date: "Dec 8, 2025",
      invoiceNo: "INV-2025-RS-0003",
      client: "TechStart Inc",
      method: "Cash",
      reference: "CASH-123",
      amount: 2500,
      status: "paid",
    },
    {
      id: 4,
      date: "Dec 7, 2025",
      invoiceNo: "INV-2025-RS-0004",
      client: "Startup Labs",
      method: "Bank Transfer",
      reference: "TXN-002345",
      amount: 1500,
      status: "partial",
    },
    {
      id: 5,
      date: "Dec 6, 2025",
      invoiceNo: "INV-2025-RS-0005",
      client: "Digital Agency",
      method: "Credit Card",
      reference: "CC-789012",
      amount: 0,
      status: "failed",
    },
  ];

  const StatusBadge = ({ status }) => {
    const styles = {
      paid: "bg-green-100 text-green-700 border-green-200",
      partial: "bg-yellow-100 text-yellow-700 border-yellow-200",
      failed: "bg-red-100 text-red-700 border-red-200",
    };

    const labels = {
      paid: "Paid",
      partial: "Partial",
      failed: "Failed",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          styles[status] || styles.paid
        }`}
      >
        {labels[status]}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, subtitle, iconBg, iconColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-1">
              Track all received and pending payments.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate("/payments/new")}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </Button>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-3 gap-6">
          <StatCard
            icon={DollarSign}
            label="Total Received"
            value={`$${stats.totalReceived.toLocaleString()}`}
            subtitle="All time"
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={Clock}
            label="Pending Amount"
            value={`$${stats.pendingAmount.toLocaleString()}`}
            subtitle="Outstanding"
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatCard
            icon={Calendar}
            label="Last Payment"
            value={stats.lastPaymentDate}
            subtitle="Most recent"
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
          />
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by invoice, client, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Method"
              >
                <option value="">All Methods</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Status"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </Select>
          </div>
        </div>

        {/* Payments Table */}
        {payments.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Invoice No.
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Method
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Reference ID
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 text-gray-900">{payment.date}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-indigo-600">
                          {payment.invoiceNo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {payment.client}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {payment.method}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                        {payment.reference}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {payment.status === "failed"
                          ? "-"
                          : `$${payment.amount.toLocaleString()}`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            navigate(`/invoices/${payment.invoiceNo}`)
                          }
                          className="p-1.5 text-gray-600 hover:text-indigo-600 transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No payments recorded yet.
              </h3>
              <p className="text-gray-500 mb-6">
                Start tracking your payments by adding your first transaction.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/payments/new")}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Add Payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
