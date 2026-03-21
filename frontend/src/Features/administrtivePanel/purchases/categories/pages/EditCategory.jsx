import React, { useState, useEffect } from "react";
import { X, Plus, AlertCircle, Layers } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import {
  getSubcategories,
  createSubcategory,
  deactivateCategoryWithSubcategories,
  activateCategoryWithSubcategories,
} from "../services/categoriesService";
import SubcategoriesTable from "../components/SubcategoriesTable";

function ActiveToggle({ activo, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer ${
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

// ─── Modal nueva subcategoría ─────────────────────────────────────────────────
function ModalAddSubcategory({ categoryId, categoryNombre, onClose, onCreated }) {
  const { showWarning, showSuccess } = useAlert();
  const [subForm, setSubForm] = useState({ nombre: "", descripcion: "", activo: true });
  const [nombreTouched, setNombreTouched] = useState(false);

  const nombreError = (() => {
    if (!nombreTouched) return null;
    if (!subForm.nombre.trim()) return "El nombre es obligatorio";
    if (/^\d/.test(subForm.nombre.trim())) return "No puede iniciar con un número";
    if (subForm.nombre.trim().length < 3) return "Mínimo 3 caracteres";
    return null;
  })();

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-gray-100 text-gray-700 transition ${
      hasError
        ? "border-red-400 focus:ring-2 focus:ring-red-300"
        : "border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
    }`;

  const handleGuardar = () => {
    setNombreTouched(true);
    const err =
      !subForm.nombre.trim() ? "El nombre es obligatorio"
      : /^\d/.test(subForm.nombre.trim()) ? "No puede iniciar con un número"
      : subForm.nombre.trim().length < 3 ? "Mínimo 3 caracteres"
      : null;

    if (err) return;

    const duplicate = getSubcategories()
      .filter((s) => s.categoriaId === categoryId)
      .some((s) => s.nombre.toLowerCase() === subForm.nombre.trim().toLowerCase());

    if (duplicate) {
      showWarning("Nombre duplicado", "Ya existe una subcategoría con ese nombre.");
      return;
    }

    createSubcategory({
      nombre: subForm.nombre.trim(),
      descripcion: subForm.descripcion,
      categoriaId: categoryId,
      activo: subForm.activo,
    });

    showSuccess("Subcategoría creada", `"${subForm.nombre.trim()}" fue creada correctamente.`);
    onCreated();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77]">
          <div>
            <h2 className="text-white font-semibold text-base">Nueva Subcategoría</h2>
            <p className="text-white/60 text-xs mt-0.5">en {categoryNombre}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={subForm.nombre}
                onChange={(e) => { setSubForm({ ...subForm, nombre: e.target.value }); setNombreTouched(true); }}
                onBlur={() => setNombreTouched(true)}
                placeholder="Nombre de la subcategoría"
                className={inputClass(nombreError)}
                autoFocus
              />
              {nombreTouched && nombreError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>
            {nombreTouched && nombreError && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={11} /> {nombreError}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              rows="3"
              value={subForm.descripcion}
              onChange={(e) => setSubForm({ ...subForm, descripcion: e.target.value })}
              placeholder="Descripción (opcional)"
              className="mt-1 w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-100 resize-none outline-none focus:ring-2 focus:ring-[#004D77]/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <ActiveToggle
              activo={subForm.activo}
              onChange={() => setSubForm({ ...subForm, activo: !subForm.activo })}
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={handleGuardar}
            className="w-full py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors"
          >
            Crear subcategoría
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EditCategory principal ───────────────────────────────────────────────────
const EditCategory = ({ category, allCategories, onClose, onSave, refreshCategories }) => {
  const { showWarning, showSuccess, showConfirm } = useAlert();
  const isEditing = !!category;

  const [form, setForm] = useState({
    nombre: category?.nombre || "",
    activo: category?.estado === "Activo" || category?.activo === true,
  });

  const [error, setError] = useState("");
  const [subCount, setSubCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddSubModal, setShowAddSubModal] = useState(false);

  const refreshSubCount = () => {
    if (category) {
      const count = getSubcategories().filter((s) => s.categoriaId === category.id).length;
      setSubCount(count);
    }
  };

  useEffect(() => { refreshSubCount(); }, [category, refreshKey]);

  useEffect(() => {
    const nombreTrim = form.nombre.trim();
    if (!nombreTrim) { setError("El nombre de la categoría es obligatorio."); return; }
    const existe = allCategories.some((c) => {
      if (category && c.id === category.id) return false;
      return c.nombre.toLowerCase() === nombreTrim.toLowerCase();
    });
    setError(existe ? "Ya existe una categoría con ese nombre." : "");
  }, [form.nombre, allCategories, category]);

  const handleSubmit = async () => {
    if (error) { showWarning("Campo inválido", error); return; }

    const wasActive = category?.estado === "Activo";
    const willBeActive = form.activo;

    // ── Desactivar: pedir confirmación y bajar subcategorías ──
    if (wasActive && !willBeActive) {
      const result = await showConfirm(
        "warning",
        "Desactivar categoría",
        `Al desactivar "${category.nombre}" también se desactivarán todas sus subcategorías. ¿Deseas continuar?`,
        { confirmButtonText: "Sí, desactivar", cancelButtonText: "Cancelar" }
      );
      if (!result?.isConfirmed) return;

      deactivateCategoryWithSubcategories(category.id);
      // Actualizar nombre si cambió
      onSave({ ...category, nombre: form.nombre.trim(), estado: "Inactivo" }, isEditing);

    // ── Activar: subir categoría y todas sus subcategorías ──
    } else if (!wasActive && willBeActive) {
      activateCategoryWithSubcategories(category.id);
      onSave({ ...category, nombre: form.nombre.trim(), estado: "Activo" }, isEditing);

    // ── Solo cambió el nombre ──
    } else {
      onSave({ ...category, nombre: form.nombre.trim(), estado: category.estado }, isEditing);
    }

    if (refreshCategories) refreshCategories();
    showSuccess("Categoría actualizada", "Los cambios se guardaron correctamente.");
    onClose();
  };

  const handleSubcategoryCreated = () => {
    setRefreshKey((k) => k + 1);
    if (refreshCategories) refreshCategories();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        {/* 
          Modal sin scroll:
          - h fijo usando vh con margen (h-[calc(100vh-2rem)])
          - flex col con secciones de altura fija excepto la tabla
          - La tabla vive en un flex-1 min-h-0 para crecer sin reventar el layout
        */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col"
          style={{ height: "calc(100vh - 2rem)", maxHeight: "680px" }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* HEADER — altura fija */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] rounded-t-2xl shrink-0">
            <h2 className="text-white font-semibold text-lg">
              {isEditing ? "Editar Categoría" : "Crear Categoría"}
            </h2>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* CAMPOS SUPERIORES — altura fija */}
          <div className="px-6 pt-5 pb-3 flex gap-6 shrink-0 border-b border-gray-100">

            {/* Nombre */}
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre de la categoría"
                className={`w-full px-4 py-2 text-sm border rounded-lg outline-none bg-gray-100 ${
                  error ? "border-red-500" : "border-gray-300 focus:border-[#004D77]"
                }`}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-1 justify-center">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <ActiveToggle
                activo={form.activo}
                onChange={() => setForm({ ...form, activo: !form.activo })}
              />
            </div>

          </div>

          {/* HEADER TABLA — altura fija */}
          <div className="flex items-center justify-between px-6 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#004D77]" />
              <p className="text-sm font-semibold text-gray-700">
                Subcategorías
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-[#004D77]/10 text-[#004D77]">
                  {subCount}
                </span>
              </p>
            </div>
            <button
              onClick={() => setShowAddSubModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#004D77] text-white hover:bg-[#003a5c] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir subcategoría
            </button>
          </div>

          {/* TABLA — flex-1 + min-h-0 para ocupar el espacio restante sin crecer */}
          <div className="flex-1 min-h-0 px-6 pb-3">
            <SubcategoriesTable
              key={refreshKey}
              categoryId={category?.id}
              refreshCategories={() => {
                refreshSubCount();
                if (refreshCategories) refreshCategories();
              }}
            />
          </div>

          {/* FOOTER — altura fija */}
          <div className="px-6 py-4 flex gap-4 shrink-0 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={!!error}
              className={`flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                error ? "bg-gray-400 cursor-not-allowed" : "bg-[#004D77] hover:bg-[#003a5c]"
              }`}
            >
              Guardar cambios
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>

        </div>
      </div>

      {showAddSubModal && (
        <ModalAddSubcategory
          categoryId={category?.id}
          categoryNombre={category?.nombre}
          onClose={() => setShowAddSubModal(false)}
          onCreated={handleSubcategoryCreated}
        />
      )}
    </>
  );
};

export default EditCategory;