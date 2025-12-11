import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Edit,
  CheckCircle,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Briefcase,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { getInvoiceById, markAsPaid, downloadInvoicePDF } from "../../api/invoiceApi";

const InvoiceDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getInvoiceById(id);
        const invoiceData = response.invoice || response;
        setInvoice(invoiceData);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Invoice</h3>
          <p className="text-red-600 mb-4">{error || 'Invoice not found'}</p>
          <Button onClick={() => navigate('/invoices')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try {
      setError(null);
      const blob = await downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!window.confirm('Mark this invoice as paid?')) return;
    
    try {
      setUpdating(true);
      setError(null);
      const response = await markAsPaid(id);
      const updatedInvoice = response.invoice || response;
      setInvoice(updatedInvoice);
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      setError(err.message || 'Failed to update invoice status');
    } finally {
      setUpdating(false);
    }
  };

  const client = invoice.clientId || {};
  const project = invoice.projectId || {};
  const items = invoice.items || [];
  const subtotal = invoice.totalAmount || invoice.amount || 0;
  const tax = invoice.tax || 0;
  const total = subtotal + tax;
  const status = (invoice.status || 'unpaid').toLowerCase();
  const isPaid = status === 'paid';

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

  const handleEditInvoice = () => {
    navigate(`/invoices/${id}/edit`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/invoices")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Invoices</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Invoice {invoice.invoiceNumber || `#${id.slice(-6)}`}
          </h1>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2"
            disabled={updating}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>

          {!isPaid && (
            <Button
              variant="secondary"
              onClick={handleMarkAsPaid}
              className="flex items-center gap-2"
              disabled={updating}
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Paid
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleEditInvoice}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Invoice
          </Button>
        </div>
      </div>

      {/* Top Info Section - 2 Column */}
      <div className="grid grid-cols-2 gap-6">
        {/* Client Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Client Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Client Name</p>
                <p className="font-medium text-gray-900">{client.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{client.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium text-gray-900">
                  {client.company || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{client.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">
                  {client.address || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Invoice Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Invoice Number</p>
                <p className="font-medium text-gray-900">{invoice.invoiceNumber || `#${id.slice(-6)}`}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="font-medium text-gray-900">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium text-gray-900">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Project Linked</p>
                <p className="font-medium text-gray-900">{project.name || 'No Project'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <StatusBadge status={status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Hours
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Rate
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 text-gray-900">{item.description || 'N/A'}</td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {item.hours || 0}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      ${(item.rate || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      ${(item.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-500">
                    No line items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (0%)</span>
              <span>${tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total Amount</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {invoice.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
          <p className="text-gray-700 leading-relaxed">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailsPage;
