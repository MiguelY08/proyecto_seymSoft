// src/features/orders/modals/DetailOrder.jsx
import React, { useEffect, useState } from 'react';
import {
  X, User, Phone, Mail, MapPin, Calendar, CreditCard,
  CheckCircle, XCircle, Edit, AlertTriangle, Tag, DollarSign, FileDown,
  Hash, UserCheck, Truck
} from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import {
  EstadoLogisticoBadgePill,
  EstadoPagoBadgePill,
  exportOrderToPDF
} from '../helpers/ordersHelpers';
import { PaymentService, ESTADOS_LOGISTICOS, ESTADOS_PAGO, ORIGENES } from '../services/ordersService';
import { UsersDB } from '../../../users/services/usersDB';

// ─── DetailRow ────────────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value, placeholder, highlight = false }) {
  const hasValue = value && String(value).trim() !== '';
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
        hasValue ? 'bg-[#004D77]/10' : 'bg-gray-100'
      }`}>
        <Icon className={`w-3.5 h-3.5 ${hasValue ? 'text-[#004D77]' : 'text-gray-300'}`} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
          {label}
        </span>
        <span className={`block text-sm font-medium truncate ${
          hasValue
            ? highlight ? 'text-[#004D77] font-semibold' : 'text-gray-800'
            : 'text-gray-300 italic font-normal'
        }`}>
          {hasValue ? value : (placeholder || '—')}
        </span>
      </div>
    </div>
  );
}

// ─── StatusBanner ─────────────────────────────────────────────────────────────
function StatusBanner({ order }) {
  if (order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) {
    return (
      <div className="sticky top-0 z-10 mx-4 mt-4 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
        <div>
          <p className="text-xs font-semibold text-red-600">Pedido cancelado</p>
          <p className="text-xs text-red-500 leading-relaxed mt-0.5">
            {order.motivoCancelacion || 'Sin motivo registrado.'}
          </p>
          {order.fechaCancelacion && (
            <p className="text-xs text-red-400 mt-0.5">Cancelado el {order.fechaCancelacion}</p>
          )}
        </div>
      </div>
    );
  }
  return null;
}

function DetailOrder({ 
  order, 
  isOpen, 
  onClose, 
  onEdit, 
  onCancel, 
  onEstadoChange,
  modo = 'pedido' // 'pedido' o 'venta'
}) {
  const { showConfirm, showSuccess } = useAlert();
  const [pagos, setPagos] = useState([]);
  const [totalPagado, setTotalPagado] = useState(0);
  const [asesorNombre, setAsesorNombre] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && order) {
      const pagosPedido = PaymentService.getByPedidoId(order.id);
      setPagos(pagosPedido);
      setTotalPagado(PaymentService.getTotalPagado(order.id));

      if (order.asesorId) {
        const asesor = UsersDB.findById(order.asesorId);
        setAsesorNombre(asesor ? asesor.name : `ID: ${order.asesorId}`);
      } else {
        setAsesorNombre('N/A');
      }
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? isoString : date.toLocaleDateString('es-CO');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const fechaMostrar = formatDate(order.fechaPedido);
  const isCancelado = order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO;
  const isListoYPagado = order.estadoLogistico === ESTADOS_LOGISTICOS.LISTO && order.pagoEstado === ESTADOS_PAGO.PAGADO;
  const showEditButton = !isCancelado && !isListoYPagado && modo === 'pedido';

  const handleMarcarListo = async () => {
    const result = await showConfirm(
      'info',
      'Marcar como listo',
      `¿Confirmas que el pedido #${order.numeroPedido || order.id} está listo para entrega?`,
      { confirmButtonText: 'Sí, marcar listo', cancelButtonText: 'Cancelar' }
    );
    if (!result?.isConfirmed) return;
    onEstadoChange(order, ESTADOS_LOGISTICOS.LISTO);
    showSuccess('Pedido actualizado', `El pedido #${order.numeroPedido || order.id} ahora está listo.`);
  };

  const handleCancelar = () => {
    onCancel(order);
    onClose();
  };

  const handleEditClick = () => {
    onEdit(order);
    onClose();
  };

  const handleDownloadPDF = () => {
    exportOrderToPDF(order, pagos, asesorNombre);
  };

  const esModoVenta = modo === 'venta';
  const titulo = esModoVenta 
    ? `Venta #${order.numeroPedido || order.id}`
    : `Pedido #${order.numeroPedido || order.id}`;

  return (
    <div
      onClick={onClose}
      style={{ transition: 'opacity 250ms ease' }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transformOrigin: 'center center',
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
        }}
        className={`bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]
          ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <h2 className="text-white font-semibold text-lg">
            {titulo}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
              title="Descargar PDF"
            >
              <FileDown className="w-5 h-5" strokeWidth={1.8} />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1">
          <StatusBanner order={order} />

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* ── Columna izquierda: Detalles ─────────────────── */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                  Detalles del {esModoVenta ? 'venta' : 'pedido'}
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <DetailRow icon={Hash}       label="No."        value={order.numeroPedido || order.id} highlight />
              <DetailRow icon={Calendar}   label="Fecha"      value={fechaMostrar} />
              <DetailRow icon={User}       label="Cliente"    value={order.clienteNombre || 'No especificado'} />
              <DetailRow icon={Phone}      label="Teléfono"   value={order.clienteTelefono || 'No registrado'} />
              <DetailRow icon={Mail}       label="Correo"     value={order.clienteEmail || 'No registrado'} />
              <DetailRow icon={UserCheck}  label="Asesor"     value={asesorNombre} />
              {!esModoVenta && (
                <DetailRow icon={Tag}      label="Origen"     value={order.origen || ORIGENES.MANUAL} />
              )}
              <DetailRow icon={Truck}      label="Entrega"    value={order.direccionEntrega || 'El cliente lo recoge'} />
              <DetailRow icon={MapPin}     label="Dirección"  value={order.direccionEntrega || 'No aplica'} />
              <DetailRow icon={DollarSign} label="Total"      value={formatCurrency(order.total)} highlight />
            </div>

            {/* ── Columna derecha: Productos y pagos ───────────────────────── */}
            <div className="px-6 py-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                  Productos y pagos
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              {/* Productos */}
              {order.productos?.length > 0 ? (
                <>
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 py-1.5 rounded-md bg-[#004D77]/5 mb-1">
                    <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide">Producto</span>
                    <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Cant</span>
                    <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">P. Unit</span>
                    <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Subtotal</span>
                  </div>
                  <div className="flex flex-col mb-3 flex-1">
                    {order.productos.map((producto, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 py-2 items-start rounded-md ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="w-5 h-5 rounded bg-[#004D77]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <CreditCard className="w-3 h-3 text-[#004D77]/60" strokeWidth={1.5} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-gray-700">{producto.nombre}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 text-right tabular-nums font-medium">{producto.cantidad}</span>
                        <span className="text-xs text-gray-500 text-right tabular-nums">
                          {formatCurrency(producto.precioUnitario)}
                        </span>
                        <span className="text-xs font-semibold text-gray-700 text-right tabular-nums">
                          {formatCurrency(producto.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-2 rounded-lg border border-dashed border-gray-200 mb-3">
                  <CreditCard className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                  <p className="text-xs text-gray-400">Sin productos registrados</p>
                </div>
              )}

              {/* Pagos */}
              <div className="mt-2">
                <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg mb-2">
                  <span className="text-xs text-gray-500">Total pagado</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(totalPagado)}</span>
                </div>
                <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg mb-3">
                  <span className="text-xs text-gray-500">Saldo pendiente</span>
                  <span className={`text-sm font-bold ${totalPagado >= order.total ? 'text-green-600' : 'text-amber-600'}`}>
                    {formatCurrency(Math.max(0, order.total - totalPagado))}
                  </span>
                </div>

                {pagos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 uppercase">Método</th>
                          <th className="px-2 py-1 text-right text-[10px] font-medium text-gray-500 uppercase">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {pagos.map((pago) => (
                          <tr key={pago.id}>
                            <td className="px-2 py-1 text-xs text-gray-700 whitespace-nowrap">{formatDate(pago.fechaPago)}</td>
                            <td className="px-2 py-1 text-xs text-gray-700">{pago.metodoPago}</td>
                            <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">{formatCurrency(pago.monto)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No hay pagos registrados.</p>
                )}
              </div>

              {/* Estados */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Estado logístico</span>
                  <EstadoLogisticoBadgePill estado={order.estadoLogistico} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Estado de pago</span>
                  <EstadoPagoBadgePill estado={order.pagoEstado} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-400 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" strokeWidth={1.8} />
            Exportar PDF
          </button>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
              Cerrar
            </button>
            {/* Acciones solo visibles en modo pedido */}
            {modo === 'pedido' && (
              <>
                {order.estadoLogistico === ESTADOS_LOGISTICOS.EN_PROCESO && (
                  <>
                    <button
                      onClick={handleMarcarListo}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar listo
                    </button>
                    <button
                      onClick={handleCancelar}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancelar
                    </button>
                  </>
                )}
                {showEditButton && (
                  <button onClick={handleEditClick} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors">
                    <Edit className="w-4 h-4" strokeWidth={1.8} />
                    Editar pedido
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailOrder;