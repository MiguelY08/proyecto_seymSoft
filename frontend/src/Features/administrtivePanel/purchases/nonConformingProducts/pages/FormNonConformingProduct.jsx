import { X, AlertCircle } from "lucide-react"; // Importa íconos para la UI
import { useState } from "react"; // Hook useState de React para manejo de estado
import { useAlert } from "../../../../shared/alerts/useAlert"; // Hook personalizado para mostrar alertas

// Clave de almacenamiento local para guardar los reportes
const STORAGE_KEY = "pm_non_conforming_products";

// Componente principal del formulario de producto no conforme
function FormNonConformingProduct({ onClose }) {
  // Hook de alertas
  const { showWarning, showSuccess } = useAlert();

  // Estado del formulario
  const [form, setForm] = useState({
    codigo: "",   // Código de barras del producto
    cantidad: "", // Cantidad afectada
    motivo: "",   // Motivo del reporte
  });

  // ── Estados "touched" para mostrar errores solo cuando el usuario interactúa ──
  const [codigoTouched, setCodigoTouched] = useState(false);
  const [cantidadTouched, setCantidadTouched] = useState(false);
  const [motivoTouched, setMotivoTouched] = useState(false);

  // ── VALIDACIONES ─────────────────────────────

  // Validación del código de barras
  const codigoError = (() => {
    if (!codigoTouched) return null; // No mostrar error si no se tocó el input
    if (!form.codigo.trim()) return "El código de barras es obligatorio.";
    if (!/^[0-9]{6,20}$/.test(form.codigo.trim()))
      return "Debe contener solo números (6-20 dígitos).";
    return null;
  })();

  // Validación de la cantidad afectada
  const cantidadError = (() => {
    if (!cantidadTouched) return null;
    if (!form.cantidad) return "La cantidad es obligatoria.";
    if (Number(form.cantidad) <= 0) return "La cantidad debe ser mayor a 0.";
    if (Number(form.cantidad) > 10000) return "Cantidad demasiado grande.";
    return null;
  })();

  // Validación del motivo del reporte
  const motivoError = (() => {
    if (!motivoTouched) return null;
    if (!form.motivo.trim()) return "El motivo del reporte es obligatorio.";
    if (form.motivo.trim().length < 5)
      return "Debe tener al menos 5 caracteres.";
    return null;
  })();

  // Combinación de errores para deshabilitar el botón Guardar
  const hasErrors = codigoError || cantidadError || motivoError;

  // ── FUNCIONES DEL FORMULARIO ─────────────────────────────

  // Maneja el envío del formulario
  const handleSubmit = () => {
    // Marca todos los campos como "touched" para mostrar errores
    setCodigoTouched(true);
    setCantidadTouched(true);
    setMotivoTouched(true);

    // Validación final antes de guardar
    if (
      !form.codigo.trim() ||
      !form.cantidad ||
      !form.motivo.trim() ||
      codigoError ||
      cantidadError ||
      motivoError
    ) {
      // Mostrar alerta de advertencia si hay errores
      showWarning(
        "Campos incompletos",
        "Debes completar todos los campos correctamente."
      );
      return; // Salir de la función
    }

    // Recupera los reportes guardados en localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    const reports = stored ? JSON.parse(stored) : [];

    // Genera un nuevo ID único
    const newId =
      reports.length > 0
        ? Math.max(...reports.map((r) => r.id)) + 1
        : 1;

    // Crea el nuevo objeto de reporte
    const newReport = {
      id: newId,
      codigo: form.codigo.trim(),
      cantidad: Number(form.cantidad),
      motivo: form.motivo.trim(),
      fecha: new Date().toISOString(), // Fecha actual
    };

    // Guarda el reporte en localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...reports, newReport])
    );

    // Muestra alerta de éxito
    showSuccess(
      "Reporte guardado",
      "El producto no conforme fue registrado correctamente."
    );

    // Cierra el formulario
    onClose();
  };

  // Maneja la cancelación del formulario
  const handleCancel = () => {
    onClose();
  };

  // ── ESTILOS PARA LOS INPUTS ─────────────────────────────
  const inputClass = (error) =>
    `w-full px-4 py-2.5 text-sm border rounded-xl outline-none bg-gray-100 text-gray-700 transition
    ${
      error
        ? "border-red-400 focus:ring-2 focus:ring-red-300"
        : "border-gray-300 focus:ring-2 focus:ring-[#0E5679]/20"
    }`;

  // ── RENDER DEL COMPONENTE ─────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleCancel} // Cierra el modal al hacer click afuera
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // Evita cerrar modal al hacer click dentro
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

              {/* Ícono de error */}
              {codigoTouched && codigoError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>

            {/* Mensaje de error */}
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

              {/* Ícono de error */}
              {cantidadTouched && cantidadError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>

            {/* Mensaje de error */}
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

            {/* Mensaje de error */}
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
            disabled={hasErrors} // Deshabilita el botón si hay errores
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

// Exporta el componente para usarlo en otros archivos
export default FormNonConformingProduct;