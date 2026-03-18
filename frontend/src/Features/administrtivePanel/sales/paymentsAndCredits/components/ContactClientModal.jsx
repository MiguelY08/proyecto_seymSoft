import { X } from "lucide-react"
import { useState, useMemo } from "react"
import GenerateInterestModal from "./GenerateInterestModal"
import { applyInterest } from "../data/paymentsServices"
import { getLastPaymentDate, getDaysLate, calculateSaldoFactura } from "../utils/paymentHelpers"

/*
  Modal de gestión de contacto para clientes con facturas vencidas.
  Muestra resumen del cliente y permite aplicar interés a una factura vencida.

  Props:
    account          → objeto cliente completo { nombre, telefono, facturas[] }
    onClose          → () => void
    onInterestApplied → () => void — recarga los datos en el padre tras aplicar interés
*/
export default function ContactClientModal({
  account,
  onClose,
  onInterestApplied
}) {

  if (!account) return null

  const [showInterestModal, setShowInterestModal] = useState(false)
  // Factura seleccionada para aplicar el interés (la primera vencida por defecto)
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null)

  // Recopilar todos los abonos activos de todas las facturas para el último pago
  const lastPayment = useMemo(() => {
    const todosLosAbonos = (account.facturas ?? []).flatMap(f => f.abonos ?? [])
    return getLastPaymentDate(todosLosAbonos)
  }, [account])

  // Días de mora: tomamos el mayor valor entre todas las facturas vencidas
  const daysLate = useMemo(() => {
    const facturas = account.facturas ?? []
    const dias = facturas.map(f => getDaysLate(f.fechaCredito))
    return Math.max(...dias, 0)
  }, [account])

  // Facturas que aún tienen saldo (las candidatas a recibir interés)
  const facturasConSaldo = useMemo(() => {
    return (account.facturas ?? []).filter(f => calculateSaldoFactura(f) > 0)
  }, [account])

  const handleOpenInterest = (factura) => {
    setFacturaSeleccionada(factura)
    setShowInterestModal(true)
  }

  const handleApplyInterest = ({ percentage }) => {
    // applyInterest ahora recibe clienteId + facturaId + percentage
    applyInterest(account.id, facturaSeleccionada.id, percentage)
    setShowInterestModal(false)
    if (onInterestApplied) onInterestApplied()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden font-lexend">

          {/* HEADER */}
          <div className="bg-[#004D77] text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold">Gestión de contacto al cliente</h3>
            <X size={18} className="cursor-pointer" onClick={onClose} />
          </div>

          <div className="p-5 space-y-4">

            {/* INFO CLIENTE */}
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
                  <p className="font-medium">{lastPayment || "Sin pagos registrados"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Días de atraso</p>
                  <p className={`font-semibold ${daysLate > 0 ? "text-red-600" : "text-green-600"}`}>
                    {daysLate > 0 ? `${daysLate} días` : "Sin mora"}
                  </p>
                </div>
              </div>
            </div>

            {/* FACTURAS CON SALDO — selector para aplicar interés */}
            {facturasConSaldo.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600">
                  Selecciona una factura para aplicar interés:
                </p>
                {facturasConSaldo.map(factura => (
                  <div
                    key={factura.id}
                    className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{factura.nroFactura}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-red-600 font-semibold">
                        Saldo: ${new Intl.NumberFormat("es-CO").format(calculateSaldoFactura(factura))}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenInterest(factura)}
                      className="text-xs px-3 py-1 bg-[#004D77] text-white rounded-lg hover:bg-[#003D5e] transition cursor-pointer"
                    >
                      Interés
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* BOTÓN CERRAR */}
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-400 rounded-lg text-sm text-white hover:bg-gray-600 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL INTERÉS — se abre sobre este modal */}
      {showInterestModal && facturaSeleccionada && (
        <GenerateInterestModal
          cliente={account}
          factura={facturaSeleccionada}
          onClose={() => setShowInterestModal(false)}
          onApply={handleApplyInterest}
        />
      )}
    </>
  )
}