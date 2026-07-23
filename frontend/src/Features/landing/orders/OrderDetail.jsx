import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  CheckCircle,
  Clock,
  CreditCard,
  LoaderCircle,
  MapPin,
  Package,
  Upload,
  X,
  ZoomIn,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import OrdersService, {
  PaymentReceiptService,
} from '../../administrtivePanel/sales/orders/services/ordersService';
import { useAlert } from '../../shared/alerts/useAlert';
import useAuthenticatedClient from '../../shared/hooks/useAuthenticatedClient';
import ShopHero from '../shop/components/ShopHero';
import BgPedidos from '../../../assets/BgPedidos.png';
import qrMagic from '../../../assets/QR_Magic.jpg';
import {
  formatMoney,
  formatOrderDate,
  getOrderStatusClasses,
} from './helpers/customerOrderHelpers';
import { ORDER_FONT_FAMILY, injectOrderTypography } from './orderTypography';

const normalizeReceiptStatus = (status) => String(status || 'Pendiente').trim().toLowerCase();

const formatRemainingTime = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

const getReceiptStatusView = (status) => {
  const normalized = normalizeReceiptStatus(status);

  if (normalized === 'aprobado') {
    return {
      label: 'Aprobado',
      className: 'bg-green-100 text-green-700',
    };
  }

  if (normalized === 'rechazado') {
    return {
      label: 'Rechazado',
      className: 'bg-red-100 text-red-700',
    };
  }

  return {
    label: 'Pendiente de revision',
    className: 'bg-amber-100 text-amber-700',
  };
};

function OrderDetail() {
  injectOrderTypography();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    clientId,
    isAuthenticated,
    loading: authLoading,
  } = useAuthenticatedClient();
  const { showError, showSuccess, showWarning } = useAlert();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [proofPreview, setProofPreview] = useState(null);
  const [now, setNow] = useState(Date.now());
  const fileInputRef = useRef(null);
  const paymentDeadlineTime = order?.fechaLimitePago ? new Date(order.fechaLimitePago).getTime() : null;
  const hasPaymentDeadline = Number.isFinite(paymentDeadlineTime);
  const shouldShowPaymentCountdown = Boolean(
    order &&
    Number(order.shippingAmount || 0) > 0 &&
    Number(order.saldoPendiente || 0) > 0 &&
    order.estadoLogistico !== 'cancelado' &&
    hasPaymentDeadline
  );
  const remainingPaymentMs = shouldShowPaymentCountdown
    ? Math.max(paymentDeadlineTime - now, 0)
    : 0;
  const paymentCountdownExpired = shouldShowPaymentCountdown && remainingPaymentMs <= 0;

  useEffect(() => {
    if (!shouldShowPaymentCountdown) return undefined;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [shouldShowPaymentCountdown, paymentDeadlineTime]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !clientId) {
      setLoading(false);
      return;
    }

    let active = true;
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await OrdersService.findById(id);
        if (!active) return;

        if (!response || Number(response.clienteId) !== Number(clientId)) {
          setError('El pedido no existe o no pertenece a tu cuenta.');
          setOrder(null);
          return;
        }
        setOrder(response);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError?.response?.data?.message ??
          requestError?.message ??
          'No fue posible cargar el pedido.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrder();
    return () => {
      active = false;
    };
  }, [authLoading, clientId, id, isAuthenticated]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showError('Archivo demasiado grande', 'El comprobante no puede superar los 10 MB.');
      event.target.value = '';
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      showError('Formato no permitido', 'Solo se permiten imágenes PNG, JPG o JPEG.');
      event.target.value = '';
      return;
    }
    setReceipt(file);
  };

  const handleRemoveReceipt = () => {
    if (submitting) return;
    setReceipt(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendReceipt = async () => {
    if (!receipt) {
      showWarning('Falta el comprobante', 'Selecciona una imagen antes de enviarla.');
      return;
    }
    if (!order?.saldoPendiente) return;

    try {
      setSubmitting(true);
      await PaymentReceiptService.upload(
        order.id,
        receipt,
        'Comprobante enviado desde el detalle del pedido web.'
      );
      const updatedOrder = await OrdersService.findById(order.id);
      setOrder(updatedOrder);
      setReceipt(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showSuccess(
        'Comprobante enviado',
        'El administrador verificará la imagen antes de registrar el valor pagado.'
      );
    } catch (requestError) {
      showError(
        'No se pudo registrar',
        requestError?.response?.data?.message ??
        requestError?.message ??
        'Intenta nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f9fc] text-[#004D77]" style={{ fontFamily: ORDER_FONT_FAMILY }}>
        <LoaderCircle size={34} className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !clientId || error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f9fc] p-4 text-center sm:p-6" style={{ fontFamily: ORDER_FONT_FAMILY }}>
        <Package size={40} className="mb-4 text-[#004D77]" />
        <h1 className="text-xl font-black text-slate-800">
          {!isAuthenticated ? 'Inicia sesión para ver el pedido' : 'Pedido no encontrado'}
        </h1>
        <p className="mt-2 max-w-md break-words text-sm text-slate-500 [overflow-wrap:anywhere]">
          {error || (!clientId ? 'Tu cuenta no tiene un cliente asociado.' : 'No encontramos este pedido.')}
        </p>
        <button
          type="button"
          onClick={() => navigate(!isAuthenticated ? '/login' : '/orders-l')}
          className="mt-5 rounded-full bg-[#004D77] px-6 py-3 text-xs font-black uppercase text-white"
        >
          {!isAuthenticated ? 'Iniciar sesión' : 'Volver a pedidos'}
        </button>
      </div>
    );
  }

  const hasRejectedReceipt = order.comprobantesPago?.some(
    (proof) => normalizeReceiptStatus(proof.status) === 'rechazado'
  );

  return (
    <div className="min-h-screen bg-[#f6f9fc]" style={{ fontFamily: ORDER_FONT_FAMILY }}>
      <ShopHero
        image={BgPedidos}
        title="Pedidos"
        tag="Detalle"
        subtitle={`Pedido N.° ${order.numeroPedido || order.id}`}
      />

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-5 sm:py-8">
        <button
          type="button"
          onClick={() => navigate('/orders-l')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#004D77]"
        >
          <ChevronLeft size={17} /> Volver a pedidos
        </button>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4 sm:space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
                  <Package size={21} className="text-[#004D77]" /> Información del pedido
                </h2>
                <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${getOrderStatusClasses(order.estadoLogistico)}`}>
                  {order.estadoLogistico}
                </span>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2 sm:gap-4">
                <Info label="Fecha" value={formatOrderDate(order.fechaPedido)} />
                <Info label="Número" value={order.numeroPedido || order.id} />
                <Info
                  label="Entrega"
                  value={order.tipoEntrega === 'recoge' ? 'Recoger en tienda' : order.direccionEntrega}
                  icon={<MapPin size={15} />}
                />
                <Info
                  label="Estado del pago"
                  value={order.saldoPendiente > 0 ? 'Pendiente' : 'Pago registrado'}
                  icon={<CreditCard size={15} />}
                />
              </div>
            </section>

            {order.saldoPendiente > 0 && order.estadoLogistico !== 'cancelado' && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
                  <CreditCard size={21} className="text-[#004D77]" /> Completar pago
                </h2>
                <p className="mt-3 break-words text-2xl font-black text-red-600 [overflow-wrap:anywhere] sm:text-3xl">{formatMoney(order.saldoPendiente)}</p>
                {shouldShowPaymentCountdown && (
                  <div className={`mt-3 flex items-start gap-3 rounded-2xl border px-4 py-3 ${
                    paymentCountdownExpired
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-amber-200 bg-amber-50 text-amber-800'
                  }`}>
                    <Clock size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase">
                        {paymentCountdownExpired ? 'Tiempo de pago agotado' : 'Tiempo restante para pagar'}
                      </p>
                      <p className="mt-1 text-lg font-black">
                        {paymentCountdownExpired ? '00h 00m 00s' : formatRemainingTime(remainingPaymentMs)}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-relaxed">
                        {paymentCountdownExpired
                          ? 'El pedido puede ser cancelado por vencimiento de pago.'
                          : 'El contador comenzó cuando el asesor asignó el valor del envío.'}
                      </p>
                    </div>
                  </div>
                )}
                {hasRejectedReceipt && (
                  <p className="mt-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-semibold leading-relaxed text-red-700">
                    Uno de tus comprobantes fue rechazado. Puedes enviar una nueva imagen para que el administrador revise el pago nuevamente.
                  </p>
                )}

                <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5">
                  <div className="text-center">
                    <img
                      src={qrMagic}
                      alt="Código QR de pago Magic"
                      onClick={() => setQrOpen(true)}
                      className="mx-auto h-36 w-36 cursor-pointer rounded-2xl border border-slate-200 bg-white object-contain p-1 shadow-sm sm:h-44 sm:w-44"
                    />
                    <button
                      type="button"
                      onClick={() => setQrOpen(true)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#004D77]"
                    >
                      <ZoomIn size={13} /> Ampliar QR
                    </button>
                  </div>

                  <div>
                    <div className="relative h-full">
                    <label className={`flex h-full min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition sm:min-h-44 ${
                      receipt
                        ? 'border-emerald-300 bg-emerald-50 hover:border-emerald-500'
                        : 'border-slate-300 hover:border-[#004D77] hover:bg-blue-50'
                    }`}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFileChange}
                        disabled={submitting}
                        className="hidden"
                      />
                      {receipt ? (
                        <CheckCircle size={28} className="mb-2 text-emerald-600" />
                      ) : (
                        <Upload size={28} className="mb-2 text-slate-400" />
                      )}
                      <span className="max-w-full break-all text-xs font-bold text-slate-700">
                        {receipt?.name || 'Haz clic para subir el comprobante'}
                      </span>
                      <span className={`mt-1 text-[11px] ${receipt ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {receipt ? 'Imagen cargada correctamente' : 'PNG, JPG o JPEG · máximo 10 MB'}
                      </span>
                    </label>
                    {receipt && (
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        disabled={submitting}
                        className="absolute right-3 top-3 rounded-full bg-white p-1 text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Quitar comprobante"
                      >
                        <X size={15} />
                      </button>
                    )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendReceipt}
                  disabled={!receipt || submitting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#004D77] px-5 py-3 text-xs font-black uppercase text-white disabled:opacity-50"
                >
                  {submitting && <LoaderCircle size={16} className="animate-spin" />}
                  {submitting ? 'Registrando...' : 'Enviar comprobante'}
                </button>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <h2 className="text-lg font-black text-slate-800">Ayuda con el pedido</h2>
              <button
                type="button"
                onClick={() => navigate(`/registerReturn/${order.id}`)}
                className="mt-2 text-sm font-bold text-[#004D77] hover:underline"
              >
                Tengo un problema con el pedido
              </button>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-black text-slate-800">
              {order.productos.length} {order.productos.length === 1 ? 'producto' : 'productos'}
            </h2>

            <div className="mt-4 space-y-3">
              {order.productos.map((product) => (
                <button
                  type="button"
                  key={product.detalleId || `${product.id}-${product.codBarras}`}
                  onClick={() => navigate(`/shop/detail/${product.id}`)}
                  className="grid w-full min-w-0 grid-cols-[48px_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50 sm:flex sm:items-center"
                >
                  <span className="flex h-12 w-12 shrink-0 overflow-hidden items-center justify-center rounded-xl bg-blue-50 text-[#004D77] sm:h-14 sm:w-14">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.nombre}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <Package size={20} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block break-words text-sm text-slate-800 [overflow-wrap:anywhere] sm:truncate">{product.nombre}</strong>
                    <small className="block break-words text-slate-500 [overflow-wrap:anywhere]">
                      {product.cantidad} und. × {formatMoney(product.precioUnitario)}
                    </small>
                  </span>
                  <strong className="col-start-2 min-w-0 break-words text-sm text-[#004D77] [overflow-wrap:anywhere] sm:ml-auto sm:max-w-[96px] sm:shrink-0 sm:text-right">{formatMoney(product.subtotal)}</strong>
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-slate-200 pt-5 text-sm">
              <Summary label="Subtotal" value={formatMoney(order.subtotal)} />
              <Summary label="IVA incluido" value={formatMoney(order.iva)} />
              <Summary label="Envío" value={formatMoney(order.shippingAmount)} />
              <Summary label="Total" value={formatMoney(order.total)} strong />
              <Summary label="Pagado" value={formatMoney(order.totalPagado)} className="text-green-600" />
              <Summary label="Pendiente" value={formatMoney(order.saldoPendiente)} className="text-red-600" />
            </div>

            {!!order.comprobantesPago?.length && (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-black text-slate-800">Comprobantes enviados</h3>
                <div className="mt-3 space-y-3">
                  {order.comprobantesPago.map((proof) => {
                    const statusView = getReceiptStatusView(proof.status);
                    const normalizedStatus = normalizeReceiptStatus(proof.status);
                    const reviewedAt = proof.reviewedAt
                      ? formatOrderDate(proof.reviewedAt, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : null;

                    return (
                      <button
                        type="button"
                        key={proof.id}
                        onClick={() => setProofPreview(proof)}
                        className="block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <img
                          src={proof.imageUrl}
                          alt={proof.fileName || 'Comprobante de pago'}
                          className="h-28 w-full object-cover"
                        />
                        <div className="space-y-2 p-3">
                          <span className={`inline-flex max-w-full rounded-full px-2 py-1 text-[10px] font-black uppercase ${statusView.className}`}>
                            {statusView.label}
                          </span>
                          {reviewedAt && (
                            <p className="text-[11px] font-semibold text-slate-500">
                              Revisado el {reviewedAt}
                            </p>
                          )}
                          {normalizedStatus !== 'aprobado' && normalizedStatus !== 'rechazado' && (
                            <p className="break-words rounded-lg bg-amber-50 p-2 text-[11px] font-semibold leading-snug text-amber-700 [overflow-wrap:anywhere]">
                              Tu comprobante fue enviado y esta pendiente de revision por un asesor.
                            </p>
                          )}
                          {normalizedStatus === 'rechazado' && proof.reviewObservations && (
                            <p className="break-words rounded-lg bg-red-50 p-2 text-[11px] font-semibold leading-snug text-red-700 [overflow-wrap:anywhere]">
                              {proof.reviewObservations}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!!order.pagos.length && (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-black text-slate-800">Comprobantes registrados</h3>
                {order.pagos.map((payment) => (
                  <div key={payment.id} className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                    <p className="font-bold text-slate-800">{payment.metodoPago} · {formatMoney(payment.monto)}</p>
                    {payment.comprobante && <p className="mt-1 break-all">Referencia: {payment.comprobante}</p>}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>

      {qrOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5"
          onClick={() => setQrOpen(false)}
        >
          <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-3 pt-12 shadow-2xl sm:max-w-[520px] sm:rounded-3xl sm:p-4 sm:pt-14" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Cerrar QR"
            >
              <X size={18} />
            </button>
            <img src={qrMagic} alt="Código QR de pago ampliado" className="mx-auto aspect-square max-h-[70vh] w-full max-w-[360px] rounded-2xl object-contain sm:max-w-[440px]" />
          </div>
        </div>
      )}

      {proofPreview && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5"
          onClick={() => setProofPreview(null)}
        >
          <div className="relative w-full max-w-[520px] rounded-2xl bg-white p-3 pt-12 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-4 sm:pt-14" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setProofPreview(null)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Cerrar comprobante"
            >
              <X size={18} />
            </button>
            <img
              src={proofPreview.imageUrl}
              alt={proofPreview.fileName || 'Comprobante de pago'}
              className="mx-auto max-h-[76vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 sm:p-4">
      <span className="flex min-w-0 items-center gap-1 text-xs font-black uppercase text-slate-400">{icon}{label}</span>
      <p className="mt-1 break-words font-bold text-slate-700 [overflow-wrap:anywhere]">{value || 'No disponible'}</p>
    </div>
  );
}

function Summary({ label, value, strong = false, className = '' }) {
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_minmax(0,max-content)] items-baseline gap-x-3 gap-y-1 ${strong ? 'border-t border-slate-200 pt-3 text-base font-black' : ''} ${className}`}>
      <span className="min-w-0 break-words [overflow-wrap:anywhere]">{label}</span>
      <span className="min-w-0 max-w-[160px] break-words text-right font-bold [overflow-wrap:anywhere] sm:max-w-none">{value}</span>
    </div>
  );
}

export default OrderDetail;
