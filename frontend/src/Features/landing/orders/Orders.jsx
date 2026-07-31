import { useEffect, useMemo, useState } from 'react';
import { Calendar, CreditCard, LoaderCircle, Package, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrdersService from '../../administrtivePanel/sales/orders/services/ordersService';
import useAuthenticatedClient from '../../shared/hooks/useAuthenticatedClient';
import ShopHero from '../shop/components/ShopHero';
import BgPedidos from '../../../assets/BgPedidos.png';
import {
  formatMoney,
  formatOrderDate,
  getOrderStatusClasses,
} from './helpers/customerOrderHelpers';
import { ORDER_FONT_FAMILY, injectOrderTypography } from './orderTypography';

const DETAIL_BATCH_SIZE = 3;
const DETAIL_RETRY_DELAY_MS = 250;

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const loadOrderDetail = async (order, clientId) => {
  if (order.productos?.length) return order;

  let latestOrder = order;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const detailedOrder = await OrdersService.findById(order.id);
      if (
        detailedOrder &&
        Number(detailedOrder.clienteId) === Number(clientId)
      ) {
        latestOrder = detailedOrder;
        if (detailedOrder.productos?.length) return detailedOrder;
      }
    } catch {
      // El listado puede llegar antes que sus relaciones. Se reintenta una vez.
    }

    if (attempt === 0) await wait(DETAIL_RETRY_DELAY_MS);
  }

  if (!latestOrder.productos?.length) {
    throw new Error(`No fue posible cargar los productos del pedido #${order.numeroPedido || order.id}.`);
  }

  return latestOrder;
};

const loadDetailedOrders = async (orders, clientId, isActive) => {
  const detailedOrders = [];

  for (let index = 0; index < orders.length; index += DETAIL_BATCH_SIZE) {
    if (!isActive()) return [];

    const batch = orders.slice(index, index + DETAIL_BATCH_SIZE);
    const batchDetails = await Promise.all(
      batch.map((order) => loadOrderDetail(order, clientId))
    );
    detailedOrders.push(...batchDetails);
  }

  return detailedOrders;
};

function Orders() {
  injectOrderTypography();
  const navigate = useNavigate();
  const {
    clientId,
    isAuthenticated,
    loading: authLoading,
  } = useAuthenticatedClient();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !clientId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let active = true;
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await OrdersService.list({ clientId });
        if (!active) return;

        const clientOrders = response.filter(
          (order) => Number(order.clienteId) === Number(clientId)
        );
        const detailedOrders = await loadDetailedOrders(
          clientOrders,
          clientId,
          () => active
        );

        if (!active) return;
        setOrders(
          detailedOrders.sort((a, b) => new Date(b.fechaPedido || 0) - new Date(a.fechaPedido || 0))
        );
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError?.response?.data?.message ??
          requestError?.message ??
          'No fue posible cargar tus pedidos.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, [authLoading, clientId, isAuthenticated]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        String(order.numeroPedido || order.id).toLowerCase().includes(query) ||
        order.productos.some((product) => product.nombre.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      const orderDate = new Date(order.fechaPedido);
      if (Number.isNaN(orderDate.getTime())) return !startDate && !endDate;
      if (startDate && orderDate < new Date(`${startDate}T00:00:00`)) return false;
      if (endDate && orderDate > new Date(`${endDate}T23:59:59`)) return false;
      return true;
    });
  }, [endDate, orders, search, startDate]);

  const renderContent = () => {
    if (authLoading || loading) {
      return (
        <div className="flex min-h-[55vh] items-center justify-center text-[#004D77]">
          <LoaderCircle className="animate-spin" size={32} />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <EmptyState
          title="Inicia sesión para ver tus pedidos"
          description="Tu historial de compras está asociado a tu cuenta."
          action="Iniciar sesión"
          onAction={() => navigate('/login', { state: { from: '/orders-l' } })}
        />
      );
    }

    if (!clientId) {
      return (
        <EmptyState
          title="Tu cuenta no tiene un cliente asociado"
          description="Contacta a un asesor para vincular tu perfil y consultar tus pedidos."
        />
      );
    }

    if (error) {
      return <EmptyState title="No pudimos cargar tus pedidos" description={error} />;
    }

    if (!filteredOrders.length) {
      return (
        <EmptyState
          title={orders.length ? 'No hay resultados para estos filtros' : 'Aún no tienes pedidos'}
          description={orders.length ? 'Prueba cambiando la búsqueda o las fechas.' : 'Cuando finalices una compra aparecerá aquí.'}
          action={orders.length ? 'Limpiar filtros' : 'Ir a la tienda'}
          onAction={() => {
            if (orders.length) {
              setSearch('');
              setStartDate('');
              setEndDate('');
            } else {
              navigate('/shop');
            }
          }}
        />
      );
    }

    return (
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const units = order.productos.reduce((sum, product) => sum + product.cantidad, 0);
          return (
            <article
              key={order.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-amber-50/60 px-5 py-3">
                <span className="text-sm font-extrabold text-slate-700">
                  {formatOrderDate(order.fechaPedido)}
                </span>
                <span className="text-xs font-bold tracking-wide text-slate-400">
                  Pedido No. {order.numeroPedido || order.id}
                </span>
              </header>

              <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-2xl bg-blue-50 text-[#004D77]">
                    {order.productos[0]?.image ? (
                      <img
                        src={order.productos[0].image}
                        alt={order.productos[0].nombre}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <Package size={28} />
                    )}
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase ${getOrderStatusClasses(order.estadoLogistico)}`}>
                      {order.estadoLogistico}
                    </span>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {units} {units === 1 ? 'unidad' : 'unidades'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  <p><strong className="text-slate-800">Entrega:</strong> {order.tipoEntrega === 'recoge' ? 'Recoger en tienda' : order.direccionEntrega}</p>
                  <p><strong className="text-slate-800">Productos:</strong> {order.productos.map((product) => product.nombre).join(', ')}</p>
                </div>

                <div className="min-w-48 rounded-2xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                    <CreditCard size={14} /> Estado de pago
                  </p>
                  <p className="mt-2 text-lg font-black text-[#004D77]">{formatMoney(order.total)}</p>
                  <p className={`text-xs font-bold ${order.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {order.saldoPendiente > 0
                      ? `Pendiente: ${formatMoney(order.saldoPendiente)}`
                      : 'Pago registrado'}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/orders-l/${order.id}`)}
                    className="mt-3 w-full rounded-full bg-[#004D77] px-4 py-2 text-xs font-black uppercase text-white"
                  >
                    Ver pedido
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
    <div className="min-h-screen bg-[#f6f9fc]" style={{ fontFamily: ORDER_FONT_FAMILY }}>
      <ShopHero image={BgPedidos} title="Pedidos" tag="Historial" subtitle="Revisa el estado de tus compras" />

      <main className="mx-auto max-w-[var(--store-content-max)] px-[var(--store-content-x)] py-8">
        <div className="mb-7 flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar pedido o producto"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <DateField value={startDate} onChange={setStartDate} label="Desde" />
          <DateField value={endDate} onChange={setEndDate} label="Hasta" />
          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
            {filteredOrders.length} pedidos
          </span>
          <button
            type="button"
            onClick={() => navigate('/returnsOnOrders')}
            className="rounded-full border-2 border-[#004D77] px-4 py-2 text-xs font-black uppercase text-[#004D77]"
          >
            Ver devoluciones
          </button>
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

export default Orders;
