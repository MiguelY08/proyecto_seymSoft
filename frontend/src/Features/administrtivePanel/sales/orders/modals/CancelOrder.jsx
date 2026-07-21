// src/features/orders/modals/CancelOrder.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  X, XCircle, AlertTriangle, Package,
  Hash, Calendar, User, UserCheck, CreditCard, Tag, Truck, MapPin,
  Loader2,
} from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { SalesServices } from '../../vendings/services/salesServices';
import OrdersService from '../services/ordersService';

const MOTIVO_MAX = 500;
const MOTIVO_MIN = 10;
const DEFAULT_IVA_PERCENTAGE = 19;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const roundMoney = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

const calculateIncludedIva = (total, ivaPercentage = DEFAULT_IVA_PERCENTAGE) => {
  const percentage = toNumber(ivaPercentage, DEFAULT_IVA_PERCENTAGE);
  return roundMoney(toNumber(total) - (toNumber(total) / (1 + (percentage / 100))));
};

const getLineTotal = (item = {}) => {
  const explicitTotal = item.total ?? item.totalLinea ?? item.lineTotal ?? item.subtotal;

  if (explicitTotal !== undefined && explicitTotal !== null && explicitTotal !== '') {
    return roundMoney(explicitTotal);
  }

  return roundMoney(toNumber(item.precioUnitario) * toNumber(item.cantidad));
};

const getLineIva = (item = {}) => {
  const explicitIva = item.iva ?? item.ivaAmount;

  if (explicitIva !== undefined && explicitIva !== null && explicitIva !== '') {
    return roundMoney(explicitIva);
  }

  return calculateIncludedIva(getLineTotal(item), item.ivaPercentage);
};

const hasItems = (entity, contexto) => {
  if (!entity) return false;

  const products = contexto === 'pedido'
    ? (entity.productos ?? entity.products ?? entity.items ?? entity.details)
    : (entity.items ?? entity.details ?? entity.products ?? entity.order?.details ?? entity.order?.productos);

  return Array.isArray(products) && products.length > 0;
};

const normalizeItem = (item = {}, index = 0) => {
  const product = item.product ?? item.producto ?? {};
  const precioUnitario = toNumber(
    item.precioUnitario ??
    item.unitPrice ??
    item.unit_price ??
    item.price ??
    product.precioDetalle ??
    product.retailPrice
  );

  return {
    id:
      item.id ??
      item.detalleId ??
      item.idOrderDetail ??
      product.id ??
      product.idProduct ??
      index,
    nombre:
      item.nombre ??
      item.productName ??
      item.name ??
      product.nombre ??
      product.name ??
      'Producto sin nombre',
    cantidad: toNumber(item.cantidad ?? item.quantity ?? item.qty),
    precioUnitario,
    subtotal: item.total ?? item.totalLinea ?? item.lineTotal ?? item.subtotal,
    iva: item.iva ?? item.ivaAmount,
    ivaPercentage: item.ivaPercentage ?? product.ivaPercentage,
  };
};

// ─── DetailRow ──────────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }) {
  const hasValue = value && String(value).trim() !== '';
  return (
    <div className="flex items-start gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
        hasValue ? 'bg-[#004D77]/10' : 'bg-gray-100'
      }`}>
        {React.createElement(Icon, {
          className: `w-3 h-3 ${hasValue ? 'text-[#004D77]' : 'text-gray-300'}`,
          strokeWidth: 1.8,
        })}
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
  const { showSuccess, showError } = useAlert();
  const [visible, setVisible] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailEntity, setDetailEntity] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const baseEntity = contexto === 'pedido' ? order : sale;
  const entityId = contexto === 'pedido'
    ? (order?.id ?? order?.idOrder ?? order?.pedidoId)
    : (sale?.id ?? sale?.idSale);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadDetail = async () => {
      if (!baseEntity || !entityId) {
        setDetailEntity(baseEntity ?? null);
        setIsDetailLoading(false);
        return;
      }

      if (hasItems(baseEntity, contexto)) {
        setDetailEntity(baseEntity);
        setIsDetailLoading(false);
        return;
      }

      try {
        setIsDetailLoading(true);
        const detail = contexto === 'pedido'
          ? await OrdersService.findById(entityId)
          : await SalesServices.getById(entityId);

        if (!ignore) {
          setDetailEntity(detail ?? baseEntity);
        }
      } catch (error) {
        console.error('Error cargando detalle para anulacion/cancelacion:', error);
        if (!ignore) {
          setDetailEntity(baseEntity);
        }
      } finally {
        if (!ignore) {
          setIsDetailLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [baseEntity, contexto, entityId]);

  const handleClose = () => {
    if (isSubmitting) return;

    setVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 250);
  };

  const motivoError = touched && motivo.trim().length < MOTIVO_MIN
    ? `El motivo debe tener al menos ${MOTIVO_MIN} caracteres.`
    : '';

  // Determinar la entidad según el contexto
  const activeOrder = contexto === 'pedido' ? (detailEntity ?? order) : order;
  const activeSale = contexto === 'venta' ? (detailEntity ?? sale) : sale;
  const entidad = contexto === 'pedido' ? activeOrder : activeSale;
  const numero = contexto === 'pedido' 
    ? (activeOrder?.numeroPedido || activeOrder?.id)
    : (activeSale?.factura || activeSale?.id);

  // Extraer datos según contexto
  const fecha = contexto === 'pedido' 
    ? activeOrder?.fechaPedido 
    : activeSale?.fecha;
  const clienteNombre = contexto === 'pedido'
    ? (activeOrder?.clienteNombre || activeOrder?.clienteId)
    : (activeSale?.cliente || activeSale?.clienteId);
  const asesorNombre = contexto === 'pedido'
    ? (activeOrder?.asesorNombre || activeOrder?.asesorId)
    : (activeSale?.vendedor || activeSale?.vendedorId);
  const metodoPagoLabel = contexto === 'pedido'
    ? (activeOrder?.metodoPago
        ? (Array.isArray(activeOrder.metodoPago) ? activeOrder.metodoPago.filter(Boolean).join(' · ') : activeOrder.metodoPago)
        : '—')
    : (activeSale?.metodoPago || '—');
  const estadoActual = contexto === 'pedido'
    ? activeOrder?.estadoLogistico
    : activeSale?.estado;
  const direccionEntrega = contexto === 'pedido'
    ? activeOrder?.direccionEntrega
    : activeSale?.direccion;
  const items = contexto === 'pedido'
    ? (activeOrder?.productos ?? activeOrder?.products ?? activeOrder?.items ?? activeOrder?.details ?? []).map(normalizeItem)
    : (activeSale?.items ?? activeSale?.details ?? activeSale?.products ?? activeSale?.order?.details ?? activeSale?.order?.productos ?? []).map(normalizeItem);

  const totals = useMemo(() => {
    const itemsTotal = roundMoney(items.reduce((acc, item) => acc + getLineTotal(item), 0));
    const itemsIva = roundMoney(items.reduce((acc, item) => acc + getLineIva(item), 0));
    const source = contexto === 'pedido' ? activeOrder : activeSale;
    const sourceOrder = contexto === 'venta' ? activeSale?.order : null;

    const providedTotal = toNumber(
      source?.totalNumerico ??
      source?.total ??
      sourceOrder?.total
    );
    const totalValue = roundMoney(providedTotal || itemsTotal);

    const providedIva = toNumber(
      sourceOrder?.ivaAmount ??
      sourceOrder?.iva ??
      source?.iva ??
      source?.ivaAmount
    );
    const ivaValue = roundMoney(providedIva || itemsIva || calculateIncludedIva(totalValue));

    const providedSubtotal = toNumber(
      sourceOrder?.subtotal ??
      sourceOrder?.subtotalSinIva ??
      source?.subtotalSinIva ??
      source?.subtotalBase ??
      source?.subtotal
    );
    const subtotalValue = roundMoney(providedSubtotal || Math.max(totalValue - ivaValue, 0));

    return {
      subtotal: subtotalValue,
      iva: ivaValue,
      total: totalValue,
    };
  }, [contexto, items, activeOrder, activeSale]);

  const { subtotal, iva, total } = totals;

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
    if (isSubmitting) return;

    setTouched(true);
    if (motivo.trim().length < MOTIVO_MIN) return;

    try {
      setIsSubmitting(true);
      if (contexto === 'pedido') {
        // Llamar al callback onConfirm proporcionado (que a su vez llama a OrdersService)
        await onConfirm(motivo.trim());
      } else {
        // Anular venta a través de SalesServices
        await SalesServices.anular(activeSale.id, motivo.trim());
      }
      showSuccess(
        contexto === 'pedido' ? 'Pedido cancelado' : 'Venta anulada',
        `El ${contexto === 'pedido' ? 'pedido' : 'venta'} #${numero} fue ${contexto === 'pedido' ? 'cancelado' : 'anulada'} correctamente.`
      );
      handleClose();
    } catch (error) {
      showError('Error', error.message || 'No se pudo completar la operación.');
      setIsSubmitting(false);
    }
  };

  if (!entidad) {
    return null;
  }

  const titulo = contexto === 'pedido' ? 'Cancelar pedido' : 'Anular venta';
  const entidadLabel = contexto === 'pedido' ? 'Pedido No.' : 'Venta No.';
  const mensajeIrreversible = contexto === 'pedido'
    ? 'El pedido quedará cancelado, el stock de los productos será restaurado y no podrá modificarse posteriormente.'
    : 'La venta será anulada, el pedido asociado se cancelará y el stock será restaurado. Esta acción no se puede deshacer.';

  return (
    <div
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
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-white" strokeWidth={2} />
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">{titulo}</h2>
              <p className="text-white/75 text-xs">{entidadLabel} {numero}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`text-white rounded-full p-1 transition-colors ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-white/20 cursor-pointer'
            }`}
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Aviso de irreversibilidad */}
        <div className="flex items-start gap-3 px-6 py-3 bg-yellow-50 border-b border-yellow-100 shrink-0">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-xs text-yellow-800 leading-relaxed">
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
                    disabled={isSubmitting}
                    onChange={(e) => {
                      if (e.target.value.length <= MOTIVO_MAX) setMotivo(e.target.value);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder={`Describe el motivo por el cual se ${contexto === 'pedido' ? 'cancela este pedido' : 'anula esta venta'}...`}
                    rows={4}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none resize-none text-gray-700 placeholder-gray-400 transition-colors duration-200 ${
                      isSubmitting
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : motivoError
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
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

              {isDetailLoading ? (
                <div className="flex flex-col items-center justify-center flex-1 py-10 gap-3 rounded-lg border-2 border-dashed border-[#004D77]/15 bg-[#004D77]/5">
                  <Loader2 className="w-6 h-6 text-[#004D77] animate-spin" strokeWidth={2} />
                  <p className="text-xs text-[#004D77]/70 text-center">Cargando productos...</p>
                </div>
              ) : items.length > 0 ? (
                <>
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 py-1.5 rounded-md bg-[#004D77]/10 mb-1">
                    <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide">Producto</span>
                    <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Cant</span>
                    <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">V. Unit</span>
                    <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Total</span>
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
                          <div className="w-5 h-5 rounded bg-[#004D77]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Package className="w-3 h-3 text-[#004D77]/60" strokeWidth={1.5} />
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
                          {formatCurrency(getLineTotal(producto))}
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
                    <div className="flex justify-between items-center mt-1 px-3 py-2.5 bg-[#004D77] rounded-lg">
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
            disabled={isSubmitting}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 cursor-pointer'
            }`}
          >
            Cerrar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${
              isSubmitting
                ? 'bg-[#004D77]/50 cursor-not-allowed'
                : 'bg-[#004D77] hover:bg-[#003D5e] cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
            ) : (
              <XCircle className="w-4 h-4" strokeWidth={2} />
            )}
            {isSubmitting
              ? (contexto === 'pedido' ? 'Cancelando...' : 'Anulando...')
              : `Confirmar ${contexto === 'pedido' ? 'cancelación' : 'anulación'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelOrder;
