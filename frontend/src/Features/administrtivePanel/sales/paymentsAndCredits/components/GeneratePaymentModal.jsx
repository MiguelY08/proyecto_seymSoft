import { useState, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";

export default function GeneratePaymentModal({
  cliente,
  factura,
  onClose,
  onSave,
}) {
  const { showError, showWarning, showConfirm } = useAlert();

  const capitalPendiente = factura?.saldo ?? 0;

  const interesPendiente = factura?.interes ?? 0;

  const deudaTotal = factura?.deudaTotal ?? 0;

  const [monto, setMonto] = useState("");

  const [idPaymentMethod, setIdPaymentMethod] = useState(2);

  const [observacion, setObservacion] = useState("");

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLockRef = useRef(false);

  const formatNumber = (value) => {
    if (!value) return "";

    return new Intl.NumberFormat("es-CO").format(value);
  };

  const parseNumber = (value) => Number(String(value).replace(/\./g, ""));

  const nuevaDeuda = useMemo(() => {
    const numericMonto = parseNumber(monto);

    if (!numericMonto || numericMonto <= 0) {
      return deudaTotal;
    }

    if (numericMonto > deudaTotal) {
      return deudaTotal;
    }

    return deudaTotal - numericMonto;
  }, [monto, deudaTotal]);

  const validate = () => {
    const newErrors = {};

    const numericMonto = parseNumber(monto);

    const trimmedObs = observacion.trim();

    if (!monto) {
      newErrors.monto = "Ingrese un monto";
    } else if (numericMonto <= 0) {
      newErrors.monto = "Debe ser mayor a 0";
    } else if (numericMonto > deudaTotal) {
      newErrors.monto = "El monto no puede ser mayor a la deuda";
    }

    if (!trimmedObs) {
      newErrors.observacion = "La observación es obligatoria";
    } else if (trimmedObs.length < 10) {
      newErrors.observacion = "Debe contener mínimo 10 caracteres";
    } else if (/^[0-9]/.test(trimmedObs)) {
      newErrors.observacion = "No puede iniciar con números";
    } else if (trimmedObs.length > 255) {
      newErrors.observacion = "Máximo 255 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (
      isSubmitting ||
      submitLockRef.current
    ) return;

    submitLockRef.current = true;

    if (!validate()) {
      await showWarning(
        "Formulario incompleto",
        "Revisa los campos marcados en rojo.",
      );

      submitLockRef.current = false;

      return;
    }

    const confirm = await showConfirm(
      "question",
      "¿Registrar abono?",
      `Se abonará ${formatNumber(
        parseNumber(monto),
      )} a la factura ${factura?.nroFactura}.`,
      {
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Revisar",
      },
    );

    if (!confirm.isConfirmed) {
      submitLockRef.current = false;

      return;
    }

    try {
      setIsSubmitting(true);

      await onSave({
        monto: parseNumber(monto),

        idPaymentMethod,

        observacion: observacion.trim(),
      });

      onClose();
    } catch (error) {
      showError(
        "Error al guardar",
        error.message || "Ocurrió un problema al registrar el abono.",
      );
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 font-lexend p-2 sm:p-4">
      <div className="bg-white w-full max-w-md max-h-[94vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="bg-[#004D77] text-white px-4 sm:px-5 py-3 flex justify-between items-center gap-3">
          <h3 className="font-semibold text-base sm:text-lg">Registrar Abono</h3>

          <X
            size={18}
            className={isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            onClick={isSubmitting ? undefined : onClose}
          />
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1 border border-gray-200">
            <p className="font-semibold text-gray-800 break-words">{cliente?.nombre}</p>

            <p className="text-gray-500">
              Factura:
              <span className="font-medium text-gray-700 ml-1">
                {factura?.nroFactura}
              </span>
            </p>

            <p className="text-gray-500">
              Capital pendiente:
              <span className="font-semibold text-gray-700 ml-1">
                ${formatNumber(capitalPendiente)}
              </span>
            </p>

            <p className="text-gray-500">
              Interés pendiente:
              <span className="font-semibold text-amber-600 ml-1">
                ${formatNumber(interesPendiente)}
              </span>
            </p>

            <p className="text-gray-500">
              Total a pagar:
              <span className="font-semibold text-red-600 ml-1">
                ${formatNumber(deudaTotal)}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-gray-500">Monto de Abono</label>

              <input
                type="text"
                value={monto}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");

                  setMonto(formatNumber(rawValue));

                  const numeric = Number(rawValue);

                  if (!rawValue) {
                    setErrors((prev) => ({
                      ...prev,
                      monto: "Ingrese un monto",
                    }));
                  } else if (numeric > deudaTotal) {
                    setErrors((prev) => ({
                      ...prev,
                      monto: "El monto no puede ser mayor a la deuda",
                    }));
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      monto: undefined,
                    }));
                  }
                }}
                placeholder="0"
                className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none ${
                  errors.monto
                    ? "border-red-500 ring-2 ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"
                }`}
              />

              {errors.monto && (
                <p className="text-xs text-red-500 mt-1">{errors.monto}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Medio de Pago</label>

            <select
              value={idPaymentMethod}
              onChange={(e) => setIdPaymentMethod(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004D77]"
            >
              <option value={2}>Efectivo</option>

              <option value={1}>Transferencia</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Observación</label>

            <textarea
              rows={3}
              value={observacion}
              onChange={(e) => {
                const value = e.target.value;

                if (/^[0-9]/.test(value) && value.length > 0) return;

                setObservacion(value);

                const trimmed = value.trim();

                if (!trimmed) {
                  setErrors((prev) => ({
                    ...prev,
                    observacion: "La observación es obligatoria",
                  }));
                } else if (trimmed.length < 10) {
                  setErrors((prev) => ({
                    ...prev,
                    observacion: "Debe contener mínimo 10 caracteres",
                  }));
                } else if (/^[0-9]/.test(trimmed)) {
                  setErrors((prev) => ({
                    ...prev,
                    observacion: "No puede iniciar con números",
                  }));
                } else if (trimmed.length > 255) {
                  setErrors((prev) => ({
                    ...prev,
                    observacion: "Máximo 255 caracteres",
                  }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    observacion: undefined,
                  }));
                }
              }}
              placeholder="Descripción del abono..."
              className={`w-full px-3 py-2 rounded-lg border resize-none transition focus:outline-none ${
                errors.observacion
                  ? "border-red-500 ring-2 ring-red-300"
                  : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"
              }`}
            />

            {errors.observacion && (
              <p className="text-xs text-red-500 mt-1">{errors.observacion}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500">
              Deuda después del abono
            </label>

            <input
              type="text"
              disabled
              value={`$ ${formatNumber(nuevaDeuda)}`}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 font-medium"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-white transition bg-[#004D77] hover:bg-[#003D5e] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : "Guardar Abono"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
