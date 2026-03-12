import { useState, useMemo } from "react"
import { X } from "lucide-react"
import { calculateSaldoFactura } from "../utils/paymentHelpers"
import { useAlert } from "../../../../shared/alerts/useAlert"

/*
  Modal para registrar un abono a una factura específica.

  Props:
    cliente  → objeto cliente completo { nombre, ... }
    factura  → objeto factura a abonar { id, nroFactura, valorCredito, abonos[] }
    onClose  → () => void
    onSave   → (data) => void — recibe { monto, medioPago, observacion, fecha }
               El padre (AccountDetailsPage) llama a addPayment con clienteId + facturaId
*/
export default function GeneratePaymentModal({
  cliente,
  factura,
  onClose,
  onSave
}) {

  const { showSuccess, showError, showWarning, showConfirm } = useAlert()

  // Saldo real de esta factura usando la función del nuevo modelo
  const saldoActual = calculateSaldoFactura(factura)

  const [monto, setMonto]           = useState("")
  const [medioPago, setMedioPago]   = useState("Efectivo")
  const [observacion, setObservacion] = useState("")
  const [errors, setErrors]         = useState({})

  const formatNumber = (value) => {
    if (!value) return ""
    return new Intl.NumberFormat("es-CO").format(value)
  }

  const parseNumber = (value) => {
    return Number(String(value).replace(/\./g, ""))
  }

  // Calcula el saldo proyectado en tiempo real mientras el usuario escribe
  const nuevoSaldo = useMemo(() => {
    const numericMonto = parseNumber(monto)
    if (!numericMonto || numericMonto <= 0) return saldoActual
    if (numericMonto > saldoActual) return saldoActual
    return saldoActual - numericMonto
  }, [monto, saldoActual])

  const validate = () => {
    const newErrors = {}
    const numericMonto = parseNumber(monto)
    const trimmedObs   = observacion.trim()

    if (!monto) {
      newErrors.monto = "Ingrese un monto"
    } else if (numericMonto <= 0) {
      newErrors.monto = "Debe ser mayor a 0"
    } else if (numericMonto > saldoActual) {
      newErrors.monto = "El monto no puede ser mayor al saldo"
    }

    if (!trimmedObs) {
      newErrors.observacion = "Debe contener mínimo 10 caracteres"
    } else if (trimmedObs.length < 10) {
      newErrors.observacion = "Debe contener mínimo 10 caracteres"
    } else if (/^[0-9]/.test(trimmedObs)) {
      newErrors.observacion = "No puede iniciar con números"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {

    if (!validate()) {
      showWarning("Formulario incompleto", "Revisa los campos marcados en rojo.")
      return
    }

    const confirm = await showConfirm(
      "question",
      "¿Registrar abono?",
      `Se abonará ${formatNumber(parseNumber(monto))} a la factura ${factura.nroFactura}.`,
      { confirmButtonText: "Sí, guardar", cancelButtonText: "Revisar" }
    )

    if (!confirm.isConfirmed) return

    try {
      // Pasar observacion (sin 's') — nombre correcto del campo en el modelo
      onSave({
        monto:       parseNumber(monto),
        medioPago,
        observacion: observacion.trim(),
        fecha:       new Date().toISOString().split("T")[0]
      })

      showSuccess("Abono registrado", "El pago fue guardado correctamente.")
      onClose()

    } catch (error) {
      showError("Error al guardar", error.message || "Ocurrió un problema al registrar el abono.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 font-lexend p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#004D77] text-white px-5 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Registrar Abono</h3>
          <X size={18} className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="p-6 space-y-5">

          {/* Info cliente + factura */}
          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1 border border-gray-200">
            <p className="font-semibold text-gray-800">{cliente?.nombre}</p>
            <p className="text-gray-500">
              Factura: <span className="font-medium text-gray-700">{factura?.nroFactura}</span>
            </p>
            <p className="text-gray-500">
              Saldo pendiente:{" "}
              <span className="font-semibold text-red-600">
                ${formatNumber(saldoActual)}
              </span>
            </p>
          </div>

          {/* MONTO + FECHA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="text-xs text-gray-500">Monto de Abono</label>
              <input
                type="text"
                value={monto}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "")
                  setMonto(formatNumber(rawValue))
                  const numeric = Number(rawValue)
                  if (!rawValue) {
                    setErrors(prev => ({ ...prev, monto: "Ingrese un monto" }))
                  } else if (numeric > saldoActual) {
                    setErrors(prev => ({ ...prev, monto: "El monto no puede ser mayor al saldo" }))
                  } else {
                    setErrors(prev => ({ ...prev, monto: undefined }))
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

            <div>
              <label className="text-xs text-gray-500">Fecha Abono</label>
              <input
                type="text"
                value={new Date().toLocaleDateString("es-CO")}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500"
              />
            </div>

          </div>

          {/* MEDIO DE PAGO */}
          <div>
            <label className="text-xs text-gray-500">Medio de Pago</label>
            <select
              value={medioPago}
              onChange={(e) => setMedioPago(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004D77]"
            >
              <option>Efectivo</option>
              <option>Transferencia</option>
              <option>Tarjeta</option>
              <option>Cheque</option>
            </select>
          </div>

          {/* OBSERVACIÓN */}
          <div>
            <label className="text-xs text-gray-500">Observación</label>
            <textarea
              rows={3}
              value={observacion}
              onChange={(e) => {
                const value = e.target.value
                if (/^[0-9]/.test(value)) return
                setObservacion(value)
                const trimmed = value.trim()
                if (!trimmed || trimmed.length < 10) {
                  setErrors(prev => ({ ...prev, observacion: "Debe contener mínimo 10 caracteres" }))
                } else {
                  setErrors(prev => ({ ...prev, observacion: undefined }))
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

          {/* SALDO PROYECTADO */}
          <div>
            <label className="text-xs text-gray-500">Saldo después del abono</label>
            <input
              type="text"
              value={`$ ${formatNumber(nuevoSaldo)}`}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 font-medium"
            />
          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg text-white transition bg-[#004D77] hover:bg-[#003D5e] cursor-pointer"
            >
              Guardar Abono
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}