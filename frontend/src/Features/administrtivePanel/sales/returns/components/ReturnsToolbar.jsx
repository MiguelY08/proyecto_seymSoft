import React from 'react';
import { Search, Plus, FileSpreadsheet, Eraser } from 'lucide-react';
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
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
        <div className="relative w-full md:w-[360px]">
          <input
            type="text"
            placeholder="Buscar por número, factura, cliente..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-4 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
            aria-label="Buscar devoluciones"
          />
          <Search
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <div className="flex w-full flex-col gap-1 md:w-44">
          <label className="pl-0.5 text-xs font-medium text-slate-500">
            Fecha Inicial
          </label>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDate(e.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
            aria-label="Fecha inicial"
          />
        </div>

        <div className="flex w-full flex-col gap-1 md:w-44">
          <label className="pl-0.5 text-xs font-medium text-slate-500">
            Fecha Final
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDate(e.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
            aria-label="Fecha final"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 active:scale-95 md:w-auto"
            aria-label="Limpiar filtros"
            title="Limpiar todos los filtros"
          >
            <Eraser className="h-4 w-4" strokeWidth={2} />
            <span>Limpiar filtros</span>
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
