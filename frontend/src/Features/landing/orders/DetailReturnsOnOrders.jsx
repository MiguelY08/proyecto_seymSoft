import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Banknote,
  Check,
  CheckCircle,
  ChevronLeft,
  Clock3,
  LoaderCircle,
  Package,
  RefreshCw,
  Send,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { useAlert } from '../../shared/alerts/useAlert';
import useAuthenticatedClient from '../../shared/hooks/useAuthenticatedClient';
import { getMySalesReturnById } from './salesReturnsService';
import {
  buildProductTracking,
  formatCurrency,
  formatReturnDate,
  getReturnSignature,
  getStatusClasses,
} from './salesReturnTracking';

const POLL_INTERVAL = 30000;

const TRACKING_ICONS = {
  registered: Package,
  shipping: Send,
  replacement: RefreshCw,
  refund: Banknote,
  credit: WalletCards,
  processing: Clock3,
  ready: CheckCircle,
};

const stepClasses = {
  completed: 'border-emerald-500 bg-emerald-100 text-emerald-700',
  active: 'border-[#004D77] bg-blue-100 text-[#004D77]',
  pending: 'border-slate-200 bg-slate-100 text-slate-400',
  cancelled: 'border-red-300 bg-red-100 text-red-600',
};

function DetailReturnsOnOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuthenticatedClient();
  const { showTimer } = useAlert();
  const [saleReturn, setSaleReturn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const previousSignature = useRef(null);

  const loadReturn = useCallback(async ({ silent = false } = {}) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      setError('');
      const data = await getMySalesReturnById(id);
      const signature = getReturnSignature(data);

      if (
        silent &&
        previousSignature.current &&
        previousSignature.current !== signature
      ) {
        void showTimer(
          data.status === 'Anulado' ? 'warning' : 'info',
          'Tu devolución fue actualizada',
          data.status === 'Anulado'
            ? `La devolución fue anulada. ${data.cancellationReason || ''}`.trim()
            : `El nuevo estado general es ${data.status}.`,
          7000
        );
      }

      previousSignature.current = signature;
      setSaleReturn(data);
    } catch (requestError) {
      if (!silent) {
        setError(
          requestError?.response?.data?.message ||
          requestError?.message ||
          'No fue posible cargar la devolución.'
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id, isAuthenticated, showTimer]);

  useEffect(() => {
    if (authLoading) return undefined;

    void loadReturn();
    const interval = window.setInterval(
      () => void loadReturn({ silent: true }),
      POLL_INTERVAL
    );

    return () => window.clearInterval(interval);
  }, [authLoading, loadReturn]);

  if (authLoading || loading) {
    return (
      <PageShell>
        <div className="flex min-h-96 items-center justify-center text-[#004D77]">
          <LoaderCircle className="animate-spin" size={36} />
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated || error || !saleReturn) {
    return (
      <PageShell>
        <div className="flex min-h-96 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <Package size={42} className="mb-4 text-[#004D77]" />
          <h2 className="text-xl font-black text-slate-800">
            {!isAuthenticated ? 'Inicia sesión para consultar la devolución' : 'Devolución no encontrada'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate(!isAuthenticated ? '/login' : '/returnsOnOrders')}
            className="mt-5 rounded-full bg-[#004D77] px-6 py-3 text-xs font-black uppercase text-white"
          >
            {!isAuthenticated ? 'Iniciar sesión' : 'Volver'}
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <button
        type="button"
        onClick={() => navigate('/returnsOnOrders')}
        className="mb-5 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600"
      >
        <ChevronLeft size={14} /> Volver a devoluciones
      </button>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-amber-50/60 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              {saleReturn.returnNumber || `Devolución No. ${saleReturn.id}`}
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-800">
              Seguimiento de devolución
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Creada el {formatReturnDate(saleReturn.createdAt)}
            </p>
          </div>
          <span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${getStatusClasses(saleReturn.status)}`}>
            {saleReturn.status}
          </span>
        </header>

        <div className="space-y-8 p-6">
          {saleReturn.status === 'Anulado' && (
            <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <XCircle className="shrink-0" size={22} />
              <div>
                <p className="font-black">Devolución anulada</p>
                <p className="mt-1 text-sm">
                  {saleReturn.cancellationReason || 'No se registró un motivo de anulación.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Factura" value={saleReturn.invoiceNumber || 'Sin número'} />
            <InfoCard label="Valor devuelto" value={formatCurrency(saleReturn.totalAmount)} />
            <InfoCard label="Última actualización" value={formatReturnDate(saleReturn.updatedAt)} />
          </div>

          {saleReturn.description && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-slate-400">Descripción</p>
              <p className="mt-2 text-sm text-slate-700">{saleReturn.description}</p>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-lg font-black text-slate-800">
              Seguimiento por producto
            </h2>

            <div className="space-y-5">
              {(saleReturn.details ?? []).map((detail) => (
                <ProductTracking key={detail.id} detail={detail} />
              ))}
            </div>
          </div>

          {!!saleReturn.evidences?.length && (
            <div>
              <h2 className="mb-4 text-lg font-black text-slate-800">Evidencias</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {saleReturn.evidences.map((evidence) => (
                  <a
                    key={evidence.id}
                    href={evidence.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={evidence.imageUrl}
                      alt={evidence.image_description || 'Evidencia de devolución'}
                      className="h-32 w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function ProductTracking({ detail }) {
  const tracking = buildProductTracking(detail);

  return (
    <article className="rounded-3xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 overflow-hidden items-center justify-center rounded-2xl bg-blue-50 text-[#004D77]">
            {detail.imageUrl ? (
              <img
                src={detail.imageUrl}
                alt={detail.productName}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Package size={26} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-black text-slate-800">{detail.productName}</h3>
            <p className="text-sm text-slate-500">
              {detail.quantity} und. · {formatCurrency(detail.unitPrice)} c/u
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${getStatusClasses(detail.status)}`}>
            {detail.status}
          </span>
          <p className="mt-2 text-sm font-black text-[#004D77]">{detail.method}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <p><strong>Motivo:</strong> {detail.reason || 'Sin motivo'}</p>
        <p><strong>Subtotal:</strong> {formatCurrency(detail.unitPrice * detail.quantity)}</p>
        {detail.description && (
          <p className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <strong>Descripción del motivo:</strong> {detail.description}
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{tracking.cancelled ? 'Proceso detenido' : 'Progreso'}</span>
          <span>{tracking.progress}%</span>
        </div>
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${tracking.cancelled ? 'bg-red-500' : 'bg-[#004D77]'}`}
            style={{ width: `${tracking.progress}%` }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tracking.steps.map((step) => {
            const Icon = tracking.cancelled
              ? XCircle
              : step.state === 'completed'
                ? Check
                : TRACKING_ICONS[step.key] || Clock3;

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${stepClasses[step.state]}`}>
                  <Icon size={19} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700">{step.label}</p>
                  <p className="text-[11px] text-slate-400">
                    {step.state === 'completed'
                      ? 'Completado'
                      : step.state === 'active'
                        ? 'Estado actual'
                        : step.state === 'cancelled'
                          ? 'Anulado'
                          : 'Pendiente'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-2 font-black text-slate-800">{value}</p>
    </div>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}

export default DetailReturnsOnOrders;
