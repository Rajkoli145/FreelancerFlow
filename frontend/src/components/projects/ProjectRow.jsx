import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Calendar } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { format } from 'date-fns';

const ProjectRow = ({ project }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleView = () => {
    navigate(`/projects/${project._id || project.id}`);
  };

  const handleEdit = () => {
    navigate(`/projects/${project._id || project.id}/edit`);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Project Name & Due Date */}
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-900">{project.name || project.title}</p>
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due: {formatDate(project.dueDate || project.deadline)}</span>
          </div>
        </div>
      </td>

      {/* Client */}
      <td className="px-6 py-4">
        <p className="text-gray-900">{project.client?.name || project.clientName || 'N/A'}</p>
      </td>

      {/* Hours */}
      <td className="px-6 py-4">
        <p className="font-medium text-gray-900">
          {project.hoursLogged || project.hours || 0} h
        </p>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={project.status} size="sm" />
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleView}
            className="p-2 rounded-lg hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-colors"
            title="View project"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
            title="Edit project"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProjectRow;
