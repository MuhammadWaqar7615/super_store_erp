import api from './api';

export const getDashboardMetrics = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};
