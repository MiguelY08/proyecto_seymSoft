// features/categories/components/SubcategoriesTable.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Trash2, SquarePen } from "lucide-react";
import Pagination from "../../../../shared/PaginationLanding";
import { useAlert } from "../../../../shared/alerts/useAlert";
import ActiveToggle from "./ActiveToggle";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";
import {
  getSubcategories,
  updateSubcategory,
  deleteSubcategory,
} from "../data/categoriesService";
import { synchronizeProductsBySubcategory } from "../data/categoryproductsService";

const normalizeName = (str = "") =>
  str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const SubcategoriesTable = ({ categoryId, refreshCategories }) => {
  const { showConfirm, showSuccess, showWarning, showError } = useAlert();
  const [subcategories, setSubcategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [editedEstado, setEditedEstado] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const deleteLockRef = useRef(false);
  const [changingStatusId, setChangingStatusId] = useState(null);
  const statusChangeLockRef = useRef(false);

  const loadSubcategories = async () => {
    try {
      setLoading(true);
      const subs = await getSubcategories(categoryId);
      const normalized = subs.map(sub => {
        const rawStatus = sub.status ?? sub.statusName ?? "";
        const estadoFinal =
          rawStatus === "Active"   || rawStatus === "Activo"   || rawStatus === 1 ? "Activo"
        : rawStatus === "Inactive" || rawStatus === "Inactivo" || rawStatus === 2 ? "Inactivo"
        : sub.estado ?? "Inactivo";
        return {
          ...sub,
          nombre:     sub.nombre     ?? sub.name        ?? "",
          descripcion: sub.descripcion ?? sub.description ?? "",
          estado: estadoFinal,
        };
      });
      normalized.sort((a, b) => a.id - b.id);
      setSubcategories(normalized);
    } catch {
      showError("Error", "No se pudieron cargar las subcategorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      loadSubcategories();
    }
  }, [categoryId]);

  const handleSaveEdit = async () => {
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

    if (descTrim && descTrim.length > 200) {
      showWarning("Error de validación", "La descripción no puede tener más de 200 caracteres.");
      return;
    }

    const otherSubs = subcategories.filter((s) => s.id !== editingId);
    const nombreExistente = otherSubs.some((s) => normalizeName(s.nombre) === normalizeName(nameTrim));
    if (nombreExistente) {
      showWarning("Error de validación", "Ya existe otra subcategoría con ese nombre en esta categoría.");
      return;
    }

    const currentSubcategory = subcategories.find((subcategory) => subcategory.id === editingId);
    const isBeingDeactivated = currentSubcategory?.estado === "Activo" && !editedEstado;

    if (statusChangeLockRef.current) return;
    statusChangeLockRef.current = true;
    setChangingStatusId(editingId);

    try {
      if (isBeingDeactivated) {
        const result = await showConfirm(
          "warning",
          "Desactivar subcategoría",
          "Al desactivar esta subcategoría también se desactivarán los productos asociados a ella. ¿Deseas continuar?",
          { confirmButtonText: "Sí, desactivar", cancelButtonText: "Cancelar" }
        );
        if (!result?.isConfirmed) return;
      }

      await updateSubcategory(editingId, {
        nombre: nameTrim,
        descripcion: descTrim || "",
        estado: editedEstado ? "Activo" : "Inactivo"
      });

      if (currentSubcategory?.estado !== (editedEstado ? "Activo" : "Inactivo")) {
        await synchronizeProductsBySubcategory(editingId, editedEstado);
      }

      setSubcategories(subcategories.map((s) =>
        s.id === editingId
          ? { ...s, nombre: nameTrim, descripcion: descTrim || "", estado: editedEstado ? "Activo" : "Inactivo" }
          : s
      ));

      setEditingId(null);
      showSuccess("Subcategoría actualizada", "Se guardaron los cambios correctamente.");
      if (refreshCategories) refreshCategories();
    } catch (error) {
      showError("Error", error.message || "No se pudo actualizar la subcategoría.");
    } finally {
      statusChangeLockRef.current = false;
      setChangingStatusId(null);
    }
  };

  const executeDelete = async (id) => {
    const result = await showConfirm(
      "warning",
      "Eliminar subcategoría",
      "¿Deseas eliminar esta subcategoría?",
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );
    if (!result?.isConfirmed) return;

    try {
      await deleteSubcategory(id);
      await loadSubcategories();
      showSuccess("Eliminado", "La subcategoría fue eliminada correctamente.");
      if (refreshCategories) refreshCategories();
    } catch (error) {
      showError(
        "No se puede eliminar",
        getApiErrorMessage(error, {
          conflictMessage:
            "Esta subcategoría tiene productos asociados. Reasigna o elimina esos productos antes de eliminarla.",
          fallback: "No se pudo eliminar la subcategoría.",
        })
      );
    }
  };

  const handleDelete = async (id) => {
    if (deleteLockRef.current) return;

    deleteLockRef.current = true;
    setDeletingId(id);

    try {
      await executeDelete(id);
    } finally {
      deleteLockRef.current = false;
      setDeletingId(null);
    }
  };

  const handleToggleEstado = async (subId, nuevoEstado) => {
    if (statusChangeLockRef.current) return;
    statusChangeLockRef.current = true;
    setChangingStatusId(subId);

    if (!nuevoEstado) {
      const result = await showConfirm(
        "warning",
        "Desactivar subcategoría",
        "Al desactivar esta subcategoría también se desactivarán los productos asociados a ella. ¿Deseas continuar?",
        { confirmButtonText: "Sí, desactivar", cancelButtonText: "Cancelar" }
      );
      if (!result?.isConfirmed) {
        statusChangeLockRef.current = false;
        setChangingStatusId(null);
        return;
      }
    }

    try {
      await updateSubcategory(subId, {
        estado: nuevoEstado ? "Activo" : "Inactivo"
      });

      await synchronizeProductsBySubcategory(subId, nuevoEstado);

      setSubcategories(subcategories.map((s) =>
        s.id === subId ? { ...s, estado: nuevoEstado ? "Activo" : "Inactivo" } : s
      ));
      showSuccess("Estado actualizado", "Se cambió el estado de la subcategoría.");
      if (refreshCategories) refreshCategories();
    } catch (error) {
      showError("Error", error.message || "No se pudo cambiar el estado.");
    } finally {
      statusChangeLockRef.current = false;
      setChangingStatusId(null);
    }
  };

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return subcategories.slice(start, start + productsPerPage);
  }, [currentPage, subcategories]);

  if (loading) {
    return <p className="text-gray-500 text-sm">Cargando subcategorías...</p>;
  }

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
                          placeholder="Descripción (opcional)"
                          className="w-full px-3 py-2 border border-gray-400 rounded-md"
                        />
                      </td>
                      <td className="py-1.5 text-center">
                        <ActiveToggle activo={editedEstado} onChange={(nuevo) => setEditedEstado(nuevo)} />
                      </td>
                      <td className="py-1.5 text-center flex justify-center gap-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={changingStatusId !== null}
                          aria-busy={changingStatusId === sub.id}
                          className={`px-3 py-1 text-white rounded text-xs ${
                            changingStatusId !== null
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600"
                          }`}
                        >
                          {changingStatusId === sub.id ? "Guardando..." : "Guardar"}
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
                      <td className="py-1.5">{sub.descripcion || "—"}</td>
                      <td className="py-1.5 text-center">
                        <ActiveToggle
                          activo={sub.estado === "Activo"}
                          onChange={(nuevo) => handleToggleEstado(sub.id, nuevo)}
                          disabled={changingStatusId !== null}
                          loading={changingStatusId === sub.id}
                        />
                       </td>
                      <td className="py-1.5 text-center flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(sub.id);
                            setEditedName(sub.nombre);
                            setEditedDesc(sub.descripcion || "");
                            setEditedEstado(sub.estado === "Activo");
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-all duration-200 transform hover:scale-125"
                        >
                          <SquarePen size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          disabled={deletingId !== null}
                          aria-busy={deletingId === sub.id}
                          title={deletingId === sub.id ? "Procesando..." : "Eliminar subcategoría"}
                          className={`transition-all duration-200 transform ${
                            deletingId !== null
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-400 hover:text-red-600 hover:scale-125"
                          }`}
                        >
                          <Trash2
                            size={14}
                            className={deletingId === sub.id ? "animate-pulse" : ""}
                          />
                        </button>
                       </td>
                    </>
                  )}
                 </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="scale-80 ">
          <Pagination
            totalProducts={subcategories.length}
            productsPerPage={productsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default SubcategoriesTable;
