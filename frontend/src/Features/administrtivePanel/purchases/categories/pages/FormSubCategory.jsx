import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";

import { getCategories, createSubcategory } from "../services/categoriesService";


// Toggle
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
    activo: true
  });

  const [error, setError] = useState("");



  // 🔵 Cargar categorías desde el service
  useEffect(() => {

    const cats = getCategories();

    setCategories(cats);

  }, []);



  // 🔵 Validación
  useEffect(() => {

    if (!form.nombre.trim()) {
      setError("El nombre de la subcategoría es obligatorio");
    } 
    else if (!form.categoriaId) {
      setError("Debes seleccionar una categoría");
    } 
    else {
      setError("");
    }

  }, [form]);



  const handleSubmit = () => {

    if (error) {
      showWarning("Formulario incompleto", error);
      return;
    }

    createSubcategory(form);

    showSuccess(
      "Subcategoría creada",
      "La subcategoría fue creada correctamente"
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

        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77]">
          <h2 className="text-white font-semibold text-lg">
            Crear Subcategoría
          </h2>

          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        <div className="px-6 py-6 flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nombre
            </label>

            <input
              type="text"
              value={form.nombre}
              onChange={(e) =>
                setForm({ ...form, nombre: e.target.value })
              }
              placeholder="Nombre de la subcategoría"
              className="w-full px-4 py-2.5 text-sm border rounded-lg bg-gray-100"
            />
          </div>


          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Descripción
            </label>

            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
              placeholder="Descripción de la subcategoría"
              className="w-full px-4 py-2.5 text-sm border rounded-lg bg-gray-100 resize-none"
            />
          </div>


          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Categoría
            </label>

            <select
              value={form.categoriaId}
              onChange={(e) =>
                setForm({ ...form, categoriaId: e.target.value })
              }
              className="w-full px-4 py-2.5 text-sm border rounded-lg bg-gray-100"
            >
              <option value="">Seleccionar categoría</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}

            </select>
          </div>


          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Estado
            </label>

            <ActiveToggle
              activo={form.activo}
              onChange={() =>
                setForm({ ...form, activo: !form.activo })
              }
            />
          </div>


          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

        </div>


        <div className="px-6 pb-6 flex flex-col gap-3">

          <button
            onClick={handleSubmit}
            disabled={!!error}
            className={`w-full py-2.5 text-sm font-medium text-white rounded-lg ${
              error
                ? "bg-gray-400"
                : "bg-[#004D77] hover:bg-[#003a5c]"
            }`}
          >
            Crear
          </button>


          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg"
          >
            Cancelar
          </button>

        </div>

      </div>
    </div>
  );
}

export default FormSubCategory;