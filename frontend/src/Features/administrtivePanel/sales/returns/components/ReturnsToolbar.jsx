// components/ReturnsToolbar.jsx
import React from 'react';
import { Search, Plus, FileSpreadsheet } from 'lucide-react';

function ReturnsToolbar({ search, onSearchChange, onNew, onExport }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">
      <div className="relative flex-1 sm:flex-none sm:w-72 md:w-96">
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