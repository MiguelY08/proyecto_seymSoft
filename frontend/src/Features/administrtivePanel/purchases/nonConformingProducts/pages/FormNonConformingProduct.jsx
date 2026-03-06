import { X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";

const STORAGE_KEY = "pm_non_conforming_products";

function FormNonConformingProduct({ onClose }) {
  const { showWarning, showSuccess } = useAlert();

  const [form, setForm] = useState({
    codigo: "",
    cantidad: "",
    motivo: "",
  });

  // 🔹 touched (igual que en CreateSidebar)
  const [codigoTouched, setCodigoTouched] = useState(false);
  const [cantidadTouched, setCantidadTouched] = useState(false);
  const [motivoTouched, setMotivoTouched] = useState(false);

  // ─── VALIDACIONES ─────────────────────────────

  const codigoError = (() => {
    if (!codigoTouched) return null;
    if (!form.codigo.trim()) return "El código de barras es obligatorio.";
    if (!/^[0-9]{6,20}$/.test(form.codigo.trim()))
      return "Debe contener solo números (6-20 dígitos).";
    return null;
  })();

  const cantidadError = (() => {
    if (!cantidadTouched) return null;
    if (!form.cantidad) return "La cantidad es obligatoria.";
    if (Number(form.cantidad) <= 0) return "La cantidad debe ser mayor a 0.";
    if (Number(form.cantidad) > 10000) return "Cantidad demasiado grande.";
    return null;
  })();

  const motivoError = (() => {
    if (!motivoTouched) return null;
    if (!form.motivo.trim()) return "El motivo del reporte es obligatorio.";
    if (form.motivo.trim().length < 5)
      return "Debe tener al menos 5 caracteres.";
    return null;
  })();

  const hasErrors = codigoError || cantidadError || motivoError;

  // ─── SUBMIT ─────────────────────────────

  const handleSubmit = () => {
  // fuerza mostrar errores
  setCodigoTouched(true);
  setCantidadTouched(true);
  setMotivoTouched(true);

  if (
    !form.codigo.trim() ||
    !form.cantidad ||
    !form.motivo.trim() ||
    codigoError ||
    cantidadError ||
    motivoError
  ) {
    showWarning(
      "Campos incompletos",
      "Debes completar todos los campos correctamente."
    );
    return;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const reports = stored ? JSON.parse(stored) : [];

  const newId =
    reports.length > 0
      ? Math.max(...reports.map((r) => r.id)) + 1
      : 1;

  const newReport = {
    id: newId,
    codigo: form.codigo.trim(),
    cantidad: Number(form.cantidad),
    motivo: form.motivo.trim(),
    fecha: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...reports, newReport])
  );

  showSuccess(
    "Reporte guardado",
    "El producto no conforme fue registrado correctamente."
  );

  onClose();
};

  const handleCancel = () => {
    onClose();
  };

  // ─── ESTILO INPUT ─────────────────────────────

  const inputClass = (error) =>
    `w-full px-4 py-2.5 text-sm border rounded-xl outline-none bg-gray-100 text-gray-700 transition
    ${
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0E5679]">
          <h2 className="text-white font-semibold text-xl">
            Reporte de Producto No Conforme
          </h2>

          <button
            onClick={handleCancel}
            className="text-white hover:bg-white/20 rounded-full p-1 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 flex flex-col gap-5">

          {/* CODIGO */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Código de Barras
            </label>

            <div className="relative mt-1">
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => {
                  setForm({ ...form, codigo: e.target.value });
                  setCodigoTouched(true);
                }}
                onBlur={() => setCodigoTouched(true)}
                placeholder="Código"
                className={inputClass(codigoError)}
              />

              {codigoTouched && codigoError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                codigoError ? "max-h-10 mt-1 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {codigoError}
              </p>
            </div>
          </div>

          {/* CANTIDAD */}
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">
              Cantidad Afectada
            </label>

            <div className="relative mt-1">
              <input
                type="number"
                min="1"
                value={form.cantidad}
                onChange={(e) => {
                  setForm({ ...form, cantidad: e.target.value });
                  setCantidadTouched(true);
                }}
                onBlur={() => setCantidadTouched(true)}
                placeholder="Cantidad"
                className={inputClass(cantidadError)}
              />

              {cantidadTouched && cantidadError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                cantidadError ? "max-h-10 mt-1 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {cantidadError}
              </p>
            </div>
          </div>

          {/* MOTIVO */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Motivo Reporte
            </label>

            <textarea
              rows="4"
              value={form.motivo}
              onChange={(e) => {
                setForm({ ...form, motivo: e.target.value });
                setMotivoTouched(true);
              }}
              onBlur={() => setMotivoTouched(true)}
              placeholder="Ingrese el motivo del reporte"
              className={inputClass(motivoError)}
            />

            <div
              className={`overflow-hidden transition-all duration-300 ${
                motivoError ? "max-h-10 mt-1 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {motivoError}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 pb-6 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={hasErrors}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl transition ${
              hasErrors
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0E5679] hover:bg-[#0a435c]"
            }`}
          >
            Guardar
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

export default FormNonConformingProduct;