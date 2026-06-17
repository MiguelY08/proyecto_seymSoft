// Features/administrtivePanel/purchases/nonConformingProducts/components/data/nonConformingService.js
import apiClient from '../../../../../setting/apiClient.js';

// ==========================================
// ENDPOINTS
// ==========================================

const api = {
  getNonConforming: (params) => apiClient.get('/non-conforming-products', { params }),
  getNonConformingById: (id) => apiClient.get(`/non-conforming-products/${id}`),
  createNonConforming: (data) => apiClient.post('/non-conforming-products', data),
  cancelNonConforming: (id, data) => apiClient.patch(`/non-conforming-products/${id}/cancel`, data),
  getProductByBarcode: (barcode) => apiClient.get(`/non-conforming-products/barcode/${barcode}`),
};

// ==========================================
// PRODUCTOS NO CONFORMES
// ==========================================

export const getNonConforming = async ({ page = 1, limit = 13, search = '', startDate = '', endDate = '' }) => {
  try {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
    
    const response = await api.getNonConforming(params);
    const { data, pagination } = response.data;
    
    const mappedData = (data || []).map(report => ({
      id: report.id,
      nombre: report.productName || 'Producto sin nombre',
      codigoBarras: report.barcode || '',
      categoria: report.categoryName || 'Sin categoría',
      cantidadAfectada: report.affected_quantity || 0,
      fechaDeteccion: report.detection_date?.split('T')[0] || report.detection_date || '',
      motivo: report.report_reason || '',
      estado: report.status || 'Activo',
    }));
    
    return {
      data: mappedData,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    };
  } catch (error) {
    console.error('Error en getNonConforming:', error);
    throw error;
  }
};

export const createNonConforming = async (reportData) => {
  try {
    const response = await api.createNonConforming({
      id_barcode: reportData.id_barcode,
      affected_quantity: reportData.affected_quantity,
      report_reason: reportData.report_reason,
      detection_date: reportData.detection_date || new Date().toISOString(),
    });
    
    const report = response.data.data;
    
    return {
      id: report.id,
      nombre: report.productName || 'Producto sin nombre',
      codigoBarras: report.barcode || '',
      categoria: report.categoryName || 'Sin categoría',
      cantidadAfectada: report.affected_quantity || 0,
      fechaDeteccion: report.detection_date?.split('T')[0] || report.detection_date || '',
      motivo: report.report_reason || '',
      estado: report.status || 'Activo',
    };
  } catch (error) {
    console.error('Error en createNonConforming:', error);
    throw error;
  }
};

export const cancelNonConforming = async (id, cancellationReason) => {
  try {
    const response = await api.cancelNonConforming(id, { cancellationReason });
    const report = response.data.data;
    
    return {
      id: report.id,
      nombre: report.productName || 'Producto sin nombre',
      codigoBarras: report.barcode || '',
      categoria: report.categoryName || 'Sin categoría',
      cantidadAfectada: report.affected_quantity || 0,
      fechaDeteccion: report.detection_date?.split('T')[0] || report.detection_date || '',
      motivo: report.report_reason || '',
      estado: report.status || 'Anulado',
    };
  } catch (error) {
    console.error('Error en cancelNonConforming:', error);
    throw error;
  }
};

// ==========================================
// BUSCAR PRODUCTO POR CÓDIGO DE BARRAS
// ==========================================

export const getProductByBarcode = async (barcode) => {
  try {
    const response = await api.getProductByBarcode(barcode);
    const product = response.data.data;
    
    return {
      id_barcode: product.id_barcode,
      id_product: product.id_product,
      nombre: product.productName || 'Producto sin nombre',
      codigoBarras: product.barcode || '',
      categoria: product.categoryName || 'Sin categoría',
      precio: product.price || 0,
      stock: product.stock || 0,
    };
  } catch (error) {
    console.error('Error en getProductByBarcode:', error);
    throw error;
  }
};