// ─── Extrae solo los nombres padre del array de categorías ───────────────────
// Filtra entradas con formato "Cat > Sub" — en la tabla solo se muestran padres.
// Ejemplo: ["Oficina", "Oficina > Lapiceros", "Arte y Manualidades"]
//       → "Oficina, Arte y Manualidades"
export const getParentCategories = (categorias = []) => {
  const parents = categorias.filter((c) => !c.includes(' > '));
  return parents.length > 0 ? parents.join(', ') : 'N/A';
};


// ─── Agrupa el array plano de categorías en un objeto jerárquico ──────────────
// Entrada:  ["Oficina", "Oficina > Lapiceros", "Arte y Manualidades"]
// Salida:   { "Oficina": ["Lapiceros"], "Arte y Manualidades": [] }
export const groupCategories = (categorias = []) => {
  const tree = {};

  categorias.forEach((entry) => {
    if (entry.includes(' > ')) {
      const [parent, sub] = entry.split(' > ');
      if (!tree[parent]) tree[parent] = [];
      if (!tree[parent].includes(sub)) tree[parent].push(sub);
    } else {
      if (!tree[entry]) tree[entry] = [];
    }
  });

  return tree;
};


// ─── Resaltador de texto ──────────────────────────────────────────────────────
export function HighlightText({ text, highlight }) {
  if (!highlight || !highlight.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.toString().split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="bg-[#004d7726] text-[#004D77] font-semibold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}