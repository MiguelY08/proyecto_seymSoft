// categoriesService.js - Servicio para consumir categorías desde backend

import apiClient from '../../../../../setting/apiClient.js';

export const categoriesService = {
  /**
   * Obtener todas las categorías
   * @returns {Promise<Array>} Array de categorías
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Obtener una categoría por ID
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object>} Objeto de categoría
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener subcategorías de una categoría
   * @param {number} categoryId - ID de la categoría
   * @returns {Promise<Array>} Array de subcategorías
   */
  getSubcategories: async (categoryId) => {
    try {
      const category = await categoriesService.getById(categoryId);
      return category?.subcategories || [];
    } catch (error) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, error);
      throw error;
    }
  },

  getAllWithSubcategories: async () => {
    const categories = await categoriesService.getAll();

    return Promise.all(
      categories.map(async (category) => {
        if (Array.isArray(category.subcategories)) return category;

        try {
          const detail = await categoriesService.getById(category.id);
          return {
            ...category,
            ...detail,
            subcategories: detail?.subcategories || [],
          };
        } catch {
          return { ...category, subcategories: [] };
        }
      })
    );
  },
};

export default categoriesService;
