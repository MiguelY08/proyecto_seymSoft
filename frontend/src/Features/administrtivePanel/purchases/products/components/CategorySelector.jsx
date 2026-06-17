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
        className={`border rounded-lg p-2.5 h-[200px] overflow-y-auto ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
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
              <div key={cat.id} className="mb-2 last:mb-0 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 px-2 py-2">
                  <input
                    type="checkbox"
                    id={`${idPrefix}-cat-${cat.id}`}
                    checked={selectedCategories.has(catId)}
                    onChange={() => onCategoryChange(cat)}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                  <label
                    htmlFor={`${idPrefix}-cat-${cat.id}`}
                    className="flex-1 text-xs text-gray-800 font-semibold cursor-pointer"
                  >
                    {cat.name}
                    {checkedSubCount > 0 && (
                      <span className="ml-2 text-[10px] font-medium text-[#004D77]">
                        {checkedSubCount} sub seleccionada{checkedSubCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </label>

                  {subsCat.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onToggleExpand(cat.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-[#004D77] transition-colors"
                      title={isExpanded ? 'Ocultar subcategorias' : 'Mostrar subcategorias'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {isExpanded && subsCat.length > 0 && (
                  <div className="border-t border-gray-200 bg-white px-3 py-2 space-y-1.5">
                    {subsCat.map((sub) => {
                      const subId = Number(sub.id);

                      return (
                        <div key={sub.id} className="flex items-center gap-2 pl-3">
                          <input
                            type="checkbox"
                            id={`${idPrefix}-sub-${sub.id}`}
                            checked={selectedSubcategories.has(subId)}
                            onChange={() => onSubcategoryChange(sub)}
                            className="w-3 h-3 text-blue-600 rounded"
                          />
                          <label
                            htmlFor={`${idPrefix}-sub-${sub.id}`}
                            className="text-xs text-gray-600 cursor-pointer"
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
