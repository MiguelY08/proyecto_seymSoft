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

  return (
    <div className="w-full md:w-64">

      {/* Botón solo visible en móvil */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden flex justify-between items-center w-full bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      >
        <span className="font-semibold text-lg">Filtros</span>
        {mobileOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* Panel de filtros */}
      <div
        className={`
          ${mobileOpen ? "block" : "hidden"} 
          md:block
          bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-2 md:mt-0
        `}
      >
        <h2 className="text-xl font-semibold">Filtros</h2>
        <p className="text-sm text-gray-500">{totalProducts} resultados</p>

        {/* Categorías */}
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex justify-between items-center w-full py-2 mt-4"
        >
          <span className="font-medium">Categorías</span>
          {categoryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {categoryOpen && (
          <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
            {categories.map(cat => (
              <label key={cat} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                  className="mr-2 accent-black"
                />
                {cat}
              </label>
            ))}
          </div>
        )}

        <hr className="my-4" />

        {/* Marcas */}
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
