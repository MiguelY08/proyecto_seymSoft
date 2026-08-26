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
import { METODOS_PAGO, PAYMENT_METHOD_IDS } from '../services/ordersService';

const roundMoney = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

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
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState(initialReference);
  const [reviewObservations, setReviewObservations] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !receipt) return;

    setAmount('');
    setReference(receipt.fileName ? `Comprobante ${receipt.fileName}` : '');
    setReviewObservations('');
    const animationId = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(animationId);
  }, [isOpen, receipt]);

  if (!isOpen || !receipt) return null;

  const hasNoPendingBalance = pendingBalance <= 0;
  const numericAmount = Number(amount);
  const hasValidAmount =
    Number.isFinite(numericAmount) && numericAmount > 0 && numericAmount <= pendingBalance;
  const exceedsPendingBalance = Number.isFinite(numericAmount) && numericAmount > pendingBalance;
  const canSubmit = !hasNoPendingBalance && hasValidAmount;

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
      idPaymentMethod: PAYMENT_METHOD_IDS[METODOS_PAGO.TRANSFERENCIA],
      amount: roundMoney(numericAmount),
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
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
              <CheckCircle className="h-5 w-5 text-white" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">Aprobar comprobante</h2>
              <p className="mt-0.5 truncate text-xs text-white/60">Pedido #{order?.numeroPedido || order?.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Cerrar aprobación de comprobante"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={20} />
          </button>
          </div>
        </header>

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
                El abono se registrará en el historial de pagos del pedido.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Método de pago</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700">
                  <CreditCard className="h-4 w-4 text-[#004D77]" />
                  Transferencia
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700" htmlFor="receipt-payment-amount">Monto a abonar</label>
                <input
                  id="receipt-payment-amount"
                  type="number"
                  min="0.01"
                  max={pendingBalance}
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled={isSubmitting || hasNoPendingBalance}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 disabled:bg-gray-100"
                  required
                />
              </div>
            </div>
            {exceedsPendingBalance && (
              <p className="text-xs font-semibold text-red-500">
                El monto no puede superar el saldo pendiente de {formatCurrency(pendingBalance)}.
              </p>
            )}
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
                  placeholder="Número o nombre de referencia"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Observación interna</label>
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

        <div className="flex shrink-0 flex-col items-stretch gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="order-2 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="order-1 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
