import { useParams } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { ChevronDown, ChevronUp, PlusCircle } from "lucide-react"
import { useAlert } from "../../../../shared/alerts/useAlert"

import BackHeader        from "../../../../shared/BackHeader"
import PaymentHistoryTable from "../components/PaymentsHistoryTable"
import PaymentsPaginator   from "../components/PaymentsPaginator"
import GeneratePaymentModal from "../components/GeneratePaymentModal"
import CancelPaymentModal   from "../components/CancelPaymentModal"
import AccountReceipt       from "../components/AccountReceipt"
import StatusBadge          from "../components/StatusBadge"

import { getAccountById, addPayment }        from "../data/paymentsServices"
import {
  calculateSaldoFactura,
  calculateSaldoCliente,
  getPaymentStatus,
  getClienteStatus
} from "../utils/paymentHelpers"

/*
  Vista de detalle de un cliente. Funciona en dos modos:
    "view"    → solo lectura + botón descargar PDF
    "payment" → permite registrar y anular abonos por factura

  Estructura de la vista:
    Header del cliente (nombre, doc, tel, saldo total, estado general)
    └── Lista de facturas (tabla)
          └── Al hacer click en una factura → se expande mostrando sus abonos
                  (modo "payment" agrega botón Abonar + icono Anular por abono)
*/
export default function AccountDetailsPage({ mode }) {

  const { id } = useParams()
  const { showConfirm, showSuccess, showError } = useAlert()

  const [account,          setAccount]          = useState(null)
  const [facturaExpandida, setFacturaExpandida]  = useState(null)   // id de la factura expandida
  const [facturaAbono,     setFacturaAbono]      = useState(null)   // factura seleccionada para abonar
  const [showPaymentModal, setShowPaymentModal]  = useState(false)
  const [showCancelModal,  setShowCancelModal]   = useState(false)
  const [selectedAbono,    setSelectedAbono]     = useState(null)   // abono a anular
  const [selectedFactura,  setSelectedFactura]   = useState(null)   // factura del abono a anular
  const [isGeneratingPDF,  setIsGeneratingPDF]   = useState(false)
  // Paginación independiente por factura: { [facturaId]: currentPage }
  const [pages, setPages] = useState({})

  const pdfRef       = useRef(null)
  const itemsPerPage = 4

  useEffect(() => { loadAccount() }, [id])

  const loadAccount = () => {
    const data = getAccountById(id)
    setAccount(data)
  }

  if (!account) return <div className="p-6 font-lexend">Cargando...</div>

  const facturas    = account.facturas ?? []
  const saldoTotal  = calculateSaldoCliente(account)
  const estadoGeneral = getClienteStatus(account)

  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", minimumFractionDigits: 0
    }).format(v)

  // ── Expandir / colapsar una factura ──────────────────────────────────────
  const toggleFactura = (facturaId) => {
    setFacturaExpandida(prev => prev === facturaId ? null : facturaId)
  }

  // ── Abrir modal de abono ─────────────────────────────────────────────────
  const handleOpenPaymentModal = (factura) => {
    setFacturaAbono(factura)
    setShowPaymentModal(true)
  }

  // ── Guardar abono ────────────────────────────────────────────────────────
  const handleSavePayment = (data) => {
    try {
      // addPayment ahora necesita clienteId + facturaId + data
      addPayment(account.id, facturaAbono.id, data)
      loadAccount()
      setShowPaymentModal(false)
      // Expandir la factura a la que se le hizo el abono para verlo de inmediato
      setFacturaExpandida(facturaAbono.id)
      showSuccess("Abono registrado", "El pago fue guardado correctamente.")
    } catch (error) {
      showError("Error", error.message || "No se pudo guardar el abono.")
    }
  }

  // ── Abrir modal de anulación ─────────────────────────────────────────────
  const handleOpenCancelModal = (factura, abono) => {
    setSelectedFactura(factura)
    setSelectedAbono(abono)
    setShowCancelModal(true)
  }

  // ── Generar PDF ──────────────────────────────────────────────────────────
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
        scale: 2, useCORS: true, backgroundColor: "#ffffff"
      })

      const imgData   = canvas.toDataURL("image/png")
      const pdf       = new jsPDF("p", "mm", "a4")
      const pageWidth  = 210
      const pageHeight = 297
      const imgWidth   = pageWidth
      const imgHeight  = (canvas.height * imgWidth) / canvas.width

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      } else {
        let heightLeft = imgHeight
        let position   = 0
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        while (heightLeft > 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
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

  // ── Paginación por factura ───────────────────────────────────────────────
  const getPage = (facturaId) => pages[facturaId] ?? 1
  const setPage = (facturaId, page) =>
    setPages(prev => ({ ...prev, [facturaId]: page }))

  const getPaginatedAbonos = (factura) => {
    const page  = getPage(factura.id)
    const start = (page - 1) * itemsPerPage
    return (factura.abonos ?? []).slice(start, start + itemsPerPage)
  }

  // ── Colores de estado ────────────────────────────────────────────────────
  const statusColor = {
    al_dia:   "text-green-600",
    pendiente: "text-yellow-600",
    vencido:  "text-red-600"
  }

  return (
    <>
      <BackHeader title="Volver" />

      <div className="p-4 sm:p-6 space-y-6 font-lexend">

        {/* ── HEADER DEL CLIENTE ── */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col md:flex-row md:justify-between md:items-start gap-6">

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {mode === "payment" ? "Abonar a Cuenta" : "Detalle de Cuenta"} — {account.nombre}
            </h2>
            <p className="text-sm text-gray-500">Documento: {account.documento}</p>
            <p className="text-sm text-gray-500">Teléfono: {account.telefono}</p>
            <p className="text-sm mt-1">
              Estado general:{" "}
              <span className={`font-semibold ${statusColor[estadoGeneral]}`}>
                {{ al_dia: "Al día", pendiente: "Pendiente", vencido: "Vencido" }[estadoGeneral]}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="text-left md:text-right">
              <p className="text-sm text-gray-500">Saldo total pendiente</p>
              <p className="text-2xl font-bold text-[#004D77]">{formatCOP(saldoTotal)}</p>
            </div>

            {mode === "view" && (
              <button
                disabled={isGeneratingPDF}
                onClick={handleDownloadPDF}
                className="px-4 py-2 rounded-lg border text-[#004D77] bg-white hover:bg-sky-50
                           disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-semibold cursor-pointer"
              >
                {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
              </button>
            )}
          </div>
        </div>

        {/* ── TABLA DE FACTURAS ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          {/* Cabecera de la tabla de facturas */}
          <div className="grid grid-cols-6 bg-[#004D77] text-white text-xs font-medium px-4 py-3">
            <span>Nro Factura</span>
            <span className="text-center">Valor Crédito</span>
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

            const saldoFac    = calculateSaldoFactura(factura)
            const estadoFac   = getPaymentStatus(saldoFac, factura.fechaCredito)
            const isExpanded  = facturaExpandida === factura.id
            const abonos      = factura.abonos ?? []
            const totalAbonado = abonos
              .filter(a => !a.anulado)
              .reduce((s, a) => s + a.monto, 0)

            return (
              <div key={factura.id} className="border-b border-gray-100 last:border-0">

                {/* Fila de la factura — clickeable para expandir */}
                <div
                  className="grid grid-cols-6 items-center px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleFactura(factura.id)}
                >
                  <div className="flex items-center gap-2 font-medium text-[#004D77]">
                    {isExpanded
                      ? <ChevronUp size={15} className="text-gray-400" />
                      : <ChevronDown size={15} className="text-gray-400" />
                    }
                    {factura.nroFactura}
                  </div>

                  <span className="text-center text-gray-700">
                    {formatCOP(factura.valorCredito)}
                  </span>

                  <span className="text-center text-gray-500">
                    {factura.fechaCredito}
                  </span>

                  <span className="text-center text-gray-700">
                    {formatCOP(totalAbonado)}
                  </span>

                  <span className={`text-center font-semibold ${saldoFac > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatCOP(saldoFac)}
                  </span>

                  <div className="flex justify-center">
                    <StatusBadge status={estadoFac} />
                  </div>
                </div>

                {/* Panel expandido — abonos de esta factura */}
                {isExpanded && (
                  <div className="bg-gray-50 px-4 pb-4 pt-2 space-y-3">

                    {/* Botón abonar — solo en modo payment y si hay saldo */}
                    {mode === "payment" && saldoFac > 0 && (
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenPaymentModal(factura)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#004D77] text-white text-sm rounded-lg hover:bg-[#003D5e] transition cursor-pointer"
                        >
                          <PlusCircle size={15} />
                          Registrar Abono
                        </button>
                      </div>
                    )}

                    {/* Tabla de abonos */}
                    <PaymentHistoryTable
                      abonos={getPaginatedAbonos(factura)}
                      mode={mode}
                      onDelete={(abono) => handleOpenCancelModal(factura, abono)}
                    />

                    {/* Paginador de abonos */}
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