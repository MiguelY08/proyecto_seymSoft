// ─── Archivo de utilidades para el módulo de usuarios (versión API REST) ─────
// Funciones auxiliares para:
// - Resaltado de texto en búsquedas
// - Formateo de fechas
// - Normalización de texto
// - Exportación a Excel (client‑side, basada en datos completos)

import * as XLSX from 'xlsx';

// ─── Normalizar texto (quitar tildes, minúsculas) ─────────────────────────────
export const normalizar = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

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

// ─── Exportación a Excel (generación local) ───────────────────────────────────
/**
 * Convierte una lista de usuarios en filas para Excel (arrays).
 * Adaptado a la estructura actual de la API:
 * - id
 * - name
 * - email
 * - phone
 * - active (boolean) → se muestra "Activo"/"Inactivo"
 * - createdAt (fecha)
 * - role (opcional, puede ser null)
 * @param {Array} users - Lista de usuarios (formato interno del frontend)
 * @returns {Array} Array de arrays, cada uno representa una fila.
 */
const buildExcelRows = (users) =>
  users.map((u) => [
    u.id,
    u.name,
    u.email,
    u.phone || '',
    u.active ? 'Activo' : 'Inactivo',
    u.role ?? 'Sin rol',
    formatDate(u.createdAt),
  ]);

/**
 * Genera y descarga un archivo Excel con la lista de usuarios.
 * Incluye título, fecha de exportación, encabezados y datos con anchos de columna definidos.
 * @param {Array} users - Lista de usuarios a exportar.
 * @returns {boolean} True si se descargó, false si no hay usuarios.
 */
export const downloadUsersExcel = (users) => {
  if (!users || users.length === 0) return false;

  const currentDate       = new Date();
  const formattedDate     = currentDate.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const formattedDateTime = currentDate.toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const headers = [
    'ID', 'Nombre completo', 'Correo electrónico', 'Teléfono', 'Estado', 'Rol', 'Registrado desde',
  ];

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

  // Combinar celdas
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });
  worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } });
  worksheet['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } });

  worksheet['A1'] = { v: 'USUARIOS', t: 's' };
  worksheet['A2'] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: 's' };
  worksheet['A4'] = { v: 'LISTA DE USUARIOS', t: 's' };

  // Anchos de columna
  worksheet['!cols'] = [
    { wch: 8  }, // ID
    { wch: 32 }, // Nombre completo
    { wch: 32 }, // Correo electrónico
    { wch: 16 }, // Teléfono
    { wch: 12 }, // Estado
    { wch: 20 }, // Rol
    { wch: 18 }, // Registrado desde
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

  const fileName = `usuarios_${currentDate.toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return true;
};