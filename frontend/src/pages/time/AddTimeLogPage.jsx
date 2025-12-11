import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import { createTimeLog } from "../../api/timeApi";
import { getProjects } from "../../api/projectApi";

const AddTimeLogPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState(searchParams.get('projectId') || "");
  const [description, setDescription] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await getProjects();
        const projectList = Array.isArray(response) ? response : response.projects || [];
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
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Header Section */}
        <div>
          <button
            onClick={() => navigate("/time")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Time Logs</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Add Time Entry</h1>
          <p className="text-gray-500 mt-1">
            Record time spent on a project.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project *
            </label>
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              placeholder="Choose a project"
              disabled={loadingProjects || loading}
            >
              <option value="">{loadingProjects ? 'Loading projects...' : 'Choose a project'}</option>
              {projects.map((project) => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Header design and implementation"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours Worked *
              </label>
              <Input
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this time entry..."
              rows={4}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSaveEntry}
              disabled={loading || loadingProjects}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </Button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTimeLogPage;
