import { X } from "lucide-react"
import { useState, useMemo } from "react"
import GenerateInterestModal from "./GenerateInterestModal"
import { applyInterest } from "../data/paymentsServices"

export default function ContactClientModal({
  account,
  onClose,
  onInterestApplied
}) {

  if (!account) return null

  const [showInterestModal, setShowInterestModal] = useState(false)

  const today = new Date()

  /* ===============================
     Último Pago (ordenado correctamente)
  ================================ */
  const lastPayment = useMemo(() => {

    const activePayments = (account.abonos || [])
      .filter(p => !p.anulado)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    return activePayments.length
      ? activePayments[0].fecha
      : null

  }, [account])

  /* ===============================
     Cálculo días en mora
  ================================ */
  const daysLate = useMemo(() => {

    const creditDate = new Date(account.fechaCredito)
    const dueDate = new Date(creditDate)
    dueDate.setMonth(dueDate.getMonth() + 2)

    if (today <= dueDate) return 0

    const diffTime = today - dueDate

    return Math.floor(diffTime / (1000 * 60 * 60 * 24))

  }, [account])

  /* ===============================
     Aplicar interés
  ================================ */
  const handleApplyInterest = ({ percentage }) => {

    applyInterest(account.id, percentage)

    setShowInterestModal(false)

    if (onInterestApplied) {
      onInterestApplied()
    }

    onClose()
  }

  return (
    <>
      {/* MODAL CONTACTO */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

        <div className="bg-white w-[420px] rounded-xl shadow-xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-[#004D77] text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold">
              Gestión de contacto al cliente
            </h3>
            <X
              size={18}
              className="cursor-pointer"
              onClick={onClose}
            />
          </div>

          {/* BODY */}
          <div className="p-5 space-y-4">

            <div className="bg-gray-100 rounded-xl p-4 shadow-sm space-y-3">

              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p className="font-medium">{account.nombre}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="font-medium">{account.telefono}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-500">Último pago</p>
                  <p className="font-medium">
                    {lastPayment || "Sin pagos registrados"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Días de atraso
                  </p>
                  <p className={`font-semibold ${
                    daysLate > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}>
                    {daysLate > 0
                      ? `${daysLate} días`
                      : "Sin mora"}
                  </p>
                </div>
              </div>

            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 pt-2">

              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-400 rounded-lg text-sm text-white hover:bg-gray-600 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={() => setShowInterestModal(true)}
                className="px-4 py-2 bg-[#004D77] text-white rounded-lg text-sm hover:bg-[#003D5e] transition-colors cursor-pointer"
              >
                Generar Interés
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* MODAL INTERÉS */}
      {showInterestModal && (
        <GenerateInterestModal
          account={account}
          onClose={() => setShowInterestModal(false)}
          onApply={handleApplyInterest}
        />
      )}
    </>
  )
}