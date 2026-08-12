import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  CreditCard,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  X,
} from 'lucide-react';
import FormSelect from '../../../../shared/FormSelect';
import { METODOS_PAGO, PAYMENT_METHOD_IDS } from '../services/ordersService';

const roundMoney = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const paymentMethodOptions = [
  { value: METODOS_PAGO.TRANSFERENCIA, label: 'Transferencia' },
];

function ApprovePaymentReceiptModal({
  order,
  receipt,
  isOpen = false,
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  const [visible, setVisible] = useState(false);
  const pendingBalance = useMemo(() => {
    const explicitBalance = Number(order?.saldoPendiente);
    if (Number.isFinite(explicitBalance)) return Math.max(0, roundMoney(explicitBalance));

    const total = Number(order?.total) || 0;
    const paid = Number(order?.totalPagado) || 0;
    return Math.max(0, roundMoney(total - paid));
  }, [order]);

  const initialReference = receipt?.fileName ? `Comprobante ${receipt.fileName}` : '';
  const [paymentMethod, setPaymentMethod] = useState(METODOS_PAGO.TRANSFERENCIA);
  const [reference, setReference] = useState(initialReference);
  const [reviewObservations, setReviewObservations] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !receipt) return;

    const animationId = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(animationId);
  }, [isOpen, receipt]);

  if (!isOpen || !receipt) return null;

  const hasNoPendingBalance = pendingBalance <= 0;
  const canSubmit = !hasNoPendingBalance && Boolean(PAYMENT_METHOD_IDS[paymentMethod]);

  const handleClose = () => {
    if (isSubmitting) return;
    setVisible(false);
    setTimeout(() => onClose?.(), 200);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const payload = {
      status: 'Aprobado',
      idPaymentMethod: PAYMENT_METHOD_IDS[paymentMethod],
      reference: reference.trim() || `Comprobante pedido ${order?.numeroPedido || order?.id || ''}`.trim(),
    };

    if (reviewObservations.trim()) {
      payload.reviewObservations = reviewObservations.trim();
    }

    onConfirm?.(payload);
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-stretch justify-stretch bg-white transition-opacity sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <form
        onSubmit={handleSubmit}
        className={`flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl transition-all sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 bg-[#004D77] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
              <CheckCircle size={19} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white">Aprobar comprobante</h2>
              <p className="truncate text-xs font-medium text-blue-50">
                Pedido #{order?.numeroPedido || order?.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="shrink-0 rounded-full p-1 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:gap-5 sm:p-6 md:grid-cols-[220px_1fr]">
          <button
            type="button"
            onClick={() => receipt.imageUrl && setIsPreviewOpen(true)}
            className="group w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-left"
          >
            {receipt.imageUrl ? (
              <img
                src={receipt.imageUrl}
                alt={receipt.fileName || 'Comprobante de pago'}
                className="h-64 w-full object-cover transition group-hover:scale-[1.02] sm:h-56"
              />
            ) : (
              <div className="flex h-64 items-center justify-center sm:h-56">
                <ImageIcon className="h-8 w-8 text-gray-300" />
              </div>
            )}
            <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 py-2">
              <span className="truncate text-xs font-bold text-gray-600">
                {receipt.fileName || 'Ver comprobante'}
              </span>
              <ExternalLink size={14} className="shrink-0 text-[#004D77]" />
            </div>
          </button>

          <div className="space-y-4">
            <div className="rounded-lg border border-[#004D77]/20 bg-[#004D77]/5 p-3">
              <p className="text-xs font-semibold text-[#004D77]">
                Saldo pendiente: {formatCurrency(pendingBalance)}
              </p>
              <p className="mt-1 text-xs text-[#004D77]/80">
                Al aprobar, el sistema registrara automaticamente el saldo pendiente del pedido.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Metodo</label>
                <FormSelect
                  value={paymentMethod}
                  options={paymentMethodOptions}
                  onChange={setPaymentMethod}
                  icon={CreditCard}
                  disabled={isSubmitting}
                  placeholder="Metodo"
                  ariaLabel="Metodo de pago"
                  placement="bottom"
                />
              </div>
            </div>
            {hasNoPendingBalance && (
              <p className="text-xs font-semibold text-red-500">
                Este pedido no tiene saldo pendiente para aprobar.
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Referencia</label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="Numero o nombre de referencia"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Observacion interna</label>
              <textarea
                value={reviewObservations}
                onChange={(event) => setReviewObservations(event.target.value)}
                maxLength={255}
                rows={3}
                disabled={isSubmitting}
                placeholder="Ej: comprobante legible y pago completo"
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 disabled:bg-gray-100"
              />
              <p className="text-right text-[10px] font-semibold text-gray-400">
                {reviewObservations.length}/255
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse items-stretch gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Aprobar comprobante
          </button>
        </div>
      </form>

      {isPreviewOpen && receipt.imageUrl && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-[520px] rounded-2xl bg-white p-3 pt-12 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-4 sm:pt-14"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Cerrar comprobante"
            >
              <X size={18} />
            </button>
            <img
              src={receipt.imageUrl}
              alt={receipt.fileName || 'Comprobante de pago'}
              className="mx-auto max-h-[76vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovePaymentReceiptModal;
