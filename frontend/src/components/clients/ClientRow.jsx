import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientAvatar from './ClientAvatar';
import ClientStatusBadge from './ClientStatusBadge';

export default function ClientRow({ client }) {
  const navigate = useNavigate();

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Client Name with Avatar */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <ClientAvatar name={client.name} />
          <span className="font-medium text-gray-900">{client.name}</span>
        </div>
      </td>

      {/* Email */}
      <td className="py-4 px-6 text-sm text-gray-600">{client.email}</td>

      {/* Total Billed */}
      <td className="py-4 px-6 text-sm font-semibold text-gray-900">
        ${client.totalBilled?.toLocaleString() || '0'}
      </td>

      {/* Outstanding */}
      <td className="py-4 px-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-900">
            ${client.outstandingAmount?.toLocaleString() || '0'}
          </span>
          <ClientStatusBadge status={client.status} />
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/clients/${client._id}`)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="View Client"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => navigate(`/clients/${client._id}/edit`)}
            className="p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            title="Edit Client"
          >
            <Pencil className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </td>
    </tr>
  );
}
