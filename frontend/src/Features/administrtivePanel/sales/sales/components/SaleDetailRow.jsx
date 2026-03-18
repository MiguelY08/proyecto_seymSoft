// ─── SaleDetailRow ────────────────────────────────────────────────────────────
/**
 * Componente reutilizable para mostrar una fila de detalle en formularios de venta.
 * Muestra un label en mayúsculas pequeñas y un valor debajo, con placeholder si no hay valor.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.label - Texto de la etiqueta (se muestra en mayúsculas pequeñas).
 * @param {string} props.value - Valor a mostrar; si está vacío se usa placeholder o '—'.
 * @param {string} [props.placeholder] - Texto alternativo cuando no hay valor (en cursiva y gris claro).
 */
function SaleDetailRow({ label, value, placeholder }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-sm font-medium ${value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
        {value || placeholder || '—'}
      </span>
    </div>
  );
}

export default SaleDetailRow;