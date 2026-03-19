import * as XLSX from 'xlsx';
import { UsersDB } from '../../../users/services/usersDB';

// ─── Claves de almacenamiento ─────────────────────────────────────────────────
export const SALES_STORAGE_KEY = 'pm_sales';
export const USERS_STORAGE_KEY = 'pm_users';

// ─── Constantes de formulario ─────────────────────────────────────────────────
export const METODOS_PAGO  = ['Efectivo', 'Crédito', 'Transferencia'];
export const ESTADOS_VENTA = ['Aprobada', 'Anulada', 'Esp. aprobación', 'Desaprobada'];
export const ENTREGAS      = ['Cliente lo recoge', 'Domicilio'];

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

  // Resuelve el nombre igual que resolveUserName en SalesTable
  const users = UsersDB.list();
  const resolveName = (userId, storedName) => {
    if (!userId) return storedName || '';
    const found = users.find((u) => String(u.id) === String(userId));
    return found ? found.name : (storedName || '');
  };

  return data.filter((row) => {
    const cliente  = resolveName(row.clienteId,  row.cliente).toLowerCase();
    const vendedor = resolveName(row.vendedorId, row.vendedor).toLowerCase();
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

// ─── Validación del formulario de venta ──────────────────────────────────────
export const validateForm = (form, items) => {
  const errors = {};
  if (!form.clienteId)                                       errors.clienteId  = 'Seleccione un cliente.';
  if (!form.vendedorId)                                      errors.vendedorId = 'Seleccione un vendedor.';
  if (!form.metodoPago)                                      errors.metodoPago = 'Seleccione un método de pago.';
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

  const users = UsersDB.list();
  const resolveName = (userId, storedName) => {
    if (!userId) return storedName || '—';
    const found = users.find((u) => String(u.id) === String(userId));
    return found ? found.name : (storedName || '—');
  };

  const rows = sales.map((s) => ({
    'No. Factura':       s.factura,
    'Cliente':           resolveName(s.clienteId,  s.cliente),
    'Vendedor':          resolveName(s.vendedorId, s.vendedor),
    'Fecha':             s.fecha,
    'Método de Pago':    s.metodoPago,
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