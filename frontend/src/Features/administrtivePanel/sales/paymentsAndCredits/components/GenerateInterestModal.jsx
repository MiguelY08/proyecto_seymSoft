import { useState, useMemo, useRef } from "react";
import { CirclePercent, Loader2, X } from "lucide-react";
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
      "¿Aplicar interés?",
      `Se generará un interés de $${formatCOP(
        interestGenerated,
      )} para el crédito #${factura?.idCredit}.`,
      {
        confirmButtonText: "Sí, aplicar",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="flex h-[100dvh] max-h-[100dvh] w-full max-w-160 flex-col overflow-hidden rounded-none bg-white font-lexend shadow-xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl">
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
                <CirclePercent className="h-5 w-5 text-white" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">
                  Aplicar interés
                </h2>
                <p className="mt-0.5 truncate text-sm text-sky-100">
                  {cliente?.fullName ?? cliente?.nombre ?? "Cliente sin nombre"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cerrar aplicación de interés"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 sm:space-y-4 sm:p-5">
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3 [&>p]:flex [&>p]:min-h-20 [&>p]:flex-col [&>p]:justify-center [&>p]:gap-1 [&>p]:rounded-xl [&>p]:border [&>p]:border-slate-200 [&>p]:bg-slate-50 [&>p]:p-3 [&>p]:text-slate-700 [&>p]:shadow-sm">
            <p>
              <strong>Crédito:</strong> #{factura.idCredit}
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

          <section className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Resumen de interés</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200 [-webkit-overflow-scrolling:touch]">
              <table className="min-w-[320px] w-full">
                <thead className="bg-[#004D77]/5">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                      Detalle
                    </th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-[#004D77]">
                      Totales
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-3 py-2 text-xs text-gray-600">
                      Saldo pendiente
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-medium text-gray-700">
                      ${formatCOP(factura.remainingBalance ?? 0)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 py-2 text-xs text-gray-600">
                      Interés generado
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-semibold text-emerald-600">
                      ${formatCOP(interestGenerated)}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800">
                      Total
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-semibold text-gray-800">
                      ${formatCOP(totalDebt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isValidPercentage}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CirclePercent className="h-4 w-4" strokeWidth={1.8} />
            )}
            {isSubmitting ? "Aplicando..." : "Aplicar interés"}
          </button>
        </footer>
      </div>
    </div>
  );
}
