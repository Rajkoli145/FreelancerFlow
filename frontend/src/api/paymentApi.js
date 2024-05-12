import axiosInstance from './axioInstance';

// Create a new payment
export const createPayment = async (paymentData) => {
  const response = await axiosInstance.post('/payment', paymentData);
  return response.data;
};

// Get all payments
export const getPayments = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.invoiceId) params.append('invoiceId', filters.invoiceId);
  if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
  
  const response = await axiosInstance.get(`/payment?${params.toString()}`);
  return response.data;
};

// Get single payment by ID
export const getPaymentById = async (id) => {
  const response = await axiosInstance.get(`/payment/${id}`);
  return response.data;
};

// Delete payment
export const deletePayment = async (id) => {
  const response = await axiosInstance.delete(`/payment/${id}`);
  return response.data;
};

// Get all payments for a specific invoice
export const getInvoicePayments = async (invoiceId) => {
  const response = await axiosInstance.get(`/payment/invoice/${invoiceId}`);
  return response.data;
};
