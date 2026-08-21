// features/categories/pages/CategoryDetail.jsx
import React, { useState, useEffect, useMemo } from "react";
import { FolderSearch } from "lucide-react";
import Pagination from "../../../../shared/PaginationLanding";
import { getCategoryById, normalizeCategoryStatus } from "../data/categoriesService";
import { useOutsideCloseWarning } from "../../../../shared/hooks/useOutsideCloseWarning";
import PurchaseModalHeader from "../../../../shared/PurchaseModalHeader";

function CategoryDetail({ category, onClose }) {
  const { handleOutsideClick } = useOutsideCloseWarning(onClose, { hasUnsavedChanges: false });
  const [subcategories, setSubcategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const productsPerPage = 5;

  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        setLoading(true);
        const categoryDetail = await getCategoryById(category.id);
        setSubcategories(
          (categoryDetail.subcategories || []).map(sub => ({
            id: sub.id,
            nombre: sub.name,
            descripcion: sub.description,
            estado: normalizeCategoryStatus(sub)
          }))
        );
      } catch (error) {
        console.error("Error loading subcategories:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSubcategories();
  }, [category]);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return subcategories.slice(start, start + productsPerPage);
  }, [currentPage, subcategories]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <PurchaseModalHeader
          icon={FolderSearch}
          eyebrow="Gestión de categorías"
          title={`Detalle de ${category.nombre}`}
          onClose={onClose}
          closeLabel="Cerrar detalle de categoría"
        />

        <div className="px-6 py-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="text-sm">
            <p><strong>Nombre:</strong> {category.nombre}</p>
            <p><strong>Estado:</strong> {category.estado}</p>
            <p><strong>Subcategorías:</strong> {subcategories.length}</p>
          </div>

          <hr className="my-2" />

          <div className="bg-white rounded-xl shadow overflow-hidden mb-2">
            <div className="overflow-x-auto">
              <table className="min-w-full w-full text-xs">
                <thead className="bg-[#004D77] text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                    <th className="px-3 py-2 text-left font-semibold">Descripción</th>
                    <th className="px-3 py-2 text-center font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3" className="text-center py-4 text-gray-500">Cargando...</td></tr>
                  ) : currentData.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-4 text-gray-500">No hay subcategorías</td></tr>
                  ) : (
                    currentData.map((sub, index) => (
                      <tr key={sub.id} className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                        <td className="px-3 py-2.5">{sub.nombre}</td>
                        <td className="px-3 py-2.5">{sub.descripcion || "-"}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {sub.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {subcategories.length > productsPerPage && (
          <div className="px-3 py-2 border-t border-gray-200">
            <Pagination
              totalProducts={subcategories.length}
              productsPerPage={productsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}

        <div className="px-6 pb-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryDetail;
