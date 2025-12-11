import React from 'react';
import { Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';

export default function InvoiceTable({ invoices = [] }) {
  const navigate = useNavigate();

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No invoices yet"
        message="Create your first invoice for this project to start billing your client."
        actionLabel="Create Invoice"
        onAction={() => console.log('Create invoice')}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice #</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr 
              key={invoice.id} 
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                {invoice.invoiceNumber}
              </td>
              <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                ${invoice.amount.toLocaleString()}
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={invoice.status} />
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{invoice.createdDate}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 font-medium text-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
