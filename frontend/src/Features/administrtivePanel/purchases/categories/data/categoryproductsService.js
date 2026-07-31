// features/categories/data/categoryproductsService.js
import apiClient from '../../../../../setting/apiClient.js';

// ==========================================
// PRODUCTOS POR SUBCATEGORÍA
// ==========================================

/**
 * Verifica si una subcategoría tiene productos asociados
 * @param {number} subcategoryId - ID de la subcategoría
 * @returns {Promise<boolean>} - True si tiene productos, False si no
 */
export const subcategoryHasProducts = async (subcategoryId) => {
  try {
    // Buscar productos que tengan esta subcategoría
    const response = await apiClient.get('/products', { 
      params: { 
        subcategoryId: subcategoryId,
        limit: 1 
      } 
    });
    
    const products = response.data.data || [];
    return products.length > 0;
  } catch (error) {
    console.error('Error al verificar productos de subcategoría:', error);
    // Si hay error, asumir que no tiene productos
    return false;
  }
};

/**
 * Obtiene los productos de una subcategoría
 * @param {number} subcategoryId - ID de la subcategoría
 * @returns {Promise<Array>} - Lista de productos
 */
export const getProductsBySubcategory = async (subcategoryId) => {
  try {
    const response = await apiClient.get('/products', { 
      params: { subcategoryId } 
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener productos por subcategoría:', error);
    return [];
  }
};