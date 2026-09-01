import api from './api';

export const getSales = async () => {
  return await api.get('/sales');
};
