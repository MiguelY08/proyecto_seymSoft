// features/categories/pages/CategoryDetail.jsx
import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, FolderSearch, Layers, Tag } from "lucide-react";
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

  const InfoCard = ({ icon: Icon, label, children, accent = false }) => (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3 transition-colors hover:border-[#004D77]/20 hover:bg-[#004D77]/[0.03]">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#004D77]/10">
        <Icon className="h-4 w-4 text-[#004D77]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide leading-none text-gray-400">
          {label}
        </span>
        <div className={`truncate text-sm font-medium ${accent ? "font-semibold text-[#004D77]" : "text-gray-800"}`}>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm"
      onClick={handleOutsideClick}
    >
      <div
        className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-3xl sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <PurchaseModalHeader
          icon={FolderSearch}
          eyebrow="Gestión de categorías"
          title={`Detalle de ${category.nombre}`}
          onClose={onClose}
          closeLabel="Cerrar detalle de categoría"
        />

        <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <InfoCard icon={Tag} label="Categoría" accent>
              {category.nombre || "-"}
            </InfoCard>
            <InfoCard icon={CheckCircle2} label="Estado">
              <span className={`inline-flex items-center rounded-full border border-black/5 px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${category.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {category.estado || "-"}
              </span>
            </InfoCard>
            <InfoCard icon={Layers} label="Subcategorías" accent>
              {subcategories.length}
            </InfoCard>
          </div>

          <div>
            <h3 className="mb-3 text-center text-sm font-semibold text-[#004D77]">
              Subcategorías de {category.nombre || "la categoría seleccionada"}
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-[620px] w-full">
                <thead className="bg-[#004D77]/5">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Nombre</th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Descripción</th>
                    <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#004D77]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3" className="px-3 py-10 text-center text-xs text-gray-400">Cargando...</td></tr>
                  ) : currentData.length === 0 ? (
                    <tr><td colSpan="3" className="px-3 py-10 text-center text-xs text-gray-400">No hay subcategorías</td></tr>
                  ) : (
                    currentData.map((sub, index) => (
                      <tr key={sub.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="max-w-[220px] truncate px-3 py-2 text-xs font-medium text-gray-800">{sub.nombre}</td>
                        <td className="max-w-[320px] truncate px-3 py-2 text-xs text-gray-600">{sub.descripcion || "-"}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center rounded-full border border-black/5 px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${sub.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryDetail;
