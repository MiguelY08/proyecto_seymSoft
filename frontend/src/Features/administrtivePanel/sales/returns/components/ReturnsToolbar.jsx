/**
 * Archivo: ReturnsToolbar.jsx
 *
 * Barra de herramientas ubicada en la parte superior de la página de devoluciones.
 * Contiene los controles principales para búsqueda, filtro por fechas, creación
 * de nuevas devoluciones y exportación a Excel.
 *
 * Responsabilidades:
 * - Renderizar campo de búsqueda
 * - Renderizar filtros de Fecha Inicial y Fecha Final
 * - Renderizar botón para limpiar filtros
 * - Renderizar botón para crear nueva devolución
 * - Renderizar botón para exportar a Excel
 * - Pasarle los eventos al componente padre
 */
import React from 'react';
import { Search, Plus, FileSpreadsheet, Eraser } from 'lucide-react';

/**
 * Componente: ReturnsToolbar
 *
 * Props:
 * @param {string}   search          - Valor actual del campo de búsqueda
 * @param {Function} onSearchChange  - Se ejecuta cuando el usuario digita en la búsqueda
 * @param {string}   startDate       - Fecha inicial (formato YYYY-MM-DD o '')
 * @param {Function} onStartDate     - Se ejecuta cuando cambia la fecha inicial
 * @param {string}   endDate         - Fecha final (formato YYYY-MM-DD o '')
 * @param {Function} onEndDate       - Se ejecuta cuando cambia la fecha final
 * @param {Function} onClearFilters  - Se ejecuta cuando presiona limpiar filtros
 * @param {Function} onNew           - Se ejecuta cuando presiona "Nueva devolución"
 * @param {Function} onExport        - Se ejecuta cuando presiona exportar
 */
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
  // Verificar si hay filtros activos para mostrar el botón limpiar
  const hasActiveFilters = search !== '' || startDate !== '' || endDate !== '';

  return (
    <div className="flex flex-wrap items-end gap-3 shrink-0">

      {/* ===== CAMPO DE BÚSQUEDA ===== */}
      <div className="relative w-72">
        <input
          type="text"
          placeholder="Buscar por número, factura, cliente..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
          aria-label="Buscar devoluciones"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>

      {/* ===== FILTRO FECHA INICIAL ===== */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500 font-medium pl-0.5">
          Fecha Inicial
        </label>
        <input
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(e) => onStartDate(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 cursor-pointer"
          aria-label="Fecha inicial"
        />
      </div>

      {/* ===== FILTRO FECHA FINAL ===== */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500 font-medium pl-0.5">
          Fecha Final
        </label>
        <input
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(e) => onEndDate(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 cursor-pointer"
          aria-label="Fecha final"
        />
      </div>

      {/* ===== BOTÓN LIMPIAR FILTROS (solo visible si hay filtros activos) ===== */}
      {hasActiveFilters && (
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-500 font-medium pl-0.5 invisible">
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

      {/* ===== ESPACIADOR ===== */}
      <div className="flex-1" />

      {/* ===== BOTONES DE ACCIONES ===== */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-green-600 rounded-lg text-green-600 bg-white hover:bg-green-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
          aria-label="Exportar a Excel"
        >
          <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">Export Excel</span>
        </button>

        <button
          onClick={onNew}
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
          aria-label="Nueva devolución"
        >
          <span className="hidden sm:inline">Nueva devolución</span>
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

    </div>
  );
}

export default ReturnsToolbar;