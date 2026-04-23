// src/features/orders/services/ordersService.js
// Servicio para gestión de Pedidos, Pagos y Ventas usando localStorage.
// Refactorizado según nuevas reglas de negocio:
// - Pedido tiene dos dimensiones de estado: logístico y de pago.
// - Pagos parciales permitidos; la Venta se genera al completar el pago.
// - Cliente y asesor referenciados por ID.
// - Origen del pedido: 'manual' (asesor) o 'web'.
// - Edición de productos con validación de estados y manejo de excedentes.

import ProductsService from '../../../purchases/products/services/productsServices';

// ----------------------------------------------------------------------
// Tipos de datos (JSDoc)
// ----------------------------------------------------------------------

/**
 * @typedef {Object} OrderProduct
 * @property {number} id - ID del producto
 * @property {string} nombre - Nombre descriptivo
 * @property {number} cantidad - Cantidad solicitada
 * @property {number} precioUnitario - Precio unitario al momento del pedido
 * @property {number} subtotal - cantidad * precioUnitario
 */

/**
 * @typedef {Object} Order
 * @property {number} id - Identificador único del pedido
 * @property {string} numeroPedido - Número legible (generalmente igual al id)
 * @property {number} clienteId - ID del cliente (usuario con es_cliente=true)
 * @property {number} asesorId - ID del usuario que registró el pedido
 * @property {string} fechaPedido - Fecha de creación (ISO 8601)
 * @property {string} direccionEntrega - Dirección de entrega
 * @property {OrderProduct[]} productos - Líneas del pedido
 * @property {number} subtotal - Suma de subtotales de productos
 * @property {number} iva - IVA calculado (19%)
 * @property {number} total - subtotal + iva
 * @property {'en proceso'|'listo'|'cancelado'} estadoLogistico - Estado de preparación
 * @property {'pendiente'|'pagado'} pagoEstado - Estado financiero
 * @property {'manual'|'web'} origen - Cómo se generó el pedido
 * @property {string|null} motivoCancelacion - Razón de cancelación
 */

/**
 * @typedef {Object} Payment
 * @property {number} id - Identificador único del pago
 * @property {number} pedidoId - ID del pedido asociado
 * @property {string} fechaPago - Fecha del pago (ISO 8601)
 * @property {'Efectivo'|'Transferencia'|'Crédito'} metodoPago - Método usado
 * @property {number} monto - Monto abonado
 * @property {string|null} comprobante - Referencia opcional
 */

/**
 * @typedef {Object} Sale
 * @property {number} id - Identificador único de la venta
 * @property {number} pedidoId - ID del pedido asociado
 * @property {string} fechaPago - Fecha en que se completó el pago (ISO 8601)
 * @property {string} metodoPago - Método(s) resumido(s)
 * @property {string|null} comprobantePago - Referencia consolidada (opcional)
 * @property {number} montoPagado - Total pagado (igual a total del pedido)
 */

// ----------------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------------

const ORDERS_STORAGE_KEY    = 'pm_orders';
const PAYMENTS_STORAGE_KEY  = 'pm_payments';
const SALES_STORAGE_KEY     = 'pm_sales';
const IVA_RATE = 0.19; // 19%

// ID especial para el "Cliente de Caja"
export const CAJA_CLIENTE_ID = 0; // Coincide con SYSTEM_CLIENT_ID de clientsService

// Estados logísticos
export const ESTADOS_LOGISTICOS = {
  EN_PROCESO: 'en proceso',
  LISTO:      'listo',
  CANCELADO:  'cancelado',
};

// Estados de pago
export const ESTADOS_PAGO = {
  PENDIENTE: 'pendiente',
  PAGADO:    'pagado',
};

// Orígenes
export const ORIGENES = {
  MANUAL: 'manual',
  WEB:    'web',
};

// Métodos de pago (incluye "Devolución" para manejo de excedentes)
export const METODOS_PAGO = {
  EFECTIVO:      'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  CREDITO:       'Crédito',
  DEVOLUCION:    'Devolución',
};

// ----------------------------------------------------------------------
// Helpers privados de inventario (ajustados a estadoLogistico)
// ----------------------------------------------------------------------

const _esPedidoActivo = (estadoLogistico) => estadoLogistico !== ESTADOS_LOGISTICOS.CANCELADO;

const _decrementStock = (productos = []) => {
  const allProducts = ProductsService.list();
  const updated = allProducts.map((p) => {
    const linea = productos.find((l) => l.id === p.id);
    if (!linea) return p;
    return { ...p, stock: Math.max(0, p.stock - linea.cantidad) };
  });
  ProductsService._save(updated);
};

const _restoreStock = (productos = []) => {
  const allProducts = ProductsService.list();
  const updated = allProducts.map((p) => {
    const linea = productos.find((l) => l.id === p.id);
    if (!linea) return p;
    return { ...p, stock: p.stock + linea.cantidad };
  });
  ProductsService._save(updated);
};

const _adjustStockDiff = (oldProductos = [], newProductos = []) => {
  const allIds = [...new Set([...oldProductos.map(l => l.id), ...newProductos.map(l => l.id)])];
  const allProducts = ProductsService.list();
  const updated = allProducts.map((p) => {
    if (!allIds.includes(p.id)) return p;
    const cantAntes = oldProductos.find(l => l.id === p.id)?.cantidad ?? 0;
    const cantAhora = newProductos.find(l => l.id === p.id)?.cantidad ?? 0;
    const diff = cantAhora - cantAntes;
    if (diff === 0) return p;
    return { ...p, stock: diff > 0 ? Math.max(0, p.stock - diff) : p.stock + Math.abs(diff) };
  });
  ProductsService._save(updated);
};

// ----------------------------------------------------------------------
// Persistencia (Orders, Payments, Sales)
// ----------------------------------------------------------------------

const _getOrders = () => {
  try { return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || []; }
  catch { return []; }
};

const _saveOrders = (orders) => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

const _getPayments = () => {
  try { return JSON.parse(localStorage.getItem(PAYMENTS_STORAGE_KEY)) || []; }
  catch { return []; }
};

const _savePayments = (payments) => {
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
};

const _getSales = () => {
  try { return JSON.parse(localStorage.getItem(SALES_STORAGE_KEY)) || []; }
  catch { return []; }
};

const _saveSales = (sales) => {
  localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
};

// ----------------------------------------------------------------------
// Servicio de Pagos
// ----------------------------------------------------------------------

export const PaymentService = {
  list() {
    return _getPayments();
  },

  getByPedidoId(pedidoId) {
    return this.list().filter(p => p.pedidoId === pedidoId);
  },

  getTotalPagado(pedidoId) {
    return this.getByPedidoId(pedidoId).reduce((sum, p) => sum + p.monto, 0);
  },

  add(pedidoId, { metodoPago, monto, comprobante = null }) {
    const order = OrdersService.findById(pedidoId);
    if (!order) throw new Error(`Pedido #${pedidoId} no encontrado.`);
    if (order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) {
      throw new Error('No se pueden agregar pagos a un pedido cancelado.');
    }

    const totalPagado = this.getTotalPagado(pedidoId);
    const saldoPendiente = order.total - totalPagado;
    if (monto <= 0) throw new Error('El monto debe ser mayor a cero.');
    if (monto > saldoPendiente) {
      throw new Error(`El monto excede el saldo pendiente ($${saldoPendiente.toLocaleString()}).`);
    }

    const payments = this.list();
    const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;

    const newPayment = {
      id: newId,
      pedidoId,
      fechaPago: new Date().toISOString(),
      metodoPago,
      monto,
      comprobante,
    };

    _savePayments([...payments, newPayment]);

    const nuevoTotalPagado = totalPagado + monto;
    const nuevoPagoEstado = (nuevoTotalPagado >= order.total)
      ? ESTADOS_PAGO.PAGADO
      : ESTADOS_PAGO.PENDIENTE;

    OrdersService.update({ id: pedidoId, pagoEstado: nuevoPagoEstado });

    if (nuevoPagoEstado === ESTADOS_PAGO.PAGADO) {
      const existingSale = SalesService.findByPedidoId(pedidoId);
      if (!existingSale) {
        const pagos = this.getByPedidoId(pedidoId);
        const metodos = [...new Set(pagos.map(p => p.metodoPago))];
        const metodoResumen = metodos.length === 1 ? metodos[0] : 'Mixto';
        const comprobanteResumen = pagos.length === 1 ? pagos[0].comprobante : null;

        SalesService.create({
          pedidoId,
          metodoPago: metodoResumen,
          comprobantePago: comprobanteResumen,
          montoPagado: order.total,
        });
      }
    }

    return newPayment;
  },

  /**
   * Registra una devolución (pago negativo) asociada al pedido.
   * Se usa cuando el excedente se devuelve en efectivo.
   * @param {number} pedidoId
   * @param {number} monto - Monto a devolver (positivo)
   * @returns {Payment} Pago de devolución creado.
   */
  addDevolucion(pedidoId, monto) {
    if (monto <= 0) throw new Error('El monto de devolución debe ser positivo.');
    const order = OrdersService.findById(pedidoId);
    if (!order) throw new Error(`Pedido #${pedidoId} no encontrado.`);

    const payments = this.list();
    const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;

    const devolucion = {
      id: newId,
      pedidoId,
      fechaPago: new Date().toISOString(),
      metodoPago: METODOS_PAGO.DEVOLUCION,
      monto: -monto, // negativo para indicar devolución
      comprobante: null,
    };

    _savePayments([...payments, devolucion]);

    // Recalcular estado de pago (no debería cambiar si ya estaba pagado)
    const totalPagado = this.getTotalPagado(pedidoId);
    const nuevoPagoEstado = (totalPagado >= order.total)
      ? ESTADOS_PAGO.PAGADO
      : ESTADOS_PAGO.PENDIENTE;
    OrdersService.update({ id: pedidoId, pagoEstado: nuevoPagoEstado });

    return devolucion;
  },
};

// ----------------------------------------------------------------------
// Servicio de Pedidos (actualizado)
// ----------------------------------------------------------------------

export const OrdersService = {
  list() {
    return _getOrders();
  },

  findById(id) {
    return this.list().find(o => o.id === id) ?? null;
  },

  create(data) {
    const orders = this.list();
    const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1001;

    const estadoLogistico = data.estadoLogistico ?? ESTADOS_LOGISTICOS.EN_PROCESO;
    const origen = data.origen ?? ORIGENES.MANUAL;

    const subtotal = data.productos.reduce((sum, p) => sum + p.subtotal, 0);
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;

    const newOrder = {
      ...data,
      id: newId,
      numeroPedido: String(newId),
      fechaPedido: data.fechaPedido || new Date().toISOString(),
      estadoLogistico,
      pagoEstado: ESTADOS_PAGO.PENDIENTE,
      origen,
      subtotal,
      iva,
      total,
      motivoCancelacion: null,
      direccionEntrega: data.direccionEntrega || '',
    };

    if (_esPedidoActivo(estadoLogistico)) {
      _decrementStock(newOrder.productos);
    }

    _saveOrders([...orders, newOrder]);
    return newOrder;
  },

  update(data) {
    const orders = this.list();
    const updated = orders.map(o => o.id === data.id ? { ...o, ...data } : o);
    _saveOrders(updated);
    return updated.find(o => o.id === data.id) ?? null;
  },

  canEditProductos(order) {
    if (!order) return false;
    if (order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) return false;
    if (order.pagoEstado === ESTADOS_PAGO.PAGADO) return false;
    return true;
  },

  /**
   * Actualiza los productos de un pedido.
   * NO aplica automáticamente saldo a favor; devuelve información del excedente.
   * @param {number} orderId
   * @param {OrderProduct[]} newProductos
   * @returns {Object} { order: Order, excedente: number, oldTotal: number, newTotal: number }
   */
  updateProductos(orderId, newProductos) {
    const order = this.findById(orderId);
    if (!order) throw new Error(`Pedido #${orderId} no encontrado.`);

    if (!this.canEditProductos(order)) {
      throw new Error('No se pueden modificar los productos de este pedido.');
    }

    const oldTotal = order.total;
    const totalPagado = PaymentService.getTotalPagado(orderId);

    if (_esPedidoActivo(order.estadoLogistico)) {
      _adjustStockDiff(order.productos, newProductos);
    }

    const subtotal = newProductos.reduce((sum, p) => sum + p.subtotal, 0);
    const iva = subtotal * IVA_RATE;
    const newTotal = subtotal + iva;

    const updatedOrder = this.update({
      id: orderId,
      productos: newProductos,
      subtotal,
      iva,
      total: newTotal,
    });

    let excedente = 0;
    if (newTotal < oldTotal && totalPagado > newTotal) {
      excedente = totalPagado - newTotal;
    }

    // Recalcular pagoEstado
    if (updatedOrder) {
      const nuevoPagoEstado = (totalPagado >= updatedOrder.total)
        ? ESTADOS_PAGO.PAGADO
        : ESTADOS_PAGO.PENDIENTE;
      if (updatedOrder.pagoEstado !== nuevoPagoEstado) {
        this.update({ id: orderId, pagoEstado: nuevoPagoEstado });
        if (nuevoPagoEstado === ESTADOS_PAGO.PAGADO) {
          const existingSale = SalesService.findByPedidoId(orderId);
          if (!existingSale) {
            SalesService.createFromPedido(orderId);
          }
        }
      }
    }

    const finalOrder = this.findById(orderId);
    return {
      order: finalOrder,
      excedente,
      oldTotal,
      newTotal,
    };
  },

  updateEstadoLogistico(orderId, newEstadoLogistico, motivoCancelacion = null) {
    const order = this.findById(orderId);
    if (!order) return null;
    if (order.estadoLogistico === newEstadoLogistico) return order;

    const estabaActivo = _esPedidoActivo(order.estadoLogistico);
    const quedaActivo = _esPedidoActivo(newEstadoLogistico);

    if (estabaActivo && !quedaActivo) {
      _restoreStock(order.productos);
    } else if (!estabaActivo && quedaActivo) {
      _decrementStock(order.productos);
    }

    return this.update({
      id: orderId,
      estadoLogistico: newEstadoLogistico,
      motivoCancelacion: newEstadoLogistico === ESTADOS_LOGISTICOS.CANCELADO ? motivoCancelacion : null,
    });
  },

  delete(orderId) {
    const order = this.findById(orderId);
    if (!order) return this.list();

    if (_esPedidoActivo(order.estadoLogistico)) {
      _restoreStock(order.productos);
    }

    const payments = PaymentService.list().filter(p => p.pedidoId !== orderId);
    _savePayments(payments);
    const sales = SalesService.list().filter(s => s.pedidoId !== orderId);
    _saveSales(sales);

    const updatedOrders = this.list().filter(o => o.id !== orderId);
    _saveOrders(updatedOrders);
    return updatedOrders;
  },
};

// ----------------------------------------------------------------------
// Servicio de Ventas (sin cambios)
// ----------------------------------------------------------------------

export const SalesService = {
  list() {
    return _getSales();
  },

  findById(id) {
    return this.list().find(s => s.id === id) ?? null;
  },

  findByPedidoId(pedidoId) {
    return this.list().find(s => s.pedidoId === pedidoId) ?? null;
  },

  create(data) {
    const sales = this.list();
    const newId = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;

    const newSale = {
      id: newId,
      ...data,
      fechaPago: new Date().toISOString(),
    };

    _saveSales([...sales, newSale]);
    return newSale;
  },

  createFromPedido(pedidoId) {
    const order = OrdersService.findById(pedidoId);
    if (!order) throw new Error(`Pedido #${pedidoId} no encontrado.`);

    const pagos = PaymentService.getByPedidoId(pedidoId);
    const metodos = [...new Set(pagos.map(p => p.metodoPago))];
    const metodoResumen = metodos.length === 1 ? metodos[0] : 'Mixto';
    const comprobanteResumen = pagos.length === 1 ? pagos[0].comprobante : null;

    return this.create({
      pedidoId,
      metodoPago: metodoResumen,
      comprobantePago: comprobanteResumen,
      montoPagado: order.total,
    });
  },

  delete(saleId) {
    const updatedSales = this.list().filter(s => s.id !== saleId);
    _saveSales(updatedSales);
    return updatedSales;
  },
};

export default OrdersService;