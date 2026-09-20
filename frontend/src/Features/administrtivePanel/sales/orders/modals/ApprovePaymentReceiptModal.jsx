import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  X,
  XCircle,
} from 'lucide-react';
import { METODOS_PAGO, PAYMENT_METHOD_IDS } from '../services/ordersService';
import useBodyScrollLock from '../../../../shared/hooks/useBodyScrollLock';

const roundMoney = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

const formatAmountInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? new Intl.NumberFormat('es-CO').format(Number(digits)) : '';
};

const parseAmountInput = (value) =>
  Number(String(value ?? '').replace(/\D/g, '')) || 0;

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const MIN_ANALYSIS_CONFIDENCE = 0.55;

const formatConfidence = (value) => {
  const confidence = Number(value);
  return Number.isFinite(confidence) ? `${Math.round(confidence * 100)}%` : 'No disponible';
};

function ApprovePaymentReceiptModal({
  order,
  receipt,
  isOpen = false,
  isSubmitting = false,
  onClose,
  onConfirm,
  onReject,
}) {
  const [visible, setVisible] = useState(false);
  const [reviewMode, setReviewMode] = useState('approve');
  useBodyScrollLock(isOpen && Boolean(receipt));
  const pendingBalance = useMemo(() => {
    const explicitBalance = Number(order?.saldoPendiente);
    if (Number.isFinite(explicitBalance)) return Math.max(0, roundMoney(explicitBalance));

    const total = Number(order?.total) || 0;
    const paid = Number(order?.totalPagado) || 0;
    return Math.max(0, roundMoney(total - paid));
  }, [order]);

  const initialReference = receipt?.fileName ? `Comprobante ${receipt.fileName}` : '';
  const analysis = receipt?.analysis ?? {};
  const hasReliableAmount =
    Number.isFinite(Number(analysis.amount)) &&
    Number(analysis.amount) > 0 &&
    Number(analysis.confidence) >= MIN_ANALYSIS_CONFIDENCE;
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState(initialReference);
  const [reviewObservations, setReviewObservations] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !receipt) return;

    const animationId = requestAnimationFrame(() => {
      setAmount(
        hasReliableAmount
          ? formatAmountInput(analysis.amount)
          : ''
      );
      setReference(
        analysis.transactionReference ||
        (receipt.fileName ? `Comprobante ${receipt.fileName}` : '')
      );
      setReviewObservations('');
      setReviewMode('approve');
      setVisible(true);
    });
    return () => cancelAnimationFrame(animationId);
  }, [analysis.amount, analysis.transactionReference, hasReliableAmount, isOpen, receipt]);

  if (!isOpen || !receipt) return null;

  const hasNoPendingBalance = pendingBalance <= 0;
  const numericAmount = parseAmountInput(amount);
  const hasValidAmount =
    Number.isFinite(numericAmount) && numericAmount > 0 && numericAmount <= pendingBalance;
  const exceedsPendingBalance = Number.isFinite(numericAmount) && numericAmount > pendingBalance;
  const pendingBalanceAfterApproval = hasValidAmount
    ? Math.max(0, roundMoney(pendingBalance - roundMoney(numericAmount)))
    : pendingBalance;
  const canSubmit = !hasNoPendingBalance && hasValidAmount;
  const rejectionObservationLength = reviewObservations.trim().length;
  const canReject = rejectionObservationLength >= 10;

  const handleClose = () => {
    if (isSubmitting) return;
    setVisible(false);
    setTimeout(() => onClose?.(), 200);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (reviewMode === 'reject') {
      if (!canReject) return;
      onReject?.({
        status: 'Rechazado',
        reviewObservations: reviewObservations.trim(),
      });
      return;
    }
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
              <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">
                {reviewMode === 'approve' ? 'Revisar comprobante' : 'Rechazar comprobante'}
              </h2>
              <p className="mt-0.5 truncate text-xs text-white/60">Pedido #{order?.numeroPedido || order?.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Cerrar revisión de comprobante"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={20} />
          </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:gap-5 sm:p-6 md:grid-cols-[250px_1fr]">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => receipt.imageUrl && setIsPreviewOpen(true)}
              className="group block w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-left"
            >
              {receipt.imageUrl ? (
                <img
                  src={receipt.imageUrl}
                  alt={receipt.fileName || 'Comprobante de pago'}
                  className="h-44 w-full object-contain transition group-hover:scale-[1.02] sm:h-40"
                />
              ) : (
                <div className="flex h-44 items-center justify-center sm:h-40">
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

            <div className={`rounded-lg border p-3 ${
              hasReliableAmount
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-amber-200 bg-amber-50'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-[11px] font-bold leading-tight ${
                    hasReliableAmount ? 'text-emerald-800' : 'text-amber-800'
                  }`}>
                    {hasReliableAmount ? 'Monto sugerido' : 'Verificación manual requerida'}
                  </p>
                  <p className="mt-1 text-base font-black text-slate-800">
                    {analysis.amount ? formatCurrency(analysis.amount) : 'No identificado'}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black ${
                  hasReliableAmount
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {formatConfidence(analysis.confidence)}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-[10px] text-slate-600">
                {analysis.bank && <p>Entidad: <strong>{analysis.bank}</strong></p>}
                {analysis.transactionReference && (
                  <p>Referencia: <strong>{analysis.transactionReference}</strong></p>
                )}
                {analysis.transactionDate && (
                  <p>Fecha: <strong>{analysis.transactionDate}</strong></p>
                )}
                {analysis.statusText && (
                  <p>Estado: <strong>{analysis.statusText}</strong></p>
                )}
              </div>
              {analysis.warnings?.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-3 text-[10px] font-semibold text-amber-800">
                  {analysis.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                </ul>
              )}
              <p className="mt-2 text-[9px] font-semibold leading-snug text-slate-500">
                Confirma estos datos con la imagen antes de tomar una decisión.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-[#004D77]/20 bg-[#004D77]/5 p-3">
              <p className="text-xs font-semibold text-[#004D77]">
                Saldo pendiente actual: {formatCurrency(pendingBalance)}
              </p>
              {hasValidAmount ? (
                <p className="mt-1 text-xs font-semibold text-[#004D77]/80">
                  Después de aprobar este abono, el saldo pendiente será: {formatCurrency(pendingBalanceAfterApproval)}.
                </p>
              ) : (
                <p className="mt-1 text-xs text-[#004D77]/80">
                  El abono se registrará en el historial de pagos del pedido.
                </p>
              )}
            </div>

            {reviewMode === 'approve' ? <div className="grid gap-4 sm:grid-cols-2">
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
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(formatAmountInput(event.target.value))}
                  disabled={isSubmitting || hasNoPendingBalance}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 disabled:bg-gray-100"
                  required
                />
              </div>
            </div> : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">El cliente verá este motivo.</p>
                    <p className="mt-1 text-xs text-amber-700">
                      Explica claramente por qué debe enviar un nuevo comprobante.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {reviewMode === 'approve' && exceedsPendingBalance && (
              <p className="text-xs font-semibold text-red-500">
                El monto no puede superar el saldo pendiente de {formatCurrency(pendingBalance)}.
              </p>
            )}
            {reviewMode === 'approve' && hasNoPendingBalance && (
              <p className="text-xs font-semibold text-red-500">
                Este pedido no tiene saldo pendiente para aprobar.
              </p>
            )}

            {reviewMode === 'approve' && <div className="flex flex-col gap-1.5">
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
            </div>}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                {reviewMode === 'reject' ? 'Motivo del rechazo' : 'Observación interna'}
              </label>
              <textarea
                value={reviewObservations}
                onChange={(event) => setReviewObservations(event.target.value)}
                maxLength={255}
                rows={3}
                disabled={isSubmitting}
                placeholder={reviewMode === 'reject'
                  ? 'Ej: el monto no coincide con el saldo pendiente.'
                  : 'Ej: comprobante legible y pago completo'}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 disabled:bg-gray-100"
              />
              <p className="text-right text-[10px] font-semibold text-gray-400">
                {reviewObservations.length}/255
              </p>
              {reviewMode === 'reject' && (
                <p className={`text-xs font-semibold ${
                  rejectionObservationLength < 10 ? 'text-red-500' : 'text-gray-400'
                }`}>
                  Mínimo 10 caracteres.
                </p>
              )}
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
            type="button"
            onClick={() => {
              if (reviewMode === 'reject') {
                setReviewMode('approve');
                return;
              }
              handleSubmit({ preventDefault: () => {} });
            }}
            disabled={isSubmitting || (reviewMode === 'approve' && !canSubmit)}
            className="order-1 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting && reviewMode === 'approve'
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <CheckCircle className="h-4 w-4" />}
            {reviewMode === 'approve' ? 'Aprobar comprobante' : 'Volver a aprobar'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (reviewMode === 'approve') {
                setReviewMode('reject');
                return;
              }
              handleSubmit({ preventDefault: () => {} });
            }}
            disabled={isSubmitting || (reviewMode === 'reject' && !canReject)}
            className="order-1 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting && reviewMode === 'reject'
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <XCircle className="h-4 w-4" />}
            {reviewMode === 'reject' ? 'Rechazar comprobante' : 'Rechazar'}
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
