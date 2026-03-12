import * as XLSX from 'xlsx';


// ─── Normalizar texto (quitar tildes, minúsculas) ─────────────────────────────
export const normalizar = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');


// ─── Dividir nombre completo en nombres y apellidos ───────────────────────────
export const splitName = (fullName = '') => {
  const palabras = fullName.trim().split(/\s+/).filter(Boolean);
  const mitad    = palabras.length >= 3 ? Math.ceil(palabras.length / 2) : palabras.length;
  return {
    nombres:   palabras.slice(0, mitad).join(' '),
    apellidos: palabras.slice(mitad).join(' '),
  };
};


// ─── Filtrar usuarios por término de búsqueda ────────────────────────────────
export const filterUsers = (data, search) => {
  const term = search.toLowerCase().trim();
  if (!term) return data;

  const termosEstado = ['activo', 'activos', 'inactivo', 'inactivos'];

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
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};


// ─── Mapear usuarios a filas legibles para Excel ─────────────────────────────
const buildExcelRows = (users) =>
  users.map((u) => ({
    'ID':                 u.id,
    'Tipo Documento':     u.documentType,
    'Documento':          u.document,
    'Nombre Completo':    u.name,
    'Correo Electrónico': u.email,
    'Teléfono':           u.phone,
    'Rol':                u.role      ?? 'Nulo',
    'Tipo de Cliente':    u.clientType ?? 'Detal',
    'Estado':             u.active ? 'Activo' : 'Inactivo',
    'Registrado Desde':   formatDate(u.createdAt),
  }));


// ─── Descargar Excel de usuarios ─────────────────────────────────────────────
export const downloadUsersExcel = (users) => {
  if (!users || users.length === 0) return false;

  const rows      = buildExcelRows(users);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook  = XLSX.utils.book_new();

  worksheet['!cols'] = [
    { wch: 6  }, // ID
    { wch: 16 }, // Tipo Documento
    { wch: 18 }, // Documento
    { wch: 28 }, // Nombre Completo
    { wch: 30 }, // Correo
    { wch: 14 }, // Teléfono
    { wch: 16 }, // Rol
    { wch: 16 }, // Tipo de Cliente
    { wch: 12 }, // Estado
    { wch: 18 }, // Registrado Desde
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

  const fecha = new Date()
    .toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-');
  XLSX.writeFile(workbook, `usuarios_${fecha}.xlsx`);

  return true;
};