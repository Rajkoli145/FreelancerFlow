import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import { getTimeLogById, updateTimeLog, deleteTimeLog } from "../../api/timeApi";
import { getProjects } from "../../api/projectApi";

const EditTimeLogPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [description, setDescription] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch time log and projects in parallel
        const [timeLogRes, projectsRes] = await Promise.all([
          getTimeLogById(id),
          getProjects()
        ]);
        
        const timeLog = timeLogRes.data || timeLogRes;
        const projectsData = projectsRes.data || [];
        
        setProjects(projectsData);
        setLoadingProjects(false);
        
        // Pre-fill form
        setSelectedProject(timeLog.projectId?._id || timeLog.projectId || '');
        setDescription(timeLog.description || timeLog.task || '');
        setHoursWorked(timeLog.hours?.toString() || '');
        setDate(timeLog.date ? new Date(timeLog.date).toISOString().split('T')[0] : '');
        setNotes(timeLog.notes || '');
      } catch (err) {
        console.error('Error fetching time log:', err);
        setError(err.message || 'Failed to load time log');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSaveChanges = async () => {
    if (!selectedProject || !hoursWorked || !date) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      const updateData = {
        projectId: selectedProject,
        description,
        hours: parseFloat(hoursWorked),
        date,
        notes,
      };
      
      await updateTimeLog(id, updateData);
      navigate("/time");
    } catch (err) {
      console.error('Error updating time log:', err);
      setError(err.message || 'Failed to update time log');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      try {
        setUpdating(true);
        await deleteTimeLog(id);
        navigate("/time");
      } catch (err) {
        console.error('Error deleting time log:', err);
        setError(err.message || 'Failed to delete time log');
        setUpdating(false);
      }
    }
  };

  const handleCancel = () => {
    navigate("/time");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error && !description) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Time Log</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/time')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Time Logs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* Header Section */}
        <div>
          <button
            onClick={() => navigate("/time")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Time Logs</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Edit Time Entry</h1>
          <p className="text-gray-500 mt-1">
            Update time entry information.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project *
            </label>
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={loadingProjects || updating}
            >
              <option value="">{loadingProjects ? 'Loading...' : 'Select a project'}</option>
              {projects.map((project) => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.title || project.name}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleDeleteEntry}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={updating}
            >
              Delete Entry
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updating}
              >
                Cancel
              </button>

              <Button
                variant="primary"
                onClick={handleSaveChanges}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTimeLogPage;
