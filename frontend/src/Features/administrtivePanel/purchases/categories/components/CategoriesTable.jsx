import React from "react";
import { Edit, Trash2, Info } from "lucide-react"; // Iconos para acciones
import Pagination from "../../../../shared/PaginationAdmin"; // Componente de paginación

// 🔹 Componente Toggle de estado Activo/Inactivo
function ActiveToggle({ activo, onChange }) {
  return (
    <button
      onClick={onChange} // Función para cambiar estado
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? "bg-green-500" : "bg-red-400" // Color según estado
      }`}
    >
      {/* Indicador de letra A/I */}
      <span
        className={`absolute top-0 h-full flex items-center text-white font-bold text-[9px] transition-all duration-300 ${
          activo ? "left-1.5" : "right-1.5"
        }`}
      >
        {activo ? "A" : "I"}
      </span>

      {/* Circulo deslizante */}
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? "left-[1.4rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}

// 🔹 Tabla de categorías
export const CategoriesTable = ({
  currentData, // Datos a mostrar en la página actual
  filteredCategories, // Todas las categorías filtradas
  currentPage, // Página actual
  setCurrentPage, // Función para cambiar página
  totalPages, // Número total de páginas
  startIndex, // Índice inicial de la página
  endIndex, // Índice final de la página
  handleToggleStatus, // Función para cambiar estado
  handleDelete, // Función para eliminar categoría
  handleEdit, // Función para editar categoría
  handleViewDetail, // 🔹 Función para mostrar modal de detalle
  highlightText, // Función para resaltar texto buscado
}) => {
  return (
    <>
      <div className="bg-white rounded-xl shadow overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-xs">
            <thead className="bg-[#004D77] text-white">
              <tr>
                <th className="px-3 py-2 text-center font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">Nombre Categoría</th>
                <th className="px-3 py-2 text-center font-semibold">Subcategorías</th>
                <th className="px-3 py-2 text-center font-semibold">Estado</th>
                <th className="px-3 py-2 text-center font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((category, index) => (
                <tr
                  key={category.id} // Clave única
                  className={
                    index % 2 === 0
                      ? "bg-[#FFFFFF] hover:bg-gray-50"
                      : "bg-gray-50 hover:bg-gray-100" // Diferenciar filas pares/impares
                  }
                >
                  {/* 🔹 Número de fila */}
                  <td className="px-3 py-2.5 text-center">
                    {highlightText(startIndex + index + 1)}
                  </td>

                  {/* 🔹 Nombre de categoría */}
                  <td className="px-3 py-2.5">
                    {highlightText(category.nombre || "")}
                  </td>

                  {/* 🔵 Contador de subcategorías */}
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-700">
                    {category.subcategorias || 0}
                  </td>

                  {/* 🔹 Estado */}
                  <td className="px-3 py-2.5 text-center">
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

                  {/* 🔹 Acciones */}
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex justify-center gap-2">
                      {/* 🔹 Botón ver detalle */}
                      <button
                        onClick={() => handleViewDetail(category)}
                        className="text-gray-400 hover:text-blue-600 transition-all duration-200 transform hover:scale-125"
                      >
                        <Info size={16} />
                      </button>
                      {/* Editar categoría */}
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-gray-400 hover:text-blue-600 transition-all duration-200 transform hover:scale-125"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Toggle estado */}
                      <ActiveToggle
                        activo={category.estado === "Activo"}
                        onChange={() => handleToggleStatus(category.id)}
                      />

                      {/* Eliminar categoría */}
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-gray-400 hover:text-red-600 transition-all duration-200 transform hover:scale-125"
                      >
                        <Trash2 size={16} />
                      </button>

                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Paginación */}
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRecords={filteredCategories.length} // Total de registros filtrados
      />
    </>
  );
};

export default CategoriesTable;