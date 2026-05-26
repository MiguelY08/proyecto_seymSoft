// categories/components/CategoriesTable.jsx
import React from "react";
import { Edit, Trash2, Info, Layers } from "lucide-react";
import Pagination from "../../../../shared/PaginationAdmin";
import ActiveToggle from "./ActiveToggle";

function SubcategoriasBadge({ count }) {
  const total = Number(count) || 0;

  if (total === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
        <Layers size={11} />
        0
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#004D77]/10 text-[#004D77]">
      <Layers size={11} />
      {total}
    </span>
  );
}

export const CategoriesTable = ({
  currentData,
  filteredCategories,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  handleToggleStatus,
  handleDelete,
  handleEdit,
  handleViewDetail,
  highlightText,
}) => {
  return (
    <>
      <div className="overflow-x-auto rounded-xl shadow-md min-h-0 mb-4">
        <table className="w-full" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "6%" }} />
            <col style={{ width: "42%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>

          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">#</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nombre Categoría</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Subcategorías</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Estado</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {!currentData.length ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                  No se encontraron categorías.
                </td>
              </tr>
            ) : (
              currentData.map((category, index) => {
                const recordNumber = startIndex + index + 1;

                return (
                  <tr
                    key={category.id}
                    className={`${
                      index % 2 === 0
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <td className="px-3 py-2 text-center text-xs text-gray-500 font-medium whitespace-nowrap">
                      {recordNumber}
                    </td>

                    <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium truncate">
                      {highlightText(category.nombre || "")}
                    </td>

                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      <SubcategoriasBadge count={category.subcategorias} />
                    </td>

                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          category.estado === "Activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {highlightText(category.estado || "")}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewDetail(category)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Ver detalle"
                        >
                          <Info className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Editar categoría"
                        >
                          <Edit className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <ActiveToggle
                          activo={category.estado === "Activo"}
                          onChange={() => handleToggleStatus(category.id)}
                        />
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRecords={filteredCategories.length}
      />
    </>
  );
};

export default CategoriesTable;