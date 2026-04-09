// src/features/orders/components/OrdersTable.jsx
import React from 'react';
import { Info, SquarePen, XCircle, Package } from 'lucide-react';
import {
  highlight,
  EstadoLogisticoBadgeTable,
  EstadoPagoBadgeTable,
  getPermisos
} from '../helpers/ordersHelpers';

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
function OrdersTable({ orders, onViewDetail, onEdit, onCancel, search = '', offset = 0, totalOrders = 0 }) {
  const isSearching = totalOrders > 0 && search.trim().length > 0;

  if (orders.length === 0) {
    return <EmptyState isSearching={isSearching} />;
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">N° Pedido</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Cliente</th>
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
            const rowBg = index % 2 === 0 ? 'bg-gray-100 hover:bg-blue-50' : 'bg-white hover:bg-blue-50';
            // Llamada corregida con dos parámetros
            const { deshabilitado } = getPermisos(order.estadoLogistico, order.pagoEstado);
            const direccionMostrar = order.direccionEntrega || '';
            const clienteMostrar = order.clienteNombre || 'Cliente no especificado';

            // Mensaje de tooltip según la razón del deshabilitado
            let disabledTitle = '';
            if (order.estadoLogistico === 'cancelado') {
              disabledTitle = 'No disponible para pedidos cancelados';
            } else if (order.estadoLogistico === 'listo' && order.pagoEstado === 'pagado') {
              disabledTitle = 'No disponible para pedidos listos y pagados';
            } else {
              disabledTitle = 'No disponible';
            }

            return (
              <tr key={order.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap font-mono">
                  {highlight(order.numeroPedido || String(order.id), search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">
                  {highlight(clienteMostrar, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(order.fechaPedido ? new Date(order.fechaPedido).toLocaleDateString('es-CO') : '', search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap max-w-xs truncate">
                  {highlight(direccionMostrar, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(`$${order.total.toLocaleString()}`, search)}
                </td>
                <td className="px-3 py-1.5 text-center whitespace-nowrap">
                  <EstadoLogisticoBadgeTable estado={order.estadoLogistico} term={search} />
                </td>
                <td className="px-3 py-1.5 text-center whitespace-nowrap">
                  <EstadoPagoBadgeTable estado={order.pagoEstado} term={search} />
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onViewDetail(order)}
                      className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                      title="Información"
                    >
                      <Info className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {deshabilitado ? (
                      <span className="text-gray-200 cursor-not-allowed" title={disabledTitle}>
                        <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        onClick={() => onEdit(order)}
                        className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                        title="Editar pedido"
                      >
                        <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}

                    {deshabilitado ? (
                      <span className="text-gray-200 cursor-not-allowed" title={disabledTitle}>
                        <XCircle className="w-4 h-4" strokeWidth={1.5} />
                      </span>
                    ) : (
                      <button
                        onClick={() => onCancel(order)}
                        className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                        title="Cancelar pedido"
                      >
                        <XCircle className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
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