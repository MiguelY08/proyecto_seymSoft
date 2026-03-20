import React from 'react';

// ─── Colores centralizados por estado ─────────────────────────────────────────
// Fuente única de verdad para todos los componentes del módulo de Pedidos.
// Define colores de fondo, texto y puntos para cada estado de orden.
export const ESTADO_STYLES = {
  'Por aprobar': { bg: '#fef9c3', color: '#a16207', dot: '#ca8a04' },
  'Aprobado':    { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
  'Cancelado':   { bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626' },
};

// ─── Clases Tailwind para el badge de la tabla ────────────────────────────────
// Clases CSS para badges en la tabla de pedidos, con colores por estado.
export const ESTADO_TABLE_CLASSES = {
  'Por aprobar': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Aprobado':    'bg-green-100  text-green-700  border-green-300',
  'Cancelado':   'bg-red-100    text-red-400    border-red-200',
};

/**
 * getEstadoBadgeClasses — devuelve las clases Tailwind del badge de tabla.
 * @param {string} estado - Estado de la orden ('Por aprobar', 'Aprobado', 'Cancelado').
 * @returns {string} Clases CSS para el badge.
 */
export const getEstadoBadgeClasses = (estado) =>
  ESTADO_TABLE_CLASSES[estado] ?? 'bg-gray-100 text-gray-600 border-gray-300';

/**
 * getEstadoColor — devuelve la clase Tailwind del punto de color en DetailOrder.
 * @param {string} estado - Estado de la orden.
 * @returns {string} Clase CSS para el punto de color (bg-yellow-500, etc.).
 */
export const getEstadoColor = (estado) => {
  const map = {
    'Por aprobar': 'bg-yellow-500',
    'Aprobado':    'bg-green-500',
    'Cancelado':   'bg-red-500',
  };
  return map[estado] ?? 'bg-gray-500';
};

/**
 * getPermisos — indica si las acciones de editar/cancelar están deshabilitadas.
 * Basado en el estado: solo 'Cancelado' deshabilita acciones.
 * @param {string} estado - Estado de la orden.
 * @returns {{ deshabilitado: boolean }} Objeto con flag de deshabilitado.
 */
export const getPermisos = (estado) => ({
  deshabilitado: estado === 'Cancelado',
});

/**
 * highlight — resalta las coincidencias de búsqueda dentro de un texto.
 * Usa <mark> para resaltar con color azul claro.
 * @param {string|number} text - Texto a resaltar.
 * @param {string} term - Término de búsqueda.
 * @returns {string|JSX.Element[]} Texto con resaltado o texto original.
 */
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

// ─── EstadoBadgePill — badge con punto de color (usado en dropdown y formulario) ──
/**
 * EstadoBadgePill — Componente para mostrar estado con punto de color.
 * Usado en dropdowns y formularios para selección de estado.
 * @param {{ estado: string }} props - Props del componente.
 * @param {string} props.estado - Estado a mostrar.
 */
export const EstadoBadgePill = ({ estado }) => {
  const s = ESTADO_STYLES[estado];
  if (!s) return <span className="text-gray-500 text-sm">{estado}</span>;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
      {estado}
    </span>
  );
};

// ─── EstadoBadgeTable — badge con borde para la tabla de pedidos ──────────────
/**
 * EstadoBadgeTable — Componente para badge en tabla con borde.
 * Incluye resaltado de búsqueda si se proporciona term.
 * @param {{ estado: string, term?: string }} props - Props del componente.
 * @param {string} props.estado - Estado a mostrar.
 * @param {string} [props.term] - Término de búsqueda para resaltar.
 */
export const EstadoBadgeTable = ({ estado, term }) => {
  const classes = getEstadoBadgeClasses(estado);
  const content = term?.trim() ? highlight(estado, term) : estado;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${classes}`}>
      {content}
    </span>
  );
};