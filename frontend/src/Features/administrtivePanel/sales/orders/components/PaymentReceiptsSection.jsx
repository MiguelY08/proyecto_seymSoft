import { useState } from 'react';
import { CheckCircle, ExternalLink, Image as ImageIcon, X, XCircle } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('es-CO');
};

const normalizeReceiptStatus = (status) => String(status || 'Pendiente').trim().toLowerCase();

const getReceiptStatusView = (status) => {
  const normalized = normalizeReceiptStatus(status);

  if (normalized === 'aprobado') {
    return {
      label: 'Aprobado',
      badgeClass: 'bg-green-100 text-green-700',
      borderClass: 'border-green-200',
      sectionClass: 'border-green-200 bg-green-50/50',
      iconClass: 'bg-green-100 text-green-700',
    };
  }

  if (normalized === 'rechazado') {
    return {
      label: 'Rechazado',
      badgeClass: 'bg-red-100 text-red-700',
      borderClass: 'border-red-200',
      sectionClass: 'border-red-200 bg-red-50/50',
      iconClass: 'bg-red-100 text-red-700',
    };
  }

  return {
    label: 'Pendiente',
    badgeClass: 'bg-amber-100 text-amber-700',
    borderClass: 'border-amber-200',
    sectionClass: 'border-amber-200 bg-amber-50/50',
    iconClass: 'bg-amber-100 text-amber-700',
  };
};

function PaymentReceiptsSection({
  receipts = [],
  compact = false,
  onApprove,
  onReject,
  reviewingReceiptId = null,
}) {
  const [previewReceipt, setPreviewReceipt] = useState(null);

  if (!receipts.length) return null;

  const hasPending = receipts.some((receipt) => normalizeReceiptStatus(receipt.status) === 'pendiente');
  const sectionView = hasPending
    ? getReceiptStatusView('Pendiente')
    : getReceiptStatusView(receipts[0]?.status);

  return (
    <>
      <section className={`rounded-xl border ${sectionView.sectionClass} ${compact ? 'p-3' : 'p-5'}`}>
        <div className="mb-3 flex items-center gap-2">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${sectionView.iconClass}`}>
            <ImageIcon size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Comprobantes de pago</h3>
            <p className="text-xs text-slate-600">
              Los comprobantes pendientes requieren revision antes de registrar el pago pendiente.
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {receipts.map((receipt) => {
            const statusView = getReceiptStatusView(receipt.status);
            const reviewedAt = formatDate(receipt.reviewedAt);
            const isPending = normalizeReceiptStatus(receipt.status) === 'pendiente';
            const showActions = isPending && (onApprove || onReject);
            const isReviewing = reviewingReceiptId === receipt.id;

            return (
              <article
                key={receipt.id}
                className={`group overflow-hidden rounded-xl border ${statusView.borderClass} bg-white shadow-sm`}
              >
                <button
                  type="button"
                  onClick={() => setPreviewReceipt(receipt)}
                  className="block w-full overflow-hidden text-left"
                  aria-label="Ver comprobante"
                >
                  <img
                    src={receipt.imageUrl}
                    alt={receipt.fileName || 'Comprobante de pago'}
                    className={`${compact ? 'h-44 sm:h-28' : 'h-44'} w-full object-cover transition group-hover:scale-[1.02]`}
                  />
                </button>
                <div className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-700">
                        {receipt.fileName || 'Comprobante de transferencia'}
                      </p>
                      <p className="text-[10px] text-slate-400">{formatDate(receipt.uploadedAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewReceipt(receipt)}
                      className="shrink-0 rounded-md p-1 text-[#004D77] transition hover:bg-[#004D77]/10"
                      aria-label="Ampliar comprobante"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase ${statusView.badgeClass}`}>
                    {statusView.label}
                  </span>
                  {reviewedAt && (
                    <p className="text-[10px] font-semibold text-slate-500">
                      Revisado: {reviewedAt}
                    </p>
                  )}
                  {receipt.reviewObservations && (
                    <p className={`rounded-lg p-2 text-[10px] font-semibold leading-snug ${
                      normalizeReceiptStatus(receipt.status) === 'rechazado'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-slate-50 text-slate-600'
                    }`}>
                      {receipt.reviewObservations}
                    </p>
                  )}
                  {showActions && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onApprove?.(receipt)}
                        disabled={isReviewing || !onApprove}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 px-2 py-2 text-[10px] font-black uppercase text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle size={13} />
                        Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject?.(receipt)}
                        disabled={isReviewing || !onReject}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-500 px-2 py-2 text-[10px] font-black uppercase text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {previewReceipt && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5"
          onClick={() => setPreviewReceipt(null)}
        >
          <div
            className="relative w-full max-w-[520px] rounded-2xl bg-white p-3 pt-12 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-4 sm:pt-14"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewReceipt(null)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Cerrar comprobante"
            >
              <X size={18} />
            </button>
            <img
              src={previewReceipt.imageUrl}
              alt={previewReceipt.fileName || 'Comprobante de pago'}
              className="mx-auto max-h-[76vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentReceiptsSection;
