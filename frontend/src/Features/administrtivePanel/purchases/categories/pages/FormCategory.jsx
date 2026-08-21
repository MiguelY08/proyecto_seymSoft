// features/categories/pages/FormCategory.jsx
import React, { useState } from "react";
import { AlertCircle, Plus, Trash2, ChevronRight, ChevronLeft, Tag, Layers, FolderPlus } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import ActiveToggle from "../components/ActiveToggle";
import { useOutsideCloseWarning } from "../../../../shared/hooks/useOutsideCloseWarning";
import PurchaseModalHeader from "../../../../shared/PurchaseModalHeader";

const normalizeName = (str = "") =>
  str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function StepIndicator({ currentStep }) {
  const steps = [
    { label: "Categoría", icon: Tag },
    { label: "Subcategorías", icon: Layers },
  ];

  return (
    <div className="flex items-center justify-center gap-2 px-6 py-3 bg-[#004D77]/5 border-b border-[#004D77]/10">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isDone = currentStep > stepNumber;
        const Icon = step.icon;

        return (
          <React.Fragment key={stepNumber}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-[#004D77] text-white"
                    : isDone
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isDone ? "✓" : stepNumber}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isActive ? "text-[#004D77]" : isDone ? "text-green-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-px transition-colors duration-300 ${
                  currentStep > stepNumber ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FormCategory({ allCategories = [], onClose, onSave }) {
  const { handleOutsideClick } = useOutsideCloseWarning(onClose);
  const { showWarning } = useAlert();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nombre: "",
    activo: true,
  });
  const [nombreTouched, setNombreTouched] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [subForm, setSubForm] = useState({ nombre: "", descripcion: "", activo: true });
  const [subNombreTouched, setSubNombreTouched] = useState(false);

  const nombreError = (() => {
    if (!nombreTouched) return null;
    if (!form.nombre.trim()) return "El nombre es obligatorio";
    if (/^\d/.test(form.nombre.trim())) return "El nombre no puede iniciar con un número";
    if (form.nombre.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
    const existe = allCategories.some(
      (c) => normalizeName(c.nombre) === normalizeName(form.nombre)
    );
    if (existe) return "Ya existe una categoría con ese nombre";
    return null;
  })();

  const subNombreError = (() => {
    if (!subNombreTouched) return null;
    if (!subForm.nombre.trim()) return "El nombre es obligatorio";
    if (/^\d/.test(subForm.nombre.trim())) return "No puede iniciar con un número";
    if (subForm.nombre.trim().length < 3) return "Mínimo 3 caracteres";
    return null;
  })();

  const inputClass = (error) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg outline-none bg-gray-100 text-gray-700 transition ${
      error
        ? "border-red-400 focus:ring-2 focus:ring-red-300"
        : "border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
    }`;

  const handleNextStep = () => {
    setNombreTouched(true);
    if (nombreError || !form.nombre.trim()) {
      showWarning("Error en el formulario", "Corrige los errores antes de continuar.");
      return;
    }
    setStep(2);
  };

  const handleAddSubcategory = () => {
    setSubNombreTouched(true);

    const err =
      !subForm.nombre.trim()
        ? "El nombre es obligatorio"
        : /^\d/.test(subForm.nombre.trim())
        ? "No puede iniciar con un número"
        : subForm.nombre.trim().length < 3
        ? "Mínimo 3 caracteres"
        : null;

    if (err) return;

    const duplicate = subcategories.some(
      (s) => normalizeName(s.nombre) === normalizeName(subForm.nombre)
    );
    if (duplicate) {
      showWarning("Nombre duplicado", "Ya agregaste una subcategoría con ese nombre.");
      return;
    }

    setSubcategories([
      ...subcategories,
      { id: Date.now(), nombre: subForm.nombre.trim(), descripcion: subForm.descripcion, activo: subForm.activo },
    ]);
    setSubForm({ nombre: "", descripcion: "", activo: true });
    setSubNombreTouched(false);
  };

  const handleRemoveSubcategory = (id) =>
    setSubcategories(subcategories.filter((s) => s.id !== id));

  const handleSubmit = () => {
    const categoryData = {
      nombre: form.nombre.trim(),
      activo: form.activo,
      subcategoriasIniciales: subcategories,
    };
    // No llamar onClose aquí: handleSave en CategoriesPage lo controla
    // después de confirmar y crear exitosamente
    onSave(categoryData, false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <PurchaseModalHeader
          icon={FolderPlus}
          eyebrow="Gestión de categorías"
          title="Crear categoría"
          onClose={onClose}
          closeLabel="Cerrar formulario de categoría"
        />

        <StepIndicator currentStep={step} />

        {step === 1 && (
          <div className="px-6 py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setNombreTouched(true); }}
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
              {nombreTouched && nombreError && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {nombreError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <ActiveToggle activo={form.activo} onChange={(nuevo) => setForm({ ...form, activo: nuevo })} />
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <button
                onClick={handleNextStep}
                className="w-full py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#004D77]/8 border border-[#004D77]/20 rounded-lg">
              <Tag className="w-4 h-4 text-[#004D77] shrink-0" />
              <span className="text-sm text-[#004D77] font-medium truncate">{form.nombre}</span>
              <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${form.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {form.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nueva subcategoría</p>

              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={subForm.nombre}
                    onChange={(e) => { setSubForm({ ...subForm, nombre: e.target.value }); setSubNombreTouched(true); }}
                    onBlur={() => setSubNombreTouched(true)}
                    placeholder="Nombre de la subcategoría"
                    className={inputClass(subNombreError)}
                  />
                  {subNombreTouched && subNombreError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle size={16} className="text-red-400" />
                    </div>
                  )}
                </div>
                {subNombreTouched && subNombreError && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={11} /> {subNombreError}
                  </p>
                )}
              </div>

              <textarea
                rows="2"
                value={subForm.descripcion}
                onChange={(e) => setSubForm({ ...subForm, descripcion: e.target.value })}
                placeholder="Descripción (opcional)"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 resize-none outline-none focus:ring-2 focus:ring-[#004D77]/20"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Estado</span>
                  <ActiveToggle activo={subForm.activo} onChange={(nuevo) => setSubForm({ ...subForm, activo: nuevo })} />
                </div>
                <button
                  onClick={handleAddSubcategory}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004D77] hover:bg-[#003a5c] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
            </div>

            {subcategories.length > 0 && (
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-0.5">
                {subcategories.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{sub.nombre}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sub.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {sub.activo ? "A" : "I"}
                    </span>
                    <button onClick={() => handleRemoveSubcategory(sub.id)} className="text-gray-400 hover:text-red-500 transition-colors ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {subcategories.length === 0 && (
              <p className="text-xs text-center text-gray-400 italic py-1">
                Sin subcategorías — puedes agregarlas ahora o después.
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1 px-4 py-2.5 text-sm font-medium text-[#004D77] border border-[#004D77]/30 hover:bg-[#004D77]/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors"
              >
                Crear {subcategories.length > 0 ? `(${subcategories.length} sub)` : ""}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormCategory;
