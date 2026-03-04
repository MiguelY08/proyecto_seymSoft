import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cancelPayment } from "../data/paymentsServices"
import { useAlert } from "../../../../shared/alerts/useAlert"

export default function CancelPaymentModal({
  isOpen,
  onClose,
  creditId,
  account,
  payment,
  onSuccess
}) {

  const { showSuccess, showError, showWarning, showConfirm } = useAlert()

  const [reason, setReason] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  /* ===============================
     VALIDACIÓN
  ================================ */
  const validateReason = (value) => {
    const trimmed = value.trim()

    if (!trimmed) return "El motivo es obligatorio."
    if (trimmed.length < 10) return "Debe tener mínimo 10 caracteres."
    if (/^[0-9]/.test(trimmed)) return "No puede iniciar con números."

    return ""
  }

  /* ===============================
     HANDLE CHANGE
  ================================ */
  const handleReasonChange = (e) => {
    const value = e.target.value
    setReason(value)

    setErrors(prev => ({
      ...prev,
      reason: validateReason(value)
    }))
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)

    setErrors(prev => ({
      ...prev,
      password: ""
    }))
  }

  /* ===============================
     SUBMIT
  ================================ */
  const handleSubmit = async () => {

    const reasonError = validateReason(reason)

    if (reasonError) {
      setErrors({ reason: reasonError })
      showWarning("Motivo inválido", reasonError)
      return
    }

    // Confirmación profesional
    const confirm = await showConfirm(
      "warning",
      "¿Confirmar cancelación?",
      "Esta acción no se puede deshacer.",
      {
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Volver"
      }
    )

    if (!confirm.isConfirmed) return

    try {

      cancelPayment(
        creditId,
        payment?.id,
        reason,
        password
      )

      showSuccess(
        "Abono cancelado",
        "El abono fue anulado correctamente."
      )

      if (onSuccess) onSuccess()

      // Reset
      setReason("")
      setPassword("")
      setErrors({})
      setShowPassword(false)

      onClose()

    } catch (error) {

      const message =
        error.message || "Contraseña incorrecta."

      setErrors(prev => ({
        ...prev,
        password: message
      }))

      showError(
        "Error de autenticación",
        message
      )
    }
  }

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl font-lexend">

        {/* HEADER */}
        <div className="bg-[#0E3B5F] text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-semibold">Anular Abono</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-6 space-y-5">

          <p className="text-sm text-gray-600">
            ¿Estás seguro que deseas cancelar este abono? Esta acción no se puede deshacer.
          </p>

          {/* DATOS DEL ABONO */}
          <div className="bg-gray-100 p-4 rounded-xl text-sm space-y-2">

            <p><strong>ID:</strong> {payment?.id ?? "-"}</p>

            <p>
              <strong>Cliente:</strong> {account?.nombre ?? "-"}
            </p>

            <p>
              <strong>Fecha:</strong> {payment?.fecha ?? "-"}
            </p>

            <p>
              <strong>Valor abonado:</strong>{" "}
              ${new Intl.NumberFormat("es-CO")
                .format(payment?.monto ?? 0)}
            </p>

            <p>
              <strong>Estado:</strong>{" "}
              {payment?.anulado ? "Anulado" : "Activo"}
            </p>

          </div>

          {/* MOTIVO */}
          <div>
            <label className="text-sm font-medium">
              Motivo de cancelación
            </label>

            <textarea
              value={reason}
              onChange={handleReasonChange}
              className={`w-full mt-1 p-3 rounded-lg border outline-none transition
                ${
                  errors.reason
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                }`}
              placeholder="Escriba el motivo..."
            />

            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">
                {errors.reason}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">
              Contraseña del administrador
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className={`w-full p-3 pr-10 rounded-lg border outline-none transition
                  ${
                    errors.password
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                placeholder="Ingrese contraseña"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white py-2 rounded-xl cursor-pointer hover:bg-gray-500 transition"
            >
              Cancelar operación
            </button>

            <button
              onClick={handleSubmit}
              className="flex-1 text-white py-2 rounded-xl cursor-pointer bg-[#004D77] hover:bg-[#003D5e] transition"
            >
              Confirmar cancelación
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}