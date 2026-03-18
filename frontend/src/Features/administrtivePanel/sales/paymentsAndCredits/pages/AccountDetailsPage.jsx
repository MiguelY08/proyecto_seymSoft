import { useParams, useLocation } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { ChevronDown, ChevronUp, PlusCircle } from "lucide-react"
import { useAlert } from "../../../../shared/alerts/useAlert"

import BackHeader           from "../../../../shared/BackHeader"
import AccountHeader        from "../components/AccountHeader"
import PaymentHistoryTable  from "../components/PaymentsHistoryTable"
import PaymentsPaginator    from "../components/PaymentsPaginator"
import GeneratePaymentModal from "../components/GeneratePaymentModal"
import CancelPaymentModal   from "../components/CancelPaymentModal"
import AccountReceipt       from "../components/AccountReceipt"
import StatusBadge          from "../components/StatusBadge"
import ButtonComponent      from "../../../../shared/ButtonComponent"

import { getAccountById, addPayment } from "../data/paymentsServices"
import {
  calculateSaldoFactura,
  calculateSaldoCapital,
  calculateSaldoInteres,
  calculateSaldoCliente,
  calculateCupoOcupado,
  getTotalAbonadoCapital,
  getTotalInteresCliente,
  getPaymentStatus,
  getClienteStatus
} from "../utils/paymentHelpers"

/*
  Vista de detalle de un cliente. Funciona en dos modos:
    "view"    → solo lectura + botón descargar PDF
    "payment" → permite registrar y anular abonos por factura

  Tabla de facturas — columnas:
    Nro Factura | Valor Crédito | Interés | Total a Pagar |
    Fecha Crédito | Total Abonado | Saldo | Estado
*/
export default function AccountDetailsPage({ mode }) {

  const { id }      = useParams()
  const location   = useLocation()
  const { showConfirm, showSuccess, showError } = useAlert()

  const [account,          setAccount]         = useState(null)
  const [facturaExpandida, setFacturaExpandida] = useState(null)
  const [facturaAbono,     setFacturaAbono]     = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCancelModal,  setShowCancelModal]  = useState(false)
  const [selectedAbono,    setSelectedAbono]    = useState(null)
  const [selectedFactura,  setSelectedFactura]  = useState(null)
  const [isGeneratingPDF,  setIsGeneratingPDF]  = useState(false)
  const [pages,            setPages]            = useState({})
  const [reloadKey,        setReloadKey]         = useState(0)

  const pdfRef       = useRef(null)
  const itemsPerPage = 4

  // Recargar cada vez que cambia la ruta o el id
  useEffect(() => { loadAccount() }, [id, location])

  // Escuchar cambios en los datos para mantener el estado sincronizado
  useEffect(() => {
    const handlePaymentsUpdate = () => {
      loadAccount()
    }
    window.addEventListener("paymentsUpdated", handlePaymentsUpdate)
    return () => window.removeEventListener("paymentsUpdated", handlePaymentsUpdate)
  }, [id]) // Depend on id to ensure correct account is loaded

  const loadAccount = () => {
    const data = getAccountById(id)
    setAccount(data)
    setReloadKey(k => k + 1)   // fuerza re-render de subcomponentes
  }

  if (!account) return <div className="p-6 font-lexend">Cargando...</div>

  const facturas      = account.facturas ?? []
  const saldoTotal    = calculateSaldoCliente(account)
  const cupoOcupado   = calculateCupoOcupado(account)     // solo capital
  const interesTotal  = getTotalInteresCliente(account)   // intereses pendientes
  const estadoGeneral = getClienteStatus(account)

  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", minimumFractionDigits: 0
    }).format(v)

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleFactura = (facturaId) =>
    setFacturaExpandida(prev => prev === facturaId ? null : facturaId)

  const handleOpenPaymentModal = (factura) => {
    setFacturaAbono(factura)
    setShowPaymentModal(true)
  }

  const handleSavePayment = (data) => {
    try {
      addPayment(account.id, facturaAbono.id, data)
      loadAccount()
      setShowPaymentModal(false)
      setFacturaExpandida(facturaAbono.id)
      showSuccess("Abono registrado", "El pago fue guardado correctamente.")
    } catch (error) {
      showError("Error", error.message || "No se pudo guardar el abono.")
    }
  }

  const handleOpenCancelModal = (factura, abono) => {
    setSelectedFactura(factura)
    setSelectedAbono(abono)
    setShowCancelModal(true)
  }

  const handleDownloadPDF = async () => {
    if (!account || !pdfRef.current || isGeneratingPDF) return

    const confirm = await showConfirm(
      "question",
      "¿Descargar comprobante?",
      "Se generará el PDF del estado de cuenta completo.",
      { confirmButtonText: "Sí, descargar", cancelButtonText: "Cancelar" }
    )
    if (!confirm.isConfirmed) return

    try {
      setIsGeneratingPDF(true)
      const canvas = await html2canvas(pdfRef.current, {
        scale: 3, useCORS: true, backgroundColor: "#ffffff", allowTaint: false
      })
      const imgData    = canvas.toDataURL("image/png")
      const pdf        = new jsPDF("p", "mm", "a4")
      const pageWidth  = 210
      const pageHeight = 297
      const margin     = 10
      const imgWidth   = pageWidth - 2 * margin
      const imgHeight  = (canvas.height * imgWidth) / canvas.width

      if (imgHeight <= pageHeight - 2 * margin) {
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight)
      } else {
        let heightLeft = imgHeight
        let position   = margin
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight)
        heightLeft -= (pageHeight - 2 * margin)
        while (heightLeft > 0) {
          position = (pageHeight - 2 * margin) - imgHeight + margin
          pdf.addPage()
          pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight)
          heightLeft -= (pageHeight - 2 * margin)
        }
      }
      pdf.save(`Comprobante_${account.nombre}.pdf`)
      showSuccess("Descarga completada", "El PDF fue generado correctamente.")
    } catch {
      showError("Error", "Ocurrió un problema al generar el PDF.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // ── Paginación ────────────────────────────────────────────────────────────
  const getPage = (facturaId) => pages[facturaId] ?? 1
  const setPage = (facturaId, page) =>
    setPages(prev => ({ ...prev, [facturaId]: page }))

  const getPaginatedAbonos = (factura) => {
    const page  = getPage(factura.id)
    const start = (page - 1) * itemsPerPage
    return (factura.abonos ?? []).slice(start, start + itemsPerPage)
  }

  return (
    <>
      <BackHeader title="Volver" />

      <div className="p-4 sm:p-6 space-y-6 font-lexend">

        {/* ── HEADER DEL CLIENTE ── */}
        <AccountHeader
          nombre={account.nombre}
          documento={account.documento}
          telefono={account.telefono}
          estadoGeneral={estadoGeneral}
          creditoAsignado={account.creditoAsignado}
          saldoTotal={cupoOcupado}
          interesTotal={interesTotal}
          mode={mode}
          isGeneratingPDF={isGeneratingPDF}
          onDownloadPDF={handleDownloadPDF}
        />

        {/* ── TABLA DE FACTURAS ── */}
        <div key={reloadKey} className="bg-white rounded-2xl shadow-md overflow-hidden">

          {/* Cabecera — 8 columnas */}
          <div className="grid grid-cols-8 bg-[#004D77] text-white text-xs font-medium px-4 py-3">
            <span>Nro Factura</span>
            <span className="text-center">Valor Crédito</span>
            <span className="text-center">Interés</span>
            <span className="text-center">Total a Pagar</span>
            <span className="text-center">Fecha Crédito</span>
            <span className="text-center">Total Abonado</span>
            <span className="text-center">Saldo</span>
            <span className="text-center">Estado</span>
          </div>

          {facturas.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Este cliente no tiene facturas registradas.
            </div>
          )}

          {facturas.map((factura) => {

            const interes      = factura.interes ?? 0
            const totalAPagar  = factura.valorCredito + interes
            const saldoFac     = calculateSaldoFactura(factura)   // capital + interés
            const saldoInt     = calculateSaldoInteres(factura)
            const estadoFac    = getPaymentStatus(saldoFac, factura.fechaCredito)
            const isExpanded   = facturaExpandida === factura.id
            const abonos       = factura.abonos ?? []
            const totalAbonado = getTotalAbonadoCapital(factura)

            return (
              <div key={factura.id} className="border-b border-gray-100 last:border-0">

                {/* Fila clickeable */}
                <div
                  className="grid grid-cols-8 items-center px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleFactura(factura.id)}
                >
                  {/* Nro Factura */}
                  <div className="flex items-center gap-2 font-medium text-[#004D77]">
                    {isExpanded
                      ? <ChevronUp   size={15} className="text-gray-400" />
                      : <ChevronDown size={15} className="text-gray-400" />
                    }
                    {factura.nroFactura}
                  </div>

                  {/* Valor Crédito */}
                  <span className="text-center text-gray-700">
                    {formatCOP(factura.valorCredito)}
                  </span>

                  {/* Interés — destacado en naranja si tiene mora */}
                  <span className={`text-center font-semibold ${
                    interes > 0 ? "text-orange-500" : "text-gray-400"
                  }`}>
                    {interes > 0
                      ? <span className="flex items-center justify-center gap-1">
                          <span>⚠</span>{formatCOP(interes)}
                          {saldoInt <= 0 && (
                            <span className="text-[10px] text-green-600 font-normal ml-1">✓ pagado</span>
                          )}
                        </span>
                      : formatCOP(0)
                    }
                  </span>

                  {/* Total a Pagar */}
                  <span className="text-center font-semibold text-gray-800">
                    {formatCOP(totalAPagar)}
                  </span>

                  {/* Fecha Crédito */}
                  <span className="text-center text-gray-500">
                    {factura.fechaCredito}
                  </span>

                  {/* Total Abonado a Capital */}
                  <span className="text-center text-gray-700">
                    {formatCOP(totalAbonado)}
                  </span>

                  {/* Saldo total (capital + interés pendiente) */}
                  <span className={`text-center font-semibold ${
                    saldoFac > 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    {formatCOP(saldoFac)}
                  </span>

                  {/* Estado */}
                  <div className="flex justify-center">
                    <StatusBadge status={estadoFac} />
                  </div>
                </div>

                {/* Panel expandido — abonos */}
                {isExpanded && (
                  <div className="bg-gray-50 px-4 pb-4 pt-2 space-y-3">

                    {/* Resumen capital vs interés dentro del panel */}
                    {interes > 0 && (
                      <div className="flex gap-4 text-xs text-gray-500 border-b border-gray-200 pb-2">
                        <span>
                          Saldo capital:{" "}
                          <span className={`font-semibold ${calculateSaldoCapital(factura) > 0 ? "text-red-500" : "text-green-600"}`}>
                            {formatCOP(calculateSaldoCapital(factura))}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          Saldo interés:{" "}
                          <span className={`font-semibold ${saldoInt > 0 ? "text-orange-500" : "text-green-600"}`}>
                            {formatCOP(saldoInt)}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Botón Registrar Abono */}
                    {mode === "payment" && saldoFac > 0 && (
                      <div className="flex justify-end">
                        <ButtonComponent
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenPaymentModal(factura)
                          }}
                          className="flex items-center gap-2 bg-[#004D77] text-[#004D77] border-[#004D77] hover:bg-[#003D5e]"
                        >
                          <span className="flex items-center gap-2">
                            <PlusCircle size={15} />
                            Registrar Abono
                          </span>
                        </ButtonComponent>
                      </div>
                    )}

                    {/* Tabla de abonos */}
                    <PaymentHistoryTable
                      abonos={getPaginatedAbonos(factura)}
                      mode={mode}
                      onDelete={(abono) => handleOpenCancelModal(factura, abono)}
                    />

                    {/* Paginador */}
                    <PaymentsPaginator
                      itemsPerPage={itemsPerPage}
                      totalItems={abonos.length}
                      currentPage={getPage(factura.id)}
                      onPageChange={(page) => setPage(factura.id, page)}
                    />

                  </div>
                )}

              </div>
            )
          })}
        </div>

      </div>

      {/* ── MODAL ABONAR ── */}
      {showPaymentModal && facturaAbono && (
        <GeneratePaymentModal
          cliente={account}
          factura={facturaAbono}
          onClose={() => setShowPaymentModal(false)}
          onSave={handleSavePayment}
        />
      )}

      {/* ── MODAL ANULAR ── */}
      {showCancelModal && selectedAbono && selectedFactura && (
        <CancelPaymentModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          clienteId={account.id}
          facturaId={selectedFactura.id}
          account={account}
          payment={selectedAbono}
          onSuccess={() => {
            loadAccount()
            setShowCancelModal(false)
          }}
        />
      )}

      {/* ── RECEIPT OCULTO PARA PDF ── */}
      <div style={{
        position: "absolute", top: 0, left: "-9999px",
        width: "210mm", backgroundColor: "#ffffff", zIndex: -1
      }}>
        <div ref={pdfRef}>
          <AccountReceipt account={account} />
        </div>
      </div>

    </>
  )
}