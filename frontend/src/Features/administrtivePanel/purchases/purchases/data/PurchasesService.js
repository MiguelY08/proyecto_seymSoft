// features/administrtivePanel/purchases/purchases/data/purchasesApi.js
import apiClient from '../../../../../setting/apiClient.js';

// ==========================================
// ENDPOINTS
// ==========================================

const api = {
  // Supplier Purchases (Compras a proveedores)
  getAllPurchases: (params) => apiClient.get('/supplier-purchases', { params }),
  getPurchaseById: (id) => apiClient.get(`/supplier-purchases/${id}`),
  createPurchase: (data) => apiClient.post('/supplier-purchases', data),
  annulPurchase: (id, data) => apiClient.patch(`/supplier-purchases/${id}/annul`, data),

  // Productos (para el formulario de creación)
  getProducts: (params) => apiClient.get('/products', { params }),
  getProductByBarcode: (barcode) => apiClient.get(`/products/barcode/${barcode}`),

  // Proveedores (para el formulario de creación)
  getProviders: (params) => apiClient.get('/providers', { params }),
};

// ==========================================
// CONVERSIÓN DE ESTADOS
// ==========================================

const mapStatusFromBackend = (statusId, statusName) => {
  if (statusName) {
    if (statusName === "Completada") return "Completada";
    if (statusName === "Proc. devolución") return "Proc. devolución";
    if (statusName === "Anulada") return "Anulada";
    return statusName;
  }
  if (statusId === 1) return "Completada";
  if (statusId === 2) return "Proc. devolución";
  if (statusId === 3) return "Anulada";
  return "Completada";
};

// Mapear compra para la lista (usando totalQuantity del backend)
export const mapPurchaseToList = (purchase) => {
  if (!purchase) return null;

  return {
    id: purchase.id,
    numeroFacturacion: purchase.invoiceNumber,
    fechaCompra: purchase.purchaseDate?.split('T')[0] || purchase.purchaseDate,
    proveedor: purchase.providerName,
    cantidadProductos: purchase.totalQuantity || 0,
    precioTotal: purchase.totalAmount || 0,
    estado: mapStatusFromBackend(purchase.statusId, purchase.status),
    maxReturnDate: purchase.maxReturnDate,  // ← FECHA MÁXIMA DE DEVOLUCIÓN
  };
};

// Mapear compra para el detalle (con productos)
export const mapPurchaseToFrontend = (purchase) => {
  if (!purchase) return null;

  const details = purchase.details || [];
  const cantidadProductos = details.reduce((sum, d) => sum + (d.quantity || 0), 0);

  const productos = details.map(detail => {
    const cantidadComprada = Number(
      detail.purchasedQuantity ??
      detail.returnAvailability?.purchasedQuantity ??
      detail.quantity ??
      0
    );
    const cantidadReservadaDevolucion = Number(
      detail.returnReservedQuantity ??
      detail.returnAvailability?.reservedQuantity ??
      0
    );
    const cantidadDevueltaDefinitiva = Number(
      detail.finalReturnedQuantity ??
      detail.returnAvailability?.finalReturnedQuantity ??
      0
    );
    const cantidadDisponibleDevolucion = Number(
      detail.returnAvailableQuantity ??
      detail.returnAvailability?.availableQuantity ??
      cantidadComprada
    );

    return {
      id: detail.id,
      idPurchase: purchase.id,
      idPurchaseDetail: detail.id,
      purchaseDetailId: detail.id,
      idBarcode: detail.idBarcode,
      barcodeId: detail.idBarcode,
      idProduct: detail.productId,
      productId: detail.productId,
      nombre: detail.productName || 'Producto sin nombre',
      codigoBarras: detail.barcode || '',
      cantidad: cantidadComprada,
      cantidadComprada,
      cantidadDisponibleDevolucion,
      cantidadDevueltaDefinitiva,
      cantidadReservadaDevolucion,
      returnAvailability: {
        purchasedQuantity: cantidadComprada,
        reservedQuantity: cantidadReservadaDevolucion,
        finalReturnedQuantity: cantidadDevueltaDefinitiva,
        availableQuantity: cantidadDisponibleDevolucion,
      },
      valorUnit: detail.netUnitPrice || detail.grossUnitPrice || 0,
      iva: detail.taxPercentage || 0,
      ivaValor: detail.ivaSubtotal || 0,
      subtotal: detail.netSubtotal || detail.grossSubtotal || 0,
      total: detail.netSubtotal || detail.grossSubtotal || 0,
      codigosExtra: detail.extraBarcodes || [],
    };
  });

  return {
    id: purchase.id,
    numeroFacturacion: purchase.invoiceNumber,
    fechaCompra: purchase.purchaseDate?.split('T')[0] || purchase.purchaseDate,
    proveedor: purchase.providerName,
    cantidadProductos,
    precioTotal: purchase.totalAmount || 0,
    estado: mapStatusFromBackend(purchase.statusId, purchase.status),
    ivaTotal: details.reduce((sum, d) => sum + (d.ivaSubtotal || 0), 0),
    motivoAnulacion: purchase.cancellationReason || details.find(d => d.cancellationReason)?.cancellationReason,
    productos,
    maxReturnDate: purchase.maxReturnDate,  // ← FECHA MÁXIMA DE DEVOLUCIÓN
  };
};

// ==========================================
// COMPRAS
// ==========================================

export const getAllPurchases = async ({ page = 1, limit = 13, search = '', startDate = '', endDate = '' }) => {
  try {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    console.log('📡 Fetching purchases with params:', params);

    const response = await api.getAllPurchases(params);
    console.log('📦 API Response:', response.data);

    const { data, pagination } = response.data;
    const mappedData = (data || []).map(mapPurchaseToList);
    console.log('✅ Mapped purchases:', mappedData);

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
    console.error('❌ Error in getAllPurchases:', error);
    throw error;
  }
};

export const getPurchaseById = async (id) => {
  try {
    const response = await api.getPurchaseById(id);
    return mapPurchaseToFrontend(response.data.data);
  } catch (error) {
    console.error(`Error in getPurchaseById(${id}):`, error);
    throw error;
  }
};

export const createPurchase = async (purchaseData) => {
  try {
    const payload = {
      invoiceNumber: purchaseData.numeroFacturacion,
      purchaseDate: purchaseData.fechaCompra,
      idProvider: purchaseData.idProvider,
      details: purchaseData.productos.map(product => ({
        idProduct: product.idProduct,
        quantity: product.cantidad,
        extraBarcodes: product.codigosExtra || [],
      })),
    };

    const response = await api.createPurchase(payload);
    return mapPurchaseToFrontend(response.data.data);
  } catch (error) {
    console.error('Error in createPurchase:', error);
    throw error;
  }
};

export const annulPurchase = async (id, motivo) => {
  try {
    const response = await api.annulPurchase(id, { cancellationReason: motivo });
    return mapPurchaseToFrontend(response.data.data);
  } catch (error) {
    console.error(`Error in annulPurchase(${id}):`, error);
    throw error;
  }
};

// ==========================================
// PRODUCTOS (para el formulario)
// ==========================================

export const getProducts = async (searchTerm = '') => {
  try {
    const response = await api.getProducts({ search: searchTerm, limit: 100 });
    const products = response.data.data || [];
    return products.map(p => ({
      id: p.id,
      nombre: p.name,
      codigoBarras: p.barcodes?.[0]?.barcode || '',
      proveedor: p.providerName || '',
      valorUnit: p.wholesalePrice || 0,
      iva: p.ivaPercentage || 19,
    }));
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
};

export const searchProducts = async (searchTerm) => {
  return getProducts(searchTerm);
};

// ==========================================
// PROVEEDORES (para el formulario)
// ==========================================

export const getProviders = async () => {
  try {
    const response = await api.getProviders({ limit: 100 });
    const providers = response.data.data || [];
    return providers.map(p => ({
      id: p.id,
      nombre: p.fullName || `${p.nameProvider} ${p.lastname || ''}`.trim(),
      documento: p.documentNumber,
      maxReturnPeriod: p.maxReturnPeriod || 0,  // ← PLAZO DE DEVOLUCIÓN EN DÍAS
    }));
  } catch (error) {
    console.error('Error al cargar proveedores:', error);
    return [];
  }
};
