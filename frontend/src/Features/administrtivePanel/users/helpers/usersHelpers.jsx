// ─── Archivo de utilidades para el módulo de usuarios (versión API REST) ─────
// Funciones auxiliares para:
// - Resaltado de texto en búsquedas
// - Formateo de fechas
// - Normalización de texto
// - Exportación a Excel (client‑side, basada en datos completos)

// ─── Normalizar texto (quitar tildes, minúsculas) ─────────────────────────────
export const normalizeSearch = (value = '') =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const normalizar = normalizeSearch;

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ─── Resaltador de texto ──────────────────────────────────────────────────────
const getRoleSearchText = (user = {}) =>
  user.role?.nameRole || user.role?.name || 'Cliente';

const getStatusSearchText = (user = {}) =>
  user.active ? 'Activo' : 'Inactivo';

export const userMatchesSearch = (user = {}, searchTerm = '') => {
  const term = normalizeSearch(searchTerm);
  if (!term) return true;

  const searchableFields = [
    user.name,
    user.email,
    user.phone,
    getRoleSearchText(user),
    getStatusSearchText(user),
    formatDate(user.createdAt),
  ];

  return searchableFields.some((field) =>
    normalizeSearch(field).includes(term)
  );
};

export const highlight = (text, term) => {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${escapeRegExp(term.trim())})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === term.trim().toLowerCase()
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
