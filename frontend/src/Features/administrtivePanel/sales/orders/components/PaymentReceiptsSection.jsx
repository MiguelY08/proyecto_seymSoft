import { CheckCircle, ExternalLink, Image as ImageIcon, XCircle } from 'lucide-react';

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
  if (!receipts.length) return null;

  const hasPending = receipts.some((receipt) => normalizeReceiptStatus(receipt.status) === 'pendiente');
  const sectionView = hasPending
    ? getReceiptStatusView('Pendiente')
    : getReceiptStatusView(receipts[0]?.status);

  return (
    <section className={`rounded-xl border ${sectionView.sectionClass} ${compact ? 'p-3' : 'p-5'}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${sectionView.iconClass}`}>
          <ImageIcon size={17} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Comprobantes de pago</h3>
          <p className="text-xs text-slate-600">
            Los comprobantes pendientes requieren revision antes de sumar al total pagado.
          </p>
        </div>
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
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
              <a
                href={receipt.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden"
              >
                <img
                  src={receipt.imageUrl}
                  alt={receipt.fileName || 'Comprobante de pago'}
                  className={`${compact ? 'h-28' : 'h-44'} w-full object-cover transition group-hover:scale-[1.02]`}
                />
              </a>
              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-700">
                      {receipt.fileName || 'Comprobante de transferencia'}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatDate(receipt.uploadedAt)}</p>
                  </div>
                  <ExternalLink size={14} className="shrink-0 text-[#004D77]" />
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
  );
}

export default PaymentReceiptsSection;
