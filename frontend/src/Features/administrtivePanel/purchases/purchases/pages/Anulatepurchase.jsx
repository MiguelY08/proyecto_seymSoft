import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { useOutsideCloseWarning } from "../../../../shared/hooks/useOutsideCloseWarning";
import PurchaseModalHeader from "../../../../shared/PurchaseModalHeader";

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

const AnulatePurchase = ({ purchase, onClose, onConfirm }) => {
  const { handleOutsideClick } = useOutsideCloseWarning(onClose);
  const [reason, setReason] = useState("");
  const { showWarning } = useAlert();
  const isAlreadyAnnulled = purchase?.estado === "Anulada";

  const handleSubmit = () => {
    if (!reason.trim()) {
      showWarning(
        "Campo requerido",
        "Debes escribir el motivo de la anulación."
      );
      return;
    }

    onConfirm(reason.trim());
  };

  return (
    <div
      onClick={handleOutsideClick}
      className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg"
      >
        <PurchaseModalHeader
          icon={XCircle}
          eyebrow={`Factura ${purchase?.numeroFacturacion ?? "-"}`}
          title={isAlreadyAnnulled ? "Compra anulada" : "Anular compra"}
          onClose={onClose}
          closeLabel="Cerrar anulación de compra"
        />

        {!isAlreadyAnnulled && (
          <div className="flex shrink-0 items-start gap-3 border-b border-yellow-100 bg-yellow-50 px-6 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
            <p className="text-xs leading-relaxed text-yellow-800">
              Esta acción es <strong>permanente e irreversible</strong>. La
              compra quedará anulada y no podrá gestionarse nuevamente.
            </p>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="px-6 py-5">
              <SectionTitle>Detalles de la compra</SectionTitle>
              <DetailRow
                icon={FileText}
                label="No. facturación"
                value={purchase?.numeroFacturacion}
                highlight
              />
              <DetailRow
                icon={Calendar}
                label="Fecha de compra"
                value={purchase?.fechaCompra}
              />
              <DetailRow
                icon={Truck}
                label="Proveedor"
                value={purchase?.proveedor}
              />
              <DetailRow
                icon={Package}
                label="Estado actual"
                value={purchase?.estado ?? "Completada"}
              />
            </div>

            <div className="px-6 py-5">
              <SectionTitle>
                {isAlreadyAnnulled ? "Información de anulación" : "Motivo"}
              </SectionTitle>

              {isAlreadyAnnulled ? (
                <div className="flex items-start gap-3 rounded-lg border border-[#004D77]/15 bg-[#004D77]/5 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#004D77]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#004D77]">
                      Motivo registrado
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      {purchase?.motivoAnulacion || "Sin motivo registrado."}
                    </p>
                    {purchase?.fechaAnulacion && (
                      <p className="mt-2 text-xs text-[#004D77]/60">
                        Anulada el {purchase.fechaAnulacion}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Motivo de anulación <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={reason}
                      onChange={(event) =>
                        setReason(
                          event.target.value.slice(0, MAX_REASON_LENGTH)
                        )
                      }
                      rows={6}
                      placeholder="Describe el motivo por el cual se anula esta compra..."
                      className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
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
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="order-2 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto"
          >
            {isAlreadyAnnulled ? "Cerrar" : "Cancelar"}
          </button>

          {!isAlreadyAnnulled && (
            <button
              type="button"
              onClick={handleSubmit}
              className="order-1 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto"
            >
              <XCircle className="h-4 w-4" strokeWidth={2} />
              Confirmar anulación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnulatePurchase;
