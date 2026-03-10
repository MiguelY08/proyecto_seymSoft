import { X, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { getCategories, createSubcategory } from "../services/categoriesService";

// Toggle de estado activo/inactivo
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

function FormSubCategory({ onClose }) {
  const { showWarning, showSuccess } = useAlert();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoriaId: "",
    activo: true,
  });

  // touched para mostrar errores solo después de que el usuario interactúe
  const [nombreTouched, setNombreTouched] = useState(false);
  const [categoriaTouched, setCategoriaTouched] = useState(false);

  // ─── VALIDACIONES ─────────────────────────────
  const nombreError = (() => {
    if (!nombreTouched) return null;
    if (!form.nombre.trim()) return "El nombre de la subcategoría es obligatorio.";
    if (/^\d/.test(form.nombre.trim())) return "El nombre no puede iniciar con un número.";
    if (form.nombre.trim().length < 3) return "Debe tener al menos 3 caracteres.";
    return null;
  })();

  const categoriaError = (() => {
    if (!categoriaTouched) return null;
    if (!form.categoriaId) return "Debes seleccionar una categoría.";
    return null;
  })();

  const hasErrors = nombreError || categoriaError;

  // 🔵 Cargar categorías
  useEffect(() => {
    const cats = getCategories();
    setCategories(cats);
  }, []);

  // ─── SUBMIT ─────────────────────────────
  const handleSubmit = () => {
    setNombreTouched(true);
    setCategoriaTouched(true);

    const nombreErr = !form.nombre.trim()
      ? "El nombre es obligatorio"
      : /^\d/.test(form.nombre.trim())
      ? "El nombre no puede iniciar con un número"
      : form.nombre.trim().length < 3
      ? "Debe tener al menos 3 caracteres"
      : null;

    const categoriaErr = !form.categoriaId ? "Debes seleccionar una categoría" : null;

    if (nombreErr || categoriaErr) {
      showWarning("Campos incompletos", "Por favor completa todos los campos correctamente.");
      return;
    }

    createSubcategory(form);

    showSuccess("Subcategoría creada", "La subcategoría fue creada correctamente.");
    onClose();
  };

  const handleCancel = () => onClose();

  const inputClass = (error) =>
    `w-full px-4 py-2.5 text-sm border rounded-xl outline-none bg-gray-100 text-gray-700 transition ${
      error
        ? "border-red-400 focus:ring-2 focus:ring-red-300"
        : "border-gray-300 focus:ring-2 focus:ring-[#0E5679]/20"
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
          <h2 className="text-white font-semibold text-lg">Crear Subcategoría</h2>
          <button onClick={handleCancel} className="text-white hover:bg-white/20 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 flex flex-col gap-5">
          {/* NOMBRE */}
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => {
                  setForm({ ...form, nombre: e.target.value });
                  setNombreTouched(true);
                }}
                onBlur={() => setNombreTouched(true)}
                placeholder="Nombre de la subcategoría"
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

          {/* DESCRIPCIÓN */}
          <div>
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              rows="3"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción de la subcategoría"
              className="w-full px-4 py-2.5 text-sm border rounded-xl bg-gray-100 resize-none"
            />
          </div>

          {/* CATEGORÍA */}
          <div>
            <label className="text-sm font-medium text-gray-700">Categoría</label>
            <div className="relative mt-1">
              <select
                value={form.categoriaId}
                onChange={(e) => {
                  setForm({ ...form, categoriaId: e.target.value });
                  setCategoriaTouched(true);
                }}
                onBlur={() => setCategoriaTouched(true)}
                className={inputClass(categoriaError)}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {categoriaTouched && categoriaError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                categoriaError ? "max-h-10 mt-1 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {categoriaError}
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
        <div className="px-6 pb-6 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={hasErrors}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl transition ${
              hasErrors ? "bg-gray-400 cursor-not-allowed" : "bg-[#004D77] hover:bg-[#003a5c]"
            }`}
          >
            Crear
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-xl transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormSubCategory;