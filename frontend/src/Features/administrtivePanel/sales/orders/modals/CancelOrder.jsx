// src/features/orders/modals/CancelOrder.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  XCircle, AlertTriangle, Package,
  Hash, Calendar, User, UserCheck, CreditCard, Truck, MapPin,
  Loader2,
} from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { SalesServices } from '../../vendings/services/salesServices';
import OrdersService from '../services/ordersService';
import { EstadoLogisticoBadgePill, EstadoPagoBadgePill } from '../helpers/ordersHelpers';

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

const getLineTotal = (item = {}, includeSeparateIva = false) => {
  const explicitTotal = item.total ?? item.totalLinea ?? item.lineTotal;

  if (explicitTotal !== undefined && explicitTotal !== null && explicitTotal !== '') {
    return roundMoney(explicitTotal);
  }

  const subtotal = item.subtotal;
  if (subtotal !== undefined && subtotal !== null && subtotal !== '') {
    const explicitIva = item.iva ?? item.ivaAmount;
    const iva = includeSeparateIva && explicitIva !== undefined && explicitIva !== null && explicitIva !== ''
      ? toNumber(explicitIva)
      : 0;
    return roundMoney(toNumber(subtotal) + iva);
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

const getPaymentMethodName = (value) => {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);

  return (
    value.metodoPago ??
    value.namePaymentMethod ??
    value.name ??
    value.method ??
    value.metodo ??
    value.paymentMethod?.namePaymentMethod ??
    value.paymentMethod?.name ??
    ''
  );
};

const getPaymentMethodsLabel = (entity = {}) => {
  const sources = [
    entity.metodoPago,
    entity.paymentMethod,
    entity.paymentMethods,
    entity.pagos,
    entity.payments,
    entity.orderPayments,
  ];
  const methods = sources
    .flatMap((source) => (Array.isArray(source) ? source : [source]))
    .map(getPaymentMethodName)
    .filter(Boolean);

  return [...new Set(methods)].join(' · ') || '—';
};

// ─── DetailRow ──────────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }) {
  const hasValue = value && String(value).trim() !== '';
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/70 p-3 md:gap-3">
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
  contexto = 'pedido', // 'pedido' o 'venta'
  isPage = false,
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
        console.error('Error cargando detalle para anulación/cancelación:', error);
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

    if (isPage) {
      onClose?.();
      return;
    }

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
  const metodoPagoLabel = getPaymentMethodsLabel(entidad);
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
    const itemsTotal = roundMoney(items.reduce(
      (acc, item) => acc + getLineTotal(item, contexto === 'venta'),
      0
    ));
    const itemsIva = roundMoney(items.reduce((acc, item) => acc + getLineIva(item), 0));
    const source = contexto === 'pedido' ? activeOrder : activeSale;
    const sourceOrder = contexto === 'venta' ? activeSale?.order : null;
    const shippingAmount = roundMoney(toNumber(
      sourceOrder?.shippingAmount ??
        sourceOrder?.shipping_amount ??
        sourceOrder?.deliveryShippingAmount ??
        sourceOrder?.delivery_shipping_amount ??
        source?.shippingAmount
    ));

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
      shippingAmount,
      total: totalValue,
    };
  }, [contexto, items, activeOrder, activeSale]);

  const { subtotal, iva, shippingAmount, total } = totals;

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
        contexto === 'pedido' ? 'Pedido anulado' : 'Venta anulada',
        `El ${contexto === 'pedido' ? 'pedido' : 'venta'} #${numero} fue ${contexto === 'pedido' ? 'anulado' : 'anulada'} correctamente.`
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

  const entidadLabel = contexto === 'pedido' ? 'Pedido No.' : 'Venta No.';
  const title = contexto === 'pedido' ? `Pedido #${numero}` : `Venta #${numero}`;
  const saleOrderNumber = activeSale?.numeroPedido ?? activeSale?.order?.numeroPedido;
  const mensajeIrreversible = contexto === 'pedido'
    ? 'El pedido quedará anulado, el stock de los productos será restaurado y no podrá modificarse posteriormente.'
    : 'La venta será anulada, el pedido asociado se cancelará y el stock será restaurado. Esta acción no se puede deshacer.';

  return (
    <div
      style={{ transition: 'opacity 250ms ease' }}
      className={isPage
        ? 'flex h-full min-h-0 w-full bg-white'
        : `fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm ${visible ? 'opacity-100' : 'opacity-0'}`
      }
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transformOrigin: 'center center',
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
        }}
        className={isPage
          ? 'flex h-full min-h-0 w-full flex-col overflow-hidden bg-white'
          : `flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-lg ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`
        }
      >
        <header className="flex shrink-0 flex-col gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="truncate text-lg font-semibold text-[#004D77]">{title}</h1>
            {contexto === 'venta' && saleOrderNumber && (
              <span className="rounded-full bg-[#004D77]/10 px-2 py-1 text-xs font-medium text-[#004D77]">
                Pedido #{saleOrderNumber}
              </span>
            )}
            {contexto === 'pedido' ? (
              <>
                <EstadoLogisticoBadgePill estado={activeOrder?.estadoLogistico} />
                <EstadoPagoBadgePill estado={activeOrder?.pagoEstado} />
              </>
            ) : (
              <span className="rounded-full bg-[#004D77]/10 px-2 py-1 text-xs font-medium text-[#004D77]">
                {estadoActual || 'Sin estado'}
              </span>
            )}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              Cerrar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <XCircle className="h-4 w-4" strokeWidth={2} />
              )}
              {isSubmitting
                ? (contexto === 'pedido' ? 'Cancelando...' : 'Anulando...')
                : 'Confirmar anulación'}
            </button>
          </div>
        </header>

        {/* Cuerpo */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">

            {/* ── Columna izquierda: Detalles + motivo ─────────────────── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
              <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                    Detalles del {contexto === 'pedido' ? 'pedido' : 'venta'}
                  </span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <DetailRow icon={Calendar}   label="Fecha"        value={formatDate(fecha)} />
                  <DetailRow icon={User}       label="Cliente"      value={clienteNombre} />
                  <DetailRow icon={UserCheck}  label="Asesor"       value={asesorNombre} />
                  <DetailRow icon={CreditCard} label="Método de pago" value={metodoPagoLabel} />
                  <DetailRow icon={Truck}      label="Entrega"       value={direccionEntrega ? 'Domicilio' : 'Recoge en tienda'} />
                  <DetailRow icon={Hash}       label="Total"         value={formatCurrency(total)} />
                </div>
                {direccionEntrega && (
                  <div className="mt-2">
                    <DetailRow icon={MapPin} label="Dirección" value={direccionEntrega} />
                  </div>
                )}
              </section>

              {/* Motivo de cancelación/anulación */}
              <section className="flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Motivo de anulación <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={motivo}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      if (e.target.value.length <= MOTIVO_MAX) setMotivo(e.target.value);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder={`Describe el motivo por el cual se anula ${contexto === 'pedido' ? 'este pedido' : 'esta venta'}...`}
                    rows={4}
                    className={`min-h-32 flex-1 w-full resize-none rounded-lg border px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors duration-200 placeholder-gray-400 ${
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
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" strokeWidth={2} />
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Anulación irreversible</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-600">
                      Esta acción es permanente e irreversible. {mensajeIrreversible}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* ── Columna derecha: Productos ───────────────────────────── */}
            <section className="flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
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
                  <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                    <div className="min-w-[420px]">
                      <div className="grid grid-cols-[minmax(140px,1fr)_auto_auto_auto] gap-x-3 px-2 py-1.5 rounded-md bg-[#004D77]/10 mb-1">
                        <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide">Producto</span>
                        <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Cant</span>
                        <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">V. Unit</span>
                        <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Total</span>
                      </div>

                      <div className="flex flex-col mb-3 flex-1">
                        {items.map((producto, idx) => (
                          <div
                            key={producto.id}
                            className={`grid grid-cols-[minmax(140px,1fr)_auto_auto_auto] gap-x-3 px-2 py-2 items-start rounded-md ${
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
                              {formatCurrency(getLineTotal(producto, contexto === 'venta'))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
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
                    {shippingAmount > 0 && (
                      <div className="flex justify-between items-center px-2">
                        <span className="text-xs text-gray-400">Envío</span>
                        <span className="text-xs text-gray-600 tabular-nums">{formatCurrency(shippingAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-1 px-3 py-2.5 bg-[#004D77] rounded-lg">
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Total</span>
                      <span className="text-sm font-bold text-white tabular-nums">{formatCurrency(total)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                      ↑ Al anular, el stock de {items.length} producto{items.length !== 1 ? 's' : ''} será restaurado automáticamente.
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
            </section>

          </div>
      </div>
    </div>
    </div>
  );
}

export default CancelOrder;
