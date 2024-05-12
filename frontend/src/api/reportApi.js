import axiosInstance from './axioInstance';

export const getFinancialReport = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/report/financial', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching financial report:', error);
    throw error;
  }
};

export const getTimeReport = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/report/time', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching time report:', error);
    throw error;
  }
};

export const getClientReport = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/report/client', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching client report:', error);
    throw error;
  }
};

export const getProjectReport = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/report/project', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching project report:', error);
    throw error;
  }
};

export const getTaxReport = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/report/tax', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tax report:', error);
    throw error;
  }
};
