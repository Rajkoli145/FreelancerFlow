import axiosInstance from './axioInstance';

/**
 * Get all notifications
 */
export const getNotifications = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/notification', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await axiosInstance.put(`/notification/${id}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosInstance.put('/notification/read-all');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
