import axiosInstance from './axioInstance';

export const getAdminMetrics = async () => {
    try {
        const response = await axiosInstance.get('/admin/metrics');
        return response.data;
    } catch (error) {
        throw error;
    }
};
