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
import { validateMotivoCancelacion } from "../validators/returnsValidators";

const MAX_REASON_LENGTH = 250;

const DetailRow = ({ icon: Icon, label, value, highlight = false }) => {
  const hasValue =
    value !== undefined && value !== null && String(value).trim().length > 0;

  return (
    <div className="flex items-start gap-3 border-b border-gray-50 py-2 last:border-0">
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
        <div className="flex shrink-0 items-center justify-between gap-3 bg-[#004D77] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <XCircle className="h-5 w-5 shrink-0 text-white" strokeWidth={2} />
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold leading-tight text-white">
                Anular devolución
              </h2>
              <p className="truncate text-xs text-white/75">
                Devolución #{devolucion?.id ?? "-"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-full p-1 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            title="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex shrink-0 items-start gap-3 border-b border-yellow-100 bg-yellow-50 px-4 py-3 sm:px-6">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
          <p className="text-xs leading-relaxed text-yellow-800">
            Esta acción es <strong>permanente e irreversible</strong>. La
            devolución quedará anulada y sus detalles dejarán de continuar el
            proceso actual.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <SectionTitle>Detalles de la devolución</SectionTitle>
              <DetailRow
                icon={FileText}
                label="No. devolución"
                value={devolucion?.id}
                highlight
              />
              <DetailRow
                icon={FileText}
                label="No. factura"
                value={devolucion?.idCompra ?? devolucion?.invoiceNumber}
              />
              <DetailRow
                icon={Truck}
                label="Proveedor"
                value={
                  devolucion?.proveedor ??
                  devolucion?.provider?.name ??
                  devolucion?.purchase?.provider?.name
                }
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

            <div className="px-4 py-4 sm:px-6 sm:py-5">
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

        <div className="flex shrink-0 flex-col-reverse items-stretch gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#004D77] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003D5e] disabled:cursor-not-allowed disabled:bg-[#004D77]/50 sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <XCircle className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "Anulando..." : "Confirmar anulación"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnulReturn;
