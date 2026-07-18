import { useEffect, useState } from 'react';
import {
  ChevronLeft,
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

const normalizeReceiptStatus = (status) => String(status || 'Pendiente').trim().toLowerCase();

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
    label: 'Pendiente de verificacion',
    className: 'bg-amber-100 text-amber-700',
  };
};

function OrderDetail() {
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
      <div className="flex min-h-screen items-center justify-center bg-[#f6f9fc] text-[#004D77]">
        <LoaderCircle size={34} className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !clientId || error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f9fc] p-6 text-center">
        <Package size={40} className="mb-4 text-[#004D77]" />
        <h1 className="text-xl font-black text-slate-800">
          {!isAuthenticated ? 'Inicia sesión para ver el pedido' : 'Pedido no encontrado'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
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
    <div className="min-h-screen bg-[#f6f9fc]">
      <ShopHero
        image={BgPedidos}
        title="Pedidos"
        tag="Detalle"
        subtitle={`Pedido N.° ${order.numeroPedido || order.id}`}
      />

      <main className="mx-auto max-w-7xl px-5 py-8">
        <button
          type="button"
          onClick={() => navigate('/orders-l')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#004D77]"
        >
          <ChevronLeft size={17} /> Volver a pedidos
        </button>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
                  <Package size={21} className="text-[#004D77]" /> Información del pedido
                </h2>
                <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${getOrderStatusClasses(order.estadoLogistico)}`}>
                  {order.estadoLogistico}
                </span>
              </div>

              <div className="grid gap-4 text-sm sm:grid-cols-2">
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
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
                  <CreditCard size={21} className="text-[#004D77]" /> Completar pago
                </h2>
                <p className="mt-3 text-3xl font-black text-red-600">{formatMoney(order.saldoPendiente)}</p>
                {hasRejectedReceipt && (
                  <p className="mt-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-semibold leading-relaxed text-red-700">
                    Uno de tus comprobantes fue rechazado. Puedes enviar una nueva imagen para que el administrador revise el pago nuevamente.
                  </p>
                )}

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="text-center">
                    <img
                      src={qrMagic}
                      alt="Código QR de pago Magic"
                      onClick={() => setQrOpen(true)}
                      className="mx-auto h-44 w-44 cursor-pointer rounded-2xl border border-slate-200 object-contain p-1 shadow-sm"
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
                    <label className="flex h-full min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center hover:border-[#004D77] hover:bg-blue-50">
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFileChange}
                        disabled={submitting}
                        className="hidden"
                      />
                      <Upload size={28} className="mb-2 text-slate-400" />
                      <span className="max-w-full break-all text-xs font-bold text-slate-700">
                        {receipt?.name || 'Subir comprobante'}
                      </span>
                      <span className="mt-1 text-[11px] text-slate-400">PNG, JPG o JPEG · máximo 10 MB</span>
                    </label>
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

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-black text-slate-800">
              {order.productos.length} {order.productos.length === 1 ? 'producto' : 'productos'}
            </h2>

            <div className="mt-4 space-y-3">
              {order.productos.map((product) => (
                <button
                  type="button"
                  key={product.detalleId || `${product.id}-${product.codBarras}`}
                  onClick={() => navigate(`/shop/detail/${product.id}`)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="flex h-14 w-14 shrink-0 overflow-hidden items-center justify-center rounded-xl bg-blue-50 text-[#004D77]">
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
                    <strong className="block truncate text-sm text-slate-800">{product.nombre}</strong>
                    <small className="text-slate-500">
                      {product.cantidad} und. × {formatMoney(product.precioUnitario)}
                    </small>
                  </span>
                  <strong className="text-sm text-[#004D77]">{formatMoney(product.subtotal)}</strong>
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-200 pt-5 text-sm">
              <Summary label="Subtotal" value={formatMoney(order.subtotal)} />
              <Summary label="IVA incluido" value={formatMoney(order.iva)} />
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
                    const reviewedAt = proof.reviewedAt
                      ? formatOrderDate(proof.reviewedAt, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : null;

                    return (
                      <a
                        key={proof.id}
                        href={proof.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={proof.imageUrl}
                          alt={proof.fileName || 'Comprobante de pago'}
                          className="h-28 w-full object-cover"
                        />
                        <div className="space-y-2 p-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase ${statusView.className}`}>
                            {statusView.label}
                          </span>
                          {reviewedAt && (
                            <p className="text-[11px] font-semibold text-slate-500">
                              Revisado el {reviewedAt}
                            </p>
                          )}
                          {normalizeReceiptStatus(proof.status) === 'rechazado' && proof.reviewObservations && (
                            <p className="rounded-lg bg-red-50 p-2 text-[11px] font-semibold leading-snug text-red-700">
                              {proof.reviewObservations}
                            </p>
                          )}
                        </div>
                      </a>
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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-5"
          onClick={() => setQrOpen(false)}
        >
          <div className="relative rounded-3xl bg-white p-4" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              className="absolute right-3 top-3 rounded-full bg-slate-100 p-2"
              aria-label="Cerrar QR"
            >
              <X size={18} />
            </button>
            <img src={qrMagic} alt="Código QR de pago ampliado" className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <span className="flex items-center gap-1 text-xs font-black uppercase text-slate-400">{icon}{label}</span>
      <p className="mt-1 font-bold text-slate-700">{value || 'No disponible'}</p>
    </div>
  );
}

function Summary({ label, value, strong = false, className = '' }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? 'border-t border-slate-200 pt-3 text-base font-black' : ''} ${className}`}>
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export default OrderDetail;
