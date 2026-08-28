import { CircleCheck, CircleX, Eraser, FileSpreadsheet, FolderTree, Layers3, ListFilter, Loader2, Plus, Search } from "lucide-react";
import ButtonComponent from "../../../../shared/ButtonComponent";
import FormSelect from "../../../../shared/FormSelect";

function ProductsToolbar({ search, onSearchChange, categories = [], subcategories = [], filterCategory, onCategoryChange, filterSubcategory, onSubcategoryChange, filterStatus, onStatusChange, hasActiveFilters, onClearFilters, canExport, exporting, onExport, canCreate, onCreate }) {
  const statusOptions = [
    { value: "all", label: "Todos", icon: ListFilter, iconClassName: "text-gray-400" },
    { value: "Activo", label: "Activos", icon: CircleCheck, iconClassName: "text-green-600" },
    { value: "Inactivo", label: "Inactivos", icon: CircleX, iconClassName: "text-red-500" },
  ];
  const categoryOptions = [{ value: "all", label: "Todas las categorías" }, ...categories.map((category) => ({ value: category, label: category }))];
  const subcategoryOptions = [{ value: "all", label: "Todas las subcategorías" }, ...subcategories.map((subcategory) => ({ value: subcategory, label: subcategory }))];

  return (
    <div className="flex min-w-0 shrink-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-1 lg:flex-row lg:flex-wrap lg:items-end lg:gap-4">
        <div className="relative w-full lg:w-52 xl:w-64">
          <input
            type="text"
            placeholder="Buscar producto"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={2} />
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap lg:items-end lg:gap-4">
          {categories.length > 0 && <div className="w-full min-w-0 lg:w-40"><FormSelect value={filterCategory} options={categoryOptions} onChange={onCategoryChange} icon={FolderTree} placeholder="Categoría" ariaLabel="Filtrar por categoría" /></div>}
          {subcategories.length > 0 && <div className="w-full min-w-0 lg:w-40"><FormSelect value={filterSubcategory} options={subcategoryOptions} onChange={onSubcategoryChange} icon={Layers3} placeholder="Subcategoría" ariaLabel="Filtrar por subcategoría" /></div>}
          <div className="w-full min-w-0 lg:w-40"><FormSelect value={filterStatus} options={statusOptions} onChange={onStatusChange} icon={ListFilter} placeholder="Estado" ariaLabel="Filtrar por estado" /></div>
          {hasActiveFilters && (
            <button type="button" onClick={onClearFilters} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 sm:col-span-2 lg:w-10" title="Limpiar filtros" aria-label="Limpiar filtros">
              <Eraser className="h-4 w-4" strokeWidth={2} />
              <span className="lg:hidden">Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
        {canExport && <ButtonComponent onClick={onExport} disabled={exporting} className={`flex flex-1 items-center justify-center gap-2 border-green-600 bg-white px-3 text-green-600 sm:flex-none ${exporting ? "cursor-not-allowed opacity-60" : "hover:bg-green-400"}`} title="Exportar a Excel">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" strokeWidth={2} />}{exporting ? "Exportando..." : "Exportar Excel"}
        </ButtonComponent>}
        {canCreate && <ButtonComponent onClick={onCreate} title="Nuevo" className="flex flex-1 items-center justify-center gap-2 sm:flex-none"><span className="hidden sm:inline">Nuevo</span><Plus className="h-4 w-4" strokeWidth={2} /></ButtonComponent>}
      </div>
    </div>
  );
}

export default ProductsToolbar;
