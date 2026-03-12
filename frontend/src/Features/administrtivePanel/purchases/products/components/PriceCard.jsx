// ─── PriceCard ────────────────────────────────────────────────────────────────
// Tarjeta de precio con campo principal y campo de descuento por paca.
// Definido fuera de los modales para evitar re-montaje en cada keystroke.
//
// Props:
//   label           — Título del grupo (ej: "Precio Detal")
//   fieldMain       — Nombre del campo principal  (ej: "precioDetalle")
//   fieldPaca       — Nombre del campo por paca   (ej: "precioDetallePaca")
//   valueMain       — Valor actual del campo principal
//   valuePaca       — Valor actual del campo por paca
//   placeholderMain — Placeholder del campo principal
//   placeholderPaca — Placeholder del campo por paca
//   onChange        — Handler onChange del formulario padre
//   errMain         — Mensaje de error del campo principal
//   errPaca         — Mensaje de error del campo por paca
// ─────────────────────────────────────────────────────────────────────────────
function PriceCard({
  label,
  fieldMain, fieldPaca,
  placeholderMain, placeholderPaca,
  valueMain, valuePaca,
  onChange,
  errMain, errPaca,
}) {
  const block   = (e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); };
  const numeric = (v) => v.replace(/[^0-9]/g, '');
  const hm = !!errMain;
  const hp = !!errPaca;

  return (
    <div className={`rounded-lg overflow-hidden border ${hm || hp ? 'border-red-400' : 'border-gray-300'}`}>

      {/* Precio base */}
      <div className="px-3 pt-2.5 pb-1 bg-white">
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          name={fieldMain}
          value={valueMain}
          onChange={(e) => onChange({ target: { name: fieldMain, value: numeric(e.target.value) } })}
          onKeyDown={block}
          placeholder={placeholderMain}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${
            hm
              ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
              : 'border-gray-200 focus:ring-blue-400 bg-gray-50'
          }`}
        />
        {hm && (
          <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1">
            <span>⚠</span>{errMain}
          </p>
        )}
      </div>

      <div className={`h-px ${hp ? 'bg-red-300' : 'bg-gray-200'}`} />

      {/* Precio por paca */}
      <div className={`px-3 pt-1.5 pb-2.5 ${hp ? 'bg-red-50' : 'bg-gray-50'}`}>
        <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">
          Desc. x paca
        </label>
        <input
          type="text"
          inputMode="numeric"
          name={fieldPaca}
          value={valuePaca}
          onChange={(e) => onChange({ target: { name: fieldPaca, value: numeric(e.target.value) } })}
          onKeyDown={block}
          placeholder={placeholderPaca}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${
            hp
              ? 'border-red-400 focus:ring-red-200 bg-white text-red-900 placeholder-red-300'
              : 'border-gray-200 focus:ring-blue-400 bg-white'
          }`}
        />
        {hp && (
          <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1">
            <span>⚠</span>{errPaca}
          </p>
        )}
      </div>

    </div>
  );
}

export default PriceCard;