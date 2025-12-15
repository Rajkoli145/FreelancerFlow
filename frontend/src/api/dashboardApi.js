import axiosInstance from './axioInstance';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
