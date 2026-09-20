import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, FileText, Image as ImageIcon, Search, X } from 'lucide-react';

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
  onView,
  reviewingReceiptId = null,
  listView = false,
}) {
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [showAllReceipts, setShowAllReceipts] = useState(false);

  if (!receipts.length) return null;

  const receiptDisplayLimit = 4;
  const hasMoreReceipts = receipts.length > receiptDisplayLimit;
  const visibleReceipts = showAllReceipts
    ? receipts
    : receipts.slice(0, receiptDisplayLimit);
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
              Los comprobantes pendientes requieren revisión antes de registrar el pago pendiente.
            </p>
          </div>
        </div>

        <div className={listView ? 'space-y-2' : `grid grid-cols-1 gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {visibleReceipts.map((receipt) => {
            const statusView = getReceiptStatusView(receipt.status);
            const reviewedAt = formatDate(receipt.reviewedAt);
            const isPending = normalizeReceiptStatus(receipt.status) === 'pendiente';
            const showActions = isPending && (onApprove || onReject);
            const isReviewing = reviewingReceiptId === receipt.id;

            return (
              <article
                key={receipt.id}
                className={listView
                  ? `flex min-w-0 max-w-full flex-col gap-3 overflow-hidden rounded-lg border ${statusView.borderClass} bg-white p-3 sm:flex-row sm:items-center sm:justify-between`
                  : `group overflow-hidden rounded-xl border ${statusView.borderClass} bg-white shadow-sm`}
              >
                {!listView && (
                  <button
                    type="button"
                    onClick={() => setPreviewReceipt(receipt)}
                    className="block w-full overflow-hidden text-left"
                    aria-label="Ver comprobante"
                  >
                    <img
                      src={receipt.imageUrl}
                      alt={receipt.fileName || 'Comprobante de pago'}
                      loading="lazy"
                      className={`${compact ? 'h-28 sm:h-24' : 'h-32'} w-full object-cover transition group-hover:scale-[1.02]`}
                    />
                  </button>
                )}
                <div className={listView ? 'flex min-w-0 max-w-full flex-1 items-start gap-3' : 'space-y-2 p-3'}>
                  {listView && (
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${statusView.iconClass}`}>
                      <FileText size={17} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="min-w-0">
                      <p className="max-w-full truncate text-xs font-bold text-slate-700" title={receipt.fileName || 'Comprobante de transferencia'}>
                        {receipt.fileName || 'Comprobante de transferencia'}
                      </p>
                      <p className="hidden text-[10px] text-slate-400 sm:block">{formatDate(receipt.uploadedAt)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex max-w-full shrink-0 truncate rounded-full px-2 py-1 text-[10px] font-black uppercase ${statusView.badgeClass}`}>
                    {statusView.label}
                  </span>
                  {reviewedAt && (
                    <p className="hidden text-[10px] font-semibold text-slate-500 sm:block">
                      Revisado: {reviewedAt}
                    </p>
                  )}
                  {receipt.reviewObservations && (
                    <p className={`hidden rounded-lg p-2 text-[10px] font-semibold leading-snug sm:block ${
                      normalizeReceiptStatus(receipt.status) === 'rechazado'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-slate-50 text-slate-600'
                    }`}>
                      {receipt.reviewObservations}
                    </p>
                  )}
                  {showActions && !listView && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => onApprove?.(receipt)}
                        disabled={isReviewing || !onApprove}
                        className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#004D77] px-2 py-2 text-[10px] font-black uppercase text-white transition hover:bg-[#003b5c] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Search size={13} />
                        Ver y revisar
                      </button>
                    </div>
                  )}
                </div>
                {listView && (showActions || onView) && (
                  <div className="w-full min-w-0 shrink-0 sm:w-40">
                    <button
                      type="button"
                      onClick={() => (isPending && onApprove ? onApprove(receipt) : onView?.(receipt))}
                      disabled={isReviewing || (isPending ? !onApprove && !onView : !onView)}
                      className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#004D77] px-3 py-2 text-[10px] font-black uppercase text-white transition hover:bg-[#003b5c] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPending && onApprove ? <Search size={13} /> : <Eye size={13} />}
                      <span className="sm:hidden">Ver</span>
                      <span className="hidden sm:inline">
                        {isPending && onApprove ? 'Ver y revisar' : 'Ver comprobante'}
                      </span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {hasMoreReceipts && (
          <button
            type="button"
            onClick={() => setShowAllReceipts((current) => !current)}
            className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase text-[#004D77] transition hover:border-[#004D77] hover:bg-slate-50"
          >
            {showAllReceipts ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {showAllReceipts ? 'Ver menos' : `Ver más (${receipts.length - receiptDisplayLimit})`}
          </button>
        )}
      </section>

      {!listView && previewReceipt && (
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
