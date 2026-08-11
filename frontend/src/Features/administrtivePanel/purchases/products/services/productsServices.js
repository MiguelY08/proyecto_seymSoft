import apiClient from '../../../../../setting/apiClient.js';
import { normalizeProduct, normalizeProducts } from '../helpers/productNormalizer.js';

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const toOptionalNumber = (value) => (hasValue(value) ? Number(value) : 0);

const buildBarcodesPayload = (data) => {
  const barcodes = [];

  if (data.codBarras) {
    barcodes.push({
      barcode: data.codBarras,
      barcode_type: 'EAN13',
      stock: Number(data.stock) || 0,
    });
  }

  if (data.codsBarrasExtra?.length > 0) {
    data.codsBarrasExtra.forEach((barcode) => {
      if (barcode?.cod) {
        barcodes.push({
          barcode: barcode.cod,
          barcode_type: 'SKU',
          stock: Number(barcode.stock) || 0,
        });
      }
    });
  }

  return barcodes;
};

export const ProductsService = {
  /**
   * Obtener unidades de medida disponibles
   * @returns {Promise<Array>}
   */
  async listUnitMeasures() {
    const response = await apiClient.get('/products/unit-measures');
    return response.data.data || [];
  },

  /**
   * Obtener todos los productos con filtros opcionales
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Productos normalizados
   */
  async list(filters = {}) {
    const response = await apiClient.get('/products', { params: filters });
    const products = response.data.data || [];
    
    // Normalizar todos los productos
    return normalizeProducts(products);
  },

  /**
   * Obtener un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Producto normalizado
   */
  async findById(id) {
    const response = await apiClient.get(`/products/${id}`);
    const product = response.data.data || null;
    
    // Normalizar el producto
    return product ? normalizeProduct(product) : null;
  },

  /**
   * Crear un nuevo producto
   * @param {Object|FormData} data - Datos del producto
   * @returns {Promise<Object>} Producto creado (normalizado)
   */
  async create(data) {
    if (data instanceof FormData) {
      const response = await apiClient.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return normalizeProduct(response.data.data);
    }

    const formData = new FormData();

    formData.append('nombre', data.nombre);
    formData.append('referencia', data.referencia);
    formData.append('precioDetalle', toOptionalNumber(data.precioDetalle));
    formData.append('precioMayorista', toOptionalNumber(data.precioMayorista));
    formData.append('precioColegas', toOptionalNumber(data.precioColegas));
    formData.append('precioPacas', toOptionalNumber(data.precioPacas));
    if (hasValue(data.supplierPrice)) formData.append('supplierPrice', Number(data.supplierPrice));
    formData.append('ivaPercentage', data.ivaPercentage || 0);
    formData.append('idUnitMeasure', data.idUnitMeasure);
    formData.append('idCategorie', data.id_category || data.idCategorie || 1);
    formData.append('description', data.descripcion || data.description || '');
    formData.append('quantityPerPack', data.cantidadXPaca ? Number(data.cantidadXPaca) : 0);
    formData.append('codBarras', data.codBarras);
    formData.append('stock', Number(data.stock) || 0);
    formData.append('barcodes', JSON.stringify(buildBarcodesPayload(data)));

    if (data.categories !== undefined) {
      formData.append('categories', JSON.stringify(data.categories));
    }

    if (data.subcategories !== undefined) {
      formData.append('subcategories', JSON.stringify(data.subcategories));
    }

    if (data.images?.length > 0) {
      data.images.forEach((img) => {
        formData.append('images', img);
      });
    }

    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return normalizeProduct(response.data.data);
  },

  /**
   * Actualizar un producto existente
   * @param {number} id - ID del producto
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Producto actualizado (normalizado)
   */
  async update(id, data) {
    const formData = new FormData();

    if (data.nombre !== undefined)          formData.append('name', data.nombre);
    if (data.referencia !== undefined)      formData.append('reference', data.referencia);
    if (data.precioDetalle !== undefined)   formData.append('retailPrice', toOptionalNumber(data.precioDetalle));
    if (data.precioMayorista !== undefined) formData.append('wholesalePrice', toOptionalNumber(data.precioMayorista));
    if (data.precioColegas !== undefined)   formData.append('partnerPrice', toOptionalNumber(data.precioColegas));
    if (data.precioPacas !== undefined)     formData.append('bulkPrice', toOptionalNumber(data.precioPacas));
    if (data.supplierPrice !== undefined)   formData.append('supplierPrice', hasValue(data.supplierPrice) ? Number(data.supplierPrice) : '');
    if (data.ivaPercentage !== undefined)   formData.append('ivaPercentage', toOptionalNumber(data.ivaPercentage));

    if (data.retailDiscountPct !== undefined)    formData.append('retailDiscountPct', toOptionalNumber(data.retailDiscountPct));
    if (data.wholesaleDiscountPct !== undefined) formData.append('wholesaleDiscountPct', toOptionalNumber(data.wholesaleDiscountPct));
    if (data.partnerDiscountPct !== undefined)   formData.append('partnerDiscountPct', toOptionalNumber(data.partnerDiscountPct));
    if (data.bulkDiscountPct !== undefined)      formData.append('bulkDiscountPct', toOptionalNumber(data.bulkDiscountPct));

    if (data.idUnitMeasure !== undefined) formData.append('idUnitMeasure', data.idUnitMeasure);

    if (data.idCategorie !== undefined || data.id_category !== undefined) {
      formData.append('idCategorie', data.id_category || data.idCategorie);
    }

    if (data.descripcion !== undefined)   formData.append('description', data.descripcion);
    if (data.cantidadXPaca !== undefined) formData.append('quantityPerPack', Number(data.cantidadXPaca));
    if (data.activo !== undefined)        formData.append('idStatus', data.activo ? 1 : 2);

    formData.append('barcodes', JSON.stringify(buildBarcodesPayload(data)));

    if (data.categories !== undefined) {
      formData.append('categories', JSON.stringify(data.categories));
    }

    if (data.subcategories !== undefined) {
      formData.append('subcategories', JSON.stringify(data.subcategories));
    }

    if (data.images?.length > 0) {
      data.images.forEach((img) => {
        formData.append('images', img);
      });
    }

    const response = await apiClient.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return normalizeProduct(response.data.data);
  },

  /**
   * Eliminar un producto (solo si está inactivo)
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data.success || false;
  },

  /**
   * Cambiar estado de un producto (activo/inactivo)
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Producto con estado actualizado
   */
  async toggleStatus(id) {
    const response = await apiClient.patch(`/products/${id}/toggle`);
    return normalizeProduct(response.data.data);
  },

  /**
   * Obtener productos destacados (primeros N activos)
   * @param {number} limit - Cantidad de productos (default: 8)
   * @returns {Promise<Array>} Productos normalizados
   */
  async getFeatured(limit = 8) {
    try {
      const products = await ProductsService.list({ active: true });
      return products.slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  /**
   * Obtener productos por categoría
   * @param {number} categoryId - ID de la categoría
   * @returns {Promise<Array>} Productos de esa categoría
   */
  async getByCategory(categoryId) {
    try {
      return await ProductsService.list({ categoryId });
    } catch (error) {
      console.error(`Error fetching products by category ${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Buscar productos por nombre/referencia
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Productos que coinciden
   */
  async search(searchTerm) {
    try {
      return await ProductsService.list({ search: searchTerm });
    } catch (error) {
      console.error(`Error searching products with term "${searchTerm}":`, error);
      throw error;
    }
  },

  /**
   * Decrementar stock de productos (implementar cuando esté módulo de ventas)
   * @param {Array} items - Items a decrementar
   */
  async decrementStock(items) {
    void items;
    console.warn('decrementStock: Implementar cuando haya módulo de ventas');
  },

  /**
   * Restaurar stock de productos (implementar cuando esté módulo de ventas)
   * @param {Array} items - Items a restaurar
   */
  async restoreStock(items) {
    void items;
    console.warn('restoreStock: Implementar cuando haya módulo de ventas');
  },
};

export default ProductsService;
