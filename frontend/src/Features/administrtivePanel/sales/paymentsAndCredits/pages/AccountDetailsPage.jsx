import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";

import BackHeader from "../../../../shared/BackHeader";
import AccountHeader from "../components/AccountHeader";
import PaymentHistoryTable from "../components/PaymentsHistoryTable";
import PaymentsPaginator from "../components/PaymentsPaginator";
import GeneratePaymentModal from "../components/GeneratePaymentModal";
import CancelPaymentModal from "../components/CancelPaymentModal";
import AccountReceipt from "../components/AccountReceipt";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../../../../shared/spinner";
import Permission from "../../../configuration/roles/components/Permission";
import { clientsService } from "../../clients/services/clientsService";

import {
  createInstallment,
  getCreditCustomers,
} from "../services/paymentsServices";
import usePaymentsDetails from "../hooks/usePaymentsDetails";
import { getTotalAbonadoFactura } from "../utils/paymentHelpers";

const getCustomerEmail = (customer) =>
  customer?.email ??
  customer?.correo ??
  customer?.mail ??
  customer?.user?.email ??
  "";

function CreditDateTooltip({ factura, formatDate }) {
  const anchorRef = useRef(null);
  const [position, setPosition] = useState(null);

  const rawDueDate =
    factura?.dueDate ||
    factura?.due_date ||
    factura?.fechaVencimiento ||
    factura?.fecha_vencimiento ||
    factura?.expirationDate ||
    factura?.expiration_date;

  const calculatedDueDate = useMemo(() => {
    if (rawDueDate) {
      return rawDueDate;
    }

    if (!factura?.fechaCredito) {
      return null;
    }

    const creditDate = new Date(factura.fechaCredito);

    if (Number.isNaN(creditDate.getTime())) {
      return null;
    }

    const dueDate = new Date(creditDate);
    dueDate.setMonth(dueDate.getMonth() + 2);

    return dueDate;
  }, [factura, rawDueDate]);

  const observation =
    factura?.observacion ||
    factura?.observation ||
    factura?.descripcion ||
    factura?.description ||
    "";

  const showTooltip = () => {
    if (!anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const tooltipWidth = 190;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - tooltipWidth / 2, 12),
      window.innerWidth - tooltipWidth - 12,
    );

    setPosition({
      left,
      top: rect.bottom + 8,
    });
  };

  const hideTooltip = () => {
    setPosition(null);
  };

  return (
    <span
      ref={anchorRef}
      className="relative inline-flex justify-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <span className="cursor-default">
        {formatDate(factura?.fechaCredito)}
      </span>

      {position && (
        <div
          className="fixed z-[9999] min-w-[190px] max-w-[240px] rounded-lg bg-[#0f172a] px-3.5 py-2.5 text-center text-xs text-white shadow-xl"
          style={{
            left: position.left,
            top: position.top,
          }}
        >
          <p className="font-semibold">
            Fecha de vencimiento
          </p>
          <p className="mt-1 text-slate-200">
            {formatDate(calculatedDueDate)}
          </p>

          {observation && (
            <>
              <div className="my-2 h-px bg-slate-600" />
              <p className="break-words text-slate-100">
                {observation}
              </p>
            </>
          )}
        </div>
      )}
    </span>
  );
}

export default function AccountDetailsPage({ mode }) {
  const { id } = useParams();
  const { showConfirm, showSuccess, showError } = useAlert();

  const [account, setAccount] = useState({
    id: null,
    nombre: "",
    documento: "",
    telefono: "",
    correo: "",
    creditoAsignado: 0,
    saldo: 0,
    cupoDisponible: 0,
    deudaTotal: 0,
    estado: "al_dia",
  });

  const { invoices, loading, loadInvoices } = usePaymentsDetails();
  const [facturaExpandida, setFacturaExpandida] = useState(null);
  const [facturaAbono, setFacturaAbono] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAbono, setSelectedAbono] = useState(null);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pages, setPages] = useState({});
  const [reloadKey, setReloadKey] = useState(0);

  const pdfRef = useRef(null);
  const downloadLockRef = useRef(false);
  const openingPaymentModalRef = useRef(false);
  const openingCancelModalRef = useRef(false);
  const itemsPerPage = 4;
  const showInterestSummaryInExpandedPanel = false;

  useEffect(() => {
    if (!id) return;

    const loadCustomerData = async () => {
      try {
        const customers = await getCreditCustomers();
        const customer = customers.find(
          (current) => Number(current.idClient) === Number(id),
        );

        if (!customer) return;

        let customerDetails = null;

        try {
          customerDetails = await clientsService.getById(id);
        } catch (customerDetailsError) {
          console.error(customerDetailsError);
        }

        setAccount({
          id: customer.idClient,
          nombre: customer.fullName,
          documento: customer.doc_number ,
          telefono: customer.phone,
          correo: getCustomerEmail(customer) || getCustomerEmail(customerDetails),
          creditoAsignado: Number(customer.assignedCredit ?? 0),
          saldo: Number(customer.usedCredit ?? 0),
          cupoDisponible: Number(customer.availableCredit ?? 0),
          deudaTotal: Number(customer.totalDebt ?? 0),
          estado: customer.status?.toLowerCase() ?? "al_dia",
        });
      } catch (error) {
        console.error(error);
      }
    };

    loadInvoices(id);
    loadCustomerData();
  }, [id, loadInvoices, reloadKey]);

  const facturas = useMemo(() => invoices ?? [], [invoices]);

  const cupoOcupado = Number(account.saldo ?? 0);

  const interesTotal = facturas.reduce(
    (total, factura) => total + Number(factura.interes ?? 0),
    0,
  );

  // fecha convertida 
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString(
      "es-CO",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const estadoGeneral = account.estado ?? "al_dia";

  const getFacturaDebtTotal = (factura) => {
    const backendDebt = Number(
      factura.saldoPendiente ??
      factura.deudaTotal ??
      0,
    );
    if (backendDebt > 0) return backendDebt;

    return (
      Number(
        factura.capitalPendiente ??
        factura.saldo ??
        factura.remainingBalance ??
        0,
      ) +
      Number(
        factura.interesPendiente ??
        factura.interes ??
        0,
      )
    );
  };

  const totalDebt =
    facturas.reduce((total, factura) => total + getFacturaDebtTotal(factura), 0) ||
    Number(account.deudaTotal ?? 0);

  const receiptAccount = useMemo(
    () => ({
      ...account,
      documento: account.documento || "-",
      telefono: account.telefono || "-",
      deudaTotal: totalDebt,
      saldo: cupoOcupado,
      facturas,
    }),
    [account, cupoOcupado, facturas, totalDebt],
  );

  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value ?? 0);

  // ✅ SPINNER INTEGRADO
  if (loading && (invoices?.length ?? 0) === 0) {
    return <Spinner message="Cargando datos de la cuenta..." />;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleFactura = (facturaId) =>
    setFacturaExpandida((prev) => (prev === facturaId ? null : facturaId));

  const handleOpenPaymentModal = (factura) => {
    if (
      showPaymentModal ||
      openingPaymentModalRef.current
    ) {
      return;
    }

    openingPaymentModalRef.current = true;

    setFacturaAbono(factura);
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (data) => {
    try {
      await createInstallment({
        id_credit: facturaAbono.idCredit,
        id_payment_method: data.idPaymentMethod,
        installment_amount: data.monto,
        observations: data.observacion,
      });

      setReloadKey((prev) => prev + 1);
      openingPaymentModalRef.current = false;
      setShowPaymentModal(false);
      setFacturaExpandida(facturaAbono.id);

      showSuccess("Abono registrado", "El pago fue guardado correctamente.");
    } catch (error) {
      showError("Error", error.message || "No se pudo guardar el abono.");
    }
  };

  const handleOpenCancelModal = (factura, abono) => {
    if (
      showCancelModal ||
      openingCancelModalRef.current
    ) {
      return;
    }

    openingCancelModalRef.current = true;

    setSelectedFactura(factura);
    setSelectedAbono(abono);
    setShowCancelModal(true);
  };

  const handleDownloadPDF = async () => {
    if (
      !account ||
      !pdfRef.current ||
      isGeneratingPDF ||
      downloadLockRef.current
    ) return;

    downloadLockRef.current = true;

    const confirm = await showConfirm(
      "question",
      "¿Descargar comprobante?",
      "Se generará el PDF del estado de cuenta completo.",
      { confirmButtonText: "Sí, descargar", cancelButtonText: "Cancelar" },
    );
    if (!confirm.isConfirmed) {
      downloadLockRef.current = false;

      return;
    }

    try {
      setIsGeneratingPDF(true);
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: false,
        windowWidth: pdfRef.current.scrollWidth,
        windowHeight: pdfRef.current.scrollHeight,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageContentHeight = pageHeight - 2 * margin;

      if (imgHeight <= pageContentHeight) {
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = margin;
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageContentHeight;
        while (heightLeft > 0) {
          position -= pageContentHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
          heightLeft -= pageContentHeight;
        }
      }
      pdf.save(`Comprobante_${account.nombre}.pdf`);
      showSuccess("Descarga completada", "El PDF fue generado correctamente.");
    } catch {
      showError("Error", "Ocurrió un problema al generar el PDF.");
    } finally {
      setIsGeneratingPDF(false);
      downloadLockRef.current = false;
    }
  };

  // ── Paginación ────────────────────────────────────────────────────────────
  const getPage = (facturaId) => pages[facturaId] ?? 1;
  const setPage = (facturaId, page) =>
    setPages((prev) => ({ ...prev, [facturaId]: page }));

  const getPaginatedAbonos = (factura) => {
    const page = getPage(factura.id);
    const start = (page - 1) * itemsPerPage;
    return (factura.abonos ?? []).slice(start, start + itemsPerPage);
  };

  return (
    <>
      <BackHeader title="Volver" />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 font-lexend">
        {/* ── HEADER DEL CLIENTE ── */}
        <AccountHeader
          nombre={account.nombre}
          documento={account.documento}
          telefono={account.telefono}
          creditoAsignado={account.creditoAsignado}
          saldoTotal={cupoOcupado}
          cupoDisponible={account.cupoDisponible}
          interesTotal={interesTotal}
          deudaTotal={totalDebt}
          estadoGeneral={estadoGeneral}
          mode={mode}
          isGeneratingPDF={isGeneratingPDF}
          onDownloadPDF={handleDownloadPDF}
        />

        {/* ── TABLA DE FACTURAS ── */}
        <div
          key={reloadKey}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
          <div className="min-w-[980px]">
          {/* Cabecera — 8 columnas */}
          <div className="grid grid-cols-9 bg-[#004D77] text-white text-xs font-medium px-4 py-3">
            <span>Nro Factura</span>
            <span className="text-center">Valor Crédito</span>
            <span className="text-center">Interés</span>
            <span className="text-center">Valor Capital</span>
            <span className="text-center">Fecha Crédito</span>
            <span className="text-center">Total Abonado</span>
            <span className="text-center">Saldo</span>
            <span className="text-center">Estado</span>
            <span className="text-center">Acciones</span>
          </div>

          {facturas.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Este cliente no tiene facturas registradas.
            </div>
          )}

          {facturas.map((factura) => {
            const interes = factura.interesPendiente ?? factura.interes ?? 0;
            const saldoCapital = Number(
              factura.capitalPendiente ??
              factura.saldo ??
              factura.remainingBalance ??
              0,
            );
            const saldoInt = factura.interesPendiente ?? factura.interes ?? 0;
            const totalAPagar = saldoCapital;
            const saldoFac = getFacturaDebtTotal(factura);
            const estadoFac = factura.estado ?? "al_dia";
            const isExpanded = facturaExpandida === factura.id;
            const abonos = factura.abonos ?? [];
            const totalAbonado =
              factura.totalAbonado ?? getTotalAbonadoFactura(factura);

            return (
              <div
                key={factura.id}
                className="border-b border-gray-100 last:border-0"
              >
                {/* Fila clickeable */}
                <div
                  className="grid grid-cols-9 items-center px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleFactura(factura.id)}
                >
                  {/* Nro Factura */}
                  <div className="flex items-center gap-2 font-medium text-[#004D77]">
                    {isExpanded ? (
                      <ChevronUp size={15} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={15} className="text-gray-400" />
                    )}
                    {factura.nroFactura}
                  </div>

                  {/* Valor Crédito */}
                  <span className="text-center text-gray-700">
                    {formatCOP(factura.valorCredito)}
                  </span>

                  {/* Interés — destacado en naranja si tiene mora */}
                  <span
                    className={`text-center font-semibold ${
                      interes > 0 ? "text-orange-500" : "text-gray-400"
                    }`}
                  >
                    {interes > 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <span>⚠</span>
                        {formatCOP(interes)}
                        {saldoInt <= 0 && (
                          <span className="text-[10px] text-green-600 font-normal ml-1">
                            ✓ pagado
                          </span>
                        )}
                      </span>
                    ) : (
                      formatCOP(0)
                    )}
                  </span>

                  {/* Total a Pagar */}
                  <span className="text-center font-semibold text-gray-800">
                    {formatCOP(totalAPagar)}
                  </span>

                  {/* Fecha Crédito */}
                  <span className="text-center text-gray-500">
                    <CreditDateTooltip
                      factura={factura}
                      formatDate={formatDate}
                    />
                  </span>

                  {/* Total Abonado a Capital */}
                  <span className="text-center text-gray-700">
                    {formatCOP(totalAbonado)}
                  </span>

                  {/* Saldo total (capital + interés pendiente) */}
                  <span
                    className={`text-center font-semibold ${
                      saldoFac > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatCOP(saldoFac)}
                  </span>

                  {/* Estado */}
                  <div className="flex justify-center">
                    <StatusBadge status={estadoFac} />
                  </div>

                  <div className="flex justify-center">
                    <Permission permission="pagos_y_abonos.abonar">
                      {mode === "payment" && saldoFac > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPaymentModal(factura);
                          }}
                          className="text-gray-400 hover:scale-110 hover:text-green-600 transition cursor-pointer"
                          title="Registrar Abono"
                          aria-label="Registrar Abono"
                        >
                          <PlusCircle size={17} strokeWidth={1.7} />
                        </button>
                      )}
                    </Permission>
                  </div>
                </div>

                {/* Panel expandido — abonos */}
                {isExpanded && (
                  <div className="bg-gray-50 px-4 pb-4 pt-2 space-y-3">
                    {/* Resumen capital vs interés dentro del panel */}
                    {showInterestSummaryInExpandedPanel && interes > 0 && (
                      <div className="flex gap-4 text-xs text-gray-500 border-b border-gray-200 pb-2">
                        <span>
                          Saldo capital:{" "}
                          <span
                            className={`font-semibold ${Math.max(0, (factura.saldo ?? 0) - (factura.interes ?? 0)) > 0 ? "text-red-500" : "text-green-600"}`}
                          >
                            {formatCOP(
                              Math.max(
                                0,
                                (factura.saldo ?? 0) - (factura.interes ?? 0),
                              ),
                            )}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          Saldo interés:{" "}
                          <span
                            className={`font-semibold ${saldoInt > 0 ? "text-orange-500" : "text-green-600"}`}
                          >
                            {formatCOP(saldoInt)}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Botón Registrar Abono */}
                    {/* Tabla de abonos */}
                    <PaymentHistoryTable
                      abonos={getPaginatedAbonos(factura)}
                      mode={mode}
                      onDelete={(abono) =>
                        handleOpenCancelModal(factura, abono)
                      }
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
            );
          })}
          </div>
          </div>
        </div>
      </div>

      {/* ── MODAL ABONAR ── */}
      {showPaymentModal && facturaAbono && (
        <GeneratePaymentModal
          cliente={account}
          factura={facturaAbono}
          onClose={() => {
            openingPaymentModalRef.current = false;
            setShowPaymentModal(false);
          }}
          onSave={handleSavePayment}
        />
      )}

      {/* ── MODAL ANULAR ── */}
      {showCancelModal && selectedAbono && selectedFactura && (
        <CancelPaymentModal
          isOpen={showCancelModal}
          onClose={() => {
            openingCancelModalRef.current = false;
            setShowCancelModal(false);
          }}
          account={account}
          payment={selectedAbono}
          onSuccess={async () => {
            setReloadKey((prev) => prev + 1);
            openingCancelModalRef.current = false;
            setShowCancelModal(false);
          }}
        />
      )}

      {/* ── RECEIPT OCULTO PARA PDF ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "210mm",
          backgroundColor: "#ffffff",
          pointerEvents: "none",
          transform: "translateX(-120%)",
        }}
      >
        <div ref={pdfRef}>
          <AccountReceipt account={receiptAccount} />
        </div>
      </div>
    </>
  );
}

