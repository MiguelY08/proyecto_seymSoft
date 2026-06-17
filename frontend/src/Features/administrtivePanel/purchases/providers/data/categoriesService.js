import apiClient from '../../../../../setting/apiClient.js';

export const categoriesService = {
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  }
};