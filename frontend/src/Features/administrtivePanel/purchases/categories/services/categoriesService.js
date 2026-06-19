// categoriesService.js - Servicio para consumir categorías desde backend

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/categories';

export const categoriesService = {
  /**
   * Obtener todas las categorías
   * @returns {Promise<Array>} Array de categorías
   */
  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
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
      const response = await axios.get(`${API_URL}/${id}`);
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
      const response = await axios.get(`${API_URL}/${categoryId}/subcategories`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, error);
      throw error;
    }
  }
};

export default categoriesService;