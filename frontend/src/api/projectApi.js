import axiosInstance from './axioInstance';

/**
 * Get all projects with optional filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {string} params.client - Filter by client ID
 * @param {string} params.status - Filter by status (Active, Completed, On Hold, Overdue)
 */
export const getProjects = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/project', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get a single project by ID
 * @param {string} id - Project ID
 */
export const getProjectById = async (id) => {
  try {
    const response = await axiosInstance.get(`/project/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create a new project
 * @param {Object} projectData - Project data
 */
export const createProject = async (projectData) => {
  try {
    const response = await axiosInstance.post('/project', projectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update an existing project
 * @param {string} id - Project ID
 * @param {Object} projectData - Updated project data
 */
export const updateProject = async (id, projectData) => {
  try {
    const response = await axiosInstance.put(`/project/${id}`, projectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a project
 * @param {string} id - Project ID
 */
export const deleteProject = async (id) => {
  try {
    const response = await axiosInstance.delete(`/project/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get project statistics
 */
export const getProjectStats = async () => {
  try {
    const response = await axiosInstance.get('/project/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
