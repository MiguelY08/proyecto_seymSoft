// src/features/orders/services/ordersService.js
// Servicio de órdenes (CRUD) respaldado en localStorage.
// Usado en el panel administrativo para simular comportamiento de una API.

import ProductsService from '../../../purchases/products/services/productsServices';

/**
 * @typedef {Object} OrderProduct
 * @property {number} id
 * @property {string} nombre
 * @property {number} cantidad
 * @property {number} precioUnitario
 * @property {number} subtotal
 */

/**
 * @typedef {Object} OrderClient
 * @property {string} nombre
 * @property {string} telefono
 * @property {string} email
 * @property {string} direccion
 */

/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {string} numerosPedido
 * @property {OrderClient} cliente
 * @property {OrderProduct[]} productos
 * @property {string} fecha
 * @property {number} total
 * @property {string} estado
 * @property {string} metodoPago
 * @property {string|null} comprobantePago
 * @property {string} direccionEntrega
 * @property {string|null} motivoCancelacion
 */

// Claves usadas en localStorage
const ORDERS_KEY   = 'pm_orders';
const SEED_VERSION = 'orders_v3'; // bump to add motivoCancelacion field
const VERSION_KEY  = 'pm_orders_version';

// ─── Seed — 16 órdenes alineadas con productsServices (IDs 1–10) ─────────────
// Este array se inyecta en localStorage para datos de ejemplo / desarrollo.
// Incluye los nuevos campos: direccionEntrega y motivoCancelacion.
const SEED_ORDERS = [
  {
    id: 1001, numerosPedido: '1001',
    cliente: { nombre: 'Elizabeth Esparza', telefono: '3001234567', email: 'elizabeth.esparza@email.com', direccion: 'Cra 73 #21-30 (Belén San Bernardo 1er piso)' },
    productos: [
      { id: 1,  nombre: 'Libreta con Lapicero',        cantidad: 5, precioUnitario: 5000,  subtotal: 25000 },
      { id: 5,  nombre: 'Caja de Colores 24 Und',      cantidad: 2, precioUnitario: 12000, subtotal: 24000 },
      { id: 10, nombre: 'Block Cuadriculado 50 Hojas', cantidad: 3, precioUnitario: 3800,  subtotal: 11400 },
    ],
    fecha: '01/11/2025', total: 60400, estado: 'Por aprobar', metodoPago: 'Transferencia', comprobantePago: 'comprobante_1001.pdf',
    direccionEntrega: 'Cra 73 #21-30 (Belén San Bernardo 1er piso)', motivoCancelacion: null,
  },
  {
    id: 1002, numerosPedido: '1002',
    cliente: { nombre: 'Andrea Moreno', telefono: '3109876543', email: 'andrea.moreno@email.com', direccion: 'El cliente lo recoge' },
    productos: [
      { id: 3, nombre: 'Resma Papel Bond A4 500 Hojas', cantidad: 10, precioUnitario: 18500, subtotal: 185000 },
    ],
    fecha: '02/11/2025', total: 185000, estado: 'Aprobado', metodoPago: 'Efectivo', comprobantePago: null,
    direccionEntrega: 'El cliente lo recoge', motivoCancelacion: null,
  },
  {
    id: 1003, numerosPedido: '1003',
    cliente: { nombre: 'Lorena Castaño', telefono: '3158765432', email: 'lorena.castano@email.com', direccion: 'El cliente lo recoge' },
    productos: [
      { id: 4, nombre: 'Bolígrafo Kilométrico x12', cantidad: 5,  precioUnitario: 8400, subtotal: 42000 },
      { id: 2, nombre: 'Silicona Líquida ET131',    cantidad: 30, precioUnitario: 2900, subtotal: 87000 },
    ],
    fecha: '03/11/2025', total: 129000, estado: 'Aprobado', metodoPago: 'Transferencia', comprobantePago: 'comprobante_1003.pdf',
    direccionEntrega: 'El cliente lo recoge', motivoCancelacion: null,
  },
  {
    id: 1004, numerosPedido: '1004',
    cliente: { nombre: 'Andrea Hernandes', telefono: '3201234567', email: 'andrea.hernandes@email.com', direccion: 'Dg 75 #72-1 (Laureles Chacho)' },
    productos: [
      { id: 9, nombre: 'Marcadores Borrables x6',  cantidad: 8,  precioUnitario: 11500, subtotal: 92000 },
      { id: 6, nombre: 'Corrector Líquido Faster', cantidad: 12, precioUnitario: 3500,  subtotal: 42000 },
      { id: 7, nombre: 'Carpeta Argollada Oficio', cantidad: 6,  precioUnitario: 9800,  subtotal: 58800 },
    ],
    fecha: '04/11/2025', total: 192800, estado: 'Por aprobar', metodoPago: 'Transferencia', comprobantePago: 'comprobante_1004.pdf',
    direccionEntrega: 'Dg 75 #72-1 (Laureles Chacho)', motivoCancelacion: null,
  },
  {
    id: 1005, numerosPedido: '1005',
    cliente: { nombre: 'Luisa Morales', telefono: '3187654321', email: 'luisa.morales@email.com', direccion: 'El cliente lo recoge' },
    productos: [{ id: 6, nombre: 'Corrector Líquido Faster', cantidad: 50, precioUnitario: 3500, subtotal: 175000 }],
    fecha: '05/11/2025', total: 175000, estado: 'Por aprobar', metodoPago: 'Efectivo', comprobantePago: null,
    direccionEntrega: 'El cliente lo recoge', motivoCancelacion: null,
  },
  {
    id: 1006, numerosPedido: '1006',
    cliente: { nombre: 'Daniel Gomez', telefono: '3109876543', email: 'daniel@example.com', direccion: 'Cll 30 #89-07 (Belén los almendros)' },
    productos: [
      { id: 7, nombre: 'Carpeta Argollada Oficio',  cantidad: 15, precioUnitario: 9800, subtotal: 147000 },
      { id: 4, nombre: 'Bolígrafo Kilométrico x12', cantidad: 30, precioUnitario: 8400, subtotal: 252000 },
    ],
    fecha: '06/11/2025', total: 399000, estado: 'Aprobado', metodoPago: 'Transferencia', comprobantePago: 'comprobante_1006.pdf',
    direccionEntrega: 'Cll 30 #89-07 (Belén los almendros)', motivoCancelacion: null,
  },
  {
    id: 1007, numerosPedido: '1007',
    cliente: { nombre: 'Melissa Martin', telefono: '3145678901', email: 'melissa.martin@email.com', direccion: 'El cliente lo recoge' },
    productos: [{ id: 8, nombre: 'Tijeras Escolar Punta Roma', cantidad: 20, precioUnitario: 4200, subtotal: 84000 }],
    fecha: '07/11/2025', total: 84000, estado: 'Cancelado', metodoPago: 'Transferencia', comprobantePago: null,
    direccionEntrega: 'El cliente lo recoge', motivoCancelacion: 'El cliente solicitó la cancelación antes de la entrega.',
  },
  {
    id: 1008, numerosPedido: '1008',
    cliente: { nombre: 'Marcela Reyes', telefono: '3167890123', email: 'marcela.reyes@email.com', direccion: 'Carrera 26#40S-81 (Belén rincón)' },
    productos: [
      { id: 5, nombre: 'Caja de Colores 24 Und',  cantidad: 8,  precioUnitario: 12000, subtotal: 96000  },
      { id: 9, nombre: 'Marcadores Borrables x6', cantidad: 10, precioUnitario: 11500, subtotal: 115000 },
    ],
    fecha: '08/11/2025', total: 211000, estado: 'Por aprobar', metodoPago: 'Transferencia', comprobantePago: 'comprobante_1008.pdf',
    direccionEntrega: 'Carrera 26#40S-81 (Belén rincón)', motivoCancelacion: null,
  },
  {
    id: 1009, numerosPedido: '1009',
    cliente: { nombre: 'Danna Mejia', telefono: '3198765432', email: 'danna.mejia@email.com', direccion: 'El cliente lo recoge' },
    productos: [
      { id: 1, nombre: 'Libreta con Lapicero',   cantidad: 10, precioUnitario: 5000, subtotal: 50000 },
      { id: 2, nombre: 'Silicona Líquida ET131', cantidad: 20, precioUnitario: 2900, subtotal: 58000 },
    ],
    fecha: '09/11/2025', total: 108000, estado: 'Cancelado', metodoPago: 'Efectivo', comprobantePago: null,
    direccionEntrega: 'El cliente lo recoge', motivoCancelacion: 'Productos sin stock disponible al momento de procesar.',
  },
  {
    id: 1010, numerosPedido: '1010',
    cliente: { nombre: 'Luciano Madrid', telefono: '3123456789', email: 'luciano.madrid@email.com', direccion: 'Calle 60#60B-36 (Manantiales oriental)' },
    productos: [
      { id: 5, nombre: 'Caja de Colores 24 Und',  cantidad: 5, precioUnitario: 12000, subtotal: 60000 },
      { id: 9, nombre: 'Marcadores Borrables x6', cantidad: 4, precioUnitario: 11500, subtotal: 46000 },
    ],
    fecha: '10/11/2025', total: 106000, estado: 'Aprobado', metodoPago: 'Transferencia', comprobantePago: 'comprobante_1010.pdf',
    direccionEntrega: 'Calle 60#60B-36 (Manantiales oriental)', motivoCancelacion: null,
  },
  {
    id: 1011, numerosPedido: '1011',
    cliente: { nombre: 'Sebastian Gallego', telefono: '3134567890', email: 'sebastian.gallego@email.com', direccion: 'El cliente lo recoge' },
    productos: [{ id: 3, nombre: 'Resma Papel Bond A4 500 Hojas', cantidad: 5, precioUnitario: 18500, subtotal: 92500 }],
    fecha: '11/11/2025', total: 92500, estado: 'Por aprobar', metodoPago: 'Efectivo', comprobantePago: null,
    direccionEntrega: 'El cliente lo recoge', motivoCancelacion: null,
  },
  {
    id: 1012, numerosPedido: '1012',
    cliente: { nombre: 'Miguel Bautista', telefono: '3156789012', email: 'miguel.bautista@email.com', direccion: 'Carrera 107#49A-97 (San Javier)' },
    productos: [
      { id: 4, nombre: 'Bolígrafo Kilométrico x12', cantidad: 20, precioUnitario: 8400, subtotal: 168000 },
      { id: 6, nombre: 'Corrector Líquido Faster',  cantidad: 50, precioUnitario: 3500, subtotal: 175000 },
    ],
    fecha: '12/11/2025', total: 343000, estado: 'Aprobado', metodoPago: 'Transferencia', comprobantePago: 'comprobante_1012.pdf',
    direccionEntrega: 'Carrera 107#49A-97 (San Javier)', motivoCancelacion: null,
  },
  {
    id: 1013, numerosPedido: '1013',
    cliente: { nombre: 'Andres Iglesias', telefono: '3178901234', email: 'andres.iglesias@email.com', direccion: 'El cliente lo recoge' },
    productos: [
      { id: 10, nombre: 'Block Cuadriculado 50 Hojas', cantidad: 15, precioUnitario: 3800,  subtotal: 57000  },
      { id: 4,  nombre: 'Bolígrafo Kilométrico x12',   cantidad: 25, precioUnitario: 8400,  subtotal: 210000 },
    ],
    fecha: '13/11/2025', total: 267000, estado: 'Por aprobar', metodoPago: 'Efectivo', comprobantePago: null,
    direccionEntrega: 'El cliente lo recoge', motivoCancelacion: null,
  },
  {
    id: 1014, numerosPedido: '1014',
    cliente: { nombre: 'Antonio Botero', telefono: '3189012345', email: 'antonio.botero@email.com', direccion: 'Transversal 74#RD-5 (Poblado)' },
    productos: [
      { id: 7, nombre: 'Carpeta Argollada Oficio', cantidad: 25, precioUnitario: 9800, subtotal: 245000 },
      { id: 6, nombre: 'Corrector Líquido Faster', cantidad: 30, precioUnitario: 3500, subtotal: 105000 },
    ],
    fecha: '14/11/2025', total: 350000, estado: 'Por aprobar', metodoPago: 'Transferencia', comprobantePago: 'comprobante_1014.pdf',
    direccionEntrega: 'Transversal 74#RD-5 (Poblado)', motivoCancelacion: null,
  },
  {
    id: 1015, numerosPedido: '1015',
    cliente: { nombre: 'Cristian Monsalve', telefono: '3190123456', email: 'cristian.monsalve@email.com', direccion: 'El cliente lo recoge' },
    productos: [{ id: 7, nombre: 'Carpeta Argollada Oficio', cantidad: 40, precioUnitario: 9800, subtotal: 392000 }],
    fecha: '15/11/2025', total: 392000, estado: 'Por aprobar', metodoPago: 'Efectivo', comprobantePago: null,
    direccionEntrega: 'El cliente lo recoge', motivoCancelacion: null,
  },
  {
    id: 1016, numerosPedido: '1016',
    cliente: { nombre: 'Nicol Espinoza', telefono: '3112345678', email: 'nicol.espinoza@email.com', direccion: 'Tenerife #54-88 (La candelaria)' },
    productos: [
      { id: 9, nombre: 'Marcadores Borrables x6', cantidad: 15, precioUnitario: 11500, subtotal: 172500 },
      { id: 5, nombre: 'Caja de Colores 24 Und',  cantidad: 5,  precioUnitario: 12000, subtotal: 60000  },
    ],
    fecha: '16/11/2025', total: 232500, estado: 'Aprobado', metodoPago: 'Transferencia', comprobantePago: 'comprobante_1016.pdf',
    direccionEntrega: 'Tenerife #54-88 (La candelaria)', motivoCancelacion: null,
  },
];

// ─── Seed: siembra datos de ejemplo solo cuando cambia la versión ────────────
//
// El propósito de este seed es proporcionar datos iniciales para desarrollo/demo.
// Los datos se escriben en localStorage solo si la versión configurada cambia,
// evitando así sobrescribir los datos del usuario en cada carga.
const seedOrders = () => {
  try {
    if (localStorage.getItem(VERSION_KEY) !== SEED_VERSION) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(SEED_ORDERS));
      localStorage.setItem(VERSION_KEY, SEED_VERSION);
    }
  } catch {
    // En caso de error (p. ej. storage inaccesible), intentamos asegurar que haya datos.
    localStorage.setItem(ORDERS_KEY, JSON.stringify(SEED_ORDERS));
    localStorage.setItem(VERSION_KEY, SEED_VERSION);
  }
};

seedOrders();

// ─── Helpers privados de stock ────────────────────────────────────────────────

/**
 * Determina si un estado implica stock comprometido.
 * Solo las órdenes Canceladas no tienen stock reservado.
 */
const _esActivo = (estado) => estado !== 'Cancelado';

/**
 * Descuenta del inventario las cantidades de las líneas de la orden.
 * No baja de cero.
 * @param {Array<{id:number, cantidad:number}>} productos
 */
const _decrementStock = (productos = []) => {
  const all     = ProductsService.list();
  const updated = all.map((p) => {
    const linea = productos.find((l) => l.id === p.id);
    if (!linea) return p;
    return { ...p, stock: Math.max(0, p.stock - linea.cantidad) };
  });
  ProductsService._save(updated);
};

/**
 * Devuelve al inventario las cantidades de las líneas de la orden.
 * @param {Array<{id:number, cantidad:number}>} productos
 */
const _restoreStock = (productos = []) => {
  const all     = ProductsService.list();
  const updated = all.map((p) => {
    const linea = productos.find((l) => l.id === p.id);
    if (!linea) return p;
    return { ...p, stock: p.stock + linea.cantidad };
  });
  ProductsService._save(updated);
};

/**
 * Ajusta el inventario al editar las líneas de una orden activa.
 *
 * Solo mueve la diferencia entre el estado anterior y el nuevo:
 *   diff > 0 → piden más → descuenta la diferencia
 *   diff < 0 → piden menos → devuelve la diferencia
 *   Un producto que desaparece → devuelve todo su stock
 *   Un producto nuevo → descuenta toda su cantidad
 *
 * @param {Array} oldProductos - líneas antes de la edición
 * @param {Array} newProductos - líneas después de la edición
 */
const _adjustStockDiff = (oldProductos = [], newProductos = []) => {
  const allIds = [...new Set([...oldProductos.map((l) => l.id), ...newProductos.map((l) => l.id)])];
  const all     = ProductsService.list();
  const updated = all.map((p) => {
    if (!allIds.includes(p.id)) return p;
    const cantAntes = oldProductos.find((l) => l.id === p.id)?.cantidad ?? 0;
    const cantAhora = newProductos.find((l) => l.id === p.id)?.cantidad ?? 0;
    const diff      = cantAhora - cantAntes;
    if (diff === 0) return p;
    return { ...p, stock: diff > 0 ? Math.max(0, p.stock - diff) : p.stock + Math.abs(diff) };
  });
  ProductsService._save(updated);
};

// ─── Servicio público ─────────────────────────────────────────────────────────
/**
 * Servicio de órdenes (CRUD) respaldado en localStorage.
 *
 * Exporta métodos utilitarios para listar, buscar, crear, actualizar y borrar órdenes.
 * La implementación es simple y está pensada para uso local / desarrollo.
 * Gestiona automáticamente el stock de productos al cambiar estados o productos.
 */
export const OrdersService = {

  /**
   * Devuelve todas las órdenes almacenadas.
   * @returns {Array<Order>} Lista de órdenes (puede estar vacía).
   */
  list() {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      // Si hay error de parseo o storage inaccesible, devolver lista vacía.
      return [];
    }
  },

  /**
   * Busca una orden por su identificador.
   * @param {number} id - ID de la orden.
   * @returns {Order|null} Orden encontrada o null.
   */
  findById(id) {
    return this.list().find((o) => o.id === id) ?? null;
  },

  /**
   * Persiste el listado completo de órdenes en localStorage.
   * @param {Array<Order>} orders - Array completo de órdenes a guardar.
   * @private
   */
  _save(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  /**
   * Crea una nueva orden y la guarda en localStorage.
   *
   * El stock se descuenta inmediatamente si la orden nace activa
   * ("Por aprobar" o "Aprobado"). Las órdenes que nacen "Canceladas"
   * no tocan el inventario.
   *
   * @param {Object} data - Datos de la orden.
   * @returns {Order} Orden creada con id y numero de pedido asignados.
   */
  create(data) {
    const orders  = this.list();
    const newId   = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1001;
    const estado  = data.estado ?? 'Por aprobar';
    const newOrder = {
      ...data,
      id:                newId,
      numerosPedido:     String(newId),
      estado,
      motivoCancelacion: null,
      direccionEntrega:  data.direccionEntrega || data.cliente?.direccion || '',
    };
    if (_esActivo(estado)) _decrementStock(newOrder.productos);
    this._save([...orders, newOrder]);
    return newOrder;
  },

  /**
   * Actualiza campos generales de la orden (cliente, fecha, metodoPago, etc.)
   * sin alterar productos ni estado.
   * Para productos usa updateProductos(); para estado, updateEstado().
   *
   * @param {Object} data - Campos a actualizar, debe incluir id.
   * @returns {Order|null} Orden actualizada.
   */
  update(data) {
    const orders  = this.list();
    const updated = orders.map((o) => (o.id === data.id ? { ...o, ...data } : o));
    this._save(updated);
    return updated.find((o) => o.id === data.id) ?? null;
  },

  /**
   * Actualiza solo los productos de la orden, ajustando stock automaticamente.
   * Usa _adjustStockDiff para mover solo la diferencia.
   * Recalcula el total basado en los nuevos productos.
   *
   * @param {number} orderId - ID de la orden.
   * @param {OrderProduct[]} newProductos - Nuevos productos.
   * @returns {Order|null} Orden actualizada.
   */
  updateProductos(orderId, newProductos) {
    const order = this.findById(orderId);
    if (!order) return null;
    if (_esActivo(order.estado)) _adjustStockDiff(order.productos, newProductos);
    const newTotal = newProductos.reduce((sum, l) => sum + l.subtotal, 0);
    return this.update({ id: orderId, productos: newProductos, total: newTotal });
  },

  /**
   * Cambia el estado del pedido, ajustando stock automaticamente.
   * Si pasa a Cancelado, requiere motivoCancelacion.
   * Gestiona stock: restaura si se cancela, descuenta si se activa.
   *
   * @param {number} orderId - ID de la orden.
   * @param {string} newEstado - Nuevo estado ('Por aprobar', 'Aprobado', 'Cancelado').
   * @param {string|null} motivoCancelacion - Requerido si newEstado === 'Cancelado'.
   * @returns {Order|null} Orden actualizada.
   */
  updateEstado(orderId, newEstado, motivoCancelacion = null) {
    const order = this.findById(orderId);
    if (!order) return null;
    if (order.estado === newEstado) return order;

    const estabaActivo = _esActivo(order.estado);
    const quedaActivo  = _esActivo(newEstado);

    if (estabaActivo && !quedaActivo) _restoreStock(order.productos);
    else if (!estabaActivo && quedaActivo) _decrementStock(order.productos);

    return this.update({
      id:                orderId,
      estado:            newEstado,
      motivoCancelacion: newEstado === 'Cancelado' ? motivoCancelacion : null,
    });
  },

  /**
   * Elimina una orden del almacenamiento.
   * Si la orden estaba activa, restaura el stock de sus productos.
   *
   * @param {number} orderId - ID de la orden a eliminar.
   * @returns {Array<Order>} Lista actualizada de órdenes.
   */
  delete(orderId) {
    const order = this.findById(orderId);
    if (!order) return this.list();
    if (_esActivo(order.estado)) _restoreStock(order.productos);
    const updated = this.list().filter((o) => o.id !== orderId);
    this._save(updated);
    return updated;
  },
};

export default OrdersService;