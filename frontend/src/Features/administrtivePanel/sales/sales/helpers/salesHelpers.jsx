import * as XLSX from 'xlsx';
import { UsersDB }        from '../../../users/services/usersDB';
import { clientsService, creditAccountService } from '../../clients/services/clientsService';

// ─── Claves de almacenamiento ─────────────────────────────────────────────────
export const SALES_STORAGE_KEY = 'pm_sales';
export const USERS_STORAGE_KEY = 'users';

// ─── Constantes de formulario ─────────────────────────────────────────────────
export const METODOS_PAGO  = ['Efectivo', 'Crédito', 'Transferencia'];
export const ESTADOS_VENTA = ['Aprobada', 'Anulada', 'Esp. aprobación', 'Desaprobada'];
export const ENTREGAS      = ['Cliente lo recoge', 'Domicilio'];

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
  'Efectivo': 0,
  'Crédito': 0,
  'Transferencia': 0,
});

// ─── Validación de montos de pago ────────────────────────────────────────────
/**
 * Valida que la suma de los montos de pago no supere el total de la venta.
 * @param {Object} paymentAmounts - Objeto con montos por método de pago.
 * @param {number} total - Total de la venta (número, no formateado).
 * @returns {string|null} Mensaje de error o null si es válido.
 */
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
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(value);

// ─── Fecha de hoy en formato colombiano ──────────────────────────────────────
export const today = () =>
  new Date().toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

// ─── Número de factura aleatorio (9 dígitos) ──────────────────────────────────
export const generateFactura = () =>
  String(Math.floor(100000000 + Math.random() * 900000000));

// ─── Cargar usuarios desde UsersDB ───────────────────────────────────────────
export const loadSalesUsers = () => UsersDB.list();

// ─── Resaltador de texto para la tabla ───────────────────────────────────────
export function highlight(text, term) {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.trim()})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">{part}</mark>
      : part
  );
}

// ─── Filtro global para la tabla de ventas ────────────────────────────────────
export const filterSales = (data, search) => {
  const term = search.toLowerCase().trim();
  if (!term) return data;

  const vendors = UsersDB.list();

  const resolveClient = (clientId, storedName) => {
    const found = clientsService.getById(clientId);
    return found ? found.name : (storedName || '');
  };

  const resolveVendor = (vendorId, storedName) => {
    if (!vendorId) return storedName || '';
    const found = vendors.find((u) => String(u.id) === String(vendorId));
    return found ? found.name : (storedName || '');
  };

  return data.filter((row) => {
    const cliente  = resolveClient(row.clienteId,  row.cliente).toLowerCase();
    const vendedor = resolveVendor(row.vendedorId, row.vendedor).toLowerCase();
    return (
      cliente.includes(term)                           ||
      vendedor.includes(term)                          ||
      String(row.factura).toLowerCase().includes(term) ||
      row.fecha.toLowerCase().includes(term)           ||
      row.metodoPago.toLowerCase().includes(term)      ||
      String(row.total).toLowerCase().includes(term)   ||
      row.estado.toLowerCase().includes(term)
    );
  });
};

// ─── Validación del formulario de venta (sin pagos) ──────────────────────────
export const validateForm = (form, items) => {
  const errors = {};
  if (!form.clienteId)                                       errors.clienteId  = 'Seleccione un cliente.';
  if (!form.vendedorId)                                      errors.vendedorId = 'Seleccione un vendedor.';
  if (!form.metodoPago || (Array.isArray(form.metodoPago) && form.metodoPago.length === 0))
                                                             errors.metodoPago = 'Seleccione al menos un método de pago.';
  if (!form.estado)                                          errors.estado     = 'Seleccione un estado.';
  if (!form.entrega)                                         errors.entrega    = 'Seleccione una opción de entrega.';
  if (form.entrega === 'Domicilio' && !form.direccion?.trim())
                                                             errors.direccion  = 'Ingrese la dirección de entrega.';
  if (items.length === 0)                                    errors.items      = 'Agrega al menos un producto al pedido.';
  return errors;
};

// ─── Exportar ventas a Excel (rediseñado estilo excelExporter) ────────────────
export const downloadSalesExcel = () => {
  const stored = localStorage.getItem(SALES_STORAGE_KEY);
  const sales  = stored ? JSON.parse(stored) : [];

  if (sales.length === 0) return false;

  // Helper: formatear moneda COP
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  // Helper: formatear fecha (dd/mm/yyyy)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`;
    return dateStr;
  };

  // Resolver nombres de clientes y vendedores
  const vendors = UsersDB.list();
  const resolveClient = (clientId, storedName) => {
    const found = clientsService.getById(clientId);
    return found ? found.name : (storedName || '—');
  };
  const resolveVendor = (vendorId, storedName) => {
    if (!vendorId) return storedName || '—';
    const found = vendors.find((u) => String(u.id) === String(vendorId));
    return found ? found.name : (storedName || '—');
  };

  // Fechas para encabezados
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedDateTime = currentDate.toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // ======================= HOJA 1: RESUMEN DE VENTAS =======================
  const summaryHeaders = [
    'No. Factura', 'Cliente', 'Vendedor', 'Fecha', 'Método de Pago',
    'Total', 'Estado', 'Registrado Desde'
  ];
  const summaryData = sales.map(s => [
    s.factura || '',
    resolveClient(s.clienteId, s.cliente),
    resolveVendor(s.vendedorId, s.vendedor),
    s.fecha || '',
    Array.isArray(s.metodoPago) ? s.metodoPago.join(', ') : (s.metodoPago || ''),
    formatCurrency(s.total || 0),
    s.estado || '—',
    s.registradoDesde || '—'
  ]);

  // ======================= HOJA 2: DETALLE DE PRODUCTOS =======================
  const productHeaders = [
    'No. Factura', 'Cliente', 'Fecha Venta', 'Producto',
    'Cantidad', 'Precio Unitario', 'Total Producto'
  ];
  const productData = [];
  sales.forEach(sale => {
    const items = sale.items || [];
    const cliente = resolveClient(sale.clienteId, sale.cliente);
    if (items.length === 0) {
      productData.push([
        sale.factura || '',
        cliente,
        sale.fecha || '',
        'Sin productos registrados',
        '',
        '',
        ''
      ]);
    } else {
      items.forEach(item => {
        const cantidad = item.cantidad || 1;
        const precioUnit = item.precioUnit || 0;
        const totalProducto = cantidad * precioUnit;
        productData.push([
          sale.factura || '',
          cliente,
          sale.fecha || '',
          item.nombre || 'Producto sin nombre',
          cantidad,
          formatCurrency(precioUnit),
          formatCurrency(totalProducto)
        ]);
      });
    }
  });

  // ======================= HOJA 3: ESTADÍSTICAS =======================
  const statsHeaders = ['Métrica', 'Valor'];
  const totalSales = sales.length;
  const totalValue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalItems = sales.reduce((sum, s) => sum + (s.items?.length || 0), 0);
  const totalUnits = sales.reduce((sum, s) => {
    const units = (s.items || []).reduce((acc, item) => acc + (item.cantidad || 0), 0);
    return sum + units;
  }, 0);
  const pendingSales = sales.filter(s => s.estado === 'Esp. aprobación').length;
  const approvedSales = sales.filter(s => s.estado === 'Aprobada').length;
  const cancelledSales = sales.filter(s => s.estado === 'Anulada').length;
  const avgPerSale = totalSales > 0 ? totalValue / totalSales : 0;

  const statsData = [
    ['Total Ventas', totalSales],
    ['Total Valor Vendido', formatCurrency(totalValue)],
    ['Total Productos (líneas)', totalItems],
    ['Total Unidades Vendidas', totalUnits],
    ['Promedio por Venta', formatCurrency(avgPerSale)],
    [''],
    ['Ventas Aprobadas', approvedSales],
    ['Ventas Pendientes', pendingSales],
    ['Ventas Anuladas', cancelledSales],
    [''],
    ['Fecha de Exportación', formattedDateTime]
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
    ...summaryData
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
  summaryWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: summaryHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: summaryHeaders.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: summaryHeaders.length - 1 } }
  ];
  summaryWs['!cols'] = [
    { wch: 16 }, { wch: 28 }, { wch: 28 }, { wch: 14 },
    { wch: 20 }, { wch: 14 }, { wch: 18 }, { wch: 18 }
  ];

  // --- Hoja Detalle de Productos ---
  const productSheetData = [
    ['VENTAS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['DETALLE DE PRODUCTOS VENDIDOS'],
    [''],
    productHeaders,
    ...productData
  ];
  const productWs = XLSX.utils.aoa_to_sheet(productSheetData);
  productWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: productHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: productHeaders.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: productHeaders.length - 1 } }
  ];
  productWs['!cols'] = [
    { wch: 16 }, { wch: 30 }, { wch: 14 }, { wch: 35 },
    { wch: 12 }, { wch: 16 }, { wch: 16 }
  ];

  // --- Hoja Estadísticas ---
  const statsSheetData = [
    ['VENTAS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['ESTADÍSTICAS'],
    [''],
    statsHeaders,
    ...statsData
  ];
  const statsWs = XLSX.utils.aoa_to_sheet(statsSheetData);
  statsWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }
  ];
  statsWs['!cols'] = [{ wch: 28 }, { wch: 28 }];

  // Agregar hojas al libro
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen Ventas');
  XLSX.utils.book_append_sheet(wb, productWs, 'Detalle Productos');
  XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas');

  // Descargar archivo
  const fileName = `ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return true;
};