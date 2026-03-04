import { useState, useMemo } from "react"
import { X } from "lucide-react"
import { calculateSaldo } from "../utils/paymentHelpers"
import { useAlert } from "../../../../shared/alerts/useAlert"

export default function GeneratePaymentModal({
  account,
  onClose,
  onSave
}) {

  const { showSuccess, showError, showWarning, showConfirm } = useAlert()

  const saldoActual = calculateSaldo(account)

  const [monto, setMonto] = useState("")
  const [medioPago, setMedioPago] = useState("Efectivo")
  const [observaciones, setObservaciones] = useState("")
  const [errors, setErrors] = useState({})

  /* ===============================
     Formato colombiano
  ================================ */
  const formatNumber = (value) => {
    if (!value) return ""
    return new Intl.NumberFormat("es-CO").format(value)
  }

  const parseNumber = (value) => {
    return Number(value.replace(/\./g, ""))
  }

  /* ===============================
     Saldo en tiempo real
  ================================ */
  const nuevoSaldo = useMemo(() => {

    const numericMonto = parseNumber(monto)

    if (!numericMonto || numericMonto <= 0)
      return saldoActual

    if (numericMonto > saldoActual)
      return saldoActual

    return saldoActual - numericMonto

  }, [monto, saldoActual])

  /* ===============================
     Validación completa
  ================================ */
  const validate = () => {

    const newErrors = {}
    const numericMonto = parseNumber(monto)
    const trimmedObs = observaciones.trim()

    if (!monto) {
      newErrors.monto = "Ingrese un monto"
    }
    else if (numericMonto <= 0) {
      newErrors.monto = "Debe ser mayor a 0"
    }
    else if (numericMonto > saldoActual) {
      newErrors.monto = "El monto no puede ser mayor al saldo"
    }

    if (!trimmedObs) {
      newErrors.observaciones = "Debe contener mínimo 10 caracteres"
    }
    else if (trimmedObs.length < 10) {
      newErrors.observaciones = "Debe contener mínimo 10 caracteres"
    }
    else if (/^[0-9]/.test(trimmedObs)) {
      newErrors.observaciones = "No puede iniciar con números"
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  /* ===============================
     SUBMIT
  ================================ */
  const handleSubmit = async () => {

    const isValid = validate()

    if (!isValid) {
      showWarning(
        "Formulario incompleto",
        "Revisa los campos marcados en rojo."
      )
      return
    }

    const confirm = await showConfirm(
      "question",
      "¿Registrar abono?",
      "Confirma que deseas guardar este abono.",
      {
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Revisar"
      }
    )

    if (!confirm.isConfirmed) return

    try {

      onSave({
        monto: parseNumber(monto),
        medioPago,
        observaciones: observaciones.trim(),
        fecha: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString()
      })

      showSuccess(
        "Abono registrado",
        "El pago fue guardado correctamente."
      )

      onClose()

    } catch (error) {

      showError(
        "Error al guardar",
        "Ocurrió un problema al registrar el abono."
      )
    }
  }

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 font-lexend p-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#004D77] text-white px-5 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            Registrar Abono
          </h3>
          <X size={18} className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="p-6 space-y-5">

          <h4 className="font-semibold text-sm sm:text-base">
            Cliente - {account.nombre}
          </h4>

          {/* MONTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="text-xs text-gray-500">
                Monto de Abono
              </label>

              <input
                type="text"
                value={monto}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "")
                  const formatted = formatNumber(rawValue)
                  setMonto(formatted)

                  const numeric = Number(rawValue)

                  if (!rawValue) {
                    setErrors(prev => ({ ...prev, monto: "Ingrese un monto" }))
                  } else if (numeric > saldoActual) {
                    setErrors(prev => ({ ...prev, monto: "El monto no puede ser mayor al saldo" }))
                  } else {
                    setErrors(prev => ({ ...prev, monto: undefined }))
                  }
                }}
                className={`w-full px-3 py-2 rounded-lg border transition
                    focus:outline-none
                    ${errors.monto
                      ? "border-red-500 ring-2 ring-red-300"
                      : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"
                    }`}
              />

              {errors.monto && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.monto}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500">
                Fecha Abono
              </label>
              <input
                type="text"
                value={new Date().toLocaleDateString("es-CO")}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100"
              />
            </div>

          </div>

          {/* MEDIO DE PAGO */}
          <div>
            <label className="text-xs text-gray-500">
              Medio de Pago
            </label>
            <select
              value={medioPago}
              onChange={(e) => setMedioPago(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#004D77]"
            >
              <option>Efectivo</option>
              <option>Transferencia</option>
            </select>
          </div>

          {/* OBSERVACIONES */}
          <div>
            <label className="text-xs text-gray-500">
              Observaciones
            </label>

            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => {

                let value = e.target.value

                //  Bloquear si el primer carácter es número
                if (/^[0-9]/.test(value)) {
                  return
                }

                setObservaciones(value)

                const trimmed = value.trim()

                if (!trimmed || trimmed.length < 10) {
                  setErrors(prev => ({
                    ...prev,
                    observaciones: "Debe contener mínimo 10 caracteres"
                  }))
                }
                else {
                  setErrors(prev => ({
                    ...prev,
                    observaciones: undefined
                  }))
                }
              }}
              className={`w-full px-3 py-2 rounded-lg border resize-none transition
                focus:outline-none
                ${errors.observaciones
                  ? "border-red-500 ring-2 ring-red-300"
                  : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"
                }`}
            />

            {errors.observaciones && (
              <p className="text-xs text-red-500 mt-1">
                {errors.observaciones}
              </p>
            )}
          </div>

          {/* SALDO EN TIEMPO REAL */}
          <div>
            <label className="text-xs text-gray-500">
              Saldo después del abono
            </label>
            <input
              type="text"
              value={`$ ${formatNumber(nuevoSaldo)}`}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg text-white transition bg-[#004D77] hover:bg-[#003D5e]"
            >
              Guardar Cambios
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}