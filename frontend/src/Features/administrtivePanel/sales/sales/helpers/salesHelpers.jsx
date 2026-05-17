// src/features/administrtivePanel/sales/helpers/salesHelpers.js
import * as XLSX from 'xlsx';
import { UsersDB } from '../../../users/services/usersDB';
import { clientsService, creditAccountService } from '../../clients/services/clientsService';
import { SalesServices } from '../services/salesServices';

// ─── Claves de almacenamiento (deprecadas, pero mantenidas por compatibilidad) ─
export const SALES_STORAGE_KEY = 'pm_sales';
export const USERS_STORAGE_KEY = 'users';

// ─── Constantes de formulario ─────────────────────────────────────────────────
export const METODOS_PAGO = ['Efectivo', 'Crédito', 'Transferencia'];
export const ESTADOS_VENTA = ['Pagada', 'Cancelada']; // ✅ actualizado
export const ENTREGAS = ['Cliente lo recoge', 'Domicilio'];

export const getClientCreditInfo = (clienteId) => {
  if (!clienteId) return { creditAmount: 0, balance: 0, available: 0 };
  const account = creditAccountService.getByClientId(clienteId);
  if (!account) return { creditAmount: 0, balance: 0, available: 0 };
  const available = account.creditAmount - account.balance;
  return {
    creditAmount: account.creditAmount,
    balance: account.balance,
    available: available > 0 ? available : 0,
  };
};

// ─── Estructura inicial de montos de pago ─────────────────────────────────────
export const getInitialPaymentAmounts = () => ({
  Efectivo: 0,
  Crédito: 0,
  Transferencia: 0,
});

// ─── Validación de montos de pago ────────────────────────────────────────────
export const validatePaymentAmounts = (paymentAmounts, total, clienteId) => {
  const suma = Object.values(paymentAmounts).reduce((acc, val) => acc + (Number(val) || 0), 0);
  if (suma > total) {
    const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    return `La suma de los pagos (${formatter.format(suma)}) supera el total de la venta (${formatter.format(total)}).`;
  }
  const creditAmount = paymentAmounts['Crédito'] || 0;
  if (creditAmount > 0 && clienteId) {
    const creditInfo = getClientCreditInfo(clienteId);
    if (creditAmount > creditInfo.available) {
      const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);
      return `El monto a crédito (${fmt(creditAmount)}) supera el cupo disponible (${fmt(creditInfo.available)}).`;
    }
  }
  return null;
};

// ─── Formateador de precios ───────────────────────────────────────────────────
export const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

// ─── Fecha de hoy en formato colombiano ──────────────────────────────────────
export const today = () =>
  new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

// ─── Número de factura aleatorio (9 dígitos) ──────────────────────────────────
export const generateFactura = () =>
  String(Math.floor(100000000 + Math.random() * 900000000));

// ─── Cargar usuarios desde UsersDB ───────────────────────────────────────────
export const loadSalesUsers = () => UsersDB.list();

// ─── Resaltador de texto para la tabla ───────────────────────────────────────
export function highlight(text, term) {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ─── Filtro global para la tabla de ventas (simplificado) ─────────────────────
export const filterSales = (data, search) => {
  const term = search.toLowerCase().trim();
  if (!term) return data;

  return data.filter((row) => {
    const cliente = (row.cliente || '').toLowerCase();
    const vendedor = (row.vendedor || '').toLowerCase();
    return (
      cliente.includes(term) ||
      vendedor.includes(term) ||
      String(row.factura).toLowerCase().includes(term) ||
      (row.fecha || '').toLowerCase().includes(term) ||
      (row.metodoPago || '').toLowerCase().includes(term) ||
      String(row.total).toLowerCase().includes(term) ||
      (row.estado || '').toLowerCase().includes(term)
    );
  });
};

// ─── Validación del formulario de venta (sin estado, fijo 'Pagada') ───────────
export const validateForm = (form, items) => {
  const errors = {};
  if (!form.clienteId) errors.clienteId = 'Seleccione un cliente.';
  if (!form.vendedorId) errors.vendedorId = 'Seleccione un vendedor.';
  if (!form.metodoPago || (Array.isArray(form.metodoPago) && form.metodoPago.length === 0))
    errors.metodoPago = 'Seleccione al menos un método de pago.';
  if (!form.entrega) errors.entrega = 'Seleccione una opción de entrega.';
  if (form.entrega === 'Domicilio' && !form.direccion?.trim())
    errors.direccion = 'Ingrese la dirección de entrega.';
  if (items.length === 0) errors.items = 'Agrega al menos un producto al pedido.';
  return errors;
};

// ─── Exportar ventas a Excel (actualizado para usar SalesServices) ────────────
export const downloadSalesExcel = () => {
  const sales = SalesServices.list();
  if (sales.length === 0) return false;

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => dateStr || '';

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedDateTime = currentDate.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // ======================= HOJA 1: RESUMEN DE VENTAS =======================
  const summaryHeaders = [
    'No. Factura',
    'Cliente',
    'Vendedor',
    'Fecha',
    'Método de Pago',
    'Total',
    'Estado',
    'Registrado Desde',
  ];
  const summaryData = sales.map((s) => [
    s.factura || '',
    s.cliente || '—',
    s.vendedor || '—',
    s.fecha || '',
    Array.isArray(s.metodoPago) ? s.metodoPago.join(', ') : s.metodoPago || '',
    formatCurrency(s.totalNumerico || 0),
    s.estado || '—',
    s.registradoDesde || '—',
  ]);

  // ======================= HOJA 2: DETALLE DE PRODUCTOS =======================
  const productHeaders = [
    'No. Factura',
    'Cliente',
    'Fecha Venta',
    'Producto',
    'Cantidad',
    'Precio Unitario',
    'Total Producto',
  ];
  const productData = [];
  sales.forEach((sale) => {
    const items = sale.items || [];
    const cliente = sale.cliente || '—';
    if (items.length === 0) {
      productData.push([sale.factura || '', cliente, sale.fecha || '', 'Sin productos registrados', '', '', '']);
    } else {
      items.forEach((item) => {
        const producto = item.product || {};
        const cantidad = item.cantidad || 1;
        const precioUnit = producto.precioDetalle || 0;
        const totalProducto = cantidad * precioUnit;
        productData.push([
          sale.factura || '',
          cliente,
          sale.fecha || '',
          producto.nombre || 'Producto sin nombre',
          cantidad,
          formatCurrency(precioUnit),
          formatCurrency(totalProducto),
        ]);
      });
    }
  });

  // ======================= HOJA 3: ESTADÍSTICAS =======================
  const statsHeaders = ['Métrica', 'Valor'];
  const totalSales = sales.length;
  const totalValue = sales.reduce((sum, s) => sum + (s.totalNumerico || 0), 0);
  const totalItems = sales.reduce((sum, s) => sum + (s.items?.length || 0), 0);
  const totalUnits = sales.reduce((sum, s) => {
    const units = (s.items || []).reduce((acc, item) => acc + (item.cantidad || 0), 0);
    return sum + units;
  }, 0);
  const pagadaSales = sales.filter((s) => s.estado === 'Pagada').length;
  const canceladaSales = sales.filter((s) => s.estado === 'Cancelada').length;
  const avgPerSale = totalSales > 0 ? totalValue / totalSales : 0;

  const statsData = [
    ['Total Ventas', totalSales],
    ['Total Valor Vendido', formatCurrency(totalValue)],
    ['Total Productos (líneas)', totalItems],
    ['Total Unidades Vendidas', totalUnits],
    ['Promedio por Venta', formatCurrency(avgPerSale)],
    [''],
    ['Ventas Pagadas', pagadaSales],
    ['Ventas Canceladas', canceladaSales],
    [''],
    ['Fecha de Exportación', formattedDateTime],
  ];

  // ======================= CREAR LIBRO Y HOJAS =======================
  const wb = XLSX.utils.book_new();

  // --- Hoja Resumen ---
  const summarySheetData = [
    ['VENTAS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['RESUMEN DE VENTAS'],
    [''],
    summaryHeaders,
    ...summaryData,
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
  summaryWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: summaryHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: summaryHeaders.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: summaryHeaders.length - 1 } },
  ];
  summaryWs['!cols'] = [
    { wch: 16 },
    { wch: 28 },
    { wch: 28 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
  ];

  // --- Hoja Detalle de Productos ---
  const productSheetData = [
    ['VENTAS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['DETALLE DE PRODUCTOS VENDIDOS'],
    [''],
    productHeaders,
    ...productData,
  ];
  const productWs = XLSX.utils.aoa_to_sheet(productSheetData);
  productWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: productHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: productHeaders.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: productHeaders.length - 1 } },
  ];
  productWs['!cols'] = [
    { wch: 16 },
    { wch: 30 },
    { wch: 14 },
    { wch: 35 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
  ];

  // --- Hoja Estadísticas ---
  const statsSheetData = [
    ['VENTAS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['ESTADÍSTICAS'],
    [''],
    statsHeaders,
    ...statsData,
  ];
  const statsWs = XLSX.utils.aoa_to_sheet(statsSheetData);
  statsWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
  ];
  statsWs['!cols'] = [{ wch: 28 }, { wch: 28 }];

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen Ventas');
  XLSX.utils.book_append_sheet(wb, productWs, 'Detalle Productos');
  XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas');

  const fileName = `ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return true;
};