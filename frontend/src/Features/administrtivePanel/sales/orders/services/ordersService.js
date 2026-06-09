// src/features/orders/services/ordersService.js
// Servicio de pedidos conectado al API mediante apiClient.

import apiClient from '../../../../../setting/apiClient';

const IVA_RATE = 0.19;

export const CAJA_CLIENTE_ID = 0;

export const ESTADOS_LOGISTICOS = {
  EN_PROCESO: 'en proceso',
  LISTO: 'listo',
  CANCELADO: 'cancelado',
};

export const ESTADOS_PAGO = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
};

export const ORIGENES = {
  MANUAL: 'manual',
  WEB: 'web',
};

export const METODOS_PAGO = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  CREDITO: 'Crédito',
  DEVOLUCION: 'Devolución',
};

const unwrap = (response) => {
  const payload = response?.data ?? response;
  return payload?.data ?? payload?.order ?? payload?.pedido ?? payload;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeEstadoLogistico = (value) => {
  const raw = String((value?.name ?? value) || ESTADOS_LOGISTICOS.EN_PROCESO).toLowerCase();
  if (raw.includes('cancel')) return ESTADOS_LOGISTICOS.CANCELADO;
  if (raw.includes('list')) return ESTADOS_LOGISTICOS.LISTO;
  return ESTADOS_LOGISTICOS.EN_PROCESO;
};

const normalizePagoEstado = (value, totalPagado = 0, total = 0) => {
  const raw = String((value?.name ?? value) || '').toLowerCase();
  if (raw.includes('pagad') || raw.includes('paid')) return ESTADOS_PAGO.PAGADO;
  if (raw.includes('pend') || raw.includes('pending')) return ESTADOS_PAGO.PENDIENTE;
  return total > 0 && totalPagado >= total ? ESTADOS_PAGO.PAGADO : ESTADOS_PAGO.PENDIENTE;
};

const normalizeTipoEntrega = (order = {}) => {
  const deliveryType = String(order.deliveryType ?? '').toLowerCase();
  const deliveryAddress = String(order.deliveryAddress ?? order.direccionEntrega ?? '').toLowerCase();
  if (deliveryType.includes('recoge') || deliveryAddress.includes('cliente lo recoge')) return 'recoge';
  return 'domicilio';
};

const normalizePayment = (payment = {}, pedidoId = null) => ({
  id: payment.id ?? payment.paymentId ?? payment.idPayment ?? Date.now(),
  pedidoId: toNumber(payment.pedidoId ?? payment.orderId ?? payment.idOrder ?? pedidoId, pedidoId),
  fechaPago: payment.fechaPago ?? payment.paymentDate ?? payment.createdAt ?? payment.date ?? new Date().toISOString(),
  metodoPago: payment.metodoPago ?? payment.paymentMethod?.name ?? payment.paymentMethod ?? payment.method ?? payment.metodo ?? METODOS_PAGO.EFECTIVO,
  monto: toNumber(payment.monto ?? payment.amount ?? payment.value),
  comprobante: payment.comprobante ?? payment.receipt ?? payment.reference ?? payment.voucher ?? null,
  observaciones: payment.observations ?? payment.observaciones ?? '',
});

const normalizeProduct = (product = {}) => {
  const productData = product.product ?? product;
  const cantidad = toNumber(product.cantidad ?? product.quantity ?? product.qty, 1);
  const precioUnitario = toNumber(
    product.precioUnitario ?? product.unitPrice ?? product.price ?? productData.precioDetalle ?? productData.retailPrice
  );

  return {
    id: toNumber(product.productId ?? product.idProduct ?? productData.productId ?? productData.id ?? product.id),
    detalleId: product.id ?? product.detailId ?? null,
    nombre: product.nombre ?? product.productName ?? product.name ?? productData.nombre ?? productData.name ?? 'Producto sin nombre',
    codBarras: product.codBarras ?? product.barcode ?? productData.codBarras ?? productData.barcode ?? '',
    cantidad,
    precioUnitario,
    subtotal: toNumber(product.subtotal ?? product.total ?? cantidad * precioUnitario),
    iva: toNumber(product.iva ?? product.ivaAmount ?? product.tax),
  };
};

const getPaymentsFromOrder = (order = {}) => (
  order.pagos ?? order.payments ?? order.orderPayments ?? []
).map((payment) => normalizePayment(payment, order.id));

const normalizeOrder = (order = {}) => {
  const productos = (order.productos ?? order.products ?? order.items ?? order.details ?? []).map(normalizeProduct);
  const subtotal = toNumber(
    order.subtotal,
    productos.reduce((sum, product) => sum + product.subtotal, 0)
  );
  const iva = toNumber(order.iva ?? order.tax, subtotal * IVA_RATE);
  const total = toNumber(order.total ?? order.totalAmount, subtotal + iva);
  const pagos = getPaymentsFromOrder(order);
  const totalPagado = toNumber(
    order.paidAmount ?? order.totalPagado,
    pagos.reduce((sum, payment) => sum + payment.monto, 0)
  );
  const id = toNumber(order.id ?? order.orderId ?? order.idOrder);

  return {
    ...order,
    id,
    numeroPedido: String(order.numeroPedido ?? order.orderNumber ?? order.number ?? id),
    clienteId: toNumber(order.clienteId ?? order.clientId ?? order.idClient ?? order.customerId),
    asesorId: toNumber(order.asesorId ?? order.advisorId ?? order.sellerId ?? order.userId, null),
    fechaPedido: order.fechaPedido ?? order.orderDate ?? order.createdAt ?? order.date,
    direccionEntrega: order.direccionEntrega ?? order.deliveryAddress ?? order.address ?? '',
    tipoEntrega: normalizeTipoEntrega(order),
    clienteNombre: order.customer?.name ?? order.clienteNombre ?? order.customerName ?? '',
    clienteTelefono: order.customer?.phone ?? order.clienteTelefono ?? order.customerPhone ?? '',
    clienteEmail: order.customer?.email ?? order.clienteEmail ?? order.customerEmail ?? '',
    clienteDireccion: order.customer?.address ?? '',
    productos,
    pagos,
    subtotal,
    iva: toNumber(order.iva ?? order.ivaAmount ?? order.tax, iva),
    total,
    totalPagado,
    saldoPendiente: toNumber(order.pendingAmount, Math.max(0, total - totalPagado)),
    tieneVenta: Boolean(order.hasSale),
    venta: order.sale ?? null,
    fechaLimitePago: order.paymentDeadline ?? null,
    estadoLogistico: normalizeEstadoLogistico(order.estadoLogistico ?? order.logisticStatus ?? order.status),
    pagoEstado: normalizePagoEstado(order.pagoEstado ?? order.paymentStatus, totalPagado, total),
    origen: order.origen ?? order.origin ?? ORIGENES.MANUAL,
    motivoCancelacion: order.motivoCancelacion ?? order.cancelReason ?? order.cancellationReason ?? null,
  };
};

const buildOrderPayload = (data = {}) => ({
  clienteId: data.clienteId,
  asesorId: data.asesorId,
  direccionEntrega: data.direccionEntrega,
  productos: data.productos,
  estadoLogistico: data.estadoLogistico,
  origen: data.origen ?? ORIGENES.MANUAL,
  motivoCancelacion: data.motivoCancelacion ?? null,
});

const buildCreateOrderPayload = (data = {}) => {
  const isRecoge = data.tipoEntrega === 'recoge' || data.direccionEntrega === 'El cliente lo recoge';

  return {
    idClient: data.clienteId,
    deliveryType: isRecoge ? 'Recibe' : 'Domicilio',
    deliveryAddress: isRecoge ? null : data.direccionEntrega,
    items: (data.productos || []).map((product) => ({
      idProduct: product.id,
      barcode: product.codBarras || product.barcode || '',
      quantity: product.cantidad,
    })),
  };
};

const ORDER_STATUS_IDS = {
  [ESTADOS_LOGISTICOS.EN_PROCESO]: 1,
  [ESTADOS_LOGISTICOS.LISTO]: 2,
  entregado: 3,
  [ESTADOS_LOGISTICOS.CANCELADO]: 4,
};

const PAYMENT_METHOD_IDS = {
  [METODOS_PAGO.TRANSFERENCIA]: 1,
  [METODOS_PAGO.EFECTIVO]: 2,
  [METODOS_PAGO.CREDITO]: 3,
};

const buildUpdateOrderPayload = (data = {}) => {
  const payload = {};
  const isRecoge = data.tipoEntrega === 'recoge' || data.direccionEntrega === 'El cliente lo recoge';

  if (data.clienteId !== undefined) {
    payload.idClient = data.clienteId;
  }

  if (data.tipoEntrega !== undefined || data.direccionEntrega !== undefined) {
    payload.deliveryType = isRecoge ? 'Recibe' : 'Domicilio';
    payload.deliveryAddress = isRecoge ? null : data.direccionEntrega;
  }

  if (data.estadoLogistico !== undefined) {
    payload.idOrderStatus = ORDER_STATUS_IDS[data.estadoLogistico] ?? data.estadoLogistico;
  }

  if (data.productos !== undefined) {
    payload.items = (data.productos || []).map((product) => ({
      idProduct: product.id,
      barcode: product.codBarras || product.barcode || '',
      quantity: product.cantidad,
    }));
  }

  return payload;
};

export const OrdersService = {
  async list(params = {}) {
    const response = await apiClient.get('/orders', { params });
    const payload = unwrap(response);
    const orders = Array.isArray(payload) ? payload : payload?.orders ?? payload?.pedidos ?? [];
    return orders.map(normalizeOrder);
  },

  async findById(id) {
    const response = await apiClient.get(`/orders/${id}`);
    const order = unwrap(response);
    return order ? normalizeOrder(order) : null;
  },

  async create(data) {
    const response = await apiClient.post('/orders', buildCreateOrderPayload(data));
    return normalizeOrder(unwrap(response));
  },

  async update(data) {
    const { id, ...rest } = data;
    const response = await apiClient.put(`/orders/${id}`, buildUpdateOrderPayload(rest));
    return normalizeOrder(unwrap(response));
  },

  canEditProductos(order) {
    if (!order) return false;
    if (order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) return false;
    if (order.pagoEstado === ESTADOS_PAGO.PAGADO) return false;
    return true;
  },

  async updateProductos(orderId, newProductos) {
    const order = await this.findById(orderId);
    if (!order) throw new Error(`Pedido #${orderId} no encontrado.`);
    if (!this.canEditProductos(order)) {
      throw new Error('No se pueden modificar los productos de este pedido.');
    }

    const oldTotal = order.total;
    const totalPagado = await PaymentService.getTotalPagado(orderId);
    const subtotal = newProductos.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    const iva = subtotal * IVA_RATE;
    const newTotal = subtotal + iva;

    const updatedOrder = await this.update({
      ...order,
      id: orderId,
      productos: newProductos,
      subtotal,
      iva,
      total: newTotal,
    });

    return {
      order: updatedOrder,
      excedente: newTotal < oldTotal && totalPagado > newTotal ? totalPagado - newTotal : 0,
      oldTotal,
      newTotal,
    };
  },

  async updateEstadoLogistico(orderId, newEstadoLogistico, motivoCancelacion = null) {
    if (newEstadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) {
      return this.cancel(orderId, motivoCancelacion);
    }

    const current = await this.findById(orderId);
    if (!current) return null;

    return this.update({
      ...current,
      id: orderId,
      estadoLogistico: newEstadoLogistico,
      motivoCancelacion: null,
    });
  },

  async cancel(orderId) {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`);
    return normalizeOrder(unwrap(response));
  },
};

export const PaymentService = {
  async list() {
    const orders = await OrdersService.list();
    return orders.flatMap((order) => order.pagos || []);
  },

  async getByPedidoId(pedidoId) {
    const order = await OrdersService.findById(pedidoId);
    return order?.pagos || [];
  },

  async getTotalPagado(pedidoId) {
    const order = await OrdersService.findById(pedidoId);
    if (!order) return 0;
    if (Number.isFinite(Number(order.totalPagado))) return Number(order.totalPagado);
    return (order.pagos || []).reduce((sum, p) => sum + p.monto, 0);
  },

  async add(pedidoId, { metodoPago, monto, comprobante = null, observations = null }) {
    const order = await OrdersService.findById(pedidoId);
    const paymentNumber = (order?.pagos?.length || 0) + 1;
    const pendingAfter = (order?.saldoPendiente ?? order?.total ?? 0) - monto;
    const response = await apiClient.post(`/orders/${pedidoId}/payments`, {
      idPaymentMethod: PAYMENT_METHOD_IDS[metodoPago] ?? metodoPago,
      amount: monto,
      reference: comprobante || `P${pedidoId}-${String(paymentNumber).padStart(3, '0')}`,
      observations: observations || `Abono ${paymentNumber} - ${pendingAfter <= 0 ? 'Pago completo' : 'Pago parcial'}`,
    });
    const result = unwrap(response);
    const updatedOrder = normalizeOrder(result?.order ?? result);
    const payments = updatedOrder.pagos || [];
    return payments[payments.length - 1] || null;
  },

  async addDevolucion(pedidoId, monto) {
    return this.add(pedidoId, {
      metodoPago: METODOS_PAGO.DEVOLUCION,
      monto: -Math.abs(monto),
      comprobante: null,
    });
  },
};

export const SalesService = {
  async list() {
    const orders = await OrdersService.list();
    return orders
      .filter((order) => order.pagoEstado === ESTADOS_PAGO.PAGADO)
      .map((order) => ({
        id: order.id,
        pedidoId: order.id,
        fechaPago: order.fechaPedido,
        metodoPago: 'Mixto',
        comprobantePago: null,
        montoPagado: order.total,
      }));
  },

  async findById(id) {
    const sales = await this.list();
    return sales.find((sale) => sale.id === id) ?? null;
  },

  async findByPedidoId(pedidoId) {
    const sales = await this.list();
    return sales.find((sale) => sale.pedidoId === pedidoId) ?? null;
  },

  async createFromPedido(pedidoId) {
    return this.findByPedidoId(pedidoId);
  },
};

export default OrdersService;
