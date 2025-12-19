import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientAvatar from './ClientAvatar';
import ClientStatusBadge from './ClientStatusBadge';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/global/neumorphism.css';

export default function ClientRow({ client }) {
  const navigate = useNavigate();
  const { formatAmount } = useAuth();

  return (
    <tr className="transition-colors" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
      {/* Client Name with Avatar */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <ClientAvatar name={client.name} />
          <span className="font-medium neu-heading">{client.name}</span>
        </div>
      </td>

      {/* Email */}
      <td className="py-4 px-6 text-sm neu-text">{client.email}</td>

      {/* Total Billed */}
      <td className="py-4 px-6 text-sm font-semibold neu-heading">
        {formatAmount(client.totalBilled || 0)}
      </td>

      {/* Outstanding */}
      <td className="py-4 px-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold neu-heading">
            {formatAmount(client.outstandingAmount || 0)}
          </span>
          <ClientStatusBadge status={client.status} />
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/clients/${client._id}`)}
            className="neu-button p-2"
            title="View Client"
          >
            <Eye className="w-4 h-4 neu-text-light" />
          </button>
          <button
            onClick={() => navigate(`/clients/${client._id}/edit`)}
            className="neu-button p-2"
            title="Edit Client"
          >
            <Pencil className="w-4 h-4 neu-text-light" />
          </button>
        </div>
      </td>
    </tr>
  );
}
