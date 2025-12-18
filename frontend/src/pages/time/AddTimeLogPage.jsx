import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NeuButton from "../../components/ui/NeuButton";
import NeuInput from "../../components/ui/NeuInput";
import { createTimeLog } from "../../api/timeApi";
import { getProjects } from "../../api/projectApi";
import '../../styles/global/neumorphism.css';

const AddTimeLogPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState(searchParams.get('projectId') || "");
  const [description, setDescription] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [billable, setBillable] = useState(true); // Default to billable
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await getProjects();
        const projectList = response.data || [];
        setProjects(projectList);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSaveEntry = async () => {
    // Validation
    if (!selectedProject || !description || !hoursWorked || !date) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(hoursWorked) <= 0) {
      setError('Hours worked must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const timeLogData = {
        projectId: selectedProject,
        description,
        hours: parseFloat(hoursWorked),
        date,
        billable,
        notes: notes || undefined
      };

      await createTimeLog(timeLogData);
      navigate("/time");
    } catch (err) {
      console.error('Error creating time log:', err);
      setError(err.error || err.message || 'Failed to create time entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/time");
  };

  return (
    <div className="neu-container">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="neu-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/time")}
              className="neu-button p-2.5 rounded-xl transition-all duration-200"
              style={{ boxShadow: '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff' }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.boxShadow = 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff';
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#6b7280' }} />
            </button>
            <div>
              <h1 className="text-3xl font-bold neu-heading">Add Time Entry</h1>
              <p className="neu-text-light mt-1">Record time spent on a project.</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="neu-card space-y-6">
          {error && (
            <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #ef4444' }}>
              <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Select Project *
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={loadingProjects || loading}
              className="neu-input w-full"
            >
              <option value="">{loadingProjects ? 'Loading projects...' : 'Choose a project'}</option>
              {projects.map((project) => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.title || project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Description *
            </label>
            <NeuInput
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Header design and implementation"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Hours Worked *
              </label>
              <NeuInput
                type="number"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.5"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Date *
              </label>
              <NeuInput
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Billable Checkbox */}
          <div className="neu-card-inset p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
                disabled={loading}
                className="w-5 h-5 rounded"
                style={{ accentColor: 'var(--neu-primary)' }}
              />
              <div>
                <span className="block text-sm font-medium neu-text">
                  Billable Time
                </span>
                <span className="block text-xs neu-text-light mt-0.5">
                  {billable 
                    ? 'This time will be included in invoices' 
                    : 'This time will NOT be invoiced (e.g., meetings, admin work)'}
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this time entry..."
              rows={4}
              disabled={loading}
              className="neu-input w-full resize-none"
              style={{
                backgroundColor: '#eef1f6',
                boxShadow: 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff',
                border: 'none',
                outline: 'none',
                color: '#374151'
              }}
            />
          </div>

          <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--neu-dark)' }}>
            <NeuButton
              variant="primary"
              onClick={handleSaveEntry}
              disabled={loading || loadingProjects}
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </NeuButton>

            <NeuButton
              variant="default"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </NeuButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTimeLogPage;
