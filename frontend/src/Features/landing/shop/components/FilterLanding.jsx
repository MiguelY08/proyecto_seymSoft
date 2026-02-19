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
  return (
    <div className="w-64 bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-xl font-semibold">Filtros</h2>
      <p className="text-sm text-gray-500">{totalProducts} resultados</p>

      {/* Categorías */}
      <button
        onClick={() => setCategoryOpen(!categoryOpen)}
        className="flex justify-between w-full py-2 mt-4"
      >
        <span className="font-medium">Categorías</span>
        {categoryOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      {categoryOpen && (
        <div className="space-y-2 mt-2">
          {categories.map(cat => (
            <label key={cat} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
                className="mr-2"
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
        className="flex justify-between w-full py-2"
      >
        <span className="font-medium">Marca</span>
        {brandOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      {brandOpen && (
        <div className="space-y-2 mt-2">
          {brands.map(brand => (
            <label key={brand} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="mr-2"
              />
              {brand}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default Filters;
