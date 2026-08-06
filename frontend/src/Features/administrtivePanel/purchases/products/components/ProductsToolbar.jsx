import {
  Eraser,
  FileSpreadsheet,
  FolderTree,
  Layers3,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import ButtonComponent from "../../../../shared/ButtonComponent";
import FormSelect from "../../../../shared/FormSelect";

function ProductsToolbar({
  search,
  onSearchChange,
  categories = [],
  subcategories = [],
  filterCategory,
  onCategoryChange,
  filterSubcategory,
  onSubcategoryChange,
  hasActiveFilters,
  onClearFilters,
  canExport,
  exporting,
  onExport,
  canCreate,
  onCreate,
}) {
  const categoryOptions = [
    { value: "all", label: "Todas las categorías" },
    ...categories.map((category) => ({ value: category, label: category })),
  ];
  const subcategoryOptions = [
    { value: "all", label: "Todas las subcategorías" },
    ...subcategories.map((subcategory) => ({
      value: subcategory,
      label: subcategory,
    })),
  ];

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none sm:gap-3">
        <div className="relative min-w-0 flex-1 sm:flex-none sm:w-72 md:w-80">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Buscar producto por nombre, código o referencia..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition hover:text-[#004D77]"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="w-36 shrink-0">
            <FormSelect
              value={filterCategory}
              options={categoryOptions}
              onChange={onCategoryChange}
              icon={FolderTree}
              placeholder="Categoría"
              ariaLabel="Filtrar por categoría"
            />
          </div>
        )}

        {subcategories.length > 0 && (
          <div className="w-36 shrink-0">
            <FormSelect
              value={filterSubcategory}
              options={subcategoryOptions}
              onChange={onSubcategoryChange}
              icon={Layers3}
              placeholder="Subcategoría"
              ariaLabel="Filtrar por subcategoría"
            />
          </div>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
            title="Limpiar filtros"
          >
            <Eraser className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {canExport && (
          <ButtonComponent
            onClick={onExport}
            disabled={exporting}
            className="flex items-center gap-2 border-green-600 bg-white px-2 text-green-600 hover:bg-green-400"
            title="Exportar a Excel"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" strokeWidth={2} />
            )}
            <span className="hidden sm:inline">
              {exporting ? "Exportando..." : "Exportar Excel"}
            </span>
          </ButtonComponent>
        )}

        {canCreate && (
          <ButtonComponent onClick={onCreate} title="Nuevo">
            <span className="hidden sm:inline">Nuevo</span>
            <Plus className="h-4 w-4" strokeWidth={2} />
          </ButtonComponent>
        )}
      </div>
    </div>
  );
}

export default ProductsToolbar;
