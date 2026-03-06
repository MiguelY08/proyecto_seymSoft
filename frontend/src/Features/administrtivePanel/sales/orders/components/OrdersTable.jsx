import React from 'react';
import { Info, SquarePen, XCircle } from 'lucide-react';

// ─── Función para resaltar coincidencias ──────────────────────────────────────
function highlight(text, term) {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.trim()})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">{part}</mark>
      : part
  );
}

function OrdersTable({ orders, onViewDetail, search = '', offset = 0 }) {
  
  const getEstadoBadge = (estado) => {
    const badges = {
      'Por aprobar': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Aprobado': 'bg-green-100 text-green-800 border-green-300',
      'Cancelado': 'bg-red-100 text-red-800 border-red-300'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-5xl">📦</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay pedidos</h3>
        <p className="text-gray-600">No se encontraron pedidos que coincidan con tu búsqueda</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">#</th>
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
            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
            
            return (
              <tr key={order.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className="px-3 py-1.5 text-center text-xs text-gray-500 font-medium whitespace-nowrap">
                  {offset + index + 1}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(order.numerosPedido, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">
                  {highlight(order.cliente.nombre, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(order.fecha, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap max-w-xs truncate">
                  {order.cliente.direccion === 'El cliente lo recoge' 
                    ? highlight('El cliente lo recoge', search)
                    : highlight(order.cliente.direccion, search)
                  }
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(`$${order.total.toLocaleString()}`, search)}
                </td>
                <td className="px-3 py-1.5 text-center whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getEstadoBadge(order.estado)}`}>
                    {highlight(order.estado, search)}
                  </span>
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <button
                      onClick={() => onViewDetail(order)}
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                      title="Información"
                    >
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Cancelar"
                    >
                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>
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