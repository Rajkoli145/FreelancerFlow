import React from 'react';
import { Pencil, Trash2, Clock } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

export default function TimeLogTable({ timeLogs = [], onEdit, onDelete }) {
  if (timeLogs.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No time entries yet"
        message="Start tracking your time on this project to monitor progress and billable hours."
        actionLabel="Add Time Entry"
        onAction={() => console.log('Add time entry')}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hours</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {timeLogs.map((log) => (
            <tr 
              key={log._id || log.id} 
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4 text-sm text-gray-900">
                {log.date ? new Date(log.date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{log.description || 'No description'}</td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">{log.hours || 0}h</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit && onEdit(log)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(log)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
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
