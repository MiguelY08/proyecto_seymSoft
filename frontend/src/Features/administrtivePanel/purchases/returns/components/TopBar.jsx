import React from 'react';
import { Search, Calendar, X } from 'lucide-react';

/**
 * TopBar — Devoluciones en Compras
 * Estilos alineados con el módulo de Usuarios.
 */
function TopBar({
  search,
  setSearch,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  setCurrentPage,
}) {
  const handleClearFilters = () => {
    setSearch('');
    setFechaInicial('');
    setFechaFinal('');
    setCurrentPage(1);
  };

  const hayFiltrosActivos = search || fechaInicial || fechaFinal;

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0 mb-4">

      {/* ── Buscador ──────────────────────────────────────────────────────── */}
      <div className="relative flex-1 sm:flex-none sm:w-72 md:w-96">
        <input
          type="text"
          placeholder="Buscar por No. devolución, factura, estado..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300
                     focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                     outline-none bg-white text-gray-700 placeholder-gray-400"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          strokeWidth={2}
        />
      </div>

      {/* ── Fechas + limpiar ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Fecha inicial */}
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={1.8}
          />
          <input
            type="date"
            value={fechaInicial}
            max={fechaFinal || undefined}
            onChange={(e) => { setFechaInicial(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300
                       focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                       outline-none bg-white text-gray-600 w-full sm:w-auto"
          />
        </div>

        <span className="text-gray-400 text-sm select-none hidden sm:block">—</span>

        {/* Fecha final */}
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={1.8}
          />
          <input
            type="date"
            value={fechaFinal}
            min={fechaInicial || undefined}
            onChange={(e) => { setFechaFinal(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300
                       focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                       outline-none bg-white text-gray-600 w-full sm:w-auto"
          />
        </div>

        {/* Limpiar filtros */}
        {hayFiltrosActivos && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold
                       border border-sky-700 rounded-lg text-[#004D77] bg-white
                       hover:bg-sky-50 active:scale-95 transition-all duration-200
                       cursor-pointer whitespace-nowrap"
          >
            <span className="hidden sm:inline">Limpiar</span>
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        )}

      </div>
    </div>
  );
}

export default TopBar;