import React from "react";
import { Search, Eraser } from "lucide-react";

export const PurchasesFilters = ({
  search,
  setSearch,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  setCurrentPage,
  onClearFilters,
}) => {
  const hasActiveFilters = search !== "" || fechaInicial !== "" || fechaFinal !== "";

  return (
    <div className="flex items-end gap-3 flex-wrap">

      {/* ===== BÚSQUEDA ===== */}
      <div className="relative w-full sm:w-72">
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-4 pr-10 py-2 bg-white rounded-lg border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-black text-sm"
        />
        <Search
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
        />
      </div>

      {/* ===== FECHA INICIAL ===== */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs font-medium text-gray-700 pl-0.5">
          Fecha Inicial
        </label>
        <input
          type="date"
          value={fechaInicial}
          max={fechaFinal || undefined}
          onChange={(e) => {
            setFechaInicial(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-white rounded-lg border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-sm text-gray-700 cursor-pointer"
        />
      </div>

      {/* ===== FECHA FINAL ===== */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs font-medium text-gray-700 pl-0.5">
          Fecha Final
        </label>
        <input
          type="date"
          value={fechaFinal}
          min={fechaInicial || undefined}
          onChange={(e) => {
            setFechaFinal(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-white rounded-lg border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-sm text-gray-700 cursor-pointer"
        />
      </div>

      {/* ===== LIMPIAR FILTROS ===== */}
      {hasActiveFilters && (
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-medium text-gray-700 pl-0.5 invisible">
            Limpiar
          </label>
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-400 rounded-lg text-gray-600 bg-white hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 cursor-pointer whitespace-nowrap"
            aria-label="Limpiar filtros"
            title="Limpiar todos los filtros"
          >
            <Eraser className="w-4 h-4" strokeWidth={2} />
            <span>Limpiar filtros</span>
          </button>
        </div>
      )}

    </div>
  );
};