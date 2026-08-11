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

  // Actualizar producto
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
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

// Mapear compra para la lista
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
    maxReturnDate: purchase.maxReturnDate,
  };
};

// Mapear compra para el detalle
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
    const cantidadDisponibleDevolucion = Number(
      detail.returnEligibleQuantity ??
      detail.returnAvailability?.eligibleQuantity ??
      Math.min(
        Number(
          detail.returnAvailableQuantity ??
          detail.returnAvailability?.availableQuantity ??
          cantidadComprada
        ),
        Number(detail.stockAvailable ?? cantidadComprada)
      )
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
      cantidadDevueltaDefinitiva: Number(
        detail.finalReturnedQuantity ??
        detail.returnAvailability?.finalReturnedQuantity ??
        0
      ),
      cantidadReservadaDevolucion: Number(
        detail.returnReservedQuantity ??
        detail.returnAvailability?.reservedQuantity ??
        0
      ),
      stockDisponible: Number(detail.stockAvailable ?? cantidadComprada),
      returnAvailability: {
        ...(detail.returnAvailability ?? {}),
        eligibleQuantity: cantidadDisponibleDevolucion,
      },
      // ========== NUEVOS CAMPOS ==========
      purchaseType: detail.purchaseType || "Unidad",
      quantityPerPack: detail.quantityPerPack || 0,
      stockAdded: detail.stockAdded || cantidadComprada,
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
    maxReturnDate: purchase.maxReturnDate,
  };
};

// ==========================================
// COMPRAS
// ==========================================

export const getAllPurchases = async ({ 
  page = 1, 
  limit = 13, 
  search = '', 
  startDate = '', 
  endDate = '',
  sortBy = 'CREATION_DESC'
}) => {
  try {
    let sortField = 'id_purchase';
    let sortOrder = 'desc';

    switch (sortBy) {
      case 'CREATION_DESC': sortField = 'id_purchase'; sortOrder = 'desc'; break;
      case 'CREATION_ASC': sortField = 'id_purchase'; sortOrder = 'asc'; break;
      case 'DATE_DESC': sortField = 'purchase_date'; sortOrder = 'desc'; break;
      case 'DATE_ASC': sortField = 'purchase_date'; sortOrder = 'asc'; break;
      default: sortField = 'id_purchase'; sortOrder = 'desc';
    }

    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      sortField,
      sortOrder,
    };

    const response = await api.getAllPurchases(params);
    const { data, pagination } = response.data;
    const mappedData = (data || []).map(mapPurchaseToList);

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
        supplierPrice: product.supplierPrice,
        purchaseType: product.purchaseType || "Unidad",
        quantityPerPack: product.quantityPerPack || 0,
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
// ACTUALIZAR PRODUCTO
// ==========================================

export const updateProductPrices = async (productId, prices) => {
  try {
    const payload = {};
    if (prices.supplierPrice !== undefined) payload.precioProveedor = Number(prices.supplierPrice);
    if (prices.retailPrice !== undefined) payload.retailPrice = Number(prices.retailPrice);
    if (prices.wholesalePrice !== undefined) payload.wholesalePrice = Number(prices.wholesalePrice);
    if (prices.partnerPrice !== undefined) payload.partnerPrice = Number(prices.partnerPrice);
    if (prices.bulkPrice !== undefined) payload.bulkPrice = Number(prices.bulkPrice);
    if (prices.quantityPerPack !== undefined) payload.quantityPerPack = Number(prices.quantityPerPack);

    if (Object.keys(payload).length === 0) return null;
    const response = await api.updateProduct(productId, payload);
    return response.data.data;
  } catch (error) {
    console.error(`Error in updateProductPrices(${productId}):`, error);
    throw error;
  }
};

// ==========================================
// VALIDACIÓN DE FACTURA
// ==========================================

export const checkInvoiceExists = async (invoiceNumber) => {
  try {
    const response = await api.getAllPurchases({ 
      search: invoiceNumber,
      limit: 100,
      page: 1
    });
    
    const data = response.data;
    const exists = data.data?.some(
      purchase => purchase.invoiceNumber?.toLowerCase() === invoiceNumber.toLowerCase()
    );
    
    return exists;
  } catch (error) {
    console.error('Error verificando factura:', error);
    return false;
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
      supplierPrice: p.supplierPrice ?? null,
      wholesalePrice: p.wholesalePrice || 0,
      retailPrice: p.retailPrice || 0,
      partnerPrice: p.partnerPrice || 0,
      bulkPrice: p.bulkPrice || 0,
      iva: p.ivaPercentage || 19,
      quantityPerPack: p.quantityPerPack || 0,
    }));
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
};

export const searchProducts = async (searchTerm) => getProducts(searchTerm);

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
      maxReturnPeriod: p.maxReturnPeriod || 0,
    }));
  } catch (error) {
    console.error('Error al cargar proveedores:', error);
    return [];
  }
};
