import apiClient from '../../../../../setting/apiClient';

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0';

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (isoString) => {
  if (!isoString) return '';

  const date = new Date(isoString);
  return Number.isNaN(date.getTime())
    ? isoString
    : date.toLocaleDateString('es-CO');
};

const getSaleId = (sale) =>
  sale?.idSale ?? sale?.idVending ?? sale?.id_vending ?? sale?.id ?? '';

const getSaleDate = (sale) =>
  sale?.saleDate ?? sale?.fechaPago ?? sale?.createdAt ?? sale?.creationDate ?? sale?.date ?? '';

const getSaleOrder = (sale) =>
  sale?.order ?? sale?.pedido ?? sale?.salesOrder ?? sale?.relatedOrder ?? null;

const getSaleClient = (sale, order) =>
  sale?.client ?? sale?.cliente ?? order?.client ?? order?.cliente ?? order?.customer ?? null;

const getSaleSeller = (sale, order) =>
  sale?.seller ??
  sale?.vendedor ??
  sale?.advisor ??
  sale?.employee ??
  order?.seller ??
  order?.asesor ??
  null;

const getSaleStatus = (sale) =>
  sale?.status?.nameStatus ??
  sale?.saleStatus?.nameStatus ??
  sale?.nameStatus ??
  sale?.estado ??
  sale?.status ??
  '-';

const getSaleType = (sale) =>
  sale?.type?.saleTypeName ??
  sale?.saleType?.saleTypeName ??
  sale?.saleTypeName ??
  sale?.vendingType ??
  '';

const getSaleTotal = (sale, order) =>
  Number(sale?.total ?? sale?.totalSale ?? sale?.amount ?? order?.total ?? 0);

const mapSaleItems = (sale, order) => {
  const items =
    sale?.items ??
    sale?.details ??
    sale?.products ??
    order?.items ??
    order?.products ??
    order?.details ??
    [];

  return items.map((item) => {
    const product = item.product ?? item.producto ?? item;
    const precioUnitario = Number(
      item.precioUnitario ??
      item.unitPrice ??
      product.precioDetalle ??
      product.retailPrice ??
      0
    );
    const cantidad = Number(item.cantidad ?? item.quantity ?? 1);

    return {
      product: {
        id: product.id ?? product.idProduct ?? product.id_producto ?? '',
        nombre: product.nombre ?? product.name ?? product.productName ?? 'Producto sin nombre',
        precioDetalle: precioUnitario,
      },
      cantidad,
      descripcion: item.descripcion ?? item.description ?? '',
    };
  });
};

const getPaymentMethod = (sale) => {
  if (sale?.metodoPago || sale?.paymentMethod || sale?.paymentSummary) {
    return sale.metodoPago ?? sale.paymentMethod ?? sale.paymentSummary;
  }

  const names = [
    ...new Set(
      (sale?.paymentMethods ?? [])
        .map((item) => item.paymentMethod?.namePaymentMethod)
        .filter(Boolean)
    ),
  ];

  if (names.length === 0) return '-';
  return names.length === 1 ? names[0] : 'Mixto';
};

const getPaymentAmounts = (sale) => {
  const amounts = {};

  (sale?.paymentMethods ?? []).forEach((item) => {
    const name = item.paymentMethod?.namePaymentMethod;
    if (!name) return;

    amounts[name] = (amounts[name] ?? 0) + Number(item.amount ?? 0);
  });

  return amounts;
};

const mapSaleFromApi = (sale) => {
  const order = getSaleOrder(sale);
  const client = getSaleClient(sale, order);
  const seller = getSaleSeller(sale, order);
  const id = getSaleId(sale);
  const total = getSaleTotal(sale, order);

  return {
    ...sale,
    id,
    factura: String(sale?.invoiceNumber ?? sale?.factura ?? id),
    fecha: formatDate(getSaleDate(sale)),
    clienteId: sale?.idClient ?? sale?.clienteId ?? order?.clienteId ?? client?.id ?? client?.idClient,
    vendedorId:
      sale?.idEmployee ??
      sale?.idSeller ??
      sale?.vendedorId ??
      order?.asesorId ??
      seller?.idEmployee ??
      seller?.id ??
      seller?.idUser,
    cliente: client?.user?.fullName ?? client?.fullName ?? client?.name ?? client?.nombre ?? sale?.clientName ?? '-',
    vendedor: seller?.user?.fullName ?? seller?.fullName ?? seller?.name ?? seller?.nombre ?? sale?.sellerName ?? '-',
    metodoPago: getPaymentMethod(sale),
    estado: getSaleStatus(sale),
    tipoVenta: getSaleType(sale),
    entrega: order?.deliveryType ?? order?.tipoEntrega ?? order?.direccionEntrega ?? sale?.delivery ?? '-',
    direccion: order?.deliveryAddress ?? order?.direccionEntrega ?? sale?.direccion ?? '',
    items: mapSaleItems(sale, order),
    total: formatCurrency(total),
    totalNumerico: total,
    registradoDesde: formatDate(order?.orderDate ?? order?.fechaPedido ?? order?.createdAt ?? sale?.createdAt),
    paymentAmounts: sale?.paymentAmounts ?? getPaymentAmounts(sale),
    motivoAnulacion: sale?.annulmentReason ?? sale?.motivoAnulacion ?? order?.motivoCancelacion ?? '',
    fechaAnulacion: formatDate(sale?.annulmentDate ?? sale?.fechaAnulacion ?? ''),
    pedidoId: sale?.idOrder ?? sale?.pedidoId ?? order?.id ?? order?.idOrder,
    numeroPedido: order?.numeroPedido ?? order?.orderNumber ?? order?.idOrder ?? '',
  };
};

const mapSalesResponse = (payload) => ({
  sales: (payload?.data ?? []).map(mapSaleFromApi),
  type: payload?.type ?? null,
  pagination: payload?.pagination ?? DEFAULT_PAGINATION,
});

const getCreatedSaleFromPayload = (payload) =>
  payload?.data?.sale ?? payload?.data ?? null;

const formatErrorDetail = (detail) => {
  if (!detail) return '';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.message ?? item?.msg ?? item)
      .filter(Boolean)
      .join(' ');
  }
  if (typeof detail === 'object') {
    return Object.values(detail)
      .flat()
      .map((item) => item?.message ?? item?.msg ?? item)
      .filter(Boolean)
      .join(' ');
  }
  return '';
};

const getErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data;
  const detail =
    formatErrorDetail(responseData?.errors) ||
    formatErrorDetail(responseData?.details) ||
    formatErrorDetail(responseData?.data);

  return [responseData?.message, detail].filter(Boolean).join(' ') || error?.message || fallback;
};

export const SalesServices = {
  async getMetrics() {
    try {
      const response = await apiClient.get('/vendings/metrics');
      return response.data.data;
    } catch (error) {
      console.error('Error en getMetrics():', error);
      throw new Error(getErrorMessage(error, 'No se pudieron obtener las metricas de ventas.'));
    }
  },

  async getAll(params = {}) {
    try {
      const response = await apiClient.get('/vendings', { params });
      return mapSalesResponse(response.data);
    } catch (error) {
      console.error('Error en getAll():', error);
      throw new Error(getErrorMessage(error, 'No se pudieron obtener las ventas.'));
    }
  },

  async list(params = {}) {
    return this.getAll(params);
  },

  async getManual(params = {}) {
    try {
      const response = await apiClient.get('/vendings/manual', { params });
      return mapSalesResponse(response.data);
    } catch (error) {
      console.error('Error en getManual():', error);
      throw new Error(getErrorMessage(error, 'No se pudieron obtener las ventas manuales.'));
    }
  },

  async getDirect(params = {}) {
    try {
      const response = await apiClient.get('/vendings/direct', { params });
      return mapSalesResponse(response.data);
    } catch (error) {
      console.error('Error en getDirect():', error);
      throw new Error(getErrorMessage(error, 'No se pudieron obtener las ventas directas.'));
    }
  },

  async getWeb(params = {}) {
    try {
      const response = await apiClient.get('/vendings/web', { params });
      return mapSalesResponse(response.data);
    } catch (error) {
      console.error('Error en getWeb():', error);
      throw new Error(getErrorMessage(error, 'No se pudieron obtener las ventas web.'));
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(`/vendings/${id}`);
      return response.data.data ? mapSaleFromApi(response.data.data) : null;
    } catch (error) {
      console.error(`Error en getById(${id}):`, error);
      throw new Error(getErrorMessage(error, 'No se pudo obtener la venta.'));
    }
  },

  async create(vendingType, payload) {
    try {
      const response = await apiClient.post(`/vendings/${vendingType}`, payload);
      const sale = getCreatedSaleFromPayload(response.data);
      return sale ? mapSaleFromApi(sale) : null;
    } catch (error) {
      console.error(`Error en create(${vendingType}):`, error);
      console.error('Detalle create vending:', error?.response?.data);
      throw new Error(getErrorMessage(error, 'No se pudo crear la venta.'));
    }
  },

  async update(saleId, payload) {
    try {
      const response = await apiClient.put(`/vendings/${saleId}`, payload);
      return response.data.data ? mapSaleFromApi(response.data.data) : null;
    } catch (error) {
      console.error(`Error en update(${saleId}):`, error);
      throw new Error(getErrorMessage(error, 'No se pudo actualizar la venta.'));
    }
  },

  async anular(saleId, motivo = '') {
    try {
      const response = await apiClient.post(`/vendings/${saleId}/annular`, {
        annulmentReason: motivo,
      });

      const sale = response.data?.data?.sale;

      return sale
        ? {
            ...mapSaleFromApi(sale),
            annulmentReason: response.data?.data?.annulmentReason ?? motivo,
            motivoAnulacion: response.data?.data?.annulmentReason ?? motivo,
          }
        : null;
    } catch (error) {
      console.error(`Error en anular(${saleId}):`, error);
      throw new Error(getErrorMessage(error, 'No se pudo anular la venta.'));
    }
  },
};

export default SalesServices;
