// src/features/orders/components/OrdersTable.jsx
import React from 'react';
import { Info, SquarePen, XCircle, Package } from 'lucide-react';
import {
  highlight,
  EstadoLogisticoBadgeTable,
  EstadoPagoBadgeTable,
  getPermisos
} from '../helpers/ordersHelpers';
import { ESTADOS_LOGISTICOS, PaymentService } from '../services/ordersService';
import OrderPaymentHover from './OrderPaymentHover';
import Permission from '../../../configuration/roles/components/Permission';

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ isSearching }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <Package className="w-10 h-10 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      {isSearching ? (
        <>
          <p className="text-base font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Ningún pedido coincide con la búsqueda. Intenta con otro término.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-gray-500">No hay pedidos registrados</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Aún no se han registrado pedidos en el sistema. Crea el primero para comenzar.
          </p>
        </>
      )}
    </div>
  );
}

// ─── OrdersTable ─────────────────────────────────────────────────────────────
function OrdersTable({ orders, onViewDetail, onEdit, onCancel, search = '', totalOrders = 0 }) {
  const isSearching = totalOrders > 0 && search.trim().length > 0;
  const [paymentCache, setPaymentCache] = React.useState({});
  const [paymentHoverPositions, setPaymentHoverPositions] = React.useState({});

  const updatePaymentHoverPosition = React.useCallback((orderId, target) => {
    const rect = target.getBoundingClientRect();
    const tooltipWidth = 320;
    const margin = 12;
    const centeredLeft = rect.left + rect.width / 2;
    const minLeft = tooltipWidth / 2 + margin;
    const maxLeft = window.innerWidth - tooltipWidth / 2 - margin;

    setPaymentHoverPositions((prev) => ({
      ...prev,
      [orderId]: {
        left: Math.min(Math.max(centeredLeft, minLeft), maxLeft),
        top: rect.bottom + 8,
      },
    }));
  }, []);

  const loadPaymentsOnHover = React.useCallback(async (order) => {
    if (!order?.id) return;
    if (Array.isArray(order.pagos) && order.pagos.length > 0) return;

    const cacheItem = paymentCache[order.id];
    if (cacheItem?.loading || cacheItem?.loaded) return;

    setPaymentCache((prev) => ({
      ...prev,
      [order.id]: {
        payments: prev[order.id]?.payments || [],
        loading: true,
        loaded: false,
        error: null,
      },
    }));

    try {
      const payments = await PaymentService.getByPedidoId(order.id);
      setPaymentCache((prev) => ({
        ...prev,
        [order.id]: {
          payments,
          loading: false,
          loaded: true,
          error: null,
        },
      }));
    } catch (error) {
      setPaymentCache((prev) => ({
        ...prev,
        [order.id]: {
          payments: prev[order.id]?.payments || [],
          loading: false,
          loaded: false,
          error,
        },
      }));
    }
  }, [paymentCache]);

  if (orders.length === 0) {
    return <EmptyState isSearching={isSearching} />;
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-4 py-3 text-center text-sm font-semibold">N° Pedido</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Cliente</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Fecha</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Entrega</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Total</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Pago</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            const rowBg = index % 2 === 0 ? 'bg-gray-100 hover:bg-blue-50' : 'bg-white hover:bg-blue-50';
            // Llamada corregida con dos parámetros
            const { deshabilitado } = getPermisos(order.estadoLogistico, order.pagoEstado);
            const direccionMostrar = order.direccionEntrega || '';
            const clienteMostrar = order.clienteNombre || 'Cliente no especificado';
            const cachedPayments = paymentCache[order.id];
            const hoverPosition = paymentHoverPositions[order.id];

            // Mensaje de tooltip según la razón del deshabilitado
            let disabledTitle = '';
            if (order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) {
              disabledTitle = 'No disponible para pedidos cancelados';
            } else if (order.estadoLogistico === ESTADOS_LOGISTICOS.ENTREGADO) {
              disabledTitle = 'No disponible para pedidos entregados';
            } else {
              disabledTitle = 'No disponible';
            }

            return (
              <tr key={order.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap font-mono">
                  {highlight(order.numeroPedido || String(order.id), search)}
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-800 whitespace-nowrap">
                  {highlight(clienteMostrar, search)}
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlight(order.fechaPedido ? new Date(order.fechaPedido).toLocaleDateString('es-CO') : '', search)}
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap max-w-xs truncate">
                  {highlight(direccionMostrar, search)}
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap font-semibold">
                  {highlight(`$${order.total.toLocaleString()}`, search)}
                </td>
                <td className="px-4 py-2.5 text-center whitespace-nowrap">
                  <EstadoLogisticoBadgeTable estado={order.estadoLogistico} term={search} />
                </td>
                <td className="px-4 py-2.5 text-center whitespace-nowrap">
                  <div
                    className="group relative inline-flex justify-center"
                    onMouseEnter={(event) => {
                      updatePaymentHoverPosition(order.id, event.currentTarget);
                      loadPaymentsOnHover(order);
                    }}
                  >
                    <EstadoPagoBadgeTable estado={order.pagoEstado} term={search} />
                    <OrderPaymentHover
                      order={order}
                      payments={cachedPayments?.payments}
                      loading={cachedPayments?.loading}
                      error={cachedPayments?.error}
                      position={hoverPosition}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <Permission permission="pedidos.ver_informacion">
                    <button
                      onClick={() => onViewDetail(order)}
                      className="text-gray-400 hover:text-[#004D77] transition-colors duration-200 cursor-pointer"
                      title="Información"
                    >
                      <Info className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    </Permission>

                    <Permission permission="pedidos.editar">
                    {deshabilitado ? (
                      <span className="text-gray-200 cursor-not-allowed" title={disabledTitle}>
                        <SquarePen className="w-5 h-5" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        onClick={() => onEdit(order)}
                        className="text-gray-400 hover:text-[#004D77] transition-colors duration-200 cursor-pointer"
                        title="Editar pedido"
                      >
                        <SquarePen className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    )}
                    </Permission>

                    <Permission permission="pedidos.anular">
                    {deshabilitado ? (
                      <span className="text-gray-200 cursor-not-allowed" title={disabledTitle}>
                        <XCircle className="w-5 h-5" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        onClick={() => onCancel(order)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
                        title="Cancelar pedido"
                      >
                        <XCircle className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    )}
                    </Permission>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersTable;
