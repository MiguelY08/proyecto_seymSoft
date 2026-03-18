import React, { useState, useEffect, useMemo } from "react";
import { Trash2, SquarePen } from "lucide-react";
import Pagination from "../../../../shared/PaginationLanding";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { getSubcategories, saveSubcategories, deleteSubcategory } from "../services/categoriesService";

function ActiveToggle({ activo, onChange }) {
  return (
    <button
      onClick={() => onChange(!activo)}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? "bg-green-500" : "bg-red-400"
      }`}
    >
      <span
        className={`absolute top-0 h-full flex items-center justify-center text-white font-bold text-[9px] transition-all duration-300 ${
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

const SubcategoriesTable = ({ categoryId, refreshCategories }) => {
  const { showConfirm, showSuccess, showWarning } = useAlert();
  const [subcategories, setSubcategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [editedEstado, setEditedEstado] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;

  const loadSubcategories = () => {
    const allSubs = getSubcategories().filter((s) => s.categoriaId === categoryId);
    setSubcategories(allSubs);
  };

  useEffect(() => {
    loadSubcategories();
  }, [categoryId]);

  const handleSaveEdit = () => {
    // ── VALIDACIONES ──
    const nameTrim = editedName.trim();
    const descTrim = editedDesc.trim();

    if (!nameTrim) {
      showWarning("Error de validación", "El nombre es obligatorio.");
      return;
    }

    if (/^\d/.test(nameTrim)) {
      showWarning("Error de validación", "El nombre no puede iniciar con un número.");
      return;
    }

    if (nameTrim.length > 50) {
      showWarning("Error de validación", "El nombre no puede tener más de 50 caracteres.");
      return;
    }

    if (!descTrim) {
      showWarning("Error de validación", "La descripción es obligatoria.");
      return;
    }

    if (descTrim.length > 200) {
      showWarning("Error de validación", "La descripción no puede tener más de 200 caracteres.");
      return;
    }

    // ── VALIDACIÓN NOMBRE DUPLICADO ──
    const otherSubs = subcategories.filter((s) => s.id !== editingId);
    const nombreExistente = otherSubs.some((s) => s.nombre.toLowerCase() === nameTrim.toLowerCase());
    if (nombreExistente) {
      showWarning("Error de validación", "Ya existe otra subcategoría con ese nombre en esta categoría.");
      return;
    }

    // ── GUARDAR CAMBIOS ──
    const allSubs = getSubcategories().map((s) =>
      s.id === editingId
        ? { ...s, nombre: nameTrim, descripcion: descTrim, estado: editedEstado ? "Activo" : "Inactivo" }
        : s
    );
    saveSubcategories(allSubs);

    setSubcategories(subcategories.map((s) =>
      s.id === editingId
        ? { ...s, nombre: nameTrim, descripcion: descTrim, estado: editedEstado ? "Activo" : "Inactivo" }
        : s
    ));

    setEditingId(null);
    showSuccess("Subcategoría actualizada", "Se guardaron los cambios correctamente.");
    refreshCategories();
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "warning",
      "Eliminar subcategoría",
      "¿Deseas eliminar esta subcategoría?",
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );
    if (!result?.isConfirmed) return;
    deleteSubcategory(id);
    loadSubcategories();
    showSuccess("Eliminado", "La subcategoría fue eliminada correctamente.");
    refreshCategories();
  };

  const handleToggleEstado = (subId, nuevoEstado) => {
    const allSubs = getSubcategories().map((s) =>
      s.id === subId ? { ...s, estado: nuevoEstado ? "Activo" : "Inactivo" } : s
    );
    saveSubcategories(allSubs);
    setSubcategories(subcategories.map((s) =>
      s.id === subId ? { ...s, estado: nuevoEstado ? "Activo" : "Inactivo" } : s
    ));
    showSuccess("Estado actualizado", "Se cambió el estado de la subcategoría.");
    refreshCategories();
  };

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return subcategories.slice(start, start + productsPerPage);
  }, [currentPage, subcategories]);

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden mt-0.5">
      <div className="px-6 py-4 overflow-y-auto flex-1">

        {subcategories.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay subcategorías registradas.</p>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="text-left border-b border-gray-300">
                <th className="pb-1.5 font-semibold text-gray-700">Nombre</th>
                <th className="pb-1.5 font-semibold text-gray-700">Descripción</th>
                <th className="pb-1.5 font-semibold text-gray-700 text-center">Estado</th>
                <th className="pb-1.5 font-semibold text-gray-700 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-100">
                  {editingId === sub.id ? (
                    <>
                      <td className="py-1.5">
                        <input
                          type="text"
                          value={editedName}
                          maxLength={50}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-400 rounded-md"
                        />
                      </td>

                      <td className="py-1.5">
                        <input
                          type="text"
                          value={editedDesc}
                          maxLength={200}
                          onChange={(e) => setEditedDesc(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-400 rounded-md"
                        />
                      </td>

                      <td className="py-1.5 text-center">
                        <ActiveToggle activo={editedEstado} onChange={setEditedEstado} />
                      </td>

                      <td className="py-1.5 text-center flex justify-center gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-400 text-white rounded text-xs"
                        >
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-1.5">{sub.nombre}</td>
                      <td className="py-1.5">{sub.descripcion}</td>
                      <td className="py-1.5 text-center">
                        <ActiveToggle
                          activo={sub.estado === "Activo"}
                          onChange={(nuevo) => handleToggleEstado(sub.id, nuevo)}
                        />
                      </td>
                      <td className="py-1.5 text-center flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(sub.id);
                            setEditedName(sub.nombre);
                            setEditedDesc(sub.descripcion);
                            setEditedEstado(sub.estado === "Activo");
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-all duration-200 transform hover:scale-125"
                        >
                          <SquarePen size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="text-gray-400 hover:text-red-600 transition-all duration-200 transform hover:scale-125"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination
          totalProducts={subcategories.length}
          productsPerPage={productsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default SubcategoriesTable;