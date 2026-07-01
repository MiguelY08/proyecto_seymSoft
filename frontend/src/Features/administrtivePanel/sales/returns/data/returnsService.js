/**
 * Archivo: returnsService.js
 * Servicio de gestión de devoluciones con conexión a API
 */

import apiClient from '../../../../../setting/apiClient.js';

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const API_ENDPOINTS = {
  RETURNS: '/sales-returns',
  RETURN_BY_ID: (id) => `/sales-returns/${id}`,
  CANCEL_RETURN: (id) => `/sales-returns/${id}/cancel`,
  RETURNABLE_SALES: '/sales-returns/returnable-sales',
  PURCHASE_RETURN_INFO: '/sales-returns/purchase-return-info',
  AVAILABLE_INVOICES: '/sales-returns/available-invoices',
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 13,
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Genera un ID único para archivos temporales
 */
const generateTempId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Convierte un archivo a base64 para previsualización
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Prepara un objeto FormData para upload de archivos
 */
const prepareFormData = (data, files = []) => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  files.forEach((file) => {
    if (file instanceof File) {
      formData.append('evidences', file);
    } else if (file.file instanceof File) {
      formData.append('evidences', file.file);
    }
  });
  return formData;
};

/**
 * Maneja errores de la API de manera consistente
 */
const handleApiError = (error, customMessage = 'Error en la operación') => {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const errorMessages = errors.map(e => e.message).join(', ');
    throw new Error(errorMessages);
  }
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    throw new Error('La conexión ha tardado demasiado. Verifica tu conexión a internet.');
  }
  throw new Error(customMessage);
};

// ============================================
// FUNCIONES DE CONSUMO DE API
// ============================================

/**
 * Obtiene todas las devoluciones con paginación y filtros
 */
export const getReturns = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries({ ...DEFAULT_PAGINATION, ...params }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    const response = await apiClient.get(`${API_ENDPOINTS.RETURNS}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error al obtener las devoluciones');
  }
};

/**
 * Obtiene todas las devoluciones (alias de getReturns)
 */
export const getAllReturns = async (params = {}) => {
  return getReturns(params);
};

/**
 * Obtiene una devolución específica por su ID
 */
export const getReturnById = async (id) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.RETURN_BY_ID(id));
    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Error al obtener la devolución');
  }
};

/**
 * Obtiene las ventas disponibles para devolución de un cliente
 */
export const getReturnableSales = async (clientId) => {
  try {
    if (!clientId) {
      throw new Error('El ID del cliente es obligatorio');
    }
    const response = await apiClient.get(`${API_ENDPOINTS.RETURNABLE_SALES}?clientId=${clientId}`);
    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Error al obtener las ventas disponibles');
  }
};

/**
 * Obtiene todas las facturas disponibles para devolución
 */
export const getAvailableInvoices = async (search = '') => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.AVAILABLE_INVOICES, {
      params: { search },
      timeout: 10000
    });
    
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    
    return [];
    
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return [];
    }
    
    if (error.response?.status === 500) {
      return [];
    }
    
    throw new Error('Error al obtener las facturas disponibles');
  }
};

/**
 * Obtiene los detalles completos de una factura por su número
 */
export const getInvoiceDetails = async (invoiceNumber) => {
  try {
    const invoices = await getAvailableInvoices(invoiceNumber);
    const invoice = invoices.find(inv => String(inv.invoiceNumber) === String(invoiceNumber).trim());
    if (!invoice) {
      throw new Error(`No se encontró la factura #${invoiceNumber}`);
    }
    return invoice;
  } catch (error) {
    throw new Error(error.message || 'Error al obtener detalles de la factura');
  }
};

/**
 * Crea una nueva devolución
 */
// frontend/src/Features/administrativePanel/sales/returns/data/returnsService.js

export const createReturn = async (returnData, evidenceFiles = []) => {
  try {
    let response;
    if (evidenceFiles && evidenceFiles.length > 0) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(returnData));
      
      evidenceFiles.forEach((file) => {
        formData.append('evidences', file);
      });
      
      response = await apiClient.post('/sales-returns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await apiClient.post('/sales-returns', returnData);
    }
    
    return response.data.data;
  } catch (error) {
    // ✅ Capturar error de multer (archivo muy grande)
    const errorMessage = error.response?.data?.message || error.message || '';
    
    if (errorMessage.includes('demasiado grande') || 
        errorMessage.includes('tamaño máximo') ||
        errorMessage.includes('LIMIT_FILE_SIZE')) {
      throw new Error('❌ La imagen es demasiado grande. El tamaño máximo permitido es 50MB.');
    }
    
    if (errorMessage.includes('imagen no es válida') || 
        errorMessage.includes('válida')) {
      throw new Error(errorMessage);
    }
    
    throw error;
  }
};
/**
 * Actualiza una devolución existente
 */
export const updateReturn = async (id, updateData, evidenceFiles = []) => {
  try {
    let response;
    if (evidenceFiles && evidenceFiles.length > 0) {
      const formData = prepareFormData(updateData, evidenceFiles);
      response = await apiClient.put(API_ENDPOINTS.RETURN_BY_ID(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await apiClient.put(API_ENDPOINTS.RETURN_BY_ID(id), updateData);
    }
    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Error al actualizar la devolución');
  }
};

/**
 * Anula una devolución
 */
// ============================================
// CANCELAR DEVOLUCIÓN
// ============================================

export const cancelReturn = async (id, cancellationReason) => {
  try {
    if (!cancellationReason?.trim() || cancellationReason.trim().length < 10) {
      throw new Error('El motivo de anulación debe tener al menos 10 caracteres');
    }
    
    const response = await apiClient.patch(`/sales-returns/${id}/cancel`, {
      cancellationReason: cancellationReason.trim()
    });
    
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Error al anular la devolución';
    throw new Error(message);
  }
};

/**
 * Elimina una devolución (solo por compatibilidad)
 */
export const deleteReturn = async () => {
  try {
    throw new Error('Las devoluciones no se eliminan, se anulan. Usa cancelReturn en su lugar.');
  } catch (error) {
    return handleApiError(error, 'Error al eliminar la devolución');
  }
};

// ============================================
// GESTIÓN DE EVIDENCIAS
// ============================================

export const prepareEvidenceForUpload = (evidenceFiles = [], description = '') => {
  if (!evidenceFiles || evidenceFiles.length === 0) {
    return { files: [], metadata: [] };
  }
  const files = evidenceFiles.filter(file => file instanceof File).map(file => file);
  const metadata = evidenceFiles.filter(file => file instanceof File).map(file => ({
    name: file.name,
    type: file.type,
    size: file.size,
    description: description || '',
  }));
  return { files, metadata };
};

export const saveEvidence = async (returnId, files, description = '') => {
  try {
    const fileArray = files instanceof FileList ? Array.from(files) : files;
    const validFiles = fileArray.filter(file => file instanceof File);
    const metadata = await Promise.all(
      validFiles.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          id: generateTempId(),
          name: file.name,
          type: file.type,
          size: file.size,
          base64: base64,
          uploadedAt: new Date().toISOString(),
          description: description,
          file: file,
        };
      })
    );
    return metadata;
  } catch (error) {
    throw new Error('Error al procesar las evidencias');
  }
};

export const deleteEvidence = async (evidenceId) => {
  try {
    const response = await apiClient.delete(`/sales-returns/evidence/${evidenceId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al eliminar la evidencia');
  }
};

export const getEvidencesByReturnId = async (returnId) => {
  try {
    const returnData = await getReturnById(returnId);
    return returnData?.evidences || [];
  } catch (error) {
    return [];
  }
};

// ============================================
// DEVOLUCIÓN DE COMPRA
// ============================================

export const getPurchaseReturnInfo = async (
  idBarcode,
  saleReturnId,
  saleReturnDetailId
) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.PURCHASE_RETURN_INFO, {
      params: { idBarcode, saleReturnId, saleReturnDetailId }
    });
    return response.data.data;
  } catch (error) {
    throw new Error('Error al obtener información de devolución de compra');
  }
};

export const resolveDefectiveProduct = async (
  saleReturnId,
  saleReturnDetailId,
  resolution
) => {
  try {
    const response = await apiClient.post(
      `/sales-returns/${saleReturnId}/details/${saleReturnDetailId}/defective-resolution`,
      resolution
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      'No fue posible completar la gestión del producto defectuoso'
    );
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getReturnStatusInfo = (status) => {
  const statusMap = {
    'En Proceso': { label: 'En Proceso', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⏳' },
    'Procesada': { label: 'Procesada', color: 'bg-green-100 text-green-700 border-green-300', icon: '✅' },
    'Anulado': { label: 'Anulado', color: 'bg-red-100 text-red-600 border-red-300', icon: '❌' },
  };
  return statusMap[status] || statusMap['En Proceso'];
};

export const getProductStatesForMethod = (method) => {
  const statesMap = {
    'Reemplazo': ['Pend. Envío', 'Pend. Reemplazo', 'Entregado', 'Listo'],
    'Reembolso': ['Pend. Envío', 'Pend. Reembolso', 'Aprobada'],
    'Saldo a favor': ['Pend. Envío', 'Aprobada'],
  };
  return statesMap[method] || ['Pendiente'];
};

export const getInitialStateForMethod = (method) => {
  const initialMap = {
    'Reemplazo': 'Pend. Envío',
    'Reembolso': 'Pend. Envío',
    'Saldo a favor': 'Pend. Envío',
  };
  return initialMap[method] || 'Pendiente';
};

export const calculateGeneralStatus = (details = []) => {
  if (!details || details.length === 0) return 'En Proceso';
  const completedStatuses = ['Aprobada', 'Entregado', 'Listo', 'Procesada'];
  const pendingStatuses = ['Pendiente', 'Pend. Envío', 'Pend. Reemplazo', 'Pend. Reembolso', 'En Proceso'];
  const cancelledStatuses = ['Anulado'];
  const allCompleted = details.every(detail => completedStatuses.includes(detail.estado));
  const hasPending = details.some(detail => pendingStatuses.includes(detail.estado));
  const allCancelled = details.every(detail => cancelledStatuses.includes(detail.estado));
  if (allCancelled) return 'Anulado';
  if (allCompleted) return 'Procesada';
  if (hasPending) return 'En Proceso';
  return 'En Proceso';
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  getReturns,
  getAllReturns,
  getReturnById,
  getReturnableSales,
  getAvailableInvoices,
  getInvoiceDetails,
  createReturn,
  updateReturn,
  cancelReturn,
  deleteReturn,
  saveEvidence,
  deleteEvidence,
  getEvidencesByReturnId,
  getPurchaseReturnInfo,
  resolveDefectiveProduct,
  fileToBase64,
  getReturnStatusInfo,
  getProductStatesForMethod,
  getInitialStateForMethod,
  calculateGeneralStatus,
};
