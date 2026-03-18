import * as XLSX from 'xlsx';

// ─── Claves de almacenamiento ─────────────────────────────────────────────────
/** Clave para almacenar ventas en localStorage. */
export const SALES_STORAGE_KEY = 'pm_sales';
/** Clave para almacenar usuarios en localStorage. */
export const USERS_STORAGE_KEY = 'pm_users';

// ─── Constantes de formulario ─────────────────────────────────────────────────
/** Lista de métodos de pago disponibles. */
export const METODOS_PAGO  = ['Efectivo', 'Crédito', 'Transferencia'];
/** Lista de estados posibles para una venta. */
export const ESTADOS_VENTA = ['Aprobada', 'Anulada', 'Esp. aprobación', 'Desaprobada'];
/** Lista de opciones de entrega. */
export const ENTREGAS      = ['Cliente lo recoge', 'Domicilio'];

// ─── Formateador de precios ───────────────────────────────────────────────────
/**
 * Formatea un valor numérico como precio en pesos colombianos.
 * @param {number} value - Valor a formatear.
 * @returns {string} Precio formateado.
 */
export const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(value);

// ─── Fecha de hoy en formato colombiano ──────────────────────────────────────
/**
 * Obtiene la fecha actual en formato colombiano (DD/MM/YYYY).
 * @returns {string} Fecha formateada.
 */
export const today = () =>
  new Date().toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

// ─── Número de factura aleatorio (9 dígitos) ──────────────────────────────────
/**
 * Genera un número de factura aleatorio de 9 dígitos.
 * @returns {string} Número de factura.
 */
export const generateFactura = () =>
  String(Math.floor(100000000 + Math.random() * 900000000));

// ─── Cargar usuarios desde localStorage ──────────────────────────────────────
/**
 * Carga la lista de usuarios desde localStorage.
 * @returns {Array} Lista de usuarios o array vacío si falla.
 */
export const loadSalesUsers = () => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

// ─── Resaltador de texto para la tabla ───────────────────────────────────────
/**
 * Resalta el término de búsqueda en el texto usando marcas HTML.
 * @param {string} text - Texto original.
 * @param {string} term - Término a resaltar.
 * @returns {string|Array} Texto con resaltado o array de elementos React.
 */
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
/**
 * Filtra la lista de ventas según un término de búsqueda.
 * Busca en cliente, vendedor, factura, fecha, método de pago, total y estado.
 * @param {Array} data - Lista de ventas.
 * @param {string} search - Término de búsqueda.
 * @returns {Array} Lista filtrada.
 */
export const filterSales = (data, search) => {
  const term = search.toLowerCase().trim();
  if (!term) return data;
  return data.filter((row) =>
    row.cliente.toLowerCase().includes(term)         ||
    row.vendedor.toLowerCase().includes(term)        ||
    String(row.factura).toLowerCase().includes(term) ||
    row.fecha.toLowerCase().includes(term)           ||
    row.metodoPago.toLowerCase().includes(term)      ||
    String(row.total).toLowerCase().includes(term)   ||
    row.estado.toLowerCase().includes(term)
  );
};

// ─── Validación del formulario de venta ──────────────────────────────────────
/**
 * Valida los datos del formulario de venta y la lista de items.
 * @param {Object} form - Datos del formulario.
 * @param {Array} items - Lista de items del pedido.
 * @returns {Object} Objeto con errores de validación.
 */
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
/**
 * Exporta la lista de ventas a un archivo Excel.
 * @returns {boolean} True si se exportó exitosamente, false si no hay ventas.
 */
export const downloadSalesExcel = () => {
  const stored = localStorage.getItem(SALES_STORAGE_KEY);
  const sales  = stored ? JSON.parse(stored) : [];

  if (sales.length === 0) return false;

  const rows = sales.map((s, index) => ({
    '#':                 index + 1,
    'Cliente':           s.cliente,
    'Vendedor':          s.vendedor,
    'No. Factura':       s.factura,
    'Fecha':             s.fecha,
    'Método de Pago':    s.metodoPago,
    'Total':             s.total,
    'Estado':            s.estado,
    'Registrado Desde':  s.registradoDesde ?? '—',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook  = XLSX.utils.book_new();

  worksheet['!cols'] = [
    { wch: 6  },
    { wch: 28 },
    { wch: 28 },
    { wch: 16 },
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