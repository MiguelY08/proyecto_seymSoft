// ─── SaleDetailRow ────────────────────────────────────────────────────────────
// Fila de detalle reutilizable: muestra un label superior y un valor inferior.
//
// Props:
//   label       — texto de la etiqueta (se muestra en mayúsculas pequeñas)
//   value       — valor a mostrar; si está vacío se usa `placeholder` o '—'
//   placeholder — texto alternativo cuando no hay valor (en cursiva y gris claro)
// ─────────────────────────────────────────────────────────────────────────────
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