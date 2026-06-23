// features/categories/components/CategoriesToolbar.jsx
import React from "react";
import { Plus } from "lucide-react";
import SearchInput from "./SearchInput";
import  Permission  from "../../../configuration/roles/components/Permission";
import ButtonComponent from "../../../../shared/ButtonComponent";

const CategoriesToolbar = ({ search, setSearch, onOpenForm }) => {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 shrink-0">
      <div className="flex-1 sm:flex-none sm:w-72 md:w-80">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Permission permission ="categorias.crear" >
          <ButtonComponent
            onClick={onOpenForm}
            title="Nueva"
          >
            <span className="hidden sm:inline">Nuevo</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </ButtonComponent>
        </Permission>
      </div>
    </div>
  );
};

export default CategoriesToolbar;