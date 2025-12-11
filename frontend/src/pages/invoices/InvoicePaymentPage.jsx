import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";

const InvoicePaymentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const invoice = {
    number: "INV-2025-RS-0003",
    client: "Client One",
    totalAmount: 3250,
    status: "unpaid",
  };

  const paymentHistory = [
    {
      id: 1,
      date: "Dec 5, 2025",
      method: "Bank Transfer",
      reference: "TXN-001234",
      amount: 1000,
    },
    {
      id: 2,
      date: "Dec 8, 2025",
      method: "UPI",
      reference: "UPI-567890",
      amount: 500,
    },
  ];

  const StatusBadge = ({ status }) => {
    const styles = {
      paid: "bg-green-100 text-green-700 border-green-200",
      unpaid: "bg-yellow-100 text-yellow-700 border-yellow-200",
      overdue: "bg-red-100 text-red-700 border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          styles[status] || styles.unpaid
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleMarkAsPaid = () => {
    console.log("Mark as Paid clicked", {
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes,
    });
    navigate(`/invoices/${id}`);
  };

  const handleCancel = () => {
    navigate(`/invoices/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Header Section */}
        <div>
          <button
            onClick={() => navigate(`/invoices/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Invoice</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Invoice Payment</h1>
          <p className="text-gray-500 mt-1">
            Record and manage client payments.
          </p>
        </div>

        {/* Payment Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Invoice Information
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-medium text-gray-900 mt-1">{invoice.number}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Client Name</p>
              <p className="font-medium text-gray-900 mt-1">{invoice.client}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-gray-900 mt-1">
                ${invoice.totalAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <div className="mt-1">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Record Payment
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Select payment method"
              >
                <option value="">Select payment method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="credit_card">Credit Card</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., TXN-123456"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any payment notes..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleMarkAsPaid}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Paid
            </Button>

            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment History
          </h2>

          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Method
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Reference
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 text-gray-900">{payment.date}</td>
                      <td className="py-3 px-4 text-gray-900">{payment.method}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {payment.reference}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No payment history available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePaymentPage;
