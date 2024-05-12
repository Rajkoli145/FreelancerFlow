import axiosInstance from './axioInstance';

/**
 * Get all time logs
 * @param {Object} params - Query parameters
 */
export const getTimeLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/timelog', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get a single time log by ID
 * @param {string} id - Time log ID
 */
export const getTimeLogById = async (id) => {
  try {
    const response = await axiosInstance.get(`/timelog/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create a new time log
 * @param {Object} timeLogData - Time log data { projectId, hours, description, notes, date }
 */
export const createTimeLog = async (timeLogData) => {
  try {
    const response = await axiosInstance.post('/timelog', timeLogData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update an existing time log
 * @param {string} id - Time log ID
 * @param {Object} timeLogData - Updated time log data
 */
export const updateTimeLog = async (id, timeLogData) => {
  try {
    const response = await axiosInstance.put(`/timelog/${id}`, timeLogData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a time log
 * @param {string} id - Time log ID
 */
export const deleteTimeLog = async (id) => {
  try {
    const response = await axiosInstance.delete(`/timelog/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get unbilled time logs
 * @param {string} projectId - Optional project ID to filter
 */
export const getUnbilledTimeLogs = async (projectId = null) => {
  try {
    const params = projectId ? { projectId } : {};
    const response = await axiosInstance.get('/timelog/unbilled', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
