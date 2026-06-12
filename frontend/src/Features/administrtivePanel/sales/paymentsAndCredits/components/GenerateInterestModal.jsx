import { useState, useMemo } from "react";
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

  const percentageNumber = useMemo(() => {
    const value = Number(percentage);
    return Number.isFinite(value) ? value : 0;
  }, [percentage]);

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
    if (percentageNumber <= 0) {
      setError("Ingrese un porcentaje valido mayor a 0");
      showWarning(
        "Porcentaje invalido",
        "Ingrese un porcentaje de interes mayor a 0.",
      );
      return;
    }

    setError("");

    const confirm = await showConfirm(
      "question",
      "Aplicar interes?",
      `Se generara un interes de $${formatCOP(
        interestGenerated,
      )} para el credito #${factura?.idCredit}.`,
      {
        confirmButtonText: "Si, aplicar",
        cancelButtonText: "Revisar",
      },
    );

    if (!confirm.isConfirmed) return;

    if (onApply) {
      setIsSubmitting(true);
      try {
        await onApply({ percentage: percentageNumber });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!factura) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl font-lexend">
        <div className="bg-[#004D77] text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-semibold">Aplicar interes</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-100 p-4 rounded-xl text-sm space-y-2">
            <p>
              <strong>Credito:</strong> #{factura.idCredit}
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
              <strong>Mora:</strong> {factura.overdueDays ?? 0} dias
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Porcentaje de interes</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={percentage}
                onChange={(e) => {
                  setPercentage(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Ej. 5"
                className={`w-full p-3 rounded-lg border outline-none transition ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm space-y-2">
            <p className="font-medium">Resumen de interes</p>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo pendiente</span>
              <span className="font-medium">
                ${formatCOP(factura.remainingBalance ?? 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interes generado</span>
              <span className="font-medium text-green-600">
                ${formatCOP(interestGenerated)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nueva deuda total</span>
              <span className="font-semibold">${formatCOP(totalDebt)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white py-2 rounded-xl cursor-pointer hover:bg-gray-500 transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 text-white py-2 rounded-xl cursor-pointer bg-[#004D77] hover:bg-[#003D5e] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Aplicando..." : "Aplicar interes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
