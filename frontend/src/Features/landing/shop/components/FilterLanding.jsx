import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function Filters({
  totalProducts,
  categories,
  brands,
  categoryOpen,
  brandOpen,
  setCategoryOpen,
  setBrandOpen,
  selectedCategories,
  selectedBrands,
  handleCategoryChange,
  handleBrandChange
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  const [openSubCategories, setOpenSubCategories] = useState({});

  const toggleCategory = (name) => {
    setOpenCategories(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const toggleSubCategory = (name) => {
    setOpenSubCategories(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="w-full md:w-64">
      {/* Botón móvil */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden flex justify-between items-center w-full bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      >
        <span className="font-semibold text-lg">Filtros</span>
        {mobileOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      <div
        className={`
          ${mobileOpen ? "block" : "hidden"} 
          md:block
          bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-2 md:mt-0
        `}
      >
        <h2 className="text-xl font-semibold">Filtros</h2>
        <p className="text-sm text-gray-500">{totalProducts} resultados</p>

        {/* CATEGORÍAS */}
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex justify-between items-center w-full py-2 mt-4"
        >
          <span className="font-medium">Categorías</span>
          {categoryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {categoryOpen && (
          <div className="space-y-2 mt-2 max-h-80 overflow-y-auto">
            {categories.map(cat => (
              <div key={cat.name}>
                {/* Categoría principal */}
                <div className="flex justify-between items-center text-sm font-medium">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => handleCategoryChange(cat.name)}
                      className="mr-2 accent-black"
                    />
                    {cat.name} ({cat.count})
                  </label>

                  {cat.subcategories && (
                    <button onClick={() => toggleCategory(cat.name)}>
                      {openCategories[cat.name] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  )}
                </div>

                {/* Subcategorías */}
                {openCategories[cat.name] &&
                  cat.subcategories?.map(sub => (
                    <div key={sub.name} className="ml-6 mt-1">
                      <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(sub.name)}
                            onChange={() => handleCategoryChange(sub.name)}
                            className="mr-2 accent-black"
                          />
                          {sub.name} ({sub.count})
                        </label>

                        {sub.children && (
                          <button onClick={() => toggleSubCategory(sub.name)}>
                            {openSubCategories[sub.name] ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Sub-subcategorías */}
                      {openSubCategories[sub.name] &&
                        sub.children?.map(child => (
                          <label
                            key={child.name}
                            className="flex items-center text-sm ml-6 mt-1"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(child.name)}
                              onChange={() => handleCategoryChange(child.name)}
                              className="mr-2 accent-black"
                            />
                            {child.name} ({child.count})
                          </label>
                        ))}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}

        <hr className="my-4" />

        {/* MARCAS */}
        <button
          onClick={() => setBrandOpen(!brandOpen)}
          className="flex justify-between items-center w-full py-2"
        >
          <span className="font-medium">Marca</span>
          {brandOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {brandOpen && (
          <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
            {brands.map(brand => (
              <label key={brand} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="mr-2 accent-black"
                />
                {brand}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Filters;