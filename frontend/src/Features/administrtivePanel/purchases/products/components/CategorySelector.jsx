import { ChevronDown, ChevronUp } from 'lucide-react';

function CategorySelector({
  categories = [],
  subcategories = [],
  selectedCategoryIds = [],
  selectedSubcategoryIds = [],
  expandedCategoryIds = {},
  onCategoryChange,
  onSubcategoryChange,
  onToggleExpand,
  error,
  idPrefix = 'cat',
}) {
  const selectedCategories = new Set(selectedCategoryIds.map(Number));
  const selectedSubcategories = new Set(selectedSubcategoryIds.map(Number));

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        Categorias <span className="text-red-500">*</span>
      </label>

      <div
        className={`border rounded-lg p-2 h-[200px] overflow-y-auto transition-colors duration-200 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white focus-within:border-[#004D77] focus-within:ring-2 focus-within:ring-[#004D77]/20'
        }`}
      >
        {categories.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-4">Sin categorias disponibles</p>
        ) : (
          categories.map((cat) => {
            const catId = Number(cat.id);
            const subsCat = subcategories.filter((sub) => Number(sub.categoryId) === catId);
            const isExpanded = !!expandedCategoryIds[catId];
            const checkedSubCount = subsCat.filter((sub) => selectedSubcategories.has(Number(sub.id))).length;

            return (
              <div key={cat.id} className="mb-2 last:mb-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-2 px-2.5 py-2 transition-colors hover:bg-[#004D77]/5">
                  <input
                    type="checkbox"
                    id={`${idPrefix}-cat-${cat.id}`}
                    checked={selectedCategories.has(catId)}
                    onChange={() => onCategoryChange(cat)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#004D77] focus:ring-[#004D77]/20"
                  />
                  <label
                    htmlFor={`${idPrefix}-cat-${cat.id}`}
                    className="flex-1 text-sm text-gray-700 font-medium cursor-pointer truncate"
                  >
                    {cat.name}
                    {checkedSubCount > 0 && (
                      <span className="ml-2 text-[10px] font-semibold text-[#004D77]">
                        {checkedSubCount} sub seleccionada{checkedSubCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </label>

                  {subsCat.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onToggleExpand(cat.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-[#004D77] transition-colors"
                      title={isExpanded ? 'Ocultar subcategorias' : 'Mostrar subcategorias'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {isExpanded && subsCat.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 space-y-1">
                    {subsCat.map((sub) => {
                      const subId = Number(sub.id);

                      return (
                        <div key={sub.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white">
                          <input
                            type="checkbox"
                            id={`${idPrefix}-sub-${sub.id}`}
                            checked={selectedSubcategories.has(subId)}
                            onChange={() => onSubcategoryChange(sub)}
                            className="w-3 h-3 rounded border-gray-300 text-[#004D77] focus:ring-[#004D77]/20"
                          />
                          <label
                            htmlFor={`${idPrefix}-sub-${sub.id}`}
                            className="text-sm text-gray-600 cursor-pointer truncate"
                          >
                            {sub.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span>!</span>{error}
        </p>
      )}
    </div>
  );
}

export default CategorySelector;
