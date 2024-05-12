import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axioInstance';

/**
 * Custom hook for making API requests with loading and error states
 * @param {string} url - The API endpoint
 * @param {Object} options - Fetch options
 */
export const useFetch = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(url, options);
            setData(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(options)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

export default useFetch;
