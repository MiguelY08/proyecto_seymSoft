import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  LoaderCircle,
  Package,
  Search,
} from 'lucide-react';
import ShopHero from '../shop/components/ShopHero';
import BgPedidos from '../../../assets/BgPedidos.png';
import useAuthenticatedClient from '../../shared/hooks/useAuthenticatedClient';
import { useAlert } from '../../shared/alerts/useAlert';
import { getMySalesReturns } from './salesReturnsService';
import {
  formatCurrency,
  formatReturnDate,
  getReturnSignature,
  getStatusClasses,
} from './salesReturnTracking';

const POLL_INTERVAL = 30000;

function ReturnsOnOrders() {
  const navigate = useNavigate();
  const { clientId, isAuthenticated, loading: authLoading } = useAuthenticatedClient();
  const { showTimer } = useAlert();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const storageKey = clientId
    ? `landing_sales_return_updates_${clientId}`
    : null;

  const detectUpdates = useCallback((items) => {
    if (!storageKey) return;

    let previous = {};
    try {
      previous = JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      previous = {};
    }

    const next = Object.fromEntries(
      items.map((item) => [item.id, getReturnSignature(item)])
    );

    const changed = items.find(
      (item) => previous[item.id] && previous[item.id] !== next[item.id]
    );

    localStorage.setItem(storageKey, JSON.stringify(next));

    if (changed) {
      void showTimer(
        changed.status === 'Anulado' ? 'warning' : 'info',
        `Actualización en ${changed.returnNumber || `devolución #${changed.id}`}`,
        changed.status === 'Anulado'
          ? `La devolución fue anulada. ${changed.cancellationReason || ''}`.trim()
          : `El estado actual es ${changed.status}. Revisa el seguimiento para conocer el avance.`,
        7000
      );
    }
  }, [showTimer, storageKey]);

  const loadReturns = useCallback(async ({ silent = false } = {}) => {
    if (!isAuthenticated || !clientId) {
      setReturns([]);
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      setError('');
      const response = await getMySalesReturns();
      setReturns(response.data);
      detectUpdates(response.data);
    } catch (requestError) {
      if (!silent) {
        setError(
          requestError?.response?.data?.message ||
          requestError?.message ||
          'No fue posible cargar tus devoluciones.'
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clientId, detectUpdates, isAuthenticated]);

  useEffect(() => {
    if (authLoading) return undefined;

    void loadReturns();
    const interval = window.setInterval(
      () => void loadReturns({ silent: true }),
      POLL_INTERVAL
    );

    return () => window.clearInterval(interval);
  }, [authLoading, loadReturns]);

  const filteredReturns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return returns.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.returnNumber || item.id).toLowerCase().includes(query) ||
        String(item.invoiceNumber || '').toLowerCase().includes(query) ||
        (item.details ?? []).some((detail) =>
          String(detail.productName || '').toLowerCase().includes(query)
        );

      if (!matchesSearch) return false;

      const createdAt = new Date(item.createdAt);
      if (Number.isNaN(createdAt.getTime())) return !startDate && !endDate;
      if (startDate && createdAt < new Date(`${startDate}T00:00:00`)) return false;
      if (endDate && createdAt > new Date(`${endDate}T23:59:59`)) return false;
      return true;
    });
  }, [endDate, returns, search, startDate]);

  const renderContent = () => {
    if (authLoading || loading) {
      return (
        <div className="flex min-h-72 items-center justify-center text-[#004D77]">
          <LoaderCircle className="animate-spin" size={34} />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <EmptyState
          title="Inicia sesión para ver tus devoluciones"
          description="El seguimiento de devoluciones está asociado a tu cuenta."
          action="Iniciar sesión"
          onAction={() => navigate('/login', { state: { from: '/returnsOnOrders' } })}
        />
      );
    }

    if (error) {
      return (
        <EmptyState
          title="No pudimos cargar tus devoluciones"
          description={error}
          action="Reintentar"
          onAction={() => void loadReturns()}
        />
      );
    }

    if (!filteredReturns.length) {
      return (
        <EmptyState
          title={returns.length ? 'No hay resultados para estos filtros' : 'Aún no tienes devoluciones'}
          description={
            returns.length
              ? 'Prueba cambiando la búsqueda o las fechas.'
              : 'Cuando se registre una devolución aparecerá aquí automáticamente.'
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        {filteredReturns.map((item) => {
          const completed = (item.details ?? []).filter(
            (detail) => detail.status === 'Listo'
          ).length;

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-amber-50/60 px-5 py-3">
                <span className="text-sm font-extrabold text-slate-700">
                  {formatReturnDate(item.createdAt)}
                </span>
                <span className="text-xs font-bold tracking-wide text-slate-400">
                  {item.returnNumber || `Devolución No. ${item.id}`}
                </span>
              </header>

              <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-2xl bg-blue-50 text-[#004D77]">
                    {item.details?.[0]?.imageUrl ? (
                      <img
                        src={item.details[0].imageUrl}
                        alt={item.details[0].productName}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <Package size={28} />
                    )}
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase ${getStatusClasses(item.status)}`}>
                      {item.status}
                    </span>
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      {completed}/{item.details?.length || 0} productos listos
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    <strong className="text-slate-800">Factura:</strong>{' '}
                    {item.invoiceNumber || 'Sin número'}
                  </p>
                  <p>
                    <strong className="text-slate-800">Productos:</strong>{' '}
                    {(item.details ?? []).map((detail) => detail.productName).join(', ')}
                  </p>
                  <p>
                    <strong className="text-slate-800">Métodos:</strong>{' '}
                    {[...new Set((item.details ?? []).map((detail) => detail.method))]
                      .filter(Boolean)
                      .join(', ') || 'Sin método'}
                  </p>
                </div>

                <div className="min-w-48 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase text-slate-500">
                    Valor devuelto
                  </p>
                  <p className="mt-2 text-lg font-black text-[#004D77]">
                    {formatCurrency(item.totalAmount)}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/returns/${item.id}`)}
                    className="mt-3 w-full rounded-full bg-[#004D77] px-4 py-2 text-xs font-black uppercase text-white"
                  >
                    Ver seguimiento
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <ShopHero
        image={BgPedidos}
        title="Devoluciones"
        tag="Seguimiento"
        subtitle="Consulta el estado real de tus solicitudes"
      />

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-7 flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/orders-l')}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-600"
          >
            <ChevronLeft size={14} /> Volver
          </button>

          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar devolución, factura o producto"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <DateField value={startDate} onChange={setStartDate} label="Desde" />
          <DateField value={endDate} onChange={setEndDate} label="Hasta" />

          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
            {filteredReturns.length} devoluciones
          </span>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}

function DateField({ value, onChange, label }) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
      <Calendar size={14} className="text-slate-400" />
      <span className="sr-only">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-xs outline-none"
      />
    </label>
  );
}

function EmptyState({ title, description, action, onAction }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center">
      <Package size={38} className="mb-4 text-[#004D77]" />
      <h2 className="text-xl font-black text-slate-800">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-[#004D77] px-6 py-3 text-xs font-black uppercase text-white"
        >
          {action}
        </button>
      )}
    </div>
  );
}

export default ReturnsOnOrders;
