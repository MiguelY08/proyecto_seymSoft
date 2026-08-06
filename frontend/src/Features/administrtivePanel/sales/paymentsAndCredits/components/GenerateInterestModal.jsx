import { useState, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";

export default function GenerateInterestModal({
  cliente,
  factura,
  onClose,
  onApply,
}) {
  const { showWarning, showConfirm } = useAlert();
  const [percentage, setPercentage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const percentageNumber = useMemo(() => {
    const value = Number(percentage);
    return Number.isFinite(value) ? value : 0;
  }, [percentage]);

  const isValidPercentage =
    Number.isInteger(percentageNumber) &&
    percentageNumber >= 1 &&
    percentageNumber <= 99;

  const percentageErrorMessage =
    "El porcentaje de interés debe estar entre 1% y 99%.";

  const normalizePercentageInput = (value) => {
    const nextValue = String(value ?? "");
    if (nextValue === "") return "";
    if (!/^\d+$/.test(nextValue)) return percentage;

    const nextNumber = Number(nextValue);
    if (!Number.isInteger(nextNumber) || nextNumber < 1 || nextNumber > 99) {
      return percentage;
    }

    return String(nextNumber);
  };

  const handlePercentageChange = (e) => {
    const nextValue = normalizePercentageInput(e.target.value);
    setPercentage(nextValue);
    setError(nextValue === "" ? percentageErrorMessage : "");
  };

  const handlePercentageBeforeInput = (e) => {
    if (!e.data || /^\d+$/.test(e.data)) return;
    e.preventDefault();
    setError("Solo se permiten números entre 1 y 99.");
  };

  const handlePercentageKeyDown = (e) => {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];

    if (allowedControlKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setError("Solo se permiten números entre 1 y 99.");
      return;
    }

    const { value, selectionStart, selectionEnd } = e.currentTarget;
    const start = selectionStart ?? value.length;
    const end = selectionEnd ?? value.length;
    const nextValue = value.slice(0, start) + e.key + value.slice(end);
    const nextNumber = Number(nextValue);

    if (!Number.isInteger(nextNumber) || nextNumber < 1 || nextNumber > 99) {
      e.preventDefault();
      setError(percentageErrorMessage);
    }
  };

  const handlePercentagePaste = (e) => {
    e.preventDefault();
    const pastedValue = e.clipboardData.getData("text").trim();

    if (!/^\d+$/.test(pastedValue)) {
      setError("Solo se permiten números entre 1 y 99.");
      return;
    }

    const nextValue = normalizePercentageInput(pastedValue);
    if (nextValue === percentage && pastedValue !== percentage) {
      setError(percentageErrorMessage);
      return;
    }

    setPercentage(nextValue);
    setError(nextValue === "" ? percentageErrorMessage : "");
  };

  const interestGenerated = useMemo(() => {
    const balance = Number(factura?.remainingBalance ?? 0);
    if (percentageNumber <= 0) return 0;
    return Math.round((balance * percentageNumber) / 100);
  }, [factura?.remainingBalance, percentageNumber]);

  const totalDebt = useMemo(
    () => Number(factura?.remainingBalance ?? 0) + interestGenerated,
    [factura?.remainingBalance, interestGenerated],
  );

  const formatCOP = (value) => new Intl.NumberFormat("es-CO").format(value);

  const handleSubmit = async () => {
    if (isSubmitting || submitLockRef.current) return;

    submitLockRef.current = true;

    if (!isValidPercentage) {
      setError(percentageErrorMessage);
      await showWarning("Porcentaje inválido", percentageErrorMessage);
      submitLockRef.current = false;
      return;
    }

    setError("");

    const confirm = await showConfirm(
      "question",
      "Aplicar interés?",
      `Se generarÃ¡ un interes de $${formatCOP(
        interestGenerated,
      )} para el crédito #${factura?.idCredit}.`,
      {
        confirmButtonText: "SÃ­, aplicar",
        cancelButtonText: "Revisar",
      },
    );

    if (!confirm.isConfirmed) {
      submitLockRef.current = false;

      return;
    }

    if (onApply) {
      setIsSubmitting(true);
      try {
        await onApply({ percentage: percentageNumber });
      } finally {
        setIsSubmitting(false);
        submitLockRef.current = false;
      }
    } else {
      submitLockRef.current = false;
    }
  };

  if (!factura) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white w-full max-w-160 max-h-[95vh] rounded-2xl shadow-xl font-lexend overflow-hidden flex flex-col">
        <div className="bg-[#004D77] text-white px-4 sm:px-5 py-3 sm:py-4 rounded-t-2xl flex justify-between items-center gap-3">
          <h2 className="text-base sm:text-lg font-semibold">
            Aplicar interés
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-4 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto">
          <div className="bg-gray-100 p-3 sm:p-4 rounded-xl text-sm space-y-2">
            <p>
              <strong>Crédito:</strong> #{factura.idCredit}
            </p>

            <p>
              <strong>Cliente:</strong>{" "}
              {cliente?.fullName ?? cliente?.nombre ?? "-"}
            </p>

            <p>
              <strong>Saldo pendiente:</strong> $
              {formatCOP(factura.remainingBalance ?? 0)}
            </p>

            <p>
              <strong>Mora:</strong> {factura.overdueDays ?? 0} días
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Porcentaje de interés</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={percentage}
                onChange={handlePercentageChange}
                onBeforeInput={handlePercentageBeforeInput}
                onKeyDown={handlePercentageKeyDown}
                onWheel={(e) => e.currentTarget.blur()}
                onPaste={handlePercentagePaste}
                placeholder="Ej. 5"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                className={`w-full p-3 rounded-lg border outline-none transition ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 text-sm space-y-2">
            <p className="font-medium">Resumen de interés</p>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-3">
              <span className="text-gray-600">Saldo pendiente</span>
              <span className="font-medium">
                ${formatCOP(factura.remainingBalance ?? 0)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-3">
              <span className="text-gray-600">Interés generado</span>
              <span className="font-medium text-green-600">
                ${formatCOP(interestGenerated)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-3">
              <span className="text-gray-600">Nueva deuda total</span>
              <span className="font-semibold">${formatCOP(totalDebt)}</span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1 mt-auto">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white py-2 rounded-xl cursor-pointer hover:bg-gray-500 transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isValidPercentage}
              className="flex-1 text-white py-2 rounded-xl cursor-pointer bg-[#004D77] hover:bg-[#003D5e] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Aplicando..." : "Aplicar interés"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
