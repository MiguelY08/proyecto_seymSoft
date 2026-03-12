import { ChevronDown, ChevronUp } from 'lucide-react';

// ─── CategorySelector ─────────────────────────────────────────────────────────
// Panel de selección de categorías con soporte para subcategorías desplegables.
// Compartido entre CreateProduct y EditProduct.
//
// Props:
//   cats          — Árbol de categorías { "Nombre": ["sub1", "sub2"] }
//   selected      — Array de strings seleccionados (formato "Cat" o "Cat > Sub")
//   expandedCats  — Estado de expansión { "Cat": true/false }
//   onCatChange   — Handler para marcar/desmarcar una categoría padre
//   onSubChange   — Handler para marcar/desmarcar una subcategoría
//   onToggleExpand — Handler para expandir/contraer subcategorías
//   error         — Mensaje de error (string)
//   idPrefix      — Prefijo para los id de los inputs (evita colisiones entre modales)
// ─────────────────────────────────────────────────────────────────────────────
function CategorySelector({
  cats = {},
  selected = [],
  expandedCats = {},
  onCatChange,
  onSubChange,
  onToggleExpand,
  error,
  idPrefix = 'cat',
}) {
  const isEmpty = Object.keys(cats).length === 0;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        Categorías <span className="text-red-500">*</span>
      </label>

      <div
        className={`border rounded-lg p-2.5 h-130px overflow-y-auto ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      >
        {isEmpty ? (
          <p className="text-xs text-gray-400 text-center mt-4">Sin categorías activas</p>
        ) : (
          Object.keys(cats).map((cat) => (
            <div key={cat} className="mb-1.5 last:mb-0">

              {/* Categoría padre */}
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id={`${idPrefix}-${cat}`}
                  checked={selected.includes(cat)}
                  onChange={() => onCatChange(cat)}
                  className="w-3.5 h-3.5 text-blue-600 rounded"
                />
                <label
                  htmlFor={`${idPrefix}-${cat}`}
                  className="flex-1 text-xs text-gray-700 font-medium cursor-pointer"
                >
                  {cat}
                </label>

                {/* Botón expandir — solo si tiene subcategorías */}
                {cats[cat].length > 0 && (
                  <button
                    type="button"
                    onClick={() => onToggleExpand(cat)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedCats[cat]
                      ? <ChevronUp  className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />
                    }
                  </button>
                )}
              </div>

              {/* Subcategorías desplegables */}
              {expandedCats[cat] && cats[cat].length > 0 && (
                <div className="ml-5 mt-1 space-y-1">
                  {cats[cat].map((sub) => (
                    <div key={sub} className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        id={`${idPrefix}-${cat}-${sub}`}
                        checked={selected.includes(`${cat} > ${sub}`)}
                        onChange={() => onSubChange(cat, sub)}
                        disabled={!selected.includes(cat)}
                        className="w-3 h-3 text-blue-600 rounded disabled:opacity-50"
                      />
                      <label
                        htmlFor={`${idPrefix}-${cat}-${sub}`}
                        className={`text-xs cursor-pointer ${
                          !selected.includes(cat) ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {sub}
                      </label>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span>{error}
        </p>
      )}
    </div>
  );
}

export default CategorySelector;