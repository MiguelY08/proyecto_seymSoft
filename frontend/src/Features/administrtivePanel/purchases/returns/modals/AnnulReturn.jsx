import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  FileText,
  Loader2,
  Package,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { getPurchaseReturnProviderName } from "../helpers/returnsHelpers";
import { validateMotivoCancelacion } from "../validators/returnsValidators";

const MAX_REASON_LENGTH = 250;

const DetailRow = ({ icon: Icon, label, value, highlight = false }) => {
  const hasValue =
    value !== undefined && value !== null && String(value).trim().length > 0;

  return (
    <div className="flex min-w-0 items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 md:gap-3 md:rounded-none md:border-x-0 md:border-t-0 md:border-b md:bg-transparent md:px-0 md:py-2 md:last:border-b-0">
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
          hasValue ? "bg-[#004D77]/10" : "bg-gray-100"
        }`}
      >
        {React.createElement(Icon, {
          className: `h-3.5 w-3.5 ${
            hasValue ? "text-[#004D77]" : "text-gray-300"
          }`,
          strokeWidth: 1.8,
        })}
      </div>
      <div className="min-w-0 flex-1">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide leading-none text-gray-400">
          {label}
        </span>
        <span
          className={`block truncate text-sm font-medium ${
            hasValue
              ? highlight
                ? "font-semibold text-[#004D77]"
                : "text-gray-800"
              : "font-normal italic text-gray-300"
          }`}
        >
          {hasValue ? value : "-"}
        </span>
      </div>
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <div className="mb-3 flex items-center gap-2">
    <div className="h-px flex-1 bg-gray-100" />
    <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {children}
    </span>
    <div className="h-px flex-1 bg-gray-100" />
  </div>
);

const AnnulReturn = ({ devolucion, onClose, onConfirm, loading = false }) => {
  const [reason, setReason] = useState("");
  const { showWarning } = useAlert();

  const handleSubmit = () => {
    if (loading) return;

    const error = validateMotivoCancelacion(reason);

    if (error) {
      showWarning("Campo requerido", error);
      return;
    }

    onConfirm(reason.trim());
  };

  return (
    <div
      onClick={loading ? undefined : onClose}
      className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg"
      >
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
                <XCircle className="h-5 w-5 text-white" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">
                Anular devolución
              </h2>
              <p className="mt-0.5 truncate text-xs text-white/60">
                Devolución #{devolucion?.id ?? "-"}
              </p>
              </div>
            </div>
            <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar anulación de devolución"
            title="Cerrar"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          </div>
        </header>

        <div className="flex shrink-0 items-start gap-3 border-b border-yellow-100 bg-yellow-50 px-4 py-3 sm:px-6">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
          <p className="text-xs leading-relaxed text-yellow-800">
            Esta acción es <strong>permanente e irreversible</strong>. La
            devolución quedará anulada y sus detalles dejarán de continuar el
            proceso actual.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:px-6 sm:py-5 md:grid-cols-2 md:gap-0 md:p-0 md:divide-x md:divide-gray-100">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:rounded-none md:border-0 md:px-6 md:py-5 md:shadow-none">
              <SectionTitle>Detalles de la devolución</SectionTitle>
              <div className="grid grid-cols-2 gap-2 md:block">
              <DetailRow
                icon={FileText}
                label="No. factura"
                value={devolucion?.idCompra ?? devolucion?.invoiceNumber}
              />
              <DetailRow
                icon={Truck}
                label="Proveedor"
                value={getPurchaseReturnProviderName(devolucion, "-")}
              />
              <DetailRow
                icon={Calendar}
                label="Fecha de devolución"
                value={
                  devolucion?.fechaDevolucion ?? devolucion?.creationDate
                }
              />
              <DetailRow
                icon={Package}
                label="Estado actual"
                value={devolucion?.estado ?? devolucion?.status}
              />
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:rounded-none md:border-0 md:px-6 md:py-5 md:shadow-none">
              <SectionTitle>Motivo</SectionTitle>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Motivo de anulación <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value.slice(0, MAX_REASON_LENGTH))
                  }
                  rows={7}
                  disabled={loading}
                  placeholder="Describe el motivo por el cual se anula esta devolución..."
                  className="min-h-40 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                />
                <span
                  className={`absolute bottom-2 right-3 text-[10px] ${
                    reason.length >= MAX_REASON_LENGTH
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {reason.length}/{MAX_REASON_LENGTH}
                </span>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="order-2 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="order-1 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <XCircle className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "Anulando..." : "Confirmar anulación"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AnnulReturn;
