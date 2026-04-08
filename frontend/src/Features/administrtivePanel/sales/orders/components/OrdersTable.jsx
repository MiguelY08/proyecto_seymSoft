import React from 'react';
import { Info, SquarePen, XCircle, Package } from 'lucide-react';
import { highlight, EstadoBadgeTable, getPermisos } from '../helpers/ordersHelpers';

// ─── Empty State ─────────────────────────────────────────────────────────────
/**
 * EmptyState — Componente para estado vacío en la tabla.
 * Muestra mensaje diferente si hay búsqueda activa.
 *
 * @param {Object} props
 * @param {boolean} props.isSearching - Si hay una búsqueda activa.
 */
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
/**
 * OrdersTable — Tabla principal de pedidos con acciones.
 * Incluye resaltado de búsqueda, badges de estado y botones de acción.
 * Maneja estado vacío y paginación externa.
 *
 * @param {Object} props
 * @param {Array} props.orders - Pedidos a mostrar en la página actual.
 * @param {Function} props.onViewDetail - Callback para ver detalle.
 * @param {Function} props.onEdit - Callback para editar.
 * @param {Function} props.onCancel - Callback para cancelar.
 * @param {string} props.search - Término de búsqueda actual.
 * @param {number} props.offset - Offset para numeración.
 * @param {number} props.totalOrders - Total de pedidos (para determinar si hay búsqueda).
 */
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
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Estado del pedido</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Funciones</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => {
            const rowBg              = index % 2 === 0 ? 'bg-gray-100 hover:bg-blue-50' : 'bg-white hover:bg-blue-50';
            const { deshabilitado }  = getPermisos(order.estado);
            const direccionMostrar   = order.direccionEntrega || order.cliente?.direccion || '';

            return (
              <tr key={order.id} className={`transition-colors duration-150 ${rowBg}`}>

                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap font-mono">
                  {highlight(order.numerosPedido, search)}
                </td>

                <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">
                  {highlight(order.cliente.nombre, search)}
                </td>

                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(order.fecha, search)}
                </td>

                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap max-w-xs truncate">
                  {highlight(direccionMostrar, search)}
                </td>

                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(`$${order.total.toLocaleString()}`, search)}
                </td>

                <td className="px-3 py-1.5 text-center whitespace-nowrap">
                  <EstadoBadgeTable estado={order.estado} term={search} />
                </td>

                <td className="px-3 py-1.5">
                  <div className="flex items-center justify-center gap-1.5">

                    {/* Ver detalle */}
                    <button
                      onClick={() => onViewDetail(order)}
                      className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                      title="Información"
                    >
                      <Info className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {/* Editar */}
                    {deshabilitado ? (
                      <span
                        className="text-gray-200 cursor-not-allowed"
                        title="No disponible para pedidos cancelados"
                      >
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

                    {/* Cancelar */}
                    {deshabilitado ? (
                      <span
                        className="text-gray-200 cursor-not-allowed"
                        title="No disponible para pedidos cancelados"
                      >
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