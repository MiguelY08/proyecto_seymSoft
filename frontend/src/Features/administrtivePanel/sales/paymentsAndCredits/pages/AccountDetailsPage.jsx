import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

import {
  getAccountById,
  cancelPayment,
  addPayment
} from "../data/paymentsServices"

import {
  calculateSaldo,
  getPaymentStatus
} from "../utils/paymentHelpers"

import PaymentHistoryTable from "../components/PaymentsHistoryTable"

export default function AccountDetailsPage({ mode }) {

  const { id } = useParams()
  const [account, setAccount] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const data = getAccountById(id)
    setAccount(data)
  }, [id])

  if (!account) return <div className="p-6">Cargando...</div>

  const saldo = calculateSaldo(account)
  const status = getPaymentStatus(
    saldo,
    account.fechaVencimiento
  )

  /* ===============================
     Cancelar Abono
  ================================ */
  const handleCancel = (paymentId) => {
    cancelPayment(id, paymentId)

    const updatedAccount = getAccountById(id)
    setAccount(updatedAccount)
  }

  /* ===============================
     Generar Abono
  ================================ */
  const handleAddPayment = () => {

    if (!amount || Number(amount) <= 0) {
      setError("Ingrese un monto válido")
      return
    }

    if (Number(amount) > saldo) {
      setError("El monto no puede ser mayor al saldo")
      return
    }

    addPayment(id, amount)

    const updatedAccount = getAccountById(id)
    setAccount(updatedAccount)

    setAmount("")
    setError("")
    setShowModal(false)
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-xl font-semibold">
            {mode === "payment"
              ? `Abonar a Cuenta - ${account.nombre}`
              : `Detalles de Estado de Cuenta - ${account.nombre}`
            }
          </h2>

          <p className="text-sm text-gray-500">
            Fecha crédito: {account.fechaCredito}
          </p>

          <p className="text-sm mt-1">
            Estado:{" "}
            <span className={`font-semibold ${
              status === "al_dia"
                ? "text-green-600"
                : status === "vencido"
                ? "text-red-600"
                : "text-yellow-600"
            }`}>
              {status === "al_dia"
                ? "Al día"
                : status === "vencido"
                ? "Vencido"
                : "Pendiente"}
            </span>
          </p>

        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            Saldo Total Actual
          </p>
          <p className="text-2xl font-bold text-sky-900">
            ${saldo.toLocaleString()}
          </p>
        </div>

      </div>

      {/* BOTÓN SOLO EN PAYMENT */}
      {mode === "payment" && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-sky-900 text-white rounded-lg hover:opacity-90 transition"
        >
          Generar Abono
        </button>
      )}

      {/* TABLA */}
      <PaymentHistoryTable
        abonos={account.abonos}
        mode={mode}
        onDelete={handleCancel}
      />

      {/* ===============================
           MODAL GENERAR ABONO
      ================================ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-96 space-y-4">

            <h3 className="text-lg font-semibold">
              Generar Abono
            </h3>

            <input
              type="number"
              placeholder="Ingrese monto"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError("")
              }}
              className="w-full px-3 py-2 border rounded-lg"
            />

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">

              <button
                onClick={() => {
                  setShowModal(false)
                  setError("")
                  setAmount("")
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={handleAddPayment}
                className="px-4 py-2 bg-sky-900 text-white rounded-lg"
              >
                Guardar
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}