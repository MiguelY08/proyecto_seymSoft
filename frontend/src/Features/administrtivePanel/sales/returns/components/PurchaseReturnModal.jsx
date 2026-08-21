import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import LoadingOverlay from '../../../../shared/LoadingOverlay';
import FormSelect from '../../../../shared/FormSelect';
import { resolveDefectiveProduct } from '../data/returnsService';
import { formatCurrency } from '../utils/returnsHelpers';
import {
  RETURN_REASON_OPTIONS as PURCHASE_RETURN_REASON_OPTIONS,
  RETURN_METHOD_OPTIONS as PURCHASE_RETURN_METHOD_OPTIONS,
  RETURN_METHOD_IDS,
} from '../../../purchases/returns/helpers/returnsHelpers';

const RETURN_REASONS = PURCHASE_RETURN_REASON_OPTIONS;

const RETURN_METHODS = PURCHASE_RETURN_METHOD_OPTIONS.filter(
  (method) => Number(method.id) !== RETURN_METHOD_IDS.CREDIT_BALANCE
);

const RETURN_REASON_OPTIONS = RETURN_REASONS.map((reason) => ({
  value: reason.id,
  label: reason.label,
}));

const RETURN_METHOD_OPTIONS = RETURN_METHODS.map((method) => ({
  value: method.id,
  label: method.label,
}));

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-0 backdrop-blur-sm sm:p-4">
      <div className="relative flex h-dvh w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl">
        <LoadingOverlay show={loading} message="Generando devolución de compra..." />
        <header className="relative flex items-center justify-between overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-4">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-white">Generar devolución de compra</h2>
              <p className="mt-0.5 text-xs text-white/70">Producto defectuoso recibido y listo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="relative rounded-full border border-white/10 p-2 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
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
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Solo {maximumQuantity} de {returnedQuantity} unidad(es) tienen disponibilidad
              para esta compra.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
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
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-[#004D77] ${
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
              <FormSelect
                value={formData.idReturnReason}
                options={RETURN_REASON_OPTIONS}
                onChange={(value) => setFormData((current) => ({
                  ...current,
                  idReturnReason: Number(value),
                }))}
                ariaLabel="Motivo de devolución de compra"
                placeholder="Seleccione un motivo"
                className="rounded-lg"
                placement="bottom"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Método <span className="text-red-500">*</span>
              </label>
              <FormSelect
                value={formData.idReturnMethod}
                options={RETURN_METHOD_OPTIONS}
                onChange={(value) => setFormData((current) => ({
                  ...current,
                  idReturnMethod: Number(value),
                }))}
                ariaLabel="Método de devolución de compra"
                placeholder="Seleccione un método"
                className="rounded-lg"
                placement="bottom"
              />
            </div>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-gray-200 p-4 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-[#004D77] bg-white py-2.5 text-sm font-medium text-[#004D77] shadow-sm transition-colors hover:bg-sky-100 hover:shadow-md disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || maximumQuantity < 1 || Object.keys(errors).length > 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#004D77] bg-[#004D77] py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:border-[#003a5c] hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300"
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

