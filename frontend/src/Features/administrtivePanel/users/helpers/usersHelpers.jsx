import * as XLSX from 'xlsx';

// ─── Archivo de utilidades para el módulo de usuarios ──────────────────────────
/**
 * Este archivo contiene funciones auxiliares para el manejo de usuarios:
 * - Normalización de texto
 * - Filtrado y búsqueda
 * - Resaltado de texto en búsquedas
 * - Formateo de fechas
 * - Exportación a Excel
 */

// ─── Normalizar texto (quitar tildes, minúsculas) ─────────────────────────────
/**
 * Normaliza un string: convierte a minúsculas, quita acentos y espacios extra.
 * Útil para comparaciones case-insensitive y sin acentos.
 * @param {string} str - El texto a normalizar.
 * @returns {string} Texto normalizado.
 */
export const normalizar = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ─── Dividir nombre completo en nombres y apellidos ───────────────────────────
/**
 * Divide un nombre completo en nombres y apellidos.
 * Si hay 3 o más palabras, divide por la mitad; de lo contrario, toma la primera como nombre.
 * @param {string} fullName - Nombre completo del usuario.
 * @returns {object} Objeto con propiedades 'nombres' y 'apellidos'.
 */
export const splitName = (fullName = '') => {
  const palabras = fullName.trim().split(/\s+/).filter(Boolean);
  const mitad    = palabras.length >= 2 ? Math.ceil(palabras.length / 2) : palabras.length;
  return {
    nombres:   palabras.slice(0, mitad).join(' '),
    apellidos: palabras.slice(mitad).join(' '),
  };
};

// ─── Filtrar usuarios por término de búsqueda ────────────────────────────────
/**
 * Filtra una lista de usuarios basada en un término de búsqueda.
 * Busca en campos como documento, nombre, email, teléfono, rol, tipo de cliente y estado.
 * Soporta términos como "activo" o "inactivo".
 * @param {Array} data - Lista de usuarios.
 * @param {string} search - Término de búsqueda.
 * @returns {Array} Lista filtrada de usuarios.
 */
export const filterUsers = (data, search) => {
  const term = search.toLowerCase().trim();
  if (!term) return data;

  const termosEstado   = ['activo', 'activos', 'inactivo', 'inactivos'];
  const termosCliente  = ['cliente', 'clientes'];
  const termosNoClient = ['no cliente', 'no clientes'];

  // Filtro exclusivo por condición de cliente — cortocircuita el resto
  if (termosNoClient.includes(term)) return data.filter(row => !row.isClient);
  if (termosCliente.includes(term))  return data.filter(row =>  row.isClient);

  return data.filter((row) => {
    const estadoTexto = row.active ? 'activo' : 'inactivo';
    const matchEstado = termosEstado.includes(term) &&
                        estadoTexto.startsWith(term.replace(/s$/, ''));

    return (
      (row.document     ?? '').toLowerCase().includes(term) ||
      (row.documentType ?? '').toLowerCase().includes(term) ||
      (row.name         ?? '').toLowerCase().includes(term) ||
      (row.email        ?? '').toLowerCase().includes(term) ||
      (row.phone        ?? '').toLowerCase().includes(term) ||
      (row.role         ?? '').toLowerCase().includes(term) ||
      (row.clientType   ?? '').toLowerCase().includes(term) ||
      matchEstado
    );
  });
};

// ─── Resaltador de texto ──────────────────────────────────────────────────────
/**
 * Resalta un término en un texto usando JSX <mark>.
 * Útil para mostrar resultados de búsqueda resaltados.
 * @param {string} text - Texto original.
 * @param {string} term - Término a resaltar.
 * @returns {Array|string} Texto con partes resaltadas o texto original.
 */
export const highlight = (text, term) => {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.trim()})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">{part}</mark>
      : part
  );
};

// ─── Resaltador para estado activo/inactivo ───────────────────────────────────
/**
 * Resalta el estado "Activo" o "Inactivo" si coincide con el término de búsqueda.
 * @param {boolean} activo - Estado del usuario.
 * @param {string} term - Término de búsqueda.
 * @returns {JSX.Element|null} Elemento resaltado o null si no coincide.
 */
export const highlightEstado = (activo, term) => {
  const estadoTexto  = activo ? 'Activo' : 'Inactivo';
  const termosEstado = ['activo', 'activos', 'inactivo', 'inactivos'];
  const termLower    = term.toLowerCase().trim();
  const isMatch      = termosEstado.includes(termLower) &&
                       estadoTexto.toLowerCase().startsWith(termLower.replace(/s$/, ''));
  if (!isMatch) return null;
  return (
    <mark className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
      {estadoTexto}
    </mark>
  );
};

// ─── Formatear fecha a formato local colombiano ───────────────────────────────
/**
 * Formatea una fecha ISO a formato colombiano (dd/mm/yyyy).
 * @param {string} dateString - Fecha en formato ISO.
 * @returns {string} Fecha formateada o '—' si no válida.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

// ─── Mapear usuarios a filas legibles para Excel ─────────────────────────────
/**
 * Convierte una lista de usuarios a filas (arrays) para exportación Excel con aoa_to_sheet.
 * @param {Array} users - Lista de usuarios.
 * @returns {Array} Filas formateadas como arrays para Excel.
 */
const buildExcelRows = (users) =>
  users.map((u) => [
    u.id,
    u.documentType,
    u.document,
    u.name,
    u.email,
    u.phone,
    u.role       ?? 'Nulo',
    u.clientType ?? 'Detal',
    u.active ? 'Activo' : 'Inactivo',
    formatDate(u.createdAt),
  ]);

// ─── Descargar Excel de usuarios ─────────────────────────────────────────────
/**
 * Genera y descarga un archivo Excel con la lista de usuarios.
 * Incluye título, fecha de exportación, encabezados y datos con anchos de columna definidos.
 * @param {Array} users - Lista de usuarios a exportar.
 * @returns {boolean} True si se descargó, false si no hay usuarios.
 */
export const downloadUsersExcel = (users) => {
  if (!users || users.length === 0) return false;

  // ── Fechas para encabezado ───────────────────────────────────────────────────
  const currentDate       = new Date();
  const formattedDate     = currentDate.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const formattedDateTime = currentDate.toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  // ── Encabezados de columnas ───────────────────────────────────────────────────
  const headers = [
    'ID', 'Tipo Documento', 'Documento', 'Nombre Completo',
    'Correo Electrónico', 'Teléfono', 'Rol', 'Tipo de Cliente',
    'Estado', 'Registrado Desde',
  ];

  // ── Estructura de la hoja ─────────────────────────────────────────────────────
  const sheetData = [
    ['USUARIOS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['LISTA DE USUARIOS'],
    [''],
    headers,
    ...buildExcelRows(users),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook  = XLSX.utils.book_new();

  // ── Combinar celdas para título, fecha y subtítulo ────────────────────────────
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }); // Título
  worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }); // Fecha
  worksheet['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } }); // Subtítulo

  // ── Asignar valores explícitos a celdas combinadas ────────────────────────────
  worksheet['A1'] = { v: 'USUARIOS',                                                      t: 's' };
  worksheet['A2'] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: 's' };
  worksheet['A4'] = { v: 'LISTA DE USUARIOS',                                             t: 's' };

  // ── Anchos de columna ─────────────────────────────────────────────────────────
  worksheet['!cols'] = [
    { wch: 6  }, // ID
    { wch: 16 }, // Tipo Documento
    { wch: 18 }, // Documento
    { wch: 28 }, // Nombre Completo
    { wch: 30 }, // Correo Electrónico
    { wch: 14 }, // Teléfono
    { wch: 16 }, // Rol
    { wch: 16 }, // Tipo de Cliente
    { wch: 12 }, // Estado
    { wch: 18 }, // Registrado Desde
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

  const fileName = `usuarios_${currentDate.toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return true;
};