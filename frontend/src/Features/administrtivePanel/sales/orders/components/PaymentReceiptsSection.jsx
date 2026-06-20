import { ExternalLink, Image as ImageIcon } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('es-CO');
};

function PaymentReceiptsSection({ receipts = [], compact = false }) {
  if (!receipts.length) return null;

  return (
    <section className={`rounded-xl border border-amber-200 bg-amber-50/50 ${compact ? 'p-3' : 'p-5'}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <ImageIcon size={17} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Comprobantes por verificar</h3>
          <p className="text-xs text-amber-700">
            Estas imágenes no suman al total pagado hasta que se registre el abono.
          </p>
        </div>
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {receipts.map((receipt) => (
          <a
            key={receipt.id}
            href={receipt.imageUrl}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm"
          >
            <img
              src={receipt.imageUrl}
              alt={receipt.fileName || 'Comprobante pendiente'}
              className={`${compact ? 'h-28' : 'h-44'} w-full object-cover transition group-hover:scale-[1.02]`}
            />
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-700">
                  {receipt.fileName || 'Comprobante de transferencia'}
                </p>
                <p className="text-[10px] text-slate-400">{formatDate(receipt.uploadedAt)}</p>
              </div>
              <ExternalLink size={14} className="shrink-0 text-[#004D77]" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default PaymentReceiptsSection;
