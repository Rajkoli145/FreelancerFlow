import axiosInstance from './axioInstance';

// Get all clients with optional filters
export const getClients = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/client', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

// Get overall client stats (outstanding amount, etc.)
export const getAllClientsStats = async () => {
  try {
    const response = await axiosInstance.get('/client/stats/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching clients stats:', error);
    throw error;
  }
};

// Get a single client by ID
export const getClientById = async (id) => {
  try {
    const response = await axiosInstance.get(`/client/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
};

// Create a new client
export const createClient = async (clientData) => {
  try {
    const response = await axiosInstance.post('/client', clientData);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

// Update an existing client
export const updateClient = async (id, clientData) => {
  try {
    const response = await axiosInstance.put(`/client/${id}`, clientData);
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

// Delete a client
export const deleteClient = async (id) => {
  try {
    const response = await axiosInstance.delete(`/client/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

// Get client statistics
export const getClientStats = async (id) => {
  try {
    const response = await axiosInstance.get(`/client/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client stats:', error);
    throw error;
  }
};
