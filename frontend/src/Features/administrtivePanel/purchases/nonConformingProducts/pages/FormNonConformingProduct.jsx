import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";

const STORAGE_KEY = "pm_non_conforming_products";

function FormNonConformingProduct({ onClose }) {
  const { showWarning, showSuccess } = useAlert();

  const [form, setForm] = useState({
    codigo: "",
    cantidad: "",
    motivo: "",
  });

  const [errors, setErrors] = useState({});

  // 🔹 Validación en tiempo real
  useEffect(() => {
    const newErrors = {};

    if (!form.codigo.trim()) {
      newErrors.codigo = "El código de barras es obligatorio.";
    }

    if (!form.cantidad || Number(form.cantidad) <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0.";
    }

    if (!form.motivo.trim()) {
      newErrors.motivo = "El motivo del reporte es obligatorio.";
    }

    setErrors(newErrors);
  }, [form]);

  const handleSubmit = () => {
    if (Object.keys(errors).length > 0) {
      showWarning(
        "Campos incompletos",
        "Por favor completa correctamente el formulario."
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

    onClose(); // 🔹 Cierra el modal después de guardar
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0E5679]">
          <h2 className="text-white font-semibold text-xl">
            Reporte de Producto No Conforme
          </h2>

          <button
            onClick={handleCancel}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">

          {/* Código de barras */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Código de Barras
            </label>

            <input
              type="text"
              value={form.codigo}
              onChange={(e) =>
                setForm({ ...form, codigo: e.target.value })
              }
              placeholder="Código"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none bg-gray-100 text-gray-700 transition ${
                errors.codigo
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-[#0E5679] focus:ring-2 focus:ring-[#0E5679]/20"
              }`}
            />

            {errors.codigo && (
              <p className="text-sm text-red-600">{errors.codigo}</p>
            )}
          </div>

          {/* Cantidad Afectada */}
          <div className="flex flex-col gap-1.5 w-1/2">
            <label className="text-sm font-medium text-gray-700">
              Cantidad Afectada
            </label>

            <input
              type="number"
              min="1"
              value={form.cantidad}
              onChange={(e) =>
                setForm({ ...form, cantidad: e.target.value })
              }
              placeholder="Ingresa la cantidad"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none bg-gray-100 text-gray-700 transition ${
                errors.cantidad
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-[#0E5679] focus:ring-2 focus:ring-[#0E5679]/20"
              }`}
            />

            {errors.cantidad && (
              <p className="text-sm text-red-600">{errors.cantidad}</p>
            )}
          </div>

          {/* Motivo Reporte */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Motivo Reporte
            </label>

            <textarea
              rows="4"
              value={form.motivo}
              onChange={(e) =>
                setForm({ ...form, motivo: e.target.value })
              }
              placeholder="Ingrese el motivo del reporte"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none bg-gray-100 text-gray-700 resize-none transition ${
                errors.motivo
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-[#0E5679] focus:ring-2 focus:ring-[#0E5679]/20"
              }`}
            />

            {errors.motivo && (
              <p className="text-sm text-red-600">{errors.motivo}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(errors).length > 0}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl transition ${
              Object.keys(errors).length > 0
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