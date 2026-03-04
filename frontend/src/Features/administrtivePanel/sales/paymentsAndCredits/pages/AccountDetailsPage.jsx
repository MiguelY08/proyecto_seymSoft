import { useParams } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useAlert } from "../../../../shared/alerts/useAlert"

import BackHeader from "../../../../shared/BackHeader"

import PaymentHistoryTable from "../components/PaymentsHistoryTable"
import PaymentsPaginator from "../components/PaymentsPaginator"
import GeneratePaymentModal from "../components/generatePaymentModal"
import CancelPaymentModal from "../components/CancelPaymentModal"
import AccountReceipt from "../components/AccountReceipt"

import {
  getAccountById,
  addPayment
} from "../data/paymentsServices"

import {
  calculateSaldo,
  getPaymentStatus
} from "../utils/paymentHelpers"

export default function AccountDetailsPage({ mode }) {

  const { id } = useParams()
  const { showConfirm, showSuccess, showError } = useAlert()

  const [account, setAccount] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const pdfRef = useRef(null)
  const itemsPerPage = 4

  useEffect(() => {
    loadAccount()
  }, [id])

  const loadAccount = () => {
    const data = getAccountById(id)
    setAccount(data)
  }

  if (!account)
    return <div className="p-6 font-lexend">Cargando...</div>

  const saldo = calculateSaldo(account)
  const status = getPaymentStatus(saldo, account.fechaCredito)

  const abonos = account.abonos || []
  const paginatedAbonos = abonos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDownloadPDF = async () => {
    if (!account || !pdfRef.current || isGeneratingPDF) return

    const confirm = await showConfirm(
      "question",
      "¿Descargar comprobante?",
      "Se generará el archivo PDF del cliente.",
      {
        confirmButtonText: "Sí, descargar",
        cancelButtonText: "Cancelar"
      }
    )

    if (!confirm.isConfirmed) return

    try {
      setIsGeneratingPDF(true)

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const pageWidth = 210
      const pageHeight = 297
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      } else {
        let heightLeft = imgHeight
        let position = 0

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

      showSuccess(
        "Descarga completada",
        "El comprobante PDF fue generado correctamente."
      )

    } catch (error) {
      showError(
        "Error al generar PDF",
        "Ocurrió un problema al generar el comprobante."
      )
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleOpenCancelModal = (payment) => {
    setSelectedPayment(payment)
    setIsModalOpen(true)
  }

  const handleSavePayment = (data) => {
    const success = addPayment(id, data)

    if (!success) {
      showError("Error", "No se pudo guardar el abono.")
      return
    }

    loadAccount()
    setShowModal(false)
    setCurrentPage(1)

    showSuccess(
      "Abono registrado",
      "El abono fue guardado correctamente."
    )
  }

  return (
    <>
      <BackHeader title="Volver" />

      <div className="p-4 sm:p-6 space-y-6 font-lexend">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6
                        flex flex-col
                        md:flex-row md:justify-between md:items-start
                        gap-6">

          {/* INFO */}
          <div className="space-y-2 w-full md:w-auto">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold leading-snug">
              {mode === "payment"
                ? `Abonar a Cuenta - ${account.nombre}`
                : `Detalles de Estado de Cuenta - ${account.nombre}`}
            </h2>

            <p className="text-sm text-gray-600 break-words">
              Documento: {account.documento}
            </p>

            <p className="text-sm text-gray-600 break-words">
              Teléfono: {account.telefono}
            </p>

            <p className="text-sm mt-1">
              Estado{" "}
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

          {/* BOTONES Y SALDO */}
          <div className="flex flex-col sm:flex-row md:flex-col
                          items-start sm:items-center md:items-end
                          gap-4 w-full md:w-auto">

            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-500">
                Saldo Total Actual
              </p>
              <p className="text-xl sm:text-2xl font-bold text-[#004D77]">
                ${new Intl.NumberFormat("es-CO").format(saldo)}
              </p>
            </div>

            {mode === "view" && (
              <button
                disabled={isGeneratingPDF}
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto
                           px-4 py-2 rounded-lg border
                           text-[#004D77] bg-white
                           hover:bg-sky-50
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200
                           text-sm font-semibold cursor-pointer"
              >
                {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
              </button>
            )}

            {mode === "payment" && saldo > 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto
                           px-4 py-2 rounded-lg border
                           text-[#004D77] bg-white
                           hover:bg-sky-50
                           transition-all duration-200
                           text-sm font-semibold cursor-pointer"
              >
                Generar Abono +
              </button>
            )}

          </div>
        </div>

        <PaymentHistoryTable
          abonos={paginatedAbonos}
          mode={mode}
          onDelete={handleOpenCancelModal}
        />

        <PaymentsPaginator
          itemsPerPage={itemsPerPage}
          totalItems={abonos.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {showModal && (
          <GeneratePaymentModal
            account={account}
            onClose={() => setShowModal(false)}
            onSave={handleSavePayment}
          />
        )}

        {isModalOpen && selectedPayment && (
          <CancelPaymentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            creditId={account.id}
            account={account}
            payment={selectedPayment}
            onSuccess={() => {
              loadAccount()
              setCurrentPage(1)
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-9999px",
            width: "210mm",
            backgroundColor: "#ffffff",
            zIndex: -1
          }}
        >
          <div ref={pdfRef}>
            <AccountReceipt account={account} />
          </div>
        </div>

      </div>
    </>
  )
}