import { Clock, LoaderCircle, MapPin, Store, Upload, X } from 'lucide-react';
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
  deliveryMethod,
  deliveryInfo,
  cartItems,
  clientId,
}) {
  const { showError, showSuccess, showWarning } = useAlert();
  const { hours, minutes, seconds, expired } = useCountdown();
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
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

    const isPickup = deliveryMethod === 'tienda';
    const deliveryAddress = isPickup
      ? 'El cliente lo recoge'
      : [
          deliveryInfo?.direccion,
          deliveryInfo?.barrio && `Barrio ${deliveryInfo.barrio}`,
          deliveryInfo?.ciudad,
        ].filter(Boolean).join(', ');

    setSubmitting(true);
    let createdOrder = pendingOrder;

    try {
      if (!createdOrder) {
        createdOrder = await OrdersService.create({
          clienteId: clientId,
          tipoEntrega: isPickup ? 'recoge' : 'domicilio',
          direccionEntrega: deliveryAddress,
          productos: products,
          estadoLogistico: ESTADOS_LOGISTICOS.EN_PROCESO,
          origen: ORIGENES.WEB,
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
                {deliveryMethod === 'domicilio' ? <MapPin size={12} /> : <Store size={12} />}
                {deliveryMethod === 'domicilio' ? 'Domicilio' : 'Recoger en tienda'}
              </span>
            </div>
            <div className="text-center">
              <p className="mb-2 text-xs text-slate-500">Escanea para pagar</p>
              <img
                src={qrMagic}
                alt="Código QR de pago Magic"
                className="h-28 w-28 rounded-xl border border-slate-200 bg-white object-contain p-1"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-slate-700">Comprobante de transferencia</p>
            <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center transition hover:border-[#004D77] hover:bg-blue-50">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
                disabled={submitting}
                className="hidden"
              />
              <Upload size={24} className="mb-2 text-slate-400" />
              <span className="max-w-full break-all text-xs font-semibold text-slate-700">
                {receipt?.name || 'Haz clic para subir el comprobante'}
              </span>
              <span className="mt-1 text-[11px] text-slate-400">PNG, JPG o JPEG · máximo 10 MB</span>
            </label>
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
  );
}

export default CompletePay;
