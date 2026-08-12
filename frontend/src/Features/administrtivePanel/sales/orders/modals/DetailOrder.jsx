// src/features/orders/modals/DetailOrder.jsx
import React, { useEffect, useState } from 'react';
import {
  X, User, Phone, Mail, MapPin, Calendar, CreditCard,
  CheckCircle, XCircle, Edit, AlertTriangle, Tag, DollarSign, FileDown,
  IdCard, UserCheck, Truck
} from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import {
  EstadoLogisticoBadgePill,
  EstadoPagoBadgePill,
  exportOrderToPDF
} from '../helpers/ordersHelpers';
import OrdersService, {
  PaymentReceiptService,
  PaymentService,
  ESTADOS_LOGISTICOS,
  ORIGENES,
} from '../services/ordersService';
import { UserService } from '../../../users/services/userService';
import PaymentReceiptsSection from '../components/PaymentReceiptsSection';
import ApprovePaymentReceiptModal from './ApprovePaymentReceiptModal';
import RejectPaymentReceiptModal from './RejectPaymentReceiptModal';
import { formatDeliveryAddress } from '../helpers/deliveryAddressHelper';

// ─── DetailRow ────────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value, placeholder, highlight = false, multiline = false }) {
  const hasValue = value && String(value).trim() !== '';
  const IconComponent = icon;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
        hasValue ? 'bg-[#004D77]/10' : 'bg-gray-100'
      }`}>
        <IconComponent className={`w-3.5 h-3.5 ${hasValue ? 'text-[#004D77]' : 'text-gray-300'}`} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
          {label}
        </span>
        <span className={`block text-sm font-medium ${
          multiline ? 'whitespace-pre-wrap break-words leading-relaxed' : 'truncate'
        } ${
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
  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? dateValue : date.toLocaleDateString('es-CO');
  };

  if (order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) {
    const cancellationReason = order.cancellationReason ?? order.motivoCancelacion;
    const cancelledAt = order.cancelledAt ?? order.fechaCancelacion;

    return (
      <div className="sticky top-0 z-10 mx-4 mt-4 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
        <div>
          <p className="text-xs font-semibold text-red-600">Pedido cancelado</p>
          <p className="text-xs text-red-500 leading-relaxed mt-0.5">
            {cancellationReason || 'Sin motivo registrado.'}
          </p>
          {cancelledAt && (
            <p className="text-xs text-red-400 mt-0.5">Cancelado el {formatDate(cancelledAt)}</p>
          )}
        </div>
      </div>
    );
  }
  if (order.estadoLogistico === ESTADOS_LOGISTICOS.ENTREGADO) {
    return (
      <div className="sticky top-0 z-10 mx-4 mt-4 flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" strokeWidth={2} />
        <div>
          <p className="text-xs font-semibold text-blue-600">Pedido entregado</p>
          <p className="text-xs text-blue-500 leading-relaxed mt-0.5">
            Este pedido ya fue entregado y no puede modificarse ni cancelarse.
          </p>
        </div>
      </div>
    );
  }
  return null;
}

const normalizeReceiptStatus = (status) => String(status || 'pendiente').trim().toLowerCase();

function DetailOrder({ 
  order, 
  isOpen, 
  onClose, 
  onEdit, 
  onCancel, 
  onEstadoChange,
  onOrderRefresh,
  modo = 'pedido' // 'pedido' o 'venta'
}) {
  const { showConfirm, showSuccess, showError } = useAlert();
  const [pagos, setPagos] = useState([]);
  const [totalPagado, setTotalPagado] = useState(0);
  const [paymentReceipts, setPaymentReceipts] = useState([]);
  const [asesorNombre, setAsesorNombre] = useState('');
  const [receiptToApprove, setReceiptToApprove] = useState(null);
  const [receiptToReject, setReceiptToReject] = useState(null);
  const [reviewingReceiptId, setReviewingReceiptId] = useState(null);
  const visible = isOpen;

  useEffect(() => {
    const loadPayments = async () => {
      if (!isOpen || !order) return;

      if (modo === 'venta') {
        const salePayments = order.pagos || [];
        setPagos(salePayments);
        setTotalPagado(
          Number.isFinite(Number(order.totalPagado))
            ? Number(order.totalPagado)
            : salePayments.reduce((sum, payment) => sum + Number(payment.monto || 0), 0)
        );
        setPaymentReceipts(order.comprobantesPago || []);

        if (order.asesorNombre) {
          setAsesorNombre(order.asesorNombre);
        } else if (order.asesorId) {
          setAsesorNombre(`ID: ${order.asesorId}`);
        } else {
          setAsesorNombre('N/A');
        }
        return;
      }

      const pagosPedido = await PaymentService.getByPedidoId(order.id);
      setPagos(pagosPedido);
      setTotalPagado(await PaymentService.getTotalPagado(order.id));
      setPaymentReceipts(order.comprobantesPago || []);

      if (order.asesorNombre) {
        setAsesorNombre(order.asesorNombre);
      } else if (order.asesorId) {
        const asesor = await UserService.findById(order.asesorId);
        setAsesorNombre(
          asesor?.fullName ??
          asesor?.name ??
          asesor?.user?.fullName ??
          `ID: ${order.asesorId}`
        );
      } else {
        setAsesorNombre('N/A');
      }
    };

    loadPayments();
  }, [isOpen, order, modo]);

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
  const isRecoge = String(order.tipoEntrega ?? order.deliveryType ?? '').toLowerCase().includes('recoge');
  const entregaMostrar = isRecoge ? 'El cliente lo recoge' : 'Domicilio';
  const direccionEntregaCompleta = formatDeliveryAddress(order);
  const personaRecibe = order.deliveryRecipientName || order.clienteNombre || 'No especificado';
  const telefonoPersonaRecibe = order.deliveryRecipientPhone || 'No especificado';
  const clienteDocumento =
    order.clienteDocumento ??
    order.customerDocument ??
    order.documentNumber ??
    order.docNumber ??
    '';
  const clienteTipoDocumento =
    order.clienteTipoDocumento ??
    order.customerDocumentType ??
    order.documentType ??
    order.docType ??
    '';
  const documentoCliente = clienteDocumento
    ? [clienteTipoDocumento, clienteDocumento].filter(Boolean).join(' ')
    : '';
  const shippingAmount = Number(order.shippingAmount ?? 0);
  const isCancelado = order.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO;
  const isEntregado = order.estadoLogistico === ESTADOS_LOGISTICOS.ENTREGADO;
  const canChangeOrder = !isCancelado && !isEntregado;
  const showEditButton = canChangeOrder && modo === 'pedido';

  const handleMarcarListo = async () => {
    if (!canChangeOrder) return;
    const result = await showConfirm(
      'info',
      'Marcar como listo',
      `¿Confirmas que el pedido #${order.numeroPedido || order.id} está listo para entrega?`,
      { confirmButtonText: 'Sí, marcar listo', cancelButtonText: 'Cancelar' }
    );
    if (!result?.isConfirmed) return;
    await onEstadoChange?.(order, ESTADOS_LOGISTICOS.LISTO);
    return;
    showSuccess('Pedido actualizado', `El pedido #${order.numeroPedido || order.id} ahora está listo.`);
  };

  const handleCancelar = () => {
    if (!canChangeOrder) return;
    onCancel(order);
    onClose();
  };

  const handleEditClick = () => {
    if (!showEditButton) return;
    onEdit(order);
    onClose();
  };

  const handleDownloadPDF = () => {
    exportOrderToPDF(order, pagos, asesorNombre);
  };

  const ensurePendingReceipt = (receipt) => {
    if (normalizeReceiptStatus(receipt?.status) === 'pendiente') return true;

    showError(
      'Comprobante ya revisado',
      'Solo los comprobantes pendientes pueden aprobarse o rechazarse.'
    );
    return false;
  };

  const handleOpenApproveReceipt = (receipt) => {
    if (!ensurePendingReceipt(receipt)) return;
    setReceiptToApprove(receipt);
  };

  const handleOpenRejectReceipt = (receipt) => {
    if (!ensurePendingReceipt(receipt)) return;
    setReceiptToReject(receipt);
  };

  const refreshOrderDetail = async () => {
    const freshOrder = await OrdersService.findById(order.id);
    if (!freshOrder) return;

    const freshPayments = await PaymentService.getByPedidoId(order.id);
    const freshTotalPaid = await PaymentService.getTotalPagado(order.id);

    setPagos(freshPayments);
    setTotalPagado(freshTotalPaid);
    setPaymentReceipts(freshOrder.comprobantesPago || []);
    onOrderRefresh?.(freshOrder);
  };

  const handleReviewReceipt = async (receipt, payload, successMessage) => {
    if (!receipt?.id || reviewingReceiptId) return;
    if (!ensurePendingReceipt(receipt)) return;

    setReviewingReceiptId(receipt.id);
    try {
      const result = await PaymentReceiptService.review(order.id, receipt.id, payload);

      if (result?.paymentReceipt) {
        setPaymentReceipts((current) =>
          current.map((item) => (item.id === receipt.id ? result.paymentReceipt : item))
        );
      }

      await refreshOrderDetail();
      showSuccess('Comprobante revisado', successMessage);
      setReceiptToApprove(null);
      setReceiptToReject(null);
    } catch (error) {
      showError(
        'No se pudo revisar',
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'No se pudo actualizar el comprobante.'
      );
    } finally {
      setReviewingReceiptId(null);
    }
  };

  const esModoVenta = modo === 'venta';
  const titulo = esModoVenta 
    ? `Venta #${order.ventaId || order.id}`
    : `Pedido #${order.numeroPedido || order.id}`;
  const pedidoRelacionadoId = order.numeroPedido || order.id;

  return (
    <>
      <div
        style={{ transition: 'opacity 250ms ease' }}
        className={`fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm
          ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            transformOrigin: 'center center',
            transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
          }}
          className={`flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-lg
            ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-3 bg-[#004D77] px-4 py-3 sm:items-center sm:px-6 sm:py-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h2 className="truncate text-base font-semibold text-white sm:text-lg">
                {titulo}
              </h2>
              {esModoVenta && pedidoRelacionadoId && (
                <span className="w-fit rounded-full bg-white/15 px-2 py-1 text-xs font-medium text-white">
                  Pedido #{pedidoRelacionadoId}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <EstadoLogisticoBadgePill estado={order.estadoLogistico} />
                <EstadoPagoBadgePill estado={order.pagoEstado} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-1 text-white transition-colors hover:bg-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Cuerpo */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <StatusBanner order={order} />

            {paymentReceipts.length > 0 && (
              <div className="px-4 pt-4 sm:px-6 sm:pt-5">
                <PaymentReceiptsSection
                  receipts={paymentReceipts}
                  compact
                  onApprove={!esModoVenta ? handleOpenApproveReceipt : undefined}
                  onReject={!esModoVenta ? handleOpenRejectReceipt : undefined}
                  reviewingReceiptId={!esModoVenta ? reviewingReceiptId : null}
                />
              </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* ── Columna izquierda: Detalles ─────────────────── */}
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                  Detalles del {esModoVenta ? 'venta' : 'pedido'}
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <DetailRow icon={Calendar}   label="Fecha"      value={fechaMostrar} />
              <DetailRow icon={User}       label="Persona que recibe" value={personaRecibe} />
              {!isRecoge && (
                <DetailRow icon={Phone} label="Telefono de quien recibe" value={telefonoPersonaRecibe} />
              )}
              <DetailRow icon={IdCard}     label="Documento cliente" value={documentoCliente || 'No registrado'} />
              <DetailRow icon={Phone}      label="Teléfono"   value={order.clienteTelefono || 'No registrado'} />
              <DetailRow icon={Mail}       label="Correo"     value={order.clienteEmail || 'No registrado'} />
              {esModoVenta && (
                <DetailRow icon={UserCheck} label="Asesor" value={asesorNombre} />
              )}
              {!esModoVenta && (
                <DetailRow icon={Tag}      label="Origen"     value={order.origen || ORIGENES.MANUAL} />
              )}
              <DetailRow icon={Truck}      label="Entrega"    value={entregaMostrar} />
              <DetailRow icon={MapPin}     label="Dirección de entrega"  value={direccionEntregaCompleta || 'No aplica'} multiline />
            </div>

            {/* ── Columna derecha: Productos y pagos ───────────────────────── */}
            <div className="flex flex-col px-4 py-4 sm:px-6 sm:py-5">
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
                  <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                    <div className="min-w-[420px]">
                      <div className="grid grid-cols-[minmax(140px,1fr)_auto_auto_auto] gap-x-3 px-2 py-1.5 rounded-md bg-[#004D77]/5 mb-1">
                        <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide">Producto</span>
                        <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Cant</span>
                        <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">P. Unit</span>
                        <span className="text-[10px] font-bold text-[#004D77] uppercase tracking-wide text-right">Subtotal</span>
                      </div>
                      <div className="flex flex-col mb-3 flex-1">
                        {order.productos.map((producto, idx) => (
                          <div
                            key={idx}
                            className={`grid grid-cols-[minmax(140px,1fr)_auto_auto_auto] gap-x-3 px-2 py-2 items-start rounded-md ${
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
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-2 rounded-lg border border-dashed border-gray-200 mb-3">
                  <CreditCard className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                  <p className="text-xs text-gray-400">Sin productos registrados</p>
                </div>
              )}

              {/* Pagos */}
              <div className="mt-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between items-center px-1 py-1">
                  <span className="text-xs font-semibold text-gray-500">Total</span>
                  <span className="text-sm font-bold text-[#004D77]">{formatCurrency(order.total)}</span>
                </div>
                {!isRecoge && (
                  <div className="flex justify-between items-center px-1 py-1">
                    <span className="text-xs text-gray-500">Envio</span>
                    <span className="text-sm font-bold text-gray-700">{formatCurrency(shippingAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center px-1 py-1">
                  <span className="text-xs text-gray-500">Total pagado</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(totalPagado)}</span>
                </div>
                <div className="flex justify-between items-center px-1 py-1 mb-3">
                  <span className="text-xs text-gray-500">Saldo pendiente</span>
                  <span className={`text-sm font-bold ${totalPagado >= order.total ? 'text-green-600' : 'text-amber-600'}`}>
                    {formatCurrency(Math.max(0, order.total - totalPagado))}
                  </span>
                </div>

                {pagos.length > 0 ? (
                  <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse items-stretch gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
          <button
            onClick={handleDownloadPDF}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-400 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 cursor-pointer sm:w-auto"
          >
            <FileDown className="w-4 h-4" strokeWidth={1.8} />
            Exportar PDF
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 cursor-pointer sm:w-auto"
          >
            Cerrar
          </button>
            {/* Acciones solo visibles en modo pedido */}
            {modo === 'pedido' && (
              <>
                {order.estadoLogistico === ESTADOS_LOGISTICOS.EN_PROCESO && (
                  <>
                    <button
                      onClick={handleMarcarListo}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar listo
                    </button>
                  </>
                )}
                {canChangeOrder && (
                  <button
                    onClick={handleCancelar}
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 sm:w-auto"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancelar
                  </button>
                )}
                {showEditButton && (
                  <button onClick={handleEditClick} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003a5c] sm:w-auto">
                    <Edit className="w-4 h-4" strokeWidth={1.8} />
                    Editar pedido
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {receiptToApprove && (
        <ApprovePaymentReceiptModal
          key={receiptToApprove.id}
          order={order}
          receipt={receiptToApprove}
          isOpen
          isSubmitting={reviewingReceiptId === receiptToApprove.id}
          onClose={() => setReceiptToApprove(null)}
          onConfirm={(payload) =>
            handleReviewReceipt(
              receiptToApprove,
              payload,
              'El comprobante fue aprobado y el pago pendiente quedo registrado.'
            )
          }
        />
      )}

      {receiptToReject && (
        <RejectPaymentReceiptModal
          key={receiptToReject.id}
          order={order}
          receipt={receiptToReject}
          isOpen
          isSubmitting={reviewingReceiptId === receiptToReject.id}
          onClose={() => setReceiptToReject(null)}
          onConfirm={(payload) =>
            handleReviewReceipt(
              receiptToReject,
              payload,
              'El comprobante fue rechazado y el cliente podra enviar uno nuevo.'
            )
          }
        />
      )}
    </>
  );
}

export default DetailOrder;
