import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, DollarSign, Clock, Calendar, Eye } from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import { getPayments } from "../../api/paymentApi";

const PaymentsPage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [dateFrom, dateTo, paymentMethod]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      if (dateFrom) filters.startDate = dateFrom;
      if (dateTo) filters.endDate = dateTo;
      if (paymentMethod) filters.paymentMethod = paymentMethod;
      
      const response = await getPayments(filters);
      setPayments(response.data?.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real payment data
  const stats = {
    totalReceived: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    pendingAmount: 0, // This would come from invoices with amountDue > 0
    lastPaymentDate: payments.length > 0 
      ? new Date(payments[0].paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No payments yet',
  };

  // Filter payments based on search query
  const filteredPayments = payments.filter(payment => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const invoiceNumber = payment.invoiceId?.invoiceNumber || '';
    const clientName = payment.invoiceId?.clientId?.name || '';
    const reference = payment.referenceNumber || '';
    
    return (
      invoiceNumber.toLowerCase().includes(searchLower) ||
      clientName.toLowerCase().includes(searchLower) ||
      reference.toLowerCase().includes(searchLower)
    );
  });

  const StatusBadge = ({ status }) => {
    // Payment records don't have status, they're always "paid" once recorded
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-700 border-green-200">
        Paid
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-1">
              Track all received payments across invoices.
            </p>
          </div>
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
                <option value="debit_card">Debit Card</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length > 0 ? (
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
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-indigo-600">
                          {payment.invoiceId?.invoiceNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {payment.invoiceId?.clientId?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                        {payment.referenceNumber || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            navigate(`/invoices/${payment.invoiceId?._id}`)
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
                Payments are automatically recorded when you use the "Record Payment" feature on invoices.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/invoices")}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                View Invoices
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
