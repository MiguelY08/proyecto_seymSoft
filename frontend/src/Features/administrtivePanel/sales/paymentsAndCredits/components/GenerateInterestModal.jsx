import { useState, useMemo } from "react"
import { X } from "lucide-react"
import { calculateSaldo } from "../utils/paymentHelpers"
import { useAlert } from "../../../../shared/alerts/useAlert"

export default function GenerateInterestModal({
  account,
  onClose,
  onApply
}) {

  const { showWarning, showSuccess, showConfirm } = useAlert()

  const [percentage, setPercentage] = useState(10)

  const originalDebt = calculateSaldo(account)

  /* ===============================
     Formato COP
  ================================ */
  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value)

  /* ===============================
     Cálculos en tiempo real
  ================================ */

  const interestAmount = useMemo(() => {
    return (originalDebt * percentage) / 100
  }, [originalDebt, percentage])

  const newTotalDebt = useMemo(() => {
    return originalDebt + interestAmount
  }, [originalDebt, interestAmount])

  /* ===============================
     Aplicar intereses
  ================================ */
  const handleApply = async () => {

    if (originalDebt <= 0) {
      showWarning(
        "Sin deuda pendiente",
        "No se pueden aplicar intereses si el saldo es cero."
      )
      return
    }

    if (!percentage || percentage < 1 || percentage > 99) {
      showWarning(
        "Porcentaje inválido",
        "Debe estar entre 1% y 99%."
      )
      return
    }

    const confirm = await showConfirm(
      "warning",
      "¿Aplicar intereses?",
      `Se incrementará la deuda en ${formatCOP(interestAmount)}.`,
      {
        confirmButtonText: "Sí, aplicar",
        cancelButtonText: "Cancelar"
      }
    )

    if (!confirm.isConfirmed) return

    onApply({
      percentage,
      interestAmount,
      newTotalDebt
    })

    showSuccess(
      "Intereses aplicados",
      "La deuda fue actualizada correctamente."
    )

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] px-4 font-lexend">

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#004D77] text-white px-5 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-base sm:text-lg">
            Generar intereses por mora
          </h3>
          <X
            size={18}
            className="cursor-pointer"
            onClick={onClose}
          />
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          <h4 className="font-medium text-sm sm:text-base">
            Cliente - {account.nombre}
          </h4>

          {/* ALERTA */}
          <div className="bg-yellow-100 border border-yellow-400 rounded-xl p-4 text-sm text-yellow-800">
            El cliente supera el plazo máximo de pago (2 meses).
            Se aplicarán intereses automáticamente.
          </div>

          {/* PORCENTAJE */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Porcentaje de interés
            </label>

            <div className="flex items-center gap-3">

              <input
                type="number"
                min="1"
                max="99"
                value={percentage}
                onChange={(e) => {
                  let value = Number(e.target.value)

                  if (value < 1) value = 1
                  if (value > 99) value = 99

                  setPercentage(value)
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-[#004D77]"
              />

              <span className="text-sm font-medium">%</span>

            </div>
          </div>

          {/* RESUMEN */}
          <div className="bg-gray-100 rounded-xl p-5 space-y-3 text-sm">

            <div className="flex justify-between">
              <span>Deuda original:</span>
              <span className="font-semibold text-blue-700">
                {formatCOP(originalDebt)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Interés aplicado ({percentage}%):</span>
              <span className="font-semibold text-red-600">
                {formatCOP(interestAmount)}
              </span>
            </div>

            <hr className="border-gray-300" />

            <div className="flex justify-between font-semibold text-base">
              <span>Nueva deuda total:</span>
              <span className="text-[#004D77]">
                {formatCOP(newTotalDebt)}
              </span>
            </div>

          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 rounded-lg text-sm text-white
                         hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleApply}
              className="px-4 py-2 bg-[#004D77] text-white rounded-lg text-sm
                         hover:bg-[#003D5e] transition-colors cursor-pointer"
            >
              Aplicar intereses
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}