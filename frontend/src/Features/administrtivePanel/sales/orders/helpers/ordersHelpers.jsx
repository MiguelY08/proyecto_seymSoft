// src/features/orders/helpers/ordersHelpers.jsx
import React from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DollarSign, Package } from 'lucide-react';
import { ESTADOS_LOGISTICOS, ESTADOS_PAGO, ORIGENES } from '../services/ordersService';
import logoUrl from '../../../../../assets/PMLogo_Horizontal.png';

// ─── Textos capitalizados para mostrar ───────────────────────────────────────
export const ESTADO_LOGISTICO_LABELS = {
  [ESTADOS_LOGISTICOS.EN_PROCESO]: 'En proceso',
  [ESTADOS_LOGISTICOS.LISTO]:      'Listo',
  [ESTADOS_LOGISTICOS.ENTREGADO]:  'Entregado',
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
  [ESTADOS_LOGISTICOS.ENTREGADO]:  { bg: '#dbeafe', color: '#1d4ed8', dot: '#2563eb' },
  [ESTADOS_LOGISTICOS.CANCELADO]:  { bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626' },
};

export const ESTADO_LOGISTICO_TABLE_CLASSES = {
  [ESTADOS_LOGISTICOS.EN_PROCESO]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  [ESTADOS_LOGISTICOS.LISTO]:      'bg-green-100  text-green-700  border-green-300',
  [ESTADOS_LOGISTICOS.ENTREGADO]:  'bg-blue-100   text-blue-700   border-blue-300',
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
    [ESTADOS_LOGISTICOS.ENTREGADO]:  'bg-blue-500',
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
  const esEntregado = estadoLogistico === ESTADOS_LOGISTICOS.ENTREGADO;
  return { deshabilitado: esCancelado || esEntregado };
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
      <Package className="w-3 h-3 shrink-0" strokeWidth={2} />
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
      <DollarSign className="w-3 h-3 shrink-0" strokeWidth={2} />
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
const exportOrdersToExcelLegacy = (orders) => {
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

const COMPANY_COLOR = '004D77';
const LIGHT_BLUE = 'DCEBF3';
const LIGHT_GRAY = 'F3F4F6';
const WHITE = 'FFFFFF';
const CURRENCY_FORMAT = '"$"#,##0';

const normalizeValue = (value, fallback = '') =>
  value === undefined || value === null || value === '' ? fallback : value;

const formatDateForExcel = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? isoString : date.toLocaleDateString('es-CO');
};

const getOrderNumber = (order) => normalizeValue(order.numeroPedido ?? order.id, 'Sin numero');
const getOrderProducts = (order) => order.productos ?? order.details ?? [];
const getOrderShippingAmount = (order) => Number(order.shippingAmount ?? order.shipping_amount ?? 0) || 0;

const getOriginLabel = (origin) => {
  if (origin === ORIGENES.MANUAL) return 'Manual';
  if (origin === ORIGENES.WEB) return 'Web';
  return normalizeValue(origin, 'Sin origen');
};

const getProductName = (product) =>
  normalizeValue(product.nombre ?? product.productName ?? product.product?.name, 'Producto sin nombre');

const getProductQuantity = (product) => Number(product.cantidad ?? product.quantity ?? 0);

const getProductUnitPrice = (product) =>
  Number(product.precioUnitario ?? product.unitPrice ?? product.product?.retailPrice ?? 0);

const getProductLineTotal = (product) => {
  const explicitTotal = product.subtotal ?? product.total ?? product.lineTotal ?? product.totalProducto;
  if (explicitTotal !== undefined && explicitTotal !== null && explicitTotal !== '') {
    return Number(explicitTotal) || 0;
  }

  return getProductQuantity(product) * getProductUnitPrice(product);
};

const styleTitle = (worksheet, range, title) => {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(':')[0]);
  cell.value = title;
  cell.font = { bold: true, size: 18, color: { argb: WHITE } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COMPANY_COLOR } };
};

const styleSubtitle = (worksheet, range, text) => {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(':')[0]);
  cell.value = text;
  cell.alignment = { horizontal: 'center' };
  cell.font = { italic: true, color: { argb: COMPANY_COLOR } };
};

const styleHeaderRow = (row) => {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COMPANY_COLOR } };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
};

const styleDataRow = (row, index) => {
  row.eachCell((cell) => {
    cell.alignment = { vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: index % 2 === 0 ? WHITE : LIGHT_GRAY },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: LIGHT_BLUE } },
      left: { style: 'thin', color: { argb: LIGHT_BLUE } },
      bottom: { style: 'thin', color: { argb: LIGHT_BLUE } },
      right: { style: 'thin', color: { argb: LIGHT_BLUE } },
    };
  });
};

const setupWorksheetHeader = (worksheet, title, subtitle, lastColumn) => {
  styleTitle(worksheet, `A1:${lastColumn}1`, title);
  styleSubtitle(worksheet, `A2:${lastColumn}2`, subtitle);
  worksheet.addRow([]);
};

const applyWorksheetTableSettings = (worksheet, headerRowNumber, lastColumn) => {
  worksheet.views = [{ state: 'frozen', ySplit: headerRowNumber }];
  worksheet.autoFilter = {
    from: `A${headerRowNumber}`,
    to: `${lastColumn}${headerRowNumber}`,
  };
};

const buildOrdersSummarySheet = (workbook, orders, subtitle) => {
  const worksheet = workbook.addWorksheet('Resumen Pedidos');
  setupWorksheetHeader(worksheet, 'PEDIDOS', subtitle, 'M');

  worksheet.columns = [
    { key: 'orderNumber', width: 14 },
    { key: 'client', width: 30 },
    { key: 'deliveryDepartment', width: 22 },
    { key: 'deliveryCity', width: 26 },
    { key: 'deliveryAddress', width: 40 },
    { key: 'date', width: 16 },
    { key: 'shippingAmount', width: 16 },
    { key: 'total', width: 16 },
    { key: 'logisticStatus', width: 18 },
    { key: 'paymentStatus', width: 18 },
    { key: 'origin', width: 14 },
    { key: 'cancellationReason', width: 35 },
    { key: 'productCount', width: 18 },
  ];

  const headerRow = worksheet.addRow([
    'No. Pedido',
    'Cliente',
    'Departamento',
    'Municipio/Ciudad',
    'Direccion de entrega',
    'Fecha pedido',
    'Envio',
    'Total',
    'Estado logistico',
    'Estado de pago',
    'Origen',
    'Motivo cancelacion',
    'Cantidad productos',
  ]);
  styleHeaderRow(headerRow);

  orders.forEach((order, index) => {
    const row = worksheet.addRow({
      orderNumber: getOrderNumber(order),
      client: normalizeValue(order.clienteNombre, 'Cliente no identificado'),
      deliveryDepartment: normalizeValue(order.departamentoEntregaNombre),
      deliveryCity: normalizeValue(order.ciudadEntregaNombre),
      deliveryAddress: normalizeValue(order.direccionEntrega),
      date: formatDateForExcel(order.fechaPedido),
      shippingAmount: getOrderShippingAmount(order),
      total: Number(order.total ?? 0),
      logisticStatus: ESTADO_LOGISTICO_LABELS[order.estadoLogistico] || normalizeValue(order.estadoLogistico),
      paymentStatus: ESTADO_PAGO_LABELS[order.pagoEstado] || normalizeValue(order.pagoEstado),
      origin: getOriginLabel(order.origen),
      cancellationReason: normalizeValue(order.motivoCancelacion),
      productCount: getOrderProducts(order).length,
    });

    row.getCell('shippingAmount').numFmt = CURRENCY_FORMAT;
    row.getCell('total').numFmt = CURRENCY_FORMAT;
    styleDataRow(row, index);
  });

  applyWorksheetTableSettings(worksheet, 4, 'M');
};

const buildOrdersProductsSheet = (workbook, orders, subtitle) => {
  const worksheet = workbook.addWorksheet('Detalle Productos');
  setupWorksheetHeader(worksheet, 'DETALLE DE PRODUCTOS PEDIDOS', subtitle, 'G');

  worksheet.columns = [
    { key: 'orderNumber', width: 14 },
    { key: 'client', width: 30 },
    { key: 'date', width: 16 },
    { key: 'product', width: 38 },
    { key: 'quantity', width: 12 },
    { key: 'unitPrice', width: 16 },
    { key: 'lineTotal', width: 16 },
  ];

  const headerRow = worksheet.addRow([
    'No. Pedido',
    'Cliente',
    'Fecha pedido',
    'Producto',
    'Cantidad',
    'Precio unitario',
    'Total producto',
  ]);
  styleHeaderRow(headerRow);

  let rowIndex = 0;
  orders.forEach((order) => {
    const products = getOrderProducts(order);
    const orderBase = {
      orderNumber: getOrderNumber(order),
      client: normalizeValue(order.clienteNombre, 'Cliente no identificado'),
      date: formatDateForExcel(order.fechaPedido),
    };

    if (products.length === 0) {
      const row = worksheet.addRow({ ...orderBase, product: 'Sin productos registrados' });
      styleDataRow(row, rowIndex);
      rowIndex += 1;
      return;
    }

    products.forEach((product) => {
      const row = worksheet.addRow({
        ...orderBase,
        product: getProductName(product),
        quantity: getProductQuantity(product),
        unitPrice: getProductUnitPrice(product),
        lineTotal: getProductLineTotal(product),
      });

      row.getCell('unitPrice').numFmt = CURRENCY_FORMAT;
      row.getCell('lineTotal').numFmt = CURRENCY_FORMAT;
      styleDataRow(row, rowIndex);
      rowIndex += 1;
    });
  });

  applyWorksheetTableSettings(worksheet, 4, 'G');
};

const buildOrdersStatsSheet = (workbook, orders, subtitle) => {
  const worksheet = workbook.addWorksheet('Estadisticas');
  setupWorksheetHeader(worksheet, 'ESTADISTICAS DE PEDIDOS', subtitle, 'B');

  worksheet.columns = [
    { key: 'metric', width: 36 },
    { key: 'value', width: 24 },
  ];

  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const totalProductLines = orders.reduce((sum, order) => sum + getOrderProducts(order).length, 0);
  const totalUnits = orders.reduce(
    (sum, order) => sum + getOrderProducts(order).reduce((acc, product) => acc + getProductQuantity(product), 0),
    0
  );
  const enProceso = orders.filter((order) => order.estadoLogistico === ESTADOS_LOGISTICOS.EN_PROCESO).length;
  const listo = orders.filter((order) => order.estadoLogistico === ESTADOS_LOGISTICOS.LISTO).length;
  const cancelado = orders.filter((order) => order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO).length;
  const pendientePago = orders.filter((order) => order.pagoEstado === ESTADOS_PAGO.PENDIENTE).length;
  const pagado = orders.filter((order) => order.pagoEstado === ESTADOS_PAGO.PAGADO).length;
  const avgPerOrder = totalOrders > 0 ? totalValue / totalOrders : 0;

  const headerRow = worksheet.addRow(['Metrica', 'Valor']);
  styleHeaderRow(headerRow);

  const rows = [
    ['Total pedidos', totalOrders],
    ['Total valor', totalValue],
    ['Promedio por pedido', avgPerOrder],
    ['Total productos (lineas)', totalProductLines],
    ['Total unidades', totalUnits],
    ['Estado logistico: En proceso', enProceso],
    ['Estado logistico: Listo', listo],
    ['Estado logistico: Cancelado', cancelado],
    ['Estado de pago: Pendiente', pendientePago],
    ['Estado de pago: Pagado', pagado],
    ['Fecha de exportacion', new Date().toLocaleString('es-CO')],
  ];

  rows.forEach(([metric, value], index) => {
    const row = worksheet.addRow({ metric, value });
    if (['Total valor', 'Promedio por pedido'].includes(metric)) {
      row.getCell('value').numFmt = CURRENCY_FORMAT;
    }
    styleDataRow(row, index);
  });

  applyWorksheetTableSettings(worksheet, 4, 'B');
};

export const exportOrdersToExcel = async (orders) => {
  if (!orders || orders.length === 0) return false;

  const workbook = new ExcelJS.Workbook();
  const currentDate = new Date();
  const fileDate = currentDate.toISOString().split('T')[0];
  const subtitle = `Fecha de exportacion: ${currentDate.toLocaleString('es-CO')}`;

  workbook.creator = 'SeymSoft';
  workbook.created = currentDate;

  buildOrdersSummarySheet(workbook, orders, subtitle);
  buildOrdersProductsSheet(workbook, orders, subtitle);
  buildOrdersStatsSheet(workbook, orders, subtitle);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `pedidos_${fileDate}.xlsx`);
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
export const exportLegacyOrderToPDF = (order, pagos = [], asesorNombre = 'N/A') => {
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

  const ubicacionEntrega = [order.ciudadEntregaNombre, order.departamentoEntregaNombre]
    .filter(Boolean)
    .join(', ');
  const isRecoge = String(order.tipoEntrega ?? order.deliveryType ?? '').toLowerCase().includes('recoge');
  const shippingAmount = getOrderShippingAmount(order);
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
  doc.text(`Ubicacion: ${ubicacionEntrega || 'No registrada'}`, marginLeft, yPos);
  yPos += 5;
  doc.text(`Dirección de entrega: ${order.direccionEntrega || 'No especificada'}`, marginLeft, yPos);
  yPos += 5;
  if (!isRecoge) {
    doc.text(`Envio: ${formatCurrency(shippingAmount)}`, marginLeft, yPos);
    yPos += 5;
  }
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

  const productosFoot = !isRecoge
    ? [
        ['', '', 'Envio:', formatCurrency(shippingAmount)],
        ['', '', 'Total:', formatCurrency(order.total)],
      ]
    : [['', '', 'Total:', formatCurrency(order.total)]];

  autoTable(doc, {
    startY: yPos,
    head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: productosRows,
    foot: productosFoot,
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

const loadPdfLogo = async () => {
  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/** Documento de pedido con la plantilla corporativa de Papeleria Magic. */
export const exportOrderToPDF = async (order, pagos = [], asesorNombre = 'No registrado') => {
  if (!order) return;

  const BLUE = [0, 77, 119];
  const LIGHT_BLUE = [232, 242, 248];
  const TEXT = [51, 65, 85];
  const margin = 14;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value) || 0);
  const date = (value) => value ? new Date(value).toLocaleDateString('es-CO') : 'No registrada';
  const value = (item, fallback = 'No registrado') => String(item ?? '').trim() || fallback;
  const logisticStatus = ESTADO_LOGISTICO_LABELS[order.estadoLogistico] || value(order.estadoLogistico);
  const paymentStatus = ESTADO_PAGO_LABELS[order.pagoEstado] || value(order.pagoEstado);
  const isPickup = String(order.tipoEntrega ?? order.deliveryType ?? '').toLowerCase().includes('recoge');
  const deliveryPlace = [order.ciudadEntregaNombre, order.departamentoEntregaNombre].filter(Boolean).join(', ');
  const shipping = getOrderShippingAmount(order);
  const logo = await loadPdfLogo();

  const field = (label, content, x, y, width) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    doc.text(doc.splitTextToSize(value(content), width), x, y + 4.5);
  };

  // Header
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DETALLE DE PEDIDO', margin, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Papeleria Magic · Comprobante de venta', margin, 21);
  if (logo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 58, 5, 44, 16, 2, 2, 'F');
    doc.addImage(logo, 'PNG', pageWidth - 55, 8, 38, 10);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`#${order.numeroPedido || order.id}`, pageWidth - margin, 29, { align: 'right' });

  let y = 44;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 39, 2, 2, 'F');
  field('Cliente', order.clienteNombre, 19, y + 8, 72);
  field('Telefono', order.clienteTelefono, 19, y + 23, 72);
  field('Fecha del pedido', date(order.fechaPedido), 108, y + 8, 38);
  field('Estado del pedido', logisticStatus, 108, y + 23, 38);
  field('Estado de pago', paymentStatus, 157, y + 8, 35);
  field('Asesor', asesorNombre, 157, y + 23, 35);
  y += 47;
  field('Correo', order.clienteEmail, margin, y, 74);
  field('Entrega', isPickup ? 'Recoge en tienda' : deliveryPlace, 91, y, 45);
  field('Direccion', isPickup ? 'No aplica' : order.direccionEntrega, 143, y, 52);
  y += 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BLUE);
  doc.text('Productos del pedido', margin, y);
  const productRows = (order.productos || []).map((product) => [
    value(product.nombre, 'Producto'), String(product.cantidad ?? 0), money(product.precioUnitario), money(product.subtotal),
  ]);
  const productFoot = isPickup
    ? [['', '', 'Total:', money(order.total)]]
    : [['', '', 'Envio:', money(shipping)], ['', '', 'Total:', money(order.total)]];
  autoTable(doc, {
    startY: y + 4, margin: { left: margin, right: margin, bottom: 20 },
    head: [['Producto', 'Cant.', 'Precio unitario', 'Subtotal']],
    body: productRows.length ? productRows : [['Sin productos registrados', '-', '-', money(0)]], foot: productFoot,
    theme: 'grid', styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.4, lineColor: [220, 230, 236], lineWidth: 0.2 },
    headStyles: { fillColor: BLUE, textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: LIGHT_BLUE, textColor: BLUE, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 85 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 34, halign: 'right' }, 3: { cellWidth: 38, halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 10;

  if (pagos.length) {
    if (y > 245) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...BLUE); doc.text('Pagos realizados', margin, y);
    const paid = pagos.reduce((sum, payment) => sum + (Number(payment.monto) || 0), 0);
    autoTable(doc, {
      startY: y + 4, margin: { left: margin, right: margin, bottom: 20 },
      head: [['Fecha', 'Metodo', 'Monto', 'Comprobante']],
      body: pagos.map((payment) => [date(payment.fechaPago), value(payment.metodoPago), money(payment.monto), value(payment.comprobante, '-')]),
      foot: [['', 'Total pagado:', money(paid), '']], theme: 'grid',
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.4, lineColor: [220, 230, 236], lineWidth: 0.2 },
      headStyles: { fillColor: BLUE, textColor: 255, fontStyle: 'bold', halign: 'center' },
      footStyles: { fillColor: LIGHT_BLUE, textColor: BLUE, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 60 }, 2: { cellWidth: 38, halign: 'right' }, 3: { cellWidth: 44 } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  const totalPaid = pagos.reduce((sum, payment) => sum + (Number(payment.monto) || 0), 0);
  if (y > 265) { doc.addPage(); y = 20; }
  doc.setFillColor(...LIGHT_BLUE); doc.roundedRect(pageWidth - 83, y, 69, 17, 2, 2, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...TEXT); doc.text('SALDO PENDIENTE', pageWidth - 78, y + 6);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...BLUE); doc.text(money(Math.max(0, Number(order.total || 0) - totalPaid)), pageWidth - 19, y + 13, { align: 'right' });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
    doc.text(`Generado el ${new Date().toLocaleString('es-CO')}`, margin, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Pagina ${page} de ${pages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  }
  doc.save(`pedido_${order.numeroPedido || order.id}.pdf`);
};
