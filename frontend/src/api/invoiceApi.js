import axiosInstance from './axioInstance';

/**
 * Get all invoices
 * @param {Object} params - Query parameters
 */
export const getInvoices = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/invoice', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get a single invoice by ID
 * @param {string} id - Invoice ID
 */
export const getInvoiceById = async (id) => {
  try {
    const response = await axiosInstance.get(`/invoice/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create a new invoice
 * @param {Object} invoiceData - Invoice data
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await axiosInstance.post('/invoice', invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update an existing invoice
 * @param {string} id - Invoice ID
 * @param {Object} invoiceData - Updated invoice data
 */
export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await axiosInstance.put(`/invoice/${id}`, invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete an invoice
 * @param {string} id - Invoice ID
 */
export const deleteInvoice = async (id) => {
  try {
    const response = await axiosInstance.delete(`/invoice/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark invoice as paid
 * @param {string} id - Invoice ID
 */
export const markAsPaid = async (id) => {
  try {
    const response = await axiosInstance.put(`/invoice/${id}/paid`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Download invoice PDF
 * @param {string} id - Invoice ID
 */
export const downloadInvoicePDF = async (id) => {
  try {
    const response = await axiosInstance.get(`/invoice/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get invoice statistics
 */
export const getInvoiceStats = async () => {
  try {
    const response = await axiosInstance.get('/invoice/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
