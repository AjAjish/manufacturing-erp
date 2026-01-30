import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunc(...args);
      setData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.detail || 'An error occurred';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, execute };
}