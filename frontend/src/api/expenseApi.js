import axiosInstance from './axioInstance';

// Get all expenses with optional filters
export const getExpenses = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/expense', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

// Get expense by ID
export const getExpenseById = async (id) => {
  try {
    const response = await axiosInstance.get(`/expense/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw error;
  }
};

// Create new expense
export const createExpense = async (expenseData) => {
  try {
    const response = await axiosInstance.post('/expense', expenseData);
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

// Update expense
export const updateExpense = async (id, expenseData) => {
  try {
    const response = await axiosInstance.put(`/expense/${id}`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

// Delete expense
export const deleteExpense = async (id) => {
  try {
    const response = await axiosInstance.delete(`/expense/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Get expense statistics
export const getExpenseStats = async () => {
  try {
    const response = await axiosInstance.get('/expense/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    throw error;
  }
};
