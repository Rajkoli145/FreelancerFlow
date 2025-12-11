import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Briefcase, CheckCircle, Clock, Loader } from 'lucide-react';
import Button from '../../components/ui/Button';
import SummaryCard from '../../components/ui/SummaryCard';
import ProjectRow from '../../components/projects/ProjectRow';
import Pagination from '../../components/ui/Pagination';
import { getProjects, getProjectStats } from '../../api/projectApi';

const ProjectsListPage = () => {
  const navigate = useNavigate();
  
  // State
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    hoursThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedClient && { client: selectedClient }),
        ...(selectedStatus && { status: selectedStatus }),
      };

      const response = await getProjects(params);
      
      // Handle different response structures
      if (response.projects) {
        setProjects(response.projects);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || response.projects.length);
      } else if (Array.isArray(response)) {
        setProjects(response);
        setTotalItems(response.length);
        setTotalPages(1);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
      
      // Use mock data if API fails
      setProjects(getMockProjects());
      setTotalItems(getMockProjects().length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await getProjectStats();
      setStats(response);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Use mock stats if API fails
      setStats({
        total: 24,
        active: 12,
        hoursThisMonth: 156,
      });
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchQuery, selectedClient, selectedStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClient, selectedStatus]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Mock data for development/testing
  const getMockProjects = () => [
    {
      id: '1',
      name: 'Website Redesign',
      client: { name: 'Acme Corp' },
      dueDate: '2025-12-20',
      hoursLogged: 45.5,
      status: 'Active',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      client: { name: 'TechStart Inc' },
      dueDate: '2026-01-15',
      hoursLogged: 120.0,
      status: 'Active',
    },
    {
      id: '3',
      name: 'Brand Identity',
      client: { name: 'Design Co' },
      dueDate: '2025-11-30',
      hoursLogged: 32.0,
      status: 'Overdue',
    },
    {
      id: '4',
      name: 'E-commerce Platform',
      client: { name: 'Shop Global' },
      dueDate: '2026-02-28',
      hoursLogged: 85.5,
      status: 'Active',
    },
    {
      id: '5',
      name: 'Marketing Campaign',
      client: { name: 'Marketing Pro' },
      dueDate: '2025-12-10',
      hoursLogged: 15.0,
      status: 'On Hold',
    },
    {
      id: '6',
      name: 'Database Migration',
      client: { name: 'Data Systems' },
      dueDate: '2025-10-15',
      hoursLogged: 60.0,
      status: 'Completed',
    },
  ];

  // Filter projects locally if using mock data
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = !searchQuery || 
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClient = !selectedClient || 
      project.client?.name === selectedClient || 
      project.clientName === selectedClient;
    
    const matchesStatus = !selectedStatus || project.status === selectedStatus;

    return matchesSearch && matchesClient && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track your client work</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/projects/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Project
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Projects"
          value={stats.total || filteredProjects.length}
          icon={Briefcase}
          color="indigo"
        />
        <SummaryCard
          title="Active Projects"
          value={stats.active || filteredProjects.filter(p => p.status === 'Active').length}
          change="+3"
          trend="up"
          icon={CheckCircle}
          color="green"
        />
        <SummaryCard
          title="Hours This Month"
          value={`${stats.hoursThisMonth || 156} h`}
          change="+12.5%"
          trend="up"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Client Filter */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="">All Clients</option>
            <option value="Acme Corp">Acme Corp</option>
            <option value="TechStart Inc">TechStart Inc</option>
            <option value="Design Co">Design Co</option>
            <option value="Shop Global">Shop Global</option>
            <option value="Marketing Pro">Marketing Pro</option>
            <option value="Data Systems">Data Systems</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <p className="text-sm text-yellow-700">
              ⚠️ Using mock data. API Error: {error}
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedClient || selectedStatus
                ? 'Try adjusting your filters'
                : 'Get started by creating your first project'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <ProjectRow key={project.id || project._id} project={project} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsListPage;
