import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Button from "../../components/ui/Button";

const MarkAsPaidPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Mock invoice data
  const invoice = {
    number: "INV-2025-RS-0003",
    client: "Client One",
    amountDue: 3250,
    dueDate: "Dec 20, 2025",
    status: "unpaid",
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      paid: "bg-green-100 text-green-700 border-green-200",
      unpaid: "bg-yellow-100 text-yellow-700 border-yellow-200",
      overdue: "bg-red-100 text-red-700 border-red-200",
    };

    const labels = {
      paid: "Paid",
      unpaid: "Unpaid",
      overdue: "Overdue",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold border ${
          styles[status] || styles.unpaid
        }`}
      >
        {labels[status]}
      </span>
    );
  };

  const handleConfirmPayment = () => {
    console.log("Payment confirmed for invoice:", invoice.number);
    setIsConfirmed(true);
  };

  const handleCancel = () => {
    navigate(`/invoices/${id}`);
  };

  const handleBackToInvoice = () => {
    navigate(`/invoices/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex items-center justify-center px-6 py-10">
      {!isConfirmed ? (
        // Confirmation Card
        <div className="w-full max-w-md">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Invoice</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Mark Invoice as Paid
              </h1>
              <p className="text-gray-500 mt-2">
                This action will update the payment status and lock further edits.
              </p>
            </div>

            {/* Invoice Summary Card */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Invoice Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Invoice Number</span>
                  <span className="font-semibold text-gray-900">
                    {invoice.number}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Client Name</span>
                  <span className="font-semibold text-gray-900">
                    {invoice.client}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount Due</span>
                  <span className="text-lg font-bold text-indigo-600">
                    ${invoice.amountDue.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Due Date</span>
                  <span className="font-semibold text-gray-900">
                    {invoice.dueDate}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={handleConfirmPayment}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                Confirm Payment
              </Button>

              <button
                onClick={handleCancel}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Success State
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Confirmed!
              </h1>
              <p className="text-gray-600">
                Invoice marked as paid successfully
              </p>
            </div>

            {/* Success Summary */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Invoice Number</span>
                <span className="font-semibold text-gray-900">
                  {invoice.number}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Amount Paid</span>
                <span className="text-lg font-bold text-green-600">
                  ${invoice.amountDue.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleBackToInvoice}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              Back to Invoice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAsPaidPage;
