import React, { useState } from "react";
import { X, AlertCircle, Plus, Trash2, ChevronRight, ChevronLeft, Tag, Layers } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";

// ─── Toggle Activo/Inactivo ───────────────────────────────────────────────────
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

// ─── Indicador de pasos ────────────────────────────────────────────────────────
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

// ─── Normaliza texto: minúsculas + sin tildes/diacríticos ────────────────────
const normalizeName = (str = "") =>
  str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// ─── Formulario principal ─────────────────────────────────────────────────────
function FormCategory({ category, allCategories = [], onClose, onSave }) {
  const isEditing = !!category;
  const { showWarning } = useAlert();

  const [step, setStep] = useState(1);

  // — Step 1: datos de categoría
  const [form, setForm] = useState({
    nombre: category?.nombre ?? "",
    activo: category?.estado === "Activo" || category?.activo === true,
  });
  const [nombreTouched, setNombreTouched] = useState(false);

  // — Step 2: subcategorías a crear junto con la categoría
  const [subcategories, setSubcategories] = useState([]);
  const [subForm, setSubForm] = useState({ nombre: "", descripcion: "", activo: true });
  const [subNombreTouched, setSubNombreTouched] = useState(false);

  // ─── Validaciones Step 1 ──────────────────────────────────────────────────
  const nombreError = (() => {
    if (!nombreTouched) return null;
    if (!form.nombre.trim()) return "El nombre es obligatorio";
    if (/^\d/.test(form.nombre.trim())) return "El nombre no puede iniciar con un número";
    if (form.nombre.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
    const existe = allCategories.some(
      (c) =>
        (!category || c.id !== category.id) &&
        normalizeName(c.nombre) === normalizeName(form.nombre)
    );
    if (existe) return "Ya existe una categoría con ese nombre";
    return null;
  })();

  // ─── Validaciones Step 2 (subcategoría en construcción) ──────────────────
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

  // ─── Step 1 → Step 2 ─────────────────────────────────────────────────────
  const handleNextStep = () => {
    setNombreTouched(true);
    if (nombreError || !form.nombre.trim()) {
      showWarning("Error en el formulario", "Corrige los errores antes de continuar.");
      return;
    }
    setStep(2);
  };

  // ─── Agregar subcategoría a la lista temporal ─────────────────────────────
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

  // ─── Guardar todo ─────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const categoryData = {
      ...category,
      nombre: form.nombre.trim(),
      activo: form.activo,
      estado: form.activo ? "Activo" : "Inactivo",
      subcategoriasIniciales: subcategories,
    };
    onSave(categoryData, isEditing);
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
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77]">
          <h2 className="text-white font-semibold text-lg">
            {isEditing ? "Editar Categoría" : "Crear Categoría"}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP INDICATOR */}
        <StepIndicator currentStep={step} />

        {/* ── STEP 1: CATEGORÍA ── */}
        {step === 1 && (
          <div className="px-6 py-6 flex flex-col gap-5">
            {/* Nombre */}
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
              <div className={`overflow-hidden transition-all duration-300 ${nombreError ? "max-h-10 mt-1 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {nombreError}
                </p>
              </div>
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <ActiveToggle activo={form.activo} onChange={() => setForm({ ...form, activo: !form.activo })} />
            </div>

            {/* Botones */}
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

        {/* ── STEP 2: SUBCATEGORÍAS ── */}
        {step === 2 && (
          <div className="px-6 py-5 flex flex-col gap-4">

            {/* Resumen categoría */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#004D77]/8 border border-[#004D77]/20 rounded-lg">
              <Tag className="w-4 h-4 text-[#004D77] shrink-0" />
              <span className="text-sm text-[#004D77] font-medium truncate">{form.nombre}</span>
              <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${form.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {form.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* Mini-formulario nueva subcategoría */}
            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nueva subcategoría</p>

              {/* Nombre sub */}
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
                <div className={`overflow-hidden transition-all duration-300 ${subNombreError ? "max-h-8 mt-1 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {subNombreError}
                  </p>
                </div>
              </div>

              {/* Descripción sub */}
              <textarea
                rows="2"
                value={subForm.descripcion}
                onChange={(e) => setSubForm({ ...subForm, descripcion: e.target.value })}
                placeholder="Descripción (opcional)"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 resize-none outline-none focus:ring-2 focus:ring-[#004D77]/20"
              />

              {/* Estado + botón agregar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Estado</span>
                  <ActiveToggle activo={subForm.activo} onChange={() => setSubForm({ ...subForm, activo: !subForm.activo })} />
                </div>
                <button
                  onClick={handleAddSubcategory}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004D77] hover:bg-[#003a5c] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
            </div>

            {/* Lista de subcategorías agregadas */}
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

            {/* Botones */}
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
                {isEditing ? "Guardar cambios" : `Crear${subcategories.length > 0 ? ` (${subcategories.length} sub)` : ""}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormCategory;