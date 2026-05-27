import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/products';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Servicio con Axios ───────────────────────────────────────────────────────
export const ProductsService = {

  /**
   * Obtiene todos los productos del backend
   */
  async list(filters = {}) {
    try {
      const response = await apiClient.get('/', { params: filters });
      return response.data.data || [];
    } catch (error) {
      console.error('Error al listar productos:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Busca un producto por id
   */
  async findById(id) {
    try {
      const response = await apiClient.get(`/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error al obtener producto:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Crea un producto nuevo en el backend.
   * Convierte los nombres del frontend al formato del backend.
   */
  async create(data) {
  try {
    // Si es FormData (cuando viene desde el frontend con imágenes)
    if (data instanceof FormData) {
      const response = await apiClient.post('/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data || null;
    }

    // Si no es FormData, construir uno
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('referencia', data.referencia);
    formData.append('precioDetalle', Number(data.precioDetalle));
    formData.append('precioMayorista', Number(data.precioMayorista));
    formData.append('precioColegas', data.precioColegas ? Number(data.precioColegas) : null);
    formData.append('precioPacas', data.precioPacas ? Number(data.precioPacas) : null);
    formData.append('ivaPercentage', data.ivaPercentage || 0);
    formData.append('idUnitMeasure', data.idUnitMeasure || 2);
    formData.append('idCategorie', data.id_category || data.idCategorie || 1);
    formData.append('description', data.descripcion || data.description || null);
    formData.append('quantityPerPack', data.cantidadXPaca ? Number(data.cantidadXPaca) : 0);
    formData.append('codBarras', data.codBarras);
    formData.append('stock', Number(data.stock) || 0);

    // Agregar barcodes adicionales si existen
    if (data.codsBarrasExtra && data.codsBarrasExtra.length > 0) {
      data.codsBarrasExtra.forEach((barcode, idx) => {
        formData.append(`codsBarrasExtra[${idx}]`, barcode.cod);
      });
    }

    // Las imágenes ya deben venir en FormData desde el frontend
    // Sino, agregarlas aquí si existen en data.images

    const response = await apiClient.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || null;
  } catch (error) {
    console.error('Error al crear producto:', error.response?.data || error.message);
    throw error;
  }
},

  /**
   * Actualiza un producto existente en el backend.
   */

  async update(id, data) {
  try {
    // Mapear solo los campos que vienen en data
    const payload = {};
    if (data.nombre !== undefined) payload.name = data.nombre;
    if (data.referencia !== undefined) payload.reference = data.referencia;
    if (data.precioDetalle !== undefined) payload.retailPrice = Number(data.precioDetalle);
    if (data.precioMayorista !== undefined) payload.wholesalePrice = Number(data.precioMayorista);
    if (data.precioColegas !== undefined) payload.partnerPrice = Number(data.precioColegas);
    if (data.precioPacas !== undefined) payload.bulkPrice = Number(data.precioPacas);
    if (data.ivaPercentage !== undefined) payload.ivaPercentage = data.ivaPercentage;
    if (data.idUnitMeasure !== undefined) payload.idUnitMeasure = data.idUnitMeasure;
    if (data.idCategorie !== undefined) payload.idCategorie = data.id_category || data.idCategorie;
    if (data.descripcion !== undefined) payload.description = data.descripcion;
    if (data.cantidadXPaca !== undefined) payload.quantityPerPack = Number(data.cantidadXPaca);
    if (data.activo !== undefined) {
      // Mapear activo a idStatus: true = 1, false = 2
      payload.idStatus = data.activo ? 1 : 2;
    }

    // Mapear barcodes
    if (data.codBarras !== undefined) {
      payload.barcodes = [];
      
      if (data.codBarras) {
        payload.barcodes.push({
          barcode: data.codBarras,
          barcode_type: 'EAN13',
          stock: Number(data.stock) || 0,
        });
      }

      // Agregar barcodes adicionales
      if (data.codsBarrasExtra && data.codsBarrasExtra.length > 0) {
        data.codsBarrasExtra.forEach((barcode) => {
          if (barcode?.cod) {
            payload.barcodes.push({
              barcode: barcode.cod,
              barcode_type: 'SKU',
              stock: Number(barcode.stock) || 0,
            });
          }
        });
      }
    }

    const response = await apiClient.put(`/${id}`, payload);
    return response.data.data || null;
  } catch (error) {
    console.error('Error al actualizar producto:', error.response?.data || error.message);
    throw error;
  }
},

  /**
   * Elimina un producto del backend
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`/${id}`);
      return response.data.success || false;
    } catch (error) {
      console.error('Error al eliminar producto:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Cambia el estado (activo/inactivo) de un producto
   */
  async toggleStatus(id) {
    try {
      const response = await apiClient.patch(`/${id}/toggle`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error al cambiar estado del producto:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Descuenta stock al confirmar una venta
   * (A implementar cuando tengas el módulo de ventas)
   */
  async decrementStock(items) {
    console.warn('decrementStock: Implementar cuando haya módulo de ventas');
  },

  /**
   * Restaura stock al anular una venta
   * (A implementar cuando tengas el módulo de ventas)
   */
  async restoreStock(items) {
    console.warn('restoreStock: Implementar cuando haya módulo de ventas');
  },
};

export default ProductsService;