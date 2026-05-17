// src/features/orders/modals/CancelOrder.jsx
import React, { useState, useMemo } from 'react';
import {
  X, XCircle, AlertTriangle, Package,
  Hash, Calendar, User, UserCheck, CreditCard, Tag, Truck, MapPin,
} from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { useModalAnimation } from '../../../../shared/useModalAnimation';
import OrdersService, { ESTADOS_LOGISTICOS } from '../services/ordersService';
import { SalesServices } from '../../sales/services/salesServices';

const MOTIVO_MAX = 500;
const MOTIVO_MIN = 10;

// ─── DetailRow ──────────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }) {
  const hasValue = value && String(value).trim() !== '';
  return (
    <div className="flex items-start gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
        hasValue ? 'bg-red-50' : 'bg-gray-100'
      }`}>
        <Icon className={`w-3 h-3 ${hasValue ? 'text-red-400' : 'text-gray-300'}`} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
          {label}
        </span>
        <span className={`block text-xs font-medium truncate ${hasValue ? 'text-gray-800' : 'text-gray-300 italic'}`}>
          {hasValue ? value : '—'}
        </span>
      </div>
    </div>
  );
}

// ─── CancelOrder (contexto: 'pedido' o 'venta') ──────────────────────────────
function CancelOrder({ 
  order,        // para pedidos
  sale,         // para ventas
  onClose, 
  onConfirm,
  contexto = 'pedido' // 'pedido' o 'venta'
}) {
  const { showSuccess } = useAlert();
  const { visible, handleClose } = useModalAnimation(
    contexto === 'pedido' ? '/admin/sales/orders' : '/admin/sales'
  );

  const [motivo, setMotivo] = useState('');
  const [touched, setTouched] = useState(false);

  const motivoError = touched && motivo.trim().length < MOTIVO_MIN
    ? `El motivo debe tener al menos ${MOTIVO_MIN} caracteres.`
    : '';

  // Determinar la entidad según el contexto
  const entidad = contexto === 'pedido' ? order : sale;
  const id = entidad?.id;
  const numero = contexto === 'pedido' 
    ? (order?.numeroPedido || order?.id)
    : (sale?.factura || sale?.id);

  // Extraer datos según contexto
  const fecha = contexto === 'pedido' 
    ? order?.fechaPedido 
    : sale?.fecha;
  const clienteNombre = contexto === 'pedido'
    ? (order?.clienteNombre || order?.clienteId)
    : (sale?.cliente || sale?.clienteId);
  const asesorNombre = contexto === 'pedido'
    ? (order?.asesorNombre || order?.asesorId)
    : (sale?.vendedor || sale?.vendedorId);
  const metodoPagoLabel = contexto === 'pedido'
    ? (order?.metodoPago
        ? (Array.isArray(order.metodoPago) ? order.metodoPago.filter(Boolean).join(' · ') : order.metodoPago)
        : '—')
    : (sale?.metodoPago || '—');
  const estadoActual = contexto === 'pedido'
    ? order?.estadoLogistico
    : sale?.estado;
  const direccionEntrega = contexto === 'pedido'
    ? order?.direccionEntrega
    : sale?.direccion;
  const items = contexto === 'pedido'
    ? (order?.productos ?? [])
    : (sale?.items?.map(item => ({
        id: item.product.id,
        nombre: item.product.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.product.precioDetalle,
      })) ?? []);

  // Calcular totales
  const subtotal = useMemo(() => items.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0), [items]);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    // Si ya es string en formato dd/mm/yyyy, devolver tal cual
    if (typeof dateValue === 'string' && dateValue.includes('/')) return dateValue;
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? dateValue : date.toLocaleDateString('es-CO');
  };

  const handleConfirm = async () => {
    setTouched(true);
    if (motivo.trim().length < MOTIVO_MIN) return;

    try {
      if (contexto === 'pedido') {
        // Llamar al callback onConfirm proporcionado (que a su vez llama a OrdersService)
        onConfirm(motivo.trim());
      } else {
        // Anular venta a través de SalesServices
        await SalesServices.anular(sale.id, motivo.trim());
      }
      showSuccess(
        contexto === 'pedido' ? 'Pedido cancelado' : 'Venta anulada',
        `El ${contexto === 'pedido' ? 'pedido' : 'venta'} #${numero} fue ${contexto === 'pedido' ? 'cancelado' : 'anulada'} correctamente.`
      );
      handleClose();
    } catch (error) {
      showError('Error', error.message || 'No se pudo completar la operación.');
    }
  };

  if (!entidad) {
    handleClose();
    return null;
  }

  const titulo = contexto === 'pedido' ? 'Cancelar pedido' : 'Anular venta';
  const entidadLabel = contexto === 'pedido' ? 'Pedido No.' : 'Venta No.';
  const mensajeIrreversible = contexto === 'pedido'
    ? 'El pedido quedará cancelado, el stock de los productos será restaurado y no podrá modificarse posteriormente.'
    : 'La venta será anulada, el pedido asociado se cancelará y el stock será restaurado. Esta acción no se puede deshacer.';

  return (
    <div
      onClick={handleClose}
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
        <div className="flex items-center justify-between px-6 py-4 bg-red-600 shrink-0">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-white" strokeWidth={2} />
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">{titulo}</h2>
              <p className="text-red-200 text-xs">{entidadLabel} {numero}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Aviso de irreversibilidad */}
        <div className="flex items-start gap-3 px-6 py-3 bg-red-50 border-b border-red-100 shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-xs text-red-700 leading-relaxed">
            Esta acción es <strong>permanente e irreversible</strong>. {mensajeIrreversible}
          </p>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

            {/* ── Columna izquierda: Detalles + motivo ─────────────────── */}
            <div className="px-6 py-5 flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                    Detalles del {contexto === 'pedido' ? 'pedido' : 'venta'}
                  </span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                  <DetailRow icon={Hash}       label={entidadLabel} value={numero} />
                  <DetailRow icon={Calendar}   label="Fecha"        value={formatDate(fecha)} />
                  <DetailRow icon={User}       label="Cliente"      value={clienteNombre} />
                  <DetailRow icon={UserCheck}  label="Asesor"       value={asesorNombre} />
                  <DetailRow icon={CreditCard} label="Método de pago" value={metodoPagoLabel} />
                  <DetailRow icon={Tag}        label="Estado actual" value={estadoActual} />
                  <DetailRow icon={Truck}      label="Entrega"       value={direccionEntrega ? 'Domicilio' : 'Recoge en tienda'} />
                  <DetailRow icon={Hash}       label="Total"         value={formatCurrency(total)} />
                </div>
                {direccionEntrega && (
                  <div className="mt-1">
                    <DetailRow icon={MapPin} label="Dirección" value={direccionEntrega} />
                  </div>
                )}
              </div>

              {/* Motivo de cancelación/anulación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Motivo de {contexto === 'pedido' ? 'cancelación' : 'anulación'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={motivo}
                    onChange={(e) => {
                      if (e.target.value.length <= MOTIVO_MAX) setMotivo(e.target.value);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder={`Describe el motivo por el cual se ${contexto === 'pedido' ? 'cancela este pedido' : 'anula esta venta'}...`}
                    rows={4}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none resize-none text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
                      motivoError
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    }`}
                  />
                  <span className={`absolute bottom-2 right-3 text-[10px] ${
                    motivo.length >= MOTIVO_MAX ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {motivo.length}/{MOTIVO_MAX}
                  </span>
                </div>
                {motivoError && <p className="mt-1 text-xs text-red-500">{motivoError}</p>}
              </div>
            </div>

            {/* ── Columna derecha: Productos ───────────────────────────── */}
            <div className="px-6 py-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                  Productos del {contexto === 'pedido' ? 'pedido' : 'venta'}
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              {items.length > 0 ? (
                <>
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 py-1.5 rounded-md bg-red-50 mb-1">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Producto</span>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide text-right">Cant</span>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide text-right">V. Unit</span>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide text-right">Total</span>
                  </div>

                  <div className="flex flex-col mb-3 flex-1">
                    {items.map((producto, idx) => (
                      <div
                        key={producto.id}
                        className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 py-2 items-start rounded-md ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Package className="w-3 h-3 text-red-300" strokeWidth={1.5} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-gray-700 truncate">{producto.nombre}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 text-right tabular-nums font-medium">{producto.cantidad}</span>
                        <span className="text-xs text-gray-500 text-right tabular-nums">
                          {formatCurrency(producto.precioUnitario)}
                        </span>
                        <span className="text-xs font-semibold text-gray-700 text-right tabular-nums">
                          {formatCurrency(producto.precioUnitario * producto.cantidad)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-1">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-xs text-gray-400">Subtotal</span>
                      <span className="text-xs text-gray-600 tabular-nums">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <span className="text-xs text-gray-400">IVA (19%)</span>
                      <span className="text-xs text-gray-600 tabular-nums">{formatCurrency(iva)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 px-3 py-2.5 bg-red-600 rounded-lg">
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Total</span>
                      <span className="text-sm font-bold text-white tabular-nums">{formatCurrency(total)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                      ↑ Al {contexto === 'pedido' ? 'cancelar' : 'anular'}, el stock de {items.length} producto{items.length !== 1 ? 's' : ''} será restaurado automáticamente.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-10 gap-3 rounded-lg border-2 border-dashed border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-200" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs text-gray-300 text-center">Sin productos registrados</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" strokeWidth={2} />
            Confirmar {contexto === 'pedido' ? 'cancelación' : 'anulación'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelOrder;