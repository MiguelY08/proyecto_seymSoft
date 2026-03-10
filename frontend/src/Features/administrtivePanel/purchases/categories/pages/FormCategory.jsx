import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";

function FormCategory({ category, onClose, onSave }) {
  const isEditing = !!category;
  const { showWarning } = useAlert();

  const [form, setForm] = useState({
    nombre: category?.nombre ?? "",
    activo: category?.estado === "Activo" || category?.activo === true,
  });

  const [nombreTouched, setNombreTouched] = useState(false);

  // ─── VALIDACIONES ─────────────────────────────
  const nombreError = (() => {
    if (!nombreTouched) return null;
    if (!form.nombre.trim()) return "El nombre es obligatorio";
    if (/^\d/.test(form.nombre.trim()))
      return "El nombre no puede iniciar con un número";
    if (form.nombre.trim().length < 3)
      return "El nombre debe tener al menos 3 caracteres";
    return null;
  })();

  const hasErrors = !!nombreError;

  // ─── FUNCIONES ─────────────────────────────
  const handleSubmit = () => {
    setNombreTouched(true);

    if (hasErrors) {
      showWarning(
        "Error en el formulario",
        "Corrige los errores antes de continuar."
      );
      return;
    }

    const categoryData = {
      ...category,
      nombre: form.nombre.trim(),
      activo: form.activo,
      estado: form.activo ? "Activo" : "Inactivo",
    };

    onSave(categoryData, isEditing);
    onClose();
  };

  const handleCancel = () => onClose();

  // ─── TOGGLE INLINE ─────────────────────────
  const ActiveToggle = ({ activo, onChange }) => (
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

  const inputClass = (error) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-gray-100 text-gray-700 transition ${
      error
        ? "border-red-400 focus:ring-2 focus:ring-red-300"
        : "border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77]">
          <h2 className="text-white font-semibold text-lg">
            {isEditing ? "Editar Categoría" : "Crear Categoría"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-white hover:bg-white/20 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 flex flex-col gap-5">
          {/* NOMBRE */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <div className="relative">
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => {
                  setForm({ ...form, nombre: e.target.value });
                  setNombreTouched(true);
                }}
                onBlur={() => setNombreTouched(true)}
                placeholder="Nombre de la categoría"
                className={inputClass(nombreError)}
              />
              {nombreTouched && nombreError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                nombreError ? "max-h-10 mt-1 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {nombreError}
              </p>
            </div>
          </div>

          {/* ESTADO */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <ActiveToggle
              activo={form.activo}
              onChange={() => setForm({ ...form, activo: !form.activo })}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={hasErrors}
            className={`w-full py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              hasErrors
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#004D77] hover:bg-[#003a5c]"
            }`}
          >
            {isEditing ? "Guardar cambios" : "Crear"}
          </button>
          <button
            onClick={handleCancel}
            className="w-full py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormCategory;