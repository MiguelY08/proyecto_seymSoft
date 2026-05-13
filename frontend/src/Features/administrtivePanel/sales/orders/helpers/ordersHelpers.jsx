// src/features/orders/helpers/ordersHelpers.jsx
import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ESTADOS_LOGISTICOS, ESTADOS_PAGO, ORIGENES } from '../services/ordersService';

// ─── Textos capitalizados para mostrar ───────────────────────────────────────
const ESTADO_LOGISTICO_LABELS = {
  [ESTADOS_LOGISTICOS.EN_PROCESO]: 'En proceso',
  [ESTADOS_LOGISTICOS.LISTO]:      'Listo',
  [ESTADOS_LOGISTICOS.CANCELADO]:  'Cancelado',
};

const ESTADO_PAGO_LABELS = {
  [ESTADOS_PAGO.PENDIENTE]: 'Pendiente',
  [ESTADOS_PAGO.PAGADO]:    'Pagado',
};

// ─── Colores para Estado Logístico ───────────────────────────────────────────
export const ESTADO_LOGISTICO_STYLES = {
  [ESTADOS_LOGISTICOS.EN_PROCESO]: { bg: '#fef9c3', color: '#a16207', dot: '#ca8a04' },
  [ESTADOS_LOGISTICOS.LISTO]:      { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
  [ESTADOS_LOGISTICOS.CANCELADO]:  { bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626' },
};

export const ESTADO_LOGISTICO_TABLE_CLASSES = {
  [ESTADOS_LOGISTICOS.EN_PROCESO]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  [ESTADOS_LOGISTICOS.LISTO]:      'bg-green-100  text-green-700  border-green-300',
  [ESTADOS_LOGISTICOS.CANCELADO]:  'bg-red-100    text-red-400    border-red-200',
};

// ─── Colores para Estado de Pago ──────────────────────────────────────────────
export const ESTADO_PAGO_STYLES = {
  [ESTADOS_PAGO.PENDIENTE]: { bg: '#fef3c7', color: '#b45309', dot: '#d97706' },
  [ESTADOS_PAGO.PAGADO]:    { bg: '#d1fae5', color: '#065f46', dot: '#059669' },
};

export const ESTADO_PAGO_TABLE_CLASSES = {
  [ESTADOS_PAGO.PENDIENTE]: 'bg-amber-100 text-amber-700 border-amber-300',
  [ESTADOS_PAGO.PAGADO]:    'bg-emerald-100 text-emerald-700 border-emerald-300',
};

// ─── Funciones helper para Estado Logístico ──────────────────────────────────
export const getEstadoLogisticoBadgeClasses = (estado) =>
  ESTADO_LOGISTICO_TABLE_CLASSES[estado] ?? 'bg-gray-100 text-gray-600 border-gray-300';

export const getEstadoLogisticoColor = (estado) => {
  const map = {
    [ESTADOS_LOGISTICOS.EN_PROCESO]: 'bg-yellow-500',
    [ESTADOS_LOGISTICOS.LISTO]:      'bg-green-500',
    [ESTADOS_LOGISTICOS.CANCELADO]:  'bg-red-500',
  };
  return map[estado] ?? 'bg-gray-500';
};

// ─── Funciones helper para Estado de Pago ─────────────────────────────────────
export const getEstadoPagoBadgeClasses = (estado) =>
  ESTADO_PAGO_TABLE_CLASSES[estado] ?? 'bg-gray-100 text-gray-600 border-gray-300';

export const getEstadoPagoColor = (estado) => {
  const map = {
    [ESTADOS_PAGO.PENDIENTE]: 'bg-amber-500',
    [ESTADOS_PAGO.PAGADO]:    'bg-emerald-500',
  };
  return map[estado] ?? 'bg-gray-500';
};

// ─── Permisos (basados en estado logístico y pago) ───────────────────────────
export const getPermisos = (estadoLogistico, pagoEstado) => {
  const esCancelado = estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO;
  const esListoYPagado = estadoLogistico === ESTADOS_LOGISTICOS.LISTO && pagoEstado === ESTADOS_PAGO.PAGADO;
  return { deshabilitado: esCancelado || esListoYPagado };
};

// ─── highlight (sin cambios) ──────────────────────────────────────────────────
export const highlight = (text, term) => {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">{part}</mark>
      : part
  );
};

// ─── Badges para Estado Logístico ─────────────────────────────────────────────
export const EstadoLogisticoBadgePill = ({ estado }) => {
  const s = ESTADO_LOGISTICO_STYLES[estado];
  const label = ESTADO_LOGISTICO_LABELS[estado] || estado;
  if (!s) return <span className="text-gray-500 text-sm">{label}</span>;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
      {label}
    </span>
  );
};

export const EstadoLogisticoBadgeTable = ({ estado, term }) => {
  const classes = getEstadoLogisticoBadgeClasses(estado);
  const label = ESTADO_LOGISTICO_LABELS[estado] || estado;
  const content = term?.trim() ? highlight(label, term) : label;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${classes}`}>
      {content}
    </span>
  );
};

// ─── Badges para Estado de Pago ───────────────────────────────────────────────
export const EstadoPagoBadgePill = ({ estado }) => {
  const s = ESTADO_PAGO_STYLES[estado];
  const label = ESTADO_PAGO_LABELS[estado] || estado;
  if (!s) return <span className="text-gray-500 text-sm">{label}</span>;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
      {label}
    </span>
  );
};

export const EstadoPagoBadgeTable = ({ estado, term }) => {
  const classes = getEstadoPagoBadgeClasses(estado);
  const label = ESTADO_PAGO_LABELS[estado] || estado;
  const content = term?.trim() ? highlight(label, term) : label;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${classes}`}>
      {content}
    </span>
  );
};

// ─── Compatibilidad (deprecated) ──────────────────────────────────────────────
export const ESTADO_STYLES = ESTADO_LOGISTICO_STYLES;
export const ESTADO_TABLE_CLASSES = ESTADO_LOGISTICO_TABLE_CLASSES;
export const getEstadoBadgeClasses = getEstadoLogisticoBadgeClasses;
export const getEstadoColor = getEstadoLogisticoColor;
export const EstadoBadgePill = EstadoLogisticoBadgePill;
export const EstadoBadgeTable = EstadoLogisticoBadgeTable;

// ======================= EXPORTACIÓN A EXCEL =======================
export const exportOrdersToExcel = (orders) => {
  if (!orders || orders.length === 0) return false;

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? isoString : date.toLocaleDateString('es-CO');
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedDateTime = currentDate.toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ========== HOJA 1: RESUMEN DE PEDIDOS ==========
  const summaryHeaders = [
    'N° Pedido', 'Cliente', 'Dirección de Entrega', 'Fecha Pedido',
    'Total', 'Estado Logístico', 'Estado de Pago', 'Origen', 'Motivo cancelación', 'Cantidad Productos'
  ];

  const summaryData = orders.map(order => [
    order.numeroPedido || String(order.id),
    order.clienteNombre || 'Cliente no identificado',
    order.direccionEntrega || '',
    formatDate(order.fechaPedido),
    formatCurrency(order.total || 0),
    ESTADO_LOGISTICO_LABELS[order.estadoLogistico] || order.estadoLogistico || '',
    ESTADO_PAGO_LABELS[order.pagoEstado] || order.pagoEstado || '',
    order.origen || '',
    order.motivoCancelacion ?? '',
    order.productos?.length || 0,
  ]);

  // ========== HOJA 2: DETALLE DE PRODUCTOS ==========
  const productHeaders = [
    'N° Pedido', 'Cliente', 'Fecha Pedido', 'Producto',
    'Cantidad', 'Precio Unitario', 'Total Producto'
  ];

  const productData = [];
  orders.forEach(order => {
    const productos = order.productos || [];
    const clienteNombre = order.clienteNombre || 'Cliente no identificado';
    if (productos.length === 0) {
      productData.push([order.numeroPedido || String(order.id), clienteNombre, formatDate(order.fechaPedido), 'Sin productos', '', '', '']);
    } else {
      productos.forEach(prod => {
        const cantidad = prod.cantidad || 1;
        const precioUnit = prod.precioUnitario || 0;
        const totalProducto = cantidad * precioUnit;
        productData.push([
          order.numeroPedido || String(order.id),
          clienteNombre,
          formatDate(order.fechaPedido),
          prod.nombre || 'Producto sin nombre',
          cantidad,
          formatCurrency(precioUnit),
          formatCurrency(totalProducto),
        ]);
      });
    }
  });

  // ========== HOJA 3: ESTADÍSTICAS ==========
  const statsHeaders = ['Métrica', 'Valor'];
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalProductLines = orders.reduce((sum, o) => sum + (o.productos?.length || 0), 0);
  const totalUnits = orders.reduce((sum, o) => {
    const units = (o.productos || []).reduce((acc, p) => acc + (p.cantidad || 0), 0);
    return sum + units;
  }, 0);

  const enProceso = orders.filter(o => o.estadoLogistico === ESTADOS_LOGISTICOS.EN_PROCESO).length;
  const listo = orders.filter(o => o.estadoLogistico === ESTADOS_LOGISTICOS.LISTO).length;
  const cancelado = orders.filter(o => o.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO).length;
  const pagado = orders.filter(o => o.pagoEstado === ESTADOS_PAGO.PAGADO).length;
  const pendientePago = orders.filter(o => o.pagoEstado === ESTADOS_PAGO.PENDIENTE).length;
  const avgPerOrder = totalOrders > 0 ? totalValue / totalOrders : 0;

  const statsData = [
    ['Total Pedidos', totalOrders],
    ['Total Valor', formatCurrency(totalValue)],
    ['Total Líneas de Productos', totalProductLines],
    ['Total Unidades', totalUnits],
    ['Promedio por Pedido', formatCurrency(avgPerOrder)],
    [''],
    ['Estado Logístico: En proceso', enProceso],
    ['Estado Logístico: Listo', listo],
    ['Estado Logístico: Cancelado', cancelado],
    [''],
    ['Estado de Pago: Pendiente', pendientePago],
    ['Estado de Pago: Pagado', pagado],
    [''],
    ['Fecha de Exportación', formattedDateTime],
  ];

  // ========== CREAR LIBRO ==========
  const wb = XLSX.utils.book_new();

  const summaryWs = XLSX.utils.aoa_to_sheet([
    ['PEDIDOS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['RESUMEN DE PEDIDOS'],
    [''],
    summaryHeaders,
    ...summaryData,
  ]);
  summaryWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: summaryHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: summaryHeaders.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: summaryHeaders.length - 1 } },
  ];
  summaryWs['!cols'] = [
    { wch: 12 }, { wch: 28 }, { wch: 40 }, { wch: 12 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
    { wch: 35 }, { wch: 12 },
  ];

  const productWs = XLSX.utils.aoa_to_sheet([
    ['PEDIDOS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['DETALLE DE PRODUCTOS PEDIDOS'],
    [''],
    productHeaders,
    ...productData,
  ]);
  productWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: productHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: productHeaders.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: productHeaders.length - 1 } },
  ];
  productWs['!cols'] = [
    { wch: 12 }, { wch: 28 }, { wch: 12 }, { wch: 35 },
    { wch: 12 }, { wch: 16 }, { wch: 16 },
  ];

  const statsWs = XLSX.utils.aoa_to_sheet([
    ['PEDIDOS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['ESTADÍSTICAS'],
    [''],
    statsHeaders,
    ...statsData,
  ]);
  statsWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
  ];
  statsWs['!cols'] = [{ wch: 28 }, { wch: 28 }];

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen Pedidos');
  XLSX.utils.book_append_sheet(wb, productWs, 'Detalle Productos');
  XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas');

  const fileName = `pedidos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return true;
};

// ======================= EXPORTACIÓN A PDF =======================
/**
 * Genera y descarga un PDF con el detalle completo de un pedido.
 *
 * @param {Object} order - Pedido enriquecido con clienteNombre, clienteTelefono, clienteEmail, etc.
 * @param {Array} pagos - Lista de pagos asociados al pedido.
 * @param {string} asesorNombre - Nombre del asesor que gestionó el pedido.
 */
export const exportOrderToPDF = (order, pagos = [], asesorNombre = 'N/A') => {
  if (!order) return;

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? isoString : date.toLocaleDateString('es-CO');
  };

  const doc = new jsPDF();
  const marginLeft = 15;
  let yPos = 20;

  // ========== ENCABEZADO ==========
  doc.setFontSize(18);
  doc.setTextColor(0, 77, 119); // #004D77
  doc.text(`PEDIDO #${order.numeroPedido || order.id}`, marginLeft, yPos);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CO')}`, marginLeft, yPos + 6);
  
  yPos += 15;

  // ========== INFORMACIÓN DEL CLIENTE ==========
  doc.setFontSize(12);
  doc.setTextColor(0, 77, 119);
  doc.text('Información del Cliente', marginLeft, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(`Nombre: ${order.clienteNombre || 'No especificado'}`, marginLeft, yPos);
  yPos += 5;
  doc.text(`Teléfono: ${order.clienteTelefono || 'No registrado'}`, marginLeft, yPos);
  yPos += 5;
  doc.text(`Email: ${order.clienteEmail || 'No registrado'}`, marginLeft, yPos);
  yPos += 5;
  doc.text(`Dirección de entrega: ${order.direccionEntrega || 'No especificada'}`, marginLeft, yPos);
  yPos += 5;
  doc.text(`Fecha del pedido: ${formatDate(order.fechaPedido)}`, marginLeft, yPos);
  yPos += 10;

  // ========== ESTADOS ==========
  const estadoLogisticoLabel = ESTADO_LOGISTICO_LABELS[order.estadoLogistico] || order.estadoLogistico;
  const estadoPagoLabel = ESTADO_PAGO_LABELS[order.pagoEstado] || order.pagoEstado;

  doc.setFontSize(12);
  doc.setTextColor(0, 77, 119);
  doc.text('Estados', marginLeft, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(`Estado del pedido: ${estadoLogisticoLabel}`, marginLeft, yPos);
  yPos += 5;
  doc.text(`Estado de pago: ${estadoPagoLabel}`, marginLeft, yPos);
  yPos += 5;
  doc.text(`Origen: ${order.origen === 'manual' ? 'Manual (Asesor)' : 'Web'}`, marginLeft, yPos);
  yPos += 5;
  doc.text(`Asesor: ${asesorNombre}`, marginLeft, yPos);
  yPos += 10;

  // ========== PRODUCTOS ==========
  doc.setFontSize(12);
  doc.setTextColor(0, 77, 119);
  doc.text('Productos del Pedido', marginLeft, yPos);
  yPos += 4;

  const productosRows = order.productos.map(prod => [
    prod.nombre,
    prod.cantidad.toString(),
    formatCurrency(prod.precioUnitario),
    formatCurrency(prod.subtotal),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: productosRows,
    foot: [[
      '',
      '',
      'Total:',
      formatCurrency(order.total)
    ]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [0, 77, 119], textColor: 255 },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    margin: { left: marginLeft },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ========== PAGOS REALIZADOS ==========
  if (pagos.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 77, 119);
    doc.text('Pagos Realizados', marginLeft, yPos);
    yPos += 4;

    const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
    const pagosRows = pagos.map(p => [
      formatDate(p.fechaPago),
      p.metodoPago,
      formatCurrency(p.monto),
      p.comprobante || '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Método', 'Monto', 'Comprobante']],
      body: pagosRows,
      foot: [[
        '',
        'Total pagado:',
        formatCurrency(totalPagado),
        ''
      ]],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [0, 77, 119], textColor: 255 },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      margin: { left: marginLeft },
    });

    yPos = doc.lastAutoTable.finalY + 5;
  }

  // ========== SALDO PENDIENTE ==========
  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const saldoPendiente = Math.max(0, order.total - totalPagado);

  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(`Saldo pendiente: ${formatCurrency(saldoPendiente)}`, marginLeft, yPos);

  // ========== MOTIVO DE CANCELACIÓN (si aplica) ==========
  if (order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO && order.motivoCancelacion) {
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(180, 0, 0);
    doc.text(`Motivo de cancelación: ${order.motivoCancelacion}`, marginLeft, yPos);
  }

  // ========== PIE DE PÁGINA ==========
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleString('es-CO')}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar
  const fileName = `pedido_${order.numeroPedido || order.id}.pdf`;
  doc.save(fileName);
};