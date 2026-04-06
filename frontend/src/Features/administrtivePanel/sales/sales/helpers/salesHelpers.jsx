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

// ─── Exportar ventas a Excel ──────────────────────────────────────────────────
export const downloadSalesExcel = () => {
  const stored = localStorage.getItem(SALES_STORAGE_KEY);
  const sales  = stored ? JSON.parse(stored) : [];

  if (sales.length === 0) return false;

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

  const rows = sales.map((s) => ({
    'No. Factura':       s.factura,
    'Cliente':           resolveClient(s.clienteId,  s.cliente),
    'Vendedor':          resolveVendor(s.vendedorId, s.vendedor),
    'Fecha':             s.fecha,
    'Método de Pago':    Array.isArray(s.metodoPago) ? s.metodoPago.join(', ') : s.metodoPago,
    'Total':             s.total,
    'Estado':            s.estado,
    'Registrado Desde':  s.registradoDesde ?? '—',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook  = XLSX.utils.book_new();

  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 28 },
    { wch: 28 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

  const fecha = new Date()
    .toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-');

  XLSX.writeFile(workbook, `ventas_${fecha}.xlsx`);
  return true;
};