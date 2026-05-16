// Features/categories/data/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'Error en la petición';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error desconocido');
    }
  }
);

export const api = {
  // Categorías
  getCategories: () => apiClient.get('/categories'),
  getCategoryById: (id) => apiClient.get(`/categories/${id}`),
  createCategory: (data) => apiClient.post('/categories', data),
  updateCategory: (id, data) => apiClient.patch(`/categories/${id}`, data),
  toggleCategoryStatus: (id) => apiClient.patch(`/categories/${id}/toggle-status`),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),

  // Subcategorías
  createSubcategory: (data) => apiClient.post('/categories/subcategories', data),
  updateSubcategory: (id, data) => apiClient.patch(`/categories/subcategories/${id}`, data),
  deleteSubcategory: (id) => apiClient.delete(`/categories/subcategories/${id}`),
};

export default api;