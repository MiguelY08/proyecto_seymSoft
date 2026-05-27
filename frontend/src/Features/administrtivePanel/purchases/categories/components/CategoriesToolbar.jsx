// Features/categories/components/CategoriesToolbar.jsx
import React from "react";
import { Plus } from "lucide-react";
import SearchInput from "./SearchInput";

const CategoriesToolbar = ({ search, setSearch, onOpenForm }) => {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 mt-1">
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar categoría..."
      />
      <div className="flex gap-2">
        <button
          onClick={onOpenForm}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold border border-[#004D77] rounded-lg text-[#004D77] bg-white hover:bg-sky-50 transition"
        >
          Crear Categoría
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CategoriesToolbar;