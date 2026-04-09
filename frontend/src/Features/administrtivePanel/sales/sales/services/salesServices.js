// src/features/administrtivePanel/sales/services/salesServices.js
/**
 * Servicio de Ventas (fachada sobre Pedidos).
 * 
 * Todas las operaciones de venta se delegan en OrdersService, PaymentService y SalesService.
 * Se mantiene la misma interfaz que esperaba la UI antigua para facilitar la migración.
 */

import OrdersService, { PaymentService, SalesService, ESTADOS_LOGISTICOS, ESTADOS_PAGO, ORIGENES, METODOS_PAGO } from '../../orders/services/ordersService';
import ProductsService from '../../../purchases/products/services/productsServices';
import { clientsService } from '../../clients/services/clientsService';
import { UsersDB } from '../../../users/services/usersDB';

// ----------------------------------------------------------------------
// Helpers de formato y adaptación
// ----------------------------------------------------------------------

/**
 * Formatea un valor como moneda COP.
 */
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatea una fecha ISO a dd/mm/yyyy.
 */
const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? isoString : date.toLocaleDateString('es-CO');
};

/**
 * Adapta un objeto Sale (del almacenamiento) al formato enriquecido que espera la UI.
 * Incluye datos del pedido, cliente, vendedor, productos y pagos.
 */
const adaptSale = (sale) => {
  const order = OrdersService.findById(sale.pedidoId);
  if (!order) return null;

  const cliente = clientsService.getById(order.clienteId);
  const vendedor = order.asesorId ? UsersDB.findById(order.asesorId) : null;

  const pagos = PaymentService.getByPedidoId(order.id);
  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const metodos = [...new Set(pagos.filter(p => p.monto > 0).map(p => p.metodoPago))];
  const metodoPago = metodos.length === 1 ? metodos[0] : (metodos.length > 1 ? 'Mixto' : '—');

  // Mapear estado logístico a estado de venta (para la UI)
  let estadoVenta = 'Pagada';
  if (order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) {
    estadoVenta = 'Cancelada';
  } else if (order.pagoEstado === ESTADOS_PAGO.PENDIENTE) {
    estadoVenta = 'Pendiente'; // Por si acaso, aunque una venta solo se crea al estar pagada
  }

  // Construir items en el formato esperado por la UI (array de { product, cantidad, descripcion })
  const items = order.productos.map(p => ({
    product: {
      id: p.id,
      nombre: p.nombre,
      precioDetalle: p.precioUnitario,
      // otros campos si son necesarios
    },
    cantidad: p.cantidad,
    descripcion: '',
  }));

  // Construir paymentAmounts a partir de los pagos
  const paymentAmounts = {
    Efectivo: 0,
    Crédito: 0,
    Transferencia: 0,
  };
  pagos.forEach(p => {
    if (p.metodoPago === METODOS_PAGO.EFECTIVO) paymentAmounts.Efectivo += p.monto;
    else if (p.metodoPago === METODOS_PAGO.CREDITO) paymentAmounts.Crédito += p.monto;
    else if (p.metodoPago === METODOS_PAGO.TRANSFERENCIA) paymentAmounts.Transferencia += p.monto;
    // Devoluciones no se muestran como método positivo
  });

  return {
    id: sale.id,
    factura: String(sale.id), // o sale.id como número de factura
    fecha: formatDate(sale.fechaPago),
    clienteId: order.clienteId,
    vendedorId: order.asesorId,
    cliente: cliente?.name || cliente?.fullName || '—',
    vendedor: vendedor?.name || '—',
    metodoPago: metodoPago,
    estado: estadoVenta,
    entrega: order.direccionEntrega || 'Punto de venta',
    direccion: order.direccionEntrega || '',
    items: items,
    total: formatCurrency(order.total),
    totalNumerico: order.total,
    registradoDesde: formatDate(order.fechaPedido),
    paymentAmounts: paymentAmounts,
    motivoAnulacion: order.motivoCancelacion || '',
    fechaAnulacion: order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO ? formatDate(order.fechaPedido) : '',
    // Datos extra para referencia
    pedidoId: order.id,
    numeroPedido: order.numeroPedido,
  };
};

// ----------------------------------------------------------------------
// Servicio de Ventas (fachada)
// ----------------------------------------------------------------------

export const SalesServices = {
  /**
   * Obtiene todos los productos activos del catálogo.
   */
  getProducts() {
    return ProductsService.list().filter(p => p.activo !== false);
  },

  /**
   * Obtiene un producto por ID.
   */
  getProductById(id) {
    return ProductsService.findById(id);
  },

  /**
   * Obtiene todos los clientes activos (excluyendo sistema).
   */
  getClients() {
    return clientsService.getAll().filter(c => c.active && !c.isSystem);
  },

  /**
   * Obtiene un cliente por ID.
   */
  getClientById(id) {
    return clientsService.getById(id);
  },

  /**
   * Obtiene información de crédito del cliente.
   */
  getCreditInfo(clienteId) {
    const cliente = clientsService.getById(clienteId);
    if (!cliente) return { tieneCredito: false, cupoDisponible: 0 };
    // Aquí podrías usar creditAccountService si lo necesitas; simplificamos con el campo clientCredit
    const creditoAsignado = parseFloat(cliente.clientCredit) || 0;
    // Asumimos que no hay consumo aún; en una implementación real consultarías el balance
    return {
      tieneCredito: creditoAsignado > 0,
      cupoDisponible: creditoAsignado, // Simplificado
    };
  },

  /**
   * Lista todas las ventas en el formato enriquecido.
   */
  list() {
    const sales = SalesService.list();
    return sales
      .map(adaptSale)
      .filter(s => s !== null);
  },

  /**
   * Obtiene una venta por su ID (enriquecida).
   */
  getById(id) {
    const sale = SalesService.findById(id);
    if (!sale) return null;
    return adaptSale(sale);
  },

  /**
   * Crea una nueva venta (a partir de un pedido pagado).
   * Este método se usa para ventas directas (mostrador).
   * Crea el pedido, registra los pagos y genera la venta automáticamente.
   */
  create(form, items, facturaNo, paymentAmounts) {
    // Convertir items al formato de OrderProduct
    const orderProductos = items.map(item => ({
      id: item.product.id,
      nombre: item.product.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.product.precioDetalle,
      subtotal: item.cantidad * item.product.precioDetalle,
    }));

    // Determinar estado logístico: si es venta directa, normalmente 'listo'
    const estadoLogistico = ESTADOS_LOGISTICOS.LISTO;

    // Crear pedido con estado 'pagado' (se forzará al registrar pagos)
    const order = OrdersService.create({
      clienteId: form.clienteId,
      asesorId: form.vendedorId,
      direccionEntrega: form.direccion || (form.entrega === 'Domicilio' ? form.direccion : 'Punto de venta'),
      productos: orderProductos,
      estadoLogistico: estadoLogistico,
      origen: ORIGENES.MANUAL,
    });

    // Registrar los pagos según paymentAmounts
    const metodos = [
      { key: 'Efectivo', method: METODOS_PAGO.EFECTIVO },
      { key: 'Crédito', method: METODOS_PAGO.CREDITO },
      { key: 'Transferencia', method: METODOS_PAGO.TRANSFERENCIA },
    ];

    for (const { key, method } of metodos) {
      const monto = paymentAmounts?.[key] || 0;
      if (monto > 0) {
        PaymentService.add(order.id, {
          metodoPago: method,
          monto: monto,
          comprobante: null,
        });
      }
    }

    // Si la suma de pagos no alcanza el total, la venta no se crea (no debería ocurrir por validación previa)
    const totalPagado = PaymentService.getTotalPagado(order.id);
    if (totalPagado < order.total) {
      // Forzar un pago adicional con el restante? Según reglas, debe pagarse completo.
      throw new Error('El pago total no cubre el valor del pedido.');
    }

    // Obtener la venta generada
    const sale = SalesService.findByPedidoId(order.id);
    return adaptSale(sale);
  },

  /**
   * Actualizar una venta.
   * Las ventas son inmutables. Si se intenta editar, redirigimos a la edición del pedido subyacente.
   * Por compatibilidad, lanzamos un error con un mensaje claro.
   */
  update(saleId, form, items, originalItems, paymentAmounts) {
    throw new Error('Las ventas no se pueden modificar directamente. Use la edición del pedido asociado.');
  },

  /**
   * Anula una venta (cancela el pedido asociado).
   */
  anular(saleId, motivo = '') {
    const sale = SalesService.findById(saleId);
    if (!sale) throw new Error(`Venta ${saleId} no encontrada.`);

    const order = OrdersService.findById(sale.pedidoId);
    if (!order) throw new Error(`Pedido asociado no encontrado.`);

    // Cancelar el pedido (esto restaura stock y cambia estado)
    OrdersService.updateEstadoLogistico(order.id, ESTADOS_LOGISTICOS.CANCELADO, motivo);

    // La venta sigue existiendo pero su estado se verá como 'Cancelada' en la UI
    return this.list();
  },

  // Método auxiliar para calcular totales (usado por SaleForm)
  _calcTotals(items) {
    const subtotal = items.reduce((acc, item) => acc + (item.product.precioDetalle * item.cantidad), 0);
    const iva = Math.round(subtotal * 0.19);
    return { subtotal, iva, total: subtotal + iva };
  },
};

export default SalesServices;