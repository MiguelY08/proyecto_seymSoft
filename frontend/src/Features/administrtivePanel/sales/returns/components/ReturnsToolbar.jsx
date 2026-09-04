import React from 'react';
import { Search, Plus, FileSpreadsheet, Eraser, X } from 'lucide-react';
import Permission from '../../../configuration/roles/components/Permission';
import ButtonComponent from '../../../../shared/ButtonComponent';

function ReturnsToolbar({
  search,
  onSearchChange,
  startDate,
  onStartDate,
  endDate,
  onEndDate,
  onClearFilters,
  onNew,
  onExport,
}) {
  const hasActiveFilters = search !== '' || startDate !== '' || endDate !== '';

  return (
    <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:flex-1 lg:gap-4">
        <div className="relative w-full lg:w-52 xl:w-56">
          <input
            type="text"
            placeholder="Buscar por número, factura, cliente..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-16 text-sm text-gray-700 outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
            aria-label="Buscar devoluciones"
          />
          {search && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSearchChange('')}
              className="absolute right-9 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-[#004D77]"
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <div className="w-full lg:w-40">
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors duration-200 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
            aria-label="Fecha inicial"
          />
        </div>

        <div className="w-full lg:w-40">
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors duration-200 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
            aria-label="Fecha final"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-800 active:scale-95 lg:w-10"
            aria-label="Limpiar filtros"
            title="Limpiar todos los filtros"
          >
            <Eraser className="h-4 w-4" strokeWidth={2} />
            <span className="lg:hidden">Limpiar filtros</span>
          </button>
        )}
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Permission permission="devoluciones_en_ventas.exportar">
          <ButtonComponent
            onClick={onExport}
            className="flex-1 bg-white text-green-600 border-green-600 hover:bg-green-400 px-3 flex items-center justify-center gap-2 sm:flex-none"
            aria-label="Exportar a Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </ButtonComponent>
        </Permission>

        <Permission permission="devoluciones_en_ventas.crear">
          <ButtonComponent
            onClick={onNew}
            title="Nuevo"
            className="flex-1 flex items-center justify-center gap-2 sm:flex-none"
            aria-label="Nuevo"
          >
            <span className="hidden sm:inline">Nuevo</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </ButtonComponent>
        </Permission>
      </div>
    </div>
  );
}

export default ReturnsToolbar;
