import React from 'react';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatCurrency = (value) =>
  currencyFormatter.format(toNumber(value));

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-CO');
};

const normalizeReceiptStatus = (status) => String(status || 'pendiente').trim().toLowerCase();

const getReceiptSummary = (order = {}) => {
  const receipts = Array.isArray(order.comprobantesPago) ? order.comprobantesPago : [];
  const summary = order.paymentReceiptSummary ?? {};

  if (summary.totalReceipts !== undefined) {
    return {
      totalReceipts: toNumber(summary.totalReceipts),
      pendingReceipts: toNumber(summary.pendingReceipts),
      approvedReceipts: toNumber(summary.approvedReceipts),
      rejectedReceipts: toNumber(summary.rejectedReceipts),
    };
  }

  const pendingReceipts = receipts.filter((receipt) => normalizeReceiptStatus(receipt.status) === 'pendiente').length;
  const approvedReceipts = receipts.filter((receipt) => normalizeReceiptStatus(receipt.status) === 'aprobado').length;
  const rejectedReceipts = receipts.filter((receipt) => normalizeReceiptStatus(receipt.status) === 'rechazado').length;

  return {
    totalReceipts: receipts.length,
    pendingReceipts,
    approvedReceipts,
    rejectedReceipts,
  };
};

const SummaryRow = ({ colorClass, label, value }) => (
  <div className="flex items-center justify-between gap-3 text-xs" style={{ color: '#f1f5f9' }}>
    <span className="inline-flex items-center gap-2 min-w-0">
      <span className={`h-2 w-2 rounded-full shrink-0 ${colorClass}`} />
      <span className="truncate">{label}</span>
    </span>
    <span className="font-semibold tabular-nums shrink-0" style={{ color: '#e2e8f0' }}>
      {formatCurrency(value)}
    </span>
  </div>
);

const TotalRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 text-xs" style={{ color: '#f1f5f9' }}>
    <span className="truncate">{label}</span>
    <span className="font-semibold tabular-nums shrink-0" style={{ color: '#e2e8f0' }}>
      {formatCurrency(value)}
    </span>
  </div>
);

const ReceiptCounter = ({ label, value, className }) => (
  <div className={`rounded-lg px-2 py-1.5 text-center ${className}`}>
    <p className="text-sm font-black leading-none">{value}</p>
    <p className="mt-0.5 text-[10px] font-semibold leading-none">{label}</p>
  </div>
);

const PaymentRow = ({ payment }) => (
  <div className="rounded-lg px-2 py-1.5" style={{ background: 'rgba(15, 23, 42, 0.72)' }}>
    <div className="flex items-center justify-between gap-3">
      <span className="truncate text-xs font-medium" style={{ color: '#f8fafc' }}>
        {payment.metodoPago || 'Metodo sin registrar'}
      </span>
      <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: '#93c5fd' }}>
        {formatCurrency(payment.monto)}
      </span>
    </div>
    <p className="mt-0.5 text-[11px]" style={{ color: '#94a3b8' }}>
      {formatDate(payment.fechaPago)}
    </p>
  </div>
);

const LoadingRows = () => (
  <div className="flex flex-col gap-1.5">
    {[0, 1].map((item) => (
      <div
        key={item}
        className="h-[42px] animate-pulse rounded-lg"
        style={{ background: 'rgba(148, 163, 184, 0.16)' }}
      />
    ))}
  </div>
);

function OrderPaymentHover({
  order,
  payments,
  loading = false,
  error = null,
  position = null,
  className = '',
}) {
  const paymentList = Array.isArray(payments)
    ? payments
    : Array.isArray(order?.pagos)
      ? order.pagos
      : [];
  const total = toNumber(order?.total);
  const paid = Number.isFinite(Number(order?.totalPagado))
    ? toNumber(order.totalPagado)
    : paymentList.reduce((sum, payment) => sum + toNumber(payment.monto), 0);
  const pending = Number.isFinite(Number(order?.saldoPendiente))
    ? Math.max(0, toNumber(order.saldoPendiente))
    : Math.max(0, total - paid);
  const isPaid = total > 0 && pending <= 0;
  const receiptSummary = getReceiptSummary(order);
  const hasReceipts = receiptSummary.totalReceipts > 0;
  const hasPendingReceipts = receiptSummary.pendingReceipts > 0;
  const hasRejectedReceipts = receiptSummary.rejectedReceipts > 0;

  const opensAbove = position?.placement === 'top';
  const positionStyle = position
    ? {
        left: `${position.left}px`,
        ...(opensAbove
          ? { bottom: `${position.bottom}px` }
          : { top: `${position.top}px` }),
        ...(position.maxHeight ? { maxHeight: `${position.maxHeight}px` } : {}),
      }
    : {};
  const verticalMotionClass = opensAbove
    ? '-translate-y-1 group-hover/payment:translate-y-0'
    : 'translate-y-1 group-hover/payment:translate-y-0';

  return (
    <div
      className={`pointer-events-none fixed z-[9999] min-w-[260px] max-w-[320px] -translate-x-1/2 ${verticalMotionClass} overflow-y-auto overscroll-contain rounded-xl p-3 opacity-0 shadow-2xl transition-all duration-150 group-hover/payment:opacity-100 ${className}`}
      style={{ background: '#1e293b', ...positionStyle }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
          Pagos del pedido
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isPaid ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200'
          }`}
        >
          {isPaid ? 'Completo' : 'Pendiente'}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 border-b border-slate-600/70 pb-2">
        <TotalRow label="Total del pedido" value={total} />
        <SummaryRow colorClass="bg-emerald-400" label="Total pagado" value={paid} />
        <SummaryRow colorClass="bg-amber-400" label="Pendiente" value={pending} />
      </div>

      {hasReceipts && (
        <div className="mt-2 border-b border-slate-600/70 pb-2">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
            Comprobantes
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <ReceiptCounter
              label="Pend."
              value={receiptSummary.pendingReceipts}
              className="bg-amber-400/15 text-amber-100"
            />
            <ReceiptCounter
              label="Aprob."
              value={receiptSummary.approvedReceipts}
              className="bg-emerald-400/15 text-emerald-100"
            />
            <ReceiptCounter
              label="Rech."
              value={receiptSummary.rejectedReceipts}
              className="bg-red-400/15 text-red-100"
            />
          </div>
          {(hasPendingReceipts || hasRejectedReceipts) && (
            <p
              className="mt-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium"
              style={{
                background: hasRejectedReceipts ? 'rgba(127, 29, 29, 0.28)' : 'rgba(120, 53, 15, 0.28)',
                color: hasRejectedReceipts ? '#fecaca' : '#fde68a',
              }}
            >
              {hasRejectedReceipts
                ? 'Hay comprobantes rechazados. Revisa el detalle del pedido.'
                : 'Hay comprobantes pendientes de validacion.'}
            </p>
          )}
        </div>
      )}

      <div className="mt-2">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
          Historial de pagos
        </p>

        {loading && <LoadingRows />}

        {!loading && error && (
          <div className="rounded-lg px-2 py-2" style={{ background: 'rgba(127, 29, 29, 0.28)' }}>
            <p className="text-xs font-medium" style={{ color: '#fecaca' }}>
              Historial no disponible
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: '#fca5a5' }}>
              Intenta de nuevo pasando el cursor más tarde.
            </p>
          </div>
        )}

        {!loading && !error && paymentList.length === 0 && (
          <div className="rounded-lg px-2 py-2" style={{ background: 'rgba(15, 23, 42, 0.72)' }}>
            <p className="text-xs italic" style={{ color: '#cbd5e1' }}>
              No hay pagos registrados.
            </p>
          </div>
        )}

        {!loading && !error && paymentList.length > 0 && (
          <div className="flex max-h-40 flex-col gap-1.5 overflow-hidden">
            {paymentList.map((payment, index) => (
              <PaymentRow key={payment.id ?? `${payment.fechaPago ?? 'payment'}-${index}`} payment={payment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderPaymentHover;
