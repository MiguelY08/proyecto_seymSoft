import React from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, FileText, CreditCard, CheckCircle, XCircle, Edit, AlertTriangle } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { getEstadoColor } from '../helpers/ordersHelpers';

/**
 * DetailOrder — Modal para ver detalles completos de una orden.
 * Incluye información del cliente, productos, comprobante de pago y acciones (aprobar, rechazar, editar).
 * Solo muestra si isOpen es true y order existe.
 *
 * @param {Object} order - Orden a mostrar.
 * @param {boolean} isOpen - Si el modal está abierto.
 * @param {Function} onClose - Callback para cerrar el modal.
 * @param {Function} onEdit - Callback para editar la orden.
 * @param {Function} onCancel - Callback para cancelar la orden (abre modal CancelOrder).
 * @param {Function} onEstadoChange - Callback para cambiar estado (order, nuevoEstado).
 */
function DetailOrder({ order, isOpen, onClose, onEdit, onCancel, onEstadoChange }) {
  const { showConfirm, showSuccess } = useAlert();

  if (!isOpen || !order) return null;

  // ── Aprobar pedido ─────────────────────────────────────────────────────────
  /**
   * Aprueba el pedido cambiando su estado a "Aprobado".
   * Muestra confirmación antes de proceder.
   */
  const handleAprobar = async () => {
    const result = await showConfirm(
      'info',
      'Aprobar pedido',
      `¿Estás seguro de aprobar el pedido #${order.numerosPedido}?`,
      { confirmButtonText: 'Sí, aprobar', cancelButtonText: 'Cancelar' }
    );
    if (!result?.isConfirmed) return;
    onEstadoChange(order, 'Aprobado');
    showSuccess('Pedido aprobado', `El pedido #${order.numerosPedido} fue aprobado correctamente.`);
  };

  // ── Rechazar pedido ───────────────────────────────────────────────────────
  /**
   * Rechaza el pedido abriendo el modal de cancelación.
   * Cierra este modal para evitar conflictos.
   */
  const handleRechazar = () => {
    onCancel(order);
    onClose();
  };

  // ── Editar pedido ─────────────────────────────────────────────────────────
  /**
   * Abre el modal de edición para la orden.
   * Cierra este modal.
   */
  const handleEditClick = () => {
    onEdit(order);
    onClose();
  };

  const isCancelado    = order.estado === 'Cancelado';
  const showEditButton = !isCancelado;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn  { animation: fadeIn  0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 animate-slideUp">

        {/* Header */}
        <div className="bg-[#004D77] px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Pedido #{order.numerosPedido}</h2>
            <p className="text-blue-100 text-sm mt-0.5">Detalles del pedido</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">

          {/* Banner motivo de cancelación */}
          {isCancelado && (
            <div
              className="flex gap-2.5 items-start rounded-lg px-4 py-3 mb-5 text-xs"
              style={{ backgroundColor: '#fff1f2', border: '1px solid #fecaca' }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#b91c1c' }} strokeWidth={1.8} />
              <div>
                <p className="font-semibold mb-0.5 text-sm" style={{ color: '#b91c1c' }}>
                  Pedido cancelado
                </p>
                <p style={{ color: '#7f1d1d' }}>
                  {order.motivoCancelacion ?? 'Sin motivo registrado.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Columna izquierda — cliente */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#004D77] text-white p-5 rounded-xl">
                <h3 className="text-lg font-bold mb-4">Información del Cliente</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Nombre Completo</p>
                      <p className="font-semibold">{order.cliente.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Teléfono</p>
                      <p className="font-semibold">{order.cliente.telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Correo Electrónico</p>
                      <p className="font-semibold break-all">{order.cliente.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Dirección de Entrega</p>
                      <p className="font-semibold">{order.direccionEntrega || order.cliente.direccion}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-blue-200">Fecha</p>
                      <p className="font-semibold">{order.fecha}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    {/* Punto de color usando getEstadoColor de helpers */}
                    <div className={`w-5 h-5 rounded-full ${getEstadoColor(order.estado)} mt-0.5 shrink-0`} />
                    <div>
                      <p className="text-xs text-blue-200">Estado</p>
                      <p className="font-semibold">{order.estado}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="text-sm text-blue-200 mb-1">Total del Pedido</p>
                  <p className="text-3xl font-bold">${order.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Comprobante de pago */}
              {order.comprobantePago && (
                <div className="bg-linear-to-br from-blue-50 to-white border border-blue-200 p-5 rounded-xl">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#004D77]" />
                    Comprobante de Pago
                  </h3>
                  <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-6 h-6 text-[#004D77]" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{order.comprobantePago}</p>
                    <button className="text-xs text-[#004D77] hover:underline cursor-pointer">
                      Descargar archivo
                    </button>
                  </div>
                  {order.estado === 'Aprobado' && (
                    <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-semibold">Pago Confirmado</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Columna derecha — productos */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#004D77]" />
                  Productos del Pedido
                </h3>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left   text-xs font-semibold text-gray-700 uppercase">Producto</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Cant.</th>
                        <th className="px-4 py-3 text-right  text-xs font-semibold text-gray-700 uppercase">P. Unit.</th>
                        <th className="px-4 py-3 text-right  text-xs font-semibold text-gray-700 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.productos.map((producto, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900">{producto.nombre}</td>
                          <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">{producto.cantidad}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">${producto.precioUnitario.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-[#004D77]">${producto.subtotal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan="3" className="px-4 py-4 text-right text-sm font-bold text-gray-900">Total:</td>
                        <td className="px-4 py-4 text-right text-xl font-bold text-[#004D77]">
                          ${order.total.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Método de Pago</p>
                    <p className="font-semibold text-gray-900">{order.metodoPago}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Total de Productos</p>
                    <p className="font-semibold text-gray-900">{order.productos.length} artículo(s)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          {order.estado === 'Por aprobar' && (
            <>
              <button
                onClick={handleAprobar}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Aprobar Pedido
              </button>
              <button
                onClick={handleRechazar}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Rechazar Pedido
              </button>
            </>
          )}
          {showEditButton && (
            <button
              onClick={handleEditClick}
              className="px-4 py-2 bg-[#004D77] hover:bg-[#003b5c] text-white rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Editar Pedido
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailOrder;