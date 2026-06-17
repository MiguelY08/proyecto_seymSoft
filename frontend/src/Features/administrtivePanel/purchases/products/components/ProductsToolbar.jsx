import { Search } from "lucide-react";

// ─── ProductsToolbar ──────────────────────────────────────────────────────────
function ProductsToolbar({ search, onSearchChange }) {
  return (
    <div className="relative w-full sm:w-80">
      <input
        type="text"
        placeholder="Buscar"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-black text-sm"
      />
      <Search
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
      />
    </div>
  );
}

export default ProductsToolbar;
