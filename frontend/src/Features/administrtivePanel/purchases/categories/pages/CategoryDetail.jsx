import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { getSubcategories } from "../services/categoriesService";
import SubcategoriesTable from "../components/SubcategoriesTable";

function CategoryDetail({ category, onClose, refreshCategories }) {
  const { showSuccess } = useAlert();
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const subs = getSubcategories().filter((s) => s.categoriaId === category.id);
    setSubcategories(subs);
  }, [category]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77]">
          <h2 className="text-white font-semibold text-lg">{category.nombre} - Detalle</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div>
            <p><strong>Nombre:</strong> {category.nombre}</p>
            <p><strong>Estado:</strong> {category.estado}</p>
            <p><strong>Subcategorías:</strong> {subcategories.length}</p>
          </div>

          <hr className="my-2" />

          {/* ✅ Tabla de subcategorías */}
          <SubcategoriesTable
            categoryId={category.id}
            refreshCategories={refreshCategories}
          />
        </div>

        {/* FOOTER */}
        <div className="px-6 pb-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryDetail;