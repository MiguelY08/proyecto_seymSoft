// features/categories/pages/EditCategory.jsx
import React, { useState, useEffect } from "react";
import { Plus, AlertCircle, Layers, LoaderCircle, FolderPen, ListPlus } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import ActiveToggle from "../components/ActiveToggle";
import SubcategoriesTable from "../components/SubcategoriesTable";
import { useOutsideCloseWarning } from "../../../../shared/hooks/useOutsideCloseWarning";
import PurchaseModalHeader from "../../../../shared/PurchaseModalHeader";
import {
  getSubcategories,
  createSubcategory,
} from "../data/categoriesService";

const normalizeName = (str = "") =>
  str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function ModalAddSubcategory({ categoryId, categoryNombre, onClose, onCreated }) {
  const { handleOutsideClick } = useOutsideCloseWarning(onClose);
  const { showWarning, showSuccess } = useAlert();
  const [subForm, setSubForm] = useState({ nombre: "", descripcion: "", activo: true });
  const [nombreTouched, setNombreTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleGuardar = async () => {
    // ✅ DESHABILITAR INMEDIATAMENTE - antes de cualquier validación
    setIsSubmitting(true);

    setNombreTouched(true);
    const err =
      !subForm.nombre.trim() ? "El nombre es obligatorio"
      : /^\d/.test(subForm.nombre.trim()) ? "No puede iniciar con un número"
      : subForm.nombre.trim().length < 3 ? "Mínimo 3 caracteres"
      : null;

    if (err) {
      setIsSubmitting(false);
      showWarning("Error de validación", err);
      return;
    }

    try {
      const existingSubs = await getSubcategories(categoryId);
      const duplicate = existingSubs.some(
        (s) => normalizeName(s.nombre) === normalizeName(subForm.nombre)
      );

      if (duplicate) {
        setIsSubmitting(false);
        showWarning("Nombre duplicado", "Ya existe una subcategoría con ese nombre.");
        return;
      }

      await createSubcategory({
        nombre: subForm.nombre.trim(),
        descripcion: subForm.descripcion,
        categoriaId: categoryId,
        activo: subForm.activo,
      });

      showSuccess("Subcategoría creada", `"${subForm.nombre.trim()}" fue creada correctamente.`);
      onCreated();
      onClose();
    } catch (error) {
      setIsSubmitting(false);
      showWarning("Error", error.message || "No se pudo crear la subcategoría.");
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm"
      onClick={handleOutsideClick}
    >
      <div
        className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-sm sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <PurchaseModalHeader
          icon={ListPlus}
          eyebrow={`Categoría: ${categoryNombre}`}
          title="Nueva subcategoría"
          onClose={handleCancel}
          closeLabel="Cerrar formulario de subcategoría"
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4">
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <ActiveToggle
              activo={subForm.activo}
              onChange={(nuevo) => setSubForm({ ...subForm, activo: nuevo })}
            />
          </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 px-4 pb-5 sm:px-6 sm:pb-6">
          <button
            type="button"
            onClick={handleGuardar}
            disabled={isSubmitting}
            className={`inline-flex w-full items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "cursor-pointer bg-[#004D77] hover:bg-[#003b5c] hover:shadow-md"
            }`}
          >
            {isSubmitting ? "Creando..." : "Crear subcategoría"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className={`inline-flex w-full items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 ${
              isSubmitting ? "cursor-not-allowed opacity-70" : "cursor-pointer"
            }`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const EditCategory = ({ category, allCategories, onClose, onSave, refreshCategories }) => {
  const { handleOutsideClick } = useOutsideCloseWarning(onClose);
  const { showWarning, showConfirm } = useAlert();
  const [form, setForm] = useState({
    nombre: category?.nombre || "",
    activo: category?.estado === "Activo",
  });
  const [error, setError] = useState("");
  const [subCount, setSubCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshSubCount = async () => {
    if (category) {
      const subs = await getSubcategories(category.id);
      setSubCount(subs.length);
    }
  };

  useEffect(() => {
    refreshSubCount();
  }, [category, refreshKey]);

  useEffect(() => {
    const nombreTrim = form.nombre.trim();
    if (!nombreTrim) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }
    const existe = allCategories.some((c) => {
      if (category && c.id === category.id) return false;
      return normalizeName(c.nombre) === normalizeName(nombreTrim);
    });
    setError(existe ? "Ya existe una categoría con ese nombre." : "");
  }, [form.nombre, allCategories, category]);

  const handleSubmit = async () => {
    if (isSaving) return;

    if (error) {
      showWarning("Campo inválido", error);
      return;
    }

    const wasActive = category?.estado === "Activo";
    const willBeActive = form.activo;

    if (wasActive !== willBeActive) {
      const result = await showConfirm(
        willBeActive ? "question" : "warning",
        willBeActive ? "Activar categoría" : "Desactivar categoría",
        willBeActive
          ? `Al activar "${category.nombre}" también se activarán todas sus subcategorías. ¿Deseas continuar?`
          : `Al desactivar "${category.nombre}" también se desactivarán todas sus subcategorías y los productos asociados a ellas. ¿Deseas continuar?`,
        {
          confirmButtonText: willBeActive ? "Sí, activar" : "Sí, desactivar",
          cancelButtonText: "Cancelar",
        }
      );
      if (!result?.isConfirmed) return;
    }

    try {
      setIsSaving(true);
      await onSave(
        {
          ...category,
          nombre: form.nombre.trim(),
          estado: form.activo ? "Activo" : "Inactivo",
        },
        true
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubcategoryCreated = () => {
    setRefreshKey((k) => k + 1);
    if (refreshCategories) refreshCategories();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm"
        onClick={handleOutsideClick}
      >
        <div
          className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[calc(100dvh-2rem)] sm:max-h-[680px] sm:max-w-3xl sm:rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <PurchaseModalHeader
            icon={FolderPen}
            eyebrow="Gestión de categorías"
            title="Editar categoría"
            onClose={onClose}
            closeLabel="Cerrar edición de categoría"
          />

          <div className="flex shrink-0 flex-col gap-4 border-b border-gray-100 px-4 pb-3 pt-5 sm:flex-row sm:gap-6 sm:px-6">
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

            <div className="flex flex-col gap-1 justify-center">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <ActiveToggle
                activo={form.activo}
                onChange={(nuevo) => setForm({ ...form, activo: nuevo })}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
              type="button"
              onClick={() => setShowAddSubModal(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#004D77] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir subcategoría
            </button>
          </div>

          <div className="min-h-0 flex-1 px-4 pb-3 sm:px-6">
            <SubcategoriesTable
              key={refreshKey}
              categoryId={category?.id}
              refreshCategories={() => {
                refreshSubCount();
                if (refreshCategories) refreshCategories();
              }}
            />
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-gray-100 px-4 py-4 sm:flex-row sm:gap-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="order-2 inline-flex flex-1 cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!!error || isSaving}
              aria-busy={isSaving}
              className={`order-1 inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 ${
                error || isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "cursor-pointer bg-[#004D77] hover:bg-[#003b5c] hover:shadow-md"
              }`}
            >
              {isSaving && <LoaderCircle className="w-4 h-4 animate-spin" />}
              {isSaving ? "Guardando..." : "Guardar cambios"}
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
