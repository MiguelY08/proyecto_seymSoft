import apiClient from '../../../../../setting/apiClient.js';

export const categoriesService = {
  getAll: async () => {
    const response = await apiClient.get('/categories', {
      params: { _t: Date.now() },
    });
    return response.data;
  }
};
