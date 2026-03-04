import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";

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

const EditCategory = ({ category, allCategories, onClose, onSave }) => {
  const { showWarning, showSuccess } = useAlert();
  const isEditing = !!category;

  const [form, setForm] = useState({
    nombre: category?.nombre || "",
    activo: category?.estado === "Activo" || category?.activo === true,
  });

  const [error, setError] = useState("");

  // 🔹 Validación en tiempo real
  useEffect(() => {
    const nombreTrim = form.nombre.trim();

    if (!nombreTrim) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    // 🔹 Verificar duplicados ignorando la categoría que se está editando
    const nombreExistente = allCategories.some((c) => {
      if (category && c.id === category.id) return false;
      return c.nombre.toLowerCase() === nombreTrim.toLowerCase();
    });

    if (nombreExistente) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }

    setError(""); // No hay error si pasa todas las validaciones
  }, [form.nombre, allCategories, category]);

  // 🔹 Guardar cambios
  const handleSubmit = () => {
    if (error) {
      showWarning("Campo inválido", error);
      return;
    }

    const newCategory = {
      ...category,
      nombre: form.nombre.trim(),
      estado: form.activo ? "Activo" : "Inactivo",
    };

    onSave(newCategory, isEditing);

    showSuccess(
      isEditing ? "Categoría actualizada" : "Categoría creada",
      isEditing
        ? "La categoría fue actualizada correctamente."
        : "La nueva categoría fue creada exitosamente."
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77]">
          <h2 className="text-white font-semibold text-lg">
            {isEditing ? "Editar Categoría" : "Crear Categoría"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre"
              className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-gray-100 text-gray-700 transition-colors duration-200 ${
                error
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
              }`}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <ActiveToggle
              activo={form.activo}
              onChange={() => setForm({ ...form, activo: !form.activo })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={!!error}
            className={`w-full py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              error
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#004D77] hover:bg-[#003a5c]"
            }`}
          >
            {isEditing ? "Guardar cambios" : "Crear"}
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
};

export default EditCategory;