import { useEffect, useRef, useState } from "react";
import { Eraser, FileSpreadsheet, FolderTree, Layers3, Loader2, Plus, Search, X } from "lucide-react";
import ButtonComponent from "../../../../shared/ButtonComponent";
import FormSelect from "../../../../shared/FormSelect";

function ProductsToolbar({ search, onSearchChange, categories = [], subcategories = [], filterCategory, onCategoryChange, filterSubcategory, onSubcategoryChange, hasActiveFilters, onClearFilters, canExport, exporting, onExport, canCreate, onCreate }) {
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(search));
  const searchWrapperRef = useRef(null);
  const categoryOptions = [{ value: "all", label: "Todas las categorías" }, ...categories.map((category) => ({ value: category, label: category }))];
  const subcategoryOptions = [{ value: "all", label: "Todas las subcategorías" }, ...subcategories.map((subcategory) => ({ value: subcategory, label: subcategory }))];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && !search.trim() && searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) setIsSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen, search]);

  const handleClearFilters = () => {
    onClearFilters();
    setIsSearchOpen(false);
  };

  return (
    <div className="flex min-w-0 shrink-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-1 lg:flex-row lg:flex-nowrap lg:items-start lg:gap-3">
        <div ref={searchWrapperRef} className={`relative w-full transition-all duration-300 ease-out sm:shrink-0 ${isSearchOpen ? "sm:w-64 lg:w-52 xl:w-64 2xl:w-72" : "sm:w-10"}`}>
          {isSearchOpen ? (
            <>
              <input type="text" placeholder="Buscar producto" value={search} autoFocus onChange={(event) => onSearchChange(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20" />
              <button type="button" onClick={() => { onSearchChange(""); setIsSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#004D77]" title="Cerrar búsqueda" aria-label="Cerrar búsqueda">
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setIsSearchOpen(true)} className="flex h-10 w-full items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition hover:border-[#004D77] hover:text-[#004D77] sm:w-10" title="Buscar" aria-label="Buscar">
              <Search className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-wrap lg:items-start lg:gap-3">
          {categories.length > 0 && <div className="w-full min-w-0 lg:w-40"><FormSelect value={filterCategory} options={categoryOptions} onChange={onCategoryChange} icon={FolderTree} placeholder="Categoría" ariaLabel="Filtrar por categoría" /></div>}
          {subcategories.length > 0 && <div className="w-full min-w-0 lg:w-40"><FormSelect value={filterSubcategory} options={subcategoryOptions} onChange={onSubcategoryChange} icon={Layers3} placeholder="Subcategoría" ariaLabel="Filtrar por subcategoría" /></div>}
          {hasActiveFilters && (
            <button type="button" onClick={handleClearFilters} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 sm:col-span-2 lg:w-10" title="Limpiar filtros" aria-label="Limpiar filtros">
              <Eraser className="h-4 w-4" strokeWidth={2} /><span className="lg:hidden">Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0 lg:self-start">
        {canExport && <ButtonComponent onClick={onExport} disabled={exporting} className={`flex flex-1 items-center justify-center gap-2 border-green-600 bg-white px-3 text-green-600 sm:flex-none ${exporting ? "cursor-not-allowed opacity-60" : "hover:bg-green-400"}`} title="Exportar a Excel">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" strokeWidth={2} />}{exporting ? "Exportando..." : "Exportar Excel"}
        </ButtonComponent>}
        {canCreate && <ButtonComponent onClick={onCreate} title="Nuevo" className="flex flex-1 items-center justify-center gap-2 sm:flex-none"><span className="hidden sm:inline">Nuevo</span><Plus className="h-4 w-4" strokeWidth={2} /></ButtonComponent>}
      </div>
    </div>
  );
}

export default ProductsToolbar;
