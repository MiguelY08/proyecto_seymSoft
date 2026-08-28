import React from "react";
import { Eraser, Search } from "lucide-react";

export const PurchasesFilters = ({
  search,
  setSearch,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  setCurrentPage,
  onClearFilters,
  searchScannerField,
}) => {
  const hasActiveFilters = search !== "" || fechaInicial !== "" || fechaFinal !== "";
  const inputClassName = "w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm text-gray-700 outline-none transition-colors duration-200 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20";

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-1 lg:flex-row lg:flex-wrap lg:items-end lg:gap-4">
      <div className="relative w-full lg:w-52 xl:w-56">
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          data-scanner-field={searchScannerField}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          className={`${inputClassName} pl-4 pr-10 placeholder:text-gray-400`}
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={2} />
      </div>

      <div className="w-full lg:w-40">
        <input
          type="date"
          value={fechaInicial}
          max={fechaFinal || undefined}
          aria-label="Fecha inicial"
          onChange={(event) => {
            setFechaInicial(event.target.value);
            setCurrentPage(1);
          }}
          className={`${inputClassName} cursor-pointer px-3`}
        />
      </div>

      <div className="w-full lg:w-40">
        <input
          type="date"
          value={fechaFinal}
          min={fechaInicial || undefined}
          aria-label="Fecha final"
          onChange={(event) => {
            setFechaFinal(event.target.value);
            setCurrentPage(1);
          }}
          className={`${inputClassName} cursor-pointer px-3`}
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 lg:w-10"
          aria-label="Limpiar filtros"
          title="Limpiar todos los filtros"
        >
          <Eraser className="h-4 w-4" strokeWidth={2} />
          <span className="lg:hidden">Limpiar filtros</span>
        </button>
      )}
    </div>
  );
};
