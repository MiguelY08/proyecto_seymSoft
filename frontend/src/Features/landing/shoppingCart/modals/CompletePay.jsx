import { AlertTriangle, CheckCircle, Clock, LoaderCircle, Store, Upload, X, ZoomIn } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import qrMagic from '../../../../assets/QR_Magic.jpg';
import {
  ESTADOS_LOGISTICOS,
  ORIGENES,
  OrdersService,
  PaymentReceiptService,
} from '../../../administrtivePanel/sales/orders/services/ordersService';
import { useAlert } from '../../../shared/alerts/useAlert';
import { getProductBarcode } from '../../orders/helpers/customerOrderHelpers';

const INITIAL_SECONDS = 48 * 60 * 60;

function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return {
    hours: String(Math.floor(secondsLeft / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0'),
    seconds: String(secondsLeft % 60).padStart(2, '0'),
    expired: secondsLeft === 0,
  };
}

function CompletePay({
  isOpen,
  onClose,
  onCompleted,
  totalAmount,
  deliveryInfo,
  cartItems,
  clientId,
}) {
  const { showError, showSuccess, showWarning } = useAlert();
  const { hours, minutes, seconds, expired } = useCountdown();
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (qrOpen) {
      setQrOpen(false);
      return;
    }
    if (submitting) return;
    if (pendingOrder) {
      showWarning(
        'Comprobante pendiente',
        `El pedido #${pendingOrder.id} ya fue creado. Reintenta la subida antes de cerrar esta ventana.`
      );
      return;
    }
    onClose();
  };

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

  const handleSubmit = async () => {
    if (submitting) return;
    if (expired) {
      showWarning('Tiempo agotado', 'Cierra esta ventana e inicia nuevamente el pago.');
      return;
    }
    if (!clientId) {
      showError(
        'Cliente no identificado',
        'Tu cuenta no está asociada a un cliente. Inicia sesión nuevamente o contacta a un asesor.'
      );
      return;
    }
    if (!receipt) {
      showWarning('Falta el comprobante', 'Selecciona la imagen del comprobante de pago.');
      return;
    }
    if (!cartItems?.length) {
      showError('Carrito vacío', 'No hay productos para crear el pedido.');
      return;
    }

    const products = cartItems.map((item) => ({
      id: Number(item.id),
      codBarras: getProductBarcode(item),
      cantidad: Number(item.quantity) || 1,
    }));
    const productWithoutBarcode = products.find((product) => !product.codBarras);
    if (productWithoutBarcode) {
      showError(
        'Producto sin código de barras',
        'Uno de los productos no tiene código de barras y no puede agregarse al pedido.'
      );
      return;
    }

    setSubmitting(true);
    let createdOrder = pendingOrder;

    try {
      if (!createdOrder) {
        createdOrder = await OrdersService.create({
          clienteId: clientId,
          tipoEntrega: 'recoge',
          direccionEntrega: 'El cliente lo recoge',
          deliveryRecipientName: String(deliveryInfo?.deliveryRecipientName || '').trim(),
          departamentoEntregaCodigo: null,
          departamentoEntregaNombre: null,
          ciudadEntregaCodigo: null,
          ciudadEntregaNombre: null,
          productos: products,
          estadoLogistico: ESTADOS_LOGISTICOS.EN_PROCESO,
          origen: ORIGENES.WEB,
          saleType: ORIGENES.WEB,
        });
        setPendingOrder(createdOrder);
      }

      await PaymentReceiptService.upload(
        createdOrder.id,
        receipt,
        [
          'Comprobante enviado desde la tienda web.',
          deliveryInfo?.notas ? `Notas: ${deliveryInfo.notas}` : null,
        ].filter(Boolean).join(' ')
      );

      showSuccess(
        'Pedido creado',
        `Recibimos tu pedido #${createdOrder.numeroPedido || createdOrder.id}.`
      );
      setPendingOrder(null);
      onCompleted?.(createdOrder);
    } catch (error) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'No fue posible completar la compra.';

      if (createdOrder?.id) {
        showError(
          'No se guardó el comprobante',
          `El pedido #${createdOrder.id} ya fue creado. No cierres esta ventana: vuelve a presionar "Enviar comprobante" para reintentar únicamente la imagen. ${message}`
        );
      } else {
        showError('No se pudo crear el pedido', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-serif text-xl font-bold text-slate-900">Completar pago</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full bg-slate-100 p-2 text-slate-600 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div className={`flex items-center gap-3 rounded-2xl border p-3 ${
            expired ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}>
            <Clock size={18} />
            <span className="text-sm font-bold">
              {expired ? 'Tiempo de pago agotado' : `${hours}h ${minutes}m ${seconds}s para pagar`}
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-500">Total a pagar</p>
              <p className="mt-1 text-xl font-black text-[#004D77]">
                ${(Number(totalAmount) || 0).toLocaleString('es-CO')} COP
              </p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                <Store size={12} />
                Recoger en tienda
              </span>
            </div>
            <div className="text-center">
              <p className="mb-2 text-xs text-slate-500">Escanea para pagar</p>
              <img
                src={qrMagic}
                alt="Código QR de pago Magic"
                onClick={() => setQrOpen(true)}
                className="h-28 w-28 cursor-pointer rounded-xl border border-slate-200 bg-white object-contain p-1"
              />
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#004D77]"
              >
                <ZoomIn size={13} /> Ampliar QR
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">
              El comprobante debe cubrir el total pendiente del pedido. Si el pago no corresponde al valor completo, la aprobacion puede ser rechazada.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-slate-700">Comprobante de transferencia</p>
            <div className="relative">
              <label className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-4 text-center transition ${
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
                  <CheckCircle size={24} className="mb-2 text-emerald-600" />
                ) : (
                  <Upload size={24} className="mb-2 text-slate-400" />
                )}
                <span className="max-w-full break-all text-xs font-semibold text-slate-700">
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

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-full border-2 border-slate-200 px-4 py-3 text-xs font-extrabold text-slate-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!receipt || expired || submitting}
              className="flex items-center justify-center gap-2 rounded-full bg-[#004D77] px-4 py-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <LoaderCircle size={16} className="animate-spin" />}
              {submitting
                ? pendingOrder
                  ? 'Subiendo comprobante...'
                  : 'Creando pedido...'
                : pendingOrder
                  ? 'Reintentar comprobante'
                  : 'Enviar comprobante'}
            </button>
          </div>
        </div>
      </div>
    </div>

    {qrOpen && (
      <div
        className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5"
        onClick={() => setQrOpen(false)}
      >
        <div
          className="relative w-full max-w-[420px] rounded-2xl bg-white p-3 pt-12 shadow-2xl sm:max-w-[520px] sm:rounded-3xl sm:p-4 sm:pt-14"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setQrOpen(false)}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            aria-label="Cerrar QR"
          >
            <X size={18} />
          </button>
          <img
            src={qrMagic}
            alt="Código QR de pago ampliado"
            className="mx-auto aspect-square max-h-[70vh] w-full max-w-[360px] rounded-2xl object-contain sm:max-w-[440px]"
          />
        </div>
      </div>
    )}
    </>
  );
}

export default CompletePay;
