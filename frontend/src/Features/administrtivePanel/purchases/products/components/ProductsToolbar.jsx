import { Search, Plus } from 'lucide-react';

// ─── ProductsToolbar ──────────────────────────────────────────────────────────
function ProductsToolbar({ search, onSearchChange, onNewClick }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">
      <div className="relative w-full sm:w-80">
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-black text-sm"
        />
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" />
      </div>

      <button
        onClick={onNewClick}
        title="Crear nuevo producto"
        className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
      >
        <span className="hidden sm:inline">Crear nuevo producto</span>
        <span className="sm:hidden">Nuevo</span>
        <Plus className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export default ProductsToolbar;