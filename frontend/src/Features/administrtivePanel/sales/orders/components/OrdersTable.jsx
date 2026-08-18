// src/features/orders/components/OrdersTable.jsx
import React from 'react';
import { AlertTriangle, Info, SquarePen, XCircle, Package } from 'lucide-react';
import {
  highlight,
  EstadoLogisticoBadgeTable,
  EstadoPagoBadgeTable,
  getPermisos
} from '../helpers/ordersHelpers';
import { calculateHoverPosition } from '../helpers/hoverPositionHelper';
import { ESTADOS_LOGISTICOS, ESTADOS_PAGO, PaymentService } from '../services/ordersService';
import OrderPaymentHover from './OrderPaymentHover';
import Permission from '../../../configuration/roles/components/Permission';
import { formatDeliveryAddress } from '../helpers/deliveryAddressHelper';

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ isSearching }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
      <div className="w-16 h-16 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <Package className="w-8 h-8 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      {isSearching ? (
        <>
          <p className="text-sm font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="text-xs text-gray-400 text-center max-w-xs">
            Ningún pedido coincide con la búsqueda. Intenta con otro término.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-500">No hay pedidos registrados</p>
          <p className="text-xs text-gray-400 text-center max-w-xs">
            Aún no se han registrado pedidos en el sistema. Crea el primero para comenzar.
          </p>
        </>
      )}
    </div>
  );
}

// ─── OrdersTable ─────────────────────────────────────────────────────────────
function getDeliveryText(order = {}) {
  const deliveryType = String(order.tipoEntrega ?? order.deliveryType ?? '').toLowerCase();

  if (deliveryType.includes('recoge') || deliveryType.includes('recibe')) {
    return 'Recoger en tienda';
  }

  return formatDeliveryAddress(order) || 'Sin dirección registrada';
}


function requiresShippingAmount(order = {}) {
  const origin = String(order.origen ?? order.origin ?? '').toLowerCase();
  const deliveryType = String(order.tipoEntrega ?? order.deliveryType ?? '').toLowerCase();
  const shippingAmount = Number(order.shippingAmount ?? 0);
  return origin === 'web' && deliveryType === 'domicilio' && shippingAmount <= 0;
}

function OrdersTable({
  orders,
  onViewDetail,
  onEdit,
  onCancel,
  search = '',
  totalOrders = 0,
  hasActiveFilters = false,
}) {
  const isSearching = hasActiveFilters || (totalOrders > 0 && search.trim().length > 0);
  const [paymentCache, setPaymentCache] = React.useState({});
  const [paymentHoverPositions, setPaymentHoverPositions] = React.useState({});

  const updateHoverPosition = React.useCallback(
    (setter, id, target) => {
      setter((prev) => ({
        ...prev,
        [id]: calculateHoverPosition(target),
      }));
    },
    []
  );

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
    <div className="min-w-0 w-full overflow-x-auto overscroll-x-contain rounded-xl [-webkit-overflow-scrolling:touch]">
      <table className="min-w-max w-full table-auto">
        <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-30 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">N° Pedido</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Recibe/Cliente</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Fecha</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Entrega</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Total</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Estado</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Pago</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            const needsShippingAmount = requiresShippingAmount(order);
            const rowBg = needsShippingAmount
              ? 'bg-amber-50 hover:bg-amber-100'
              : index % 2 === 0 ? 'bg-gray-100 hover:bg-blue-50' : 'bg-white hover:bg-blue-50';
            const stickyCellBg = needsShippingAmount
              ? 'bg-amber-50 group-hover:bg-amber-100'
              : index % 2 === 0
                ? 'bg-gray-100 group-hover:bg-blue-50'
                : 'bg-white group-hover:bg-blue-50';
            const { editarDeshabilitado, cancelarDeshabilitado } = getPermisos(
              order.estadoLogistico,
              order.pagoEstado
            );
            const entregaMostrar = getDeliveryText(order);
            const clienteMostrar =
              order.deliveryRecipientName ||
              order.clienteNombre ||
              'Cliente no especificado';
            const cachedPayments = paymentCache[order.id];
            const hoverPosition = paymentHoverPositions[order.id];

            let editDisabledTitle = '';
            if (order.estadoLogistico === ESTADOS_LOGISTICOS.ANULADO) {
              editDisabledTitle = 'No disponible para pedidos anulados';
            } else if (
              order.estadoLogistico === ESTADOS_LOGISTICOS.ENTREGADO &&
              order.pagoEstado === ESTADOS_PAGO.PAGADO
            ) {
              editDisabledTitle = 'No disponible para pedidos entregados y pagados';
            } else {
              editDisabledTitle = 'No disponible';
            }

            const cancelDisabledTitle = order.estadoLogistico === ESTADOS_LOGISTICOS.ANULADO
              ? 'No disponible para pedidos anulados'
              : 'No disponible para pedidos entregados';

            return (
              <tr key={order.id} className={`group transition-colors duration-150 ${rowBg}`}>
                <td className={`sticky left-0 z-10 px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap font-mono transition-colors duration-150 ${stickyCellBg}`}>
                  {highlight(order.numeroPedido || String(order.id), search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap">
                  {highlight(clienteMostrar, search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(order.fechaPedido ? new Date(order.fechaPedido).toLocaleDateString('es-CO') : '', search)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap max-w-xs truncate">
                  <div className="flex items-center justify-center gap-2" title={entregaMostrar || ""}>
                    <span className="truncate">{highlight(entregaMostrar, search)}</span>
                    {needsShippingAmount && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        <AlertTriangle className="h-3 w-3" strokeWidth={2} />
                  Envío pendiente
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap font-semibold">
                  {highlight(`$${order.total.toLocaleString()}`, search)}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <EstadoLogisticoBadgeTable estado={order.estadoLogistico} term={search} />
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <div
                    className="group/payment relative inline-flex justify-center"
                    onMouseEnter={(event) => {
                      updateHoverPosition(
                          setPaymentHoverPositions,
                          order.id,
                          event.currentTarget
                      );
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
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <Permission permission="pedidos.ver_informacion">
                    <button
                      onClick={() => onViewDetail(order)}
                      className="text-gray-400 hover:text-[#004D77] transition-colors duration-200 cursor-pointer"
                      title="Información"
                    >
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 hover:scale-110" strokeWidth={1.5} />
                    </button>
                    </Permission>

                    <Permission permission="pedidos.editar">
                    {editarDeshabilitado ? (
                      <span className="text-gray-200 cursor-not-allowed" title={editDisabledTitle}>
                        <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4 hover:scale-110" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        onClick={() => onEdit(order)}
                        className="text-gray-400 hover:text-[#004D77] transition-colors duration-200 cursor-pointer"
                        title="Editar pedido"
                      >
                        <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4 hover:scale-110" strokeWidth={1.5} />
                      </button>
                    )}
                    </Permission>

                    <Permission permission="pedidos.anular">
                    {cancelarDeshabilitado ? (
                      <span className="text-gray-200 cursor-not-allowed" title={cancelDisabledTitle}>
                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        onClick={() => onCancel(order)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
                        title="Cancelar pedido"
                      >
                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
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
