import React from "react";
import { Edit, Trash2, Info, Layers } from "lucide-react";
import Pagination from "../../../../shared/PaginationAdmin";

function ActiveToggle({ activo, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? "bg-green-500" : "bg-red-400"
      }`}
    >
      <span
        className={`absolute top-0 h-full flex items-center text-white font-bold text-[9px] transition-all duration-300 ${
          activo ? "left-1.5" : "right-1.5"
        }`}
      >
        {activo ? "A" : "I"}
      </span>
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? "left-[1.4rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}

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
            <col style={{ width: "6%" }}  /> {/* # */}
            <col style={{ width: "42%" }} /> {/* Nombre Categoría */}
            <col style={{ width: "16%" }} /> {/* Subcategorías */}
            <col style={{ width: "16%" }} /> {/* Estado */}
            <col style={{ width: "20%" }} /> {/* Acciones */}
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
                const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-100";
                const recordNumber = startIndex + index + 1;

                return (
                  <tr key={category.id} className={`transition-colors duration-150 ${rowBg}`}>
                    {/* # — misma tipografía que ClientsTable */}
                    <td className="px-3 py-2 text-center text-xs text-gray-500 font-medium whitespace-nowrap">
                      {recordNumber}
                    </td>

                    {/* Nombre — misma tipografía que ClientsTable (nombre completo) */}
                    <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium truncate">
                      {highlightText(category.nombre || "")}
                    </td>

                    {/* Subcategorías */}
                    <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                      <SubcategoriasBadge count={category.subcategorias} />
                    </td>

                    {/* Estado */}
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

                    {/* Acciones */}
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