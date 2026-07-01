import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import LoadingOverlay from '../../../../shared/LoadingOverlay';
import { resolveDefectiveProduct } from '../data/returnsService';
import { formatCurrency } from '../utils/returnsHelpers';

const RETURN_REASONS = [
  { id: 5, label: 'Insatisfecho' },
  { id: 8, label: 'Prod. en mal estado' },
  { id: 11, label: 'Prod. incorrecto' },
  { id: 10, label: 'Otro motivo' },
];

const RETURN_METHODS = [
  { id: 1, label: 'Reemplazo' },
  { id: 2, label: 'Reembolso' },
  { id: 3, label: 'Saldo a favor' },
];

const getMethodId = (method) => (
  RETURN_METHODS.find((option) => option.label === method)?.id ?? 1
);

const formatReturnDeadline = (date) => {
  if (!date) return 'la fecha configurada';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'la fecha configurada';

  return parsedDate.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
};

function PurchaseReturnModal({
  isOpen,
  onClose,
  productData,
  onSuccess,
}) {
  const { showError, showSuccess } = useAlert();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    quantity: 1,
    idReturnReason: 5,
    idReturnMethod: 1,
  });

  const availableQuantity = Math.max(
    0,
    Number(productData?.purchaseInfo?.availableQuantity || 0)
  );
  const returnedQuantity = Math.max(1, Number(productData?.quantity || 1));
  const maximumQuantity = Math.min(returnedQuantity, availableQuantity);

  useEffect(() => {
    if (!isOpen || !productData) return;

    setFormData({
      quantity: Math.max(1, maximumQuantity),
      idReturnReason: 5,
      idReturnMethod: getMethodId(productData.method),
    });
    setTouched({});
  }, [isOpen, maximumQuantity, productData]);

  const errors = useMemo(() => {
    const nextErrors = {};
    const quantity = Number(formData.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      nextErrors.quantity = 'La cantidad debe ser un número entero mayor a cero';
    } else if (quantity > maximumQuantity) {
      nextErrors.quantity = `Máximo ${maximumQuantity} unidad(es) disponibles`;
    }

    if (!RETURN_REASONS.some((reason) => reason.id === Number(formData.idReturnReason))) {
      nextErrors.idReturnReason = 'Selecciona un motivo válido';
    }
    if (!RETURN_METHODS.some((method) => method.id === Number(formData.idReturnMethod))) {
      nextErrors.idReturnMethod = 'Selecciona un método válido';
    }

    return nextErrors;
  }, [formData, maximumQuantity]);

  if (!isOpen || !productData) return null;

  const { purchaseInfo } = productData;

  const handleSubmit = async () => {
    setTouched({
      quantity: true,
      idReturnReason: true,
      idReturnMethod: true,
    });
    if (Object.keys(errors).length > 0 || loading) return;

    try {
      setLoading(true);
      const result = await resolveDefectiveProduct(
        productData.saleReturnId,
        productData.saleReturnDetailId,
        {
          action: 'PURCHASE_RETURN',
          quantity: Number(formData.quantity),
          idReturnReason: Number(formData.idReturnReason),
          idReturnMethod: Number(formData.idReturnMethod),
        }
      );
      showSuccess(
        'Devolución de compra generada',
        'El producto quedó asociado a una nueva devolución de compra.'
      );
      await onSuccess?.(result);
      onClose();
    } catch (error) {
      showError('No se pudo generar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <LoadingOverlay show={loading} message="Generando devolución de compra..." />
        <header className="flex items-center justify-between bg-[#004D77] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">Generar devolución de compra</h2>
            <p className="mt-0.5 text-xs text-white/70">Producto defectuoso recibido y listo</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">Compra vigente encontrada</p>
              <p className="mt-1 text-xs text-green-700">
                Factura {purchaseInfo.invoiceNumber || purchaseInfo.idPurchase}
                {' · '}
                {purchaseInfo.provider?.name_provider || purchaseInfo.providerName || 'Proveedor'}
                {' · '}
                disponible hasta {formatReturnDeadline(purchaseInfo.maxReturnDate)}
              </p>
            </div>
          </div>

          {maximumQuantity < returnedQuantity && (
            <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Solo {maximumQuantity} de {returnedQuantity} unidad(es) tienen disponibilidad
              para esta compra.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 p-4 text-sm">
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase text-gray-400">Producto</p>
              <p className="mt-1 font-semibold text-gray-800">{productData.productName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Código de barras</p>
              <p className="mt-1 text-gray-700">{productData.barcode || 'No registrado'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Valor de compra</p>
              <p className="mt-1 text-gray-700">
                {formatCurrency(Number(purchaseInfo.unitPrice || 0))}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={maximumQuantity}
              value={formData.quantity}
              onChange={(event) => {
                setTouched((current) => ({ ...current, quantity: true }));
                setFormData((current) => ({
                  ...current,
                  quantity: event.target.value,
                }));
              }}
              onBlur={() => setTouched((current) => ({ ...current, quantity: true }))}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-[#004D77] ${
                touched.quantity && errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {touched.quantity && errors.quantity && (
              <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Motivo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.idReturnReason}
                onChange={(event) => setFormData((current) => ({
                  ...current,
                  idReturnReason: Number(event.target.value),
                }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#004D77]"
              >
                {RETURN_REASONS.map((reason) => (
                  <option key={reason.id} value={reason.id}>{reason.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Método <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.idReturnMethod}
                onChange={(event) => setFormData((current) => ({
                  ...current,
                  idReturnMethod: Number(event.target.value),
                }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#004D77]"
              >
                {RETURN_METHODS.map((method) => (
                  <option key={method.id} value={method.id}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <footer className="flex gap-3 border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-200 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || maximumQuantity < 1 || Object.keys(errors).length > 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#004D77] py-2.5 text-sm font-bold text-white transition hover:bg-[#003d61] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Generando...' : 'Generar devolución'}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default PurchaseReturnModal;
