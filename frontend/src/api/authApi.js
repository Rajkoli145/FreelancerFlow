import axiosInstance from './axioInstance';

/**
 * User signup/registration
 * @param {Object} userData - { fullName, email, password, defaultHourlyRate?, currency? }
 */
export const signup = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * User login
 * @param {Object} credentials - { email, password }
 */
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get current logged-in user
 */
export const getMe = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - { fullName?, email?, defaultHourlyRate? }
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update user password
 * @param {Object} passwordData - { currentPassword, newPassword }
 */
export const updatePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put('/auth/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
