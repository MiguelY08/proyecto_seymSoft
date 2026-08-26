import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Plus, X } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import FormSelect from '../../../../shared/FormSelect';
import { resolveDefectiveProduct } from '../data/returnsService';
import { formatCurrency } from '../utils/returnsHelpers';
import {
  RETURN_REASON_OPTIONS as PURCHASE_RETURN_REASON_OPTIONS,
  RETURN_METHOD_OPTIONS as PURCHASE_RETURN_METHOD_OPTIONS,
  RETURN_METHOD_IDS,
  getPurchaseReturnProviderName,
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

const DEFAULT_REASON_ID =
  RETURN_REASONS.find((reason) => reason.code === 'DEFECTUOSO')?.id ??
  RETURN_REASONS[0]?.id ??
  0;

const DEFAULT_METHOD_ID =
  RETURN_METHODS.find((method) => Number(method.id) === RETURN_METHOD_IDS.REPLACEMENT)?.id ??
  RETURN_METHODS[0]?.id ??
  0;

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const getMethodId = (method) => {
  const numericMethod = Number(
    typeof method === 'object'
      ? method?.id ?? method?.idReturnMethod ?? method?.returnMethodId
      : method
  );

  if (RETURN_METHODS.some((option) => Number(option.id) === numericMethod)) {
    return numericMethod;
  }

  const normalizedMethod = normalizeText(
    typeof method === 'object'
      ? method?.label ?? method?.name ?? method?.method ?? method?.returnMethod
      : method
  );

  return (
    RETURN_METHODS.find((option) => normalizeText(option.label) === normalizedMethod)?.id ??
    DEFAULT_METHOD_ID
  );
};

const getOptionLabel = (options, value, fallback) =>
  options.find((option) => Number(option.value) === Number(value))?.label ?? fallback;

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
  const { showConfirm, showError, showSuccess, showWarning } = useAlert();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    quantity: 1,
    idReturnReason: DEFAULT_REASON_ID,
    idReturnMethod: DEFAULT_METHOD_ID,
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
      idReturnReason: DEFAULT_REASON_ID,
      idReturnMethod: getMethodId(productData.method),
    });
    setTouched({});
    setLoading(false);
  }, [isOpen, maximumQuantity, productData]);

  const errors = useMemo(() => {
    const nextErrors = {};
    const quantity = Number(formData.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      nextErrors.quantity = 'La cantidad debe ser un número entero mayor a cero';
    } else if (quantity > maximumQuantity) {
      nextErrors.quantity = `Máximo ${maximumQuantity} unidad(es) disponibles`;
    }

    if (!RETURN_REASONS.some((reason) => Number(reason.id) === Number(formData.idReturnReason))) {
      nextErrors.idReturnReason = 'Selecciona un motivo válido';
    }

    if (!RETURN_METHODS.some((method) => Number(method.id) === Number(formData.idReturnMethod))) {
      nextErrors.idReturnMethod = 'Selecciona un método válido';
    }

    return nextErrors;
  }, [formData, maximumQuantity]);

  if (!isOpen || !productData) return null;

  const { purchaseInfo } = productData;
  const reasonLabel = getOptionLabel(RETURN_REASON_OPTIONS, formData.idReturnReason, 'Sin motivo');
  const methodLabel = getOptionLabel(RETURN_METHOD_OPTIONS, formData.idReturnMethod, 'Sin método');

  const markAllTouched = () => {
    setTouched({
      quantity: true,
      idReturnReason: true,
      idReturnMethod: true,
    });
  };

  const handleSubmit = async () => {
    if (loading) return;
    markAllTouched();

    if (Object.keys(errors).length > 0) {
      showWarning(
        'Formulario incompleto',
        Object.values(errors)[0] || 'Por favor revisa los campos marcados en rojo antes de continuar.'
      );
      return;
    }

    const result = await showConfirm(
      'info',
      'Confirmar devolución de compra',
      `¿Deseas generar una devolución de compra para ${productData.productName}?`,
      { confirmButtonText: 'Sí, generar', cancelButtonText: 'Cancelar' }
    );

    if (!result?.isConfirmed) return;

    try {
      setLoading(true);
      const response = await resolveDefectiveProduct(
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
      await onSuccess?.(response);
      onClose();
    } catch (error) {
      showError(
        'No se pudo generar',
        error?.message || 'No fue posible generar la devolución de compra.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => {
        if (!loading) onClose();
      }}
      className="fixed inset-0 z-[70] flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:w-[min(920px,96vw)] sm:rounded-lg"
      >
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
                <Plus className="h-5 w-5 text-white" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">
                  Generar devolución de compra
                </h2>
                <p className="mt-0.5 text-sm text-white/80">
                  Producto defectuoso recibido y listo
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Cerrar formulario de devolución"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">
                Compra vigente encontrada
              </p>
              <p className="mt-1 text-xs leading-relaxed text-green-700 sm:text-sm">
                Factura {purchaseInfo.invoiceNumber || purchaseInfo.idPurchase}
                {' · '}
                {getPurchaseReturnProviderName(purchaseInfo)}
                {' · '}
                disponible hasta {formatReturnDeadline(purchaseInfo.maxReturnDate)}
              </p>
            </div>
          </div>

          {maximumQuantity < 1 && (
            <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              No hay unidades disponibles para generar una devolución de compra desde este producto.
            </div>
          )}

          {maximumQuantity > 0 && maximumQuantity < returnedQuantity && (
            <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Solo {maximumQuantity} de {returnedQuantity} unidad(es) tienen disponibilidad para esta compra.
            </div>
          )}

          <section className="rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Producto
                </p>
                <p className="mt-1 font-semibold text-gray-800">{productData.productName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Código de barras
                </p>
                <p className="mt-1 text-gray-700">{productData.barcode || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Valor de compra
                </p>
                <p className="mt-1 text-gray-700">
                  {formatCurrency(Number(purchaseInfo.unitPrice || 0))}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Cantidad devuelta en venta
                </p>
                <p className="mt-1 text-gray-700">{returnedQuantity}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Disponible para compra
                </p>
                <p className="mt-1 text-gray-700">{availableQuantity}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
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
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#004D77] ${
                  touched.quantity && errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {touched.quantity && errors.quantity && (
                <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Motivo <span className="text-red-500">*</span>
              </label>
              <FormSelect
                value={formData.idReturnReason}
                options={RETURN_REASON_OPTIONS}
                onChange={(value) => {
                  setTouched((current) => ({ ...current, idReturnReason: true }));
                  setFormData((current) => ({
                    ...current,
                    idReturnReason: Number(value),
                  }));
                }}
                ariaLabel="Motivo de devolución de compra"
                placeholder="Seleccione un motivo"
                className="rounded-xl"
                placement="bottom"
              />
              {touched.idReturnReason && errors.idReturnReason && (
                <p className="mt-1 text-xs text-red-600">{errors.idReturnReason}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Método <span className="text-red-500">*</span>
              </label>
              <FormSelect
                value={formData.idReturnMethod}
                options={RETURN_METHOD_OPTIONS}
                onChange={(value) => {
                  setTouched((current) => ({ ...current, idReturnMethod: true }));
                  setFormData((current) => ({
                    ...current,
                    idReturnMethod: Number(value),
                  }));
                }}
                ariaLabel="Método de devolución de compra"
                placeholder="Seleccione un método"
                className="rounded-xl"
                placement="bottom"
              />
              {touched.idReturnMethod && errors.idReturnMethod && (
                <p className="mt-1 text-xs text-red-600">{errors.idReturnMethod}</p>
              )}
            </div>
          </section>

          <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm text-[#004D77]">
            <p>
              Se generará con motivo <span className="font-semibold">{reasonLabel}</span>,
              método <span className="font-semibold">{methodLabel}</span> y estado inicial{' '}
              <span className="font-semibold">Pend. envío</span>, igual que una devolución de compra normal.
            </p>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white p-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[44px] rounded-full border border-[#004D77] bg-white px-8 py-2.5 text-sm font-medium text-[#004D77] shadow-sm transition-colors hover:bg-sky-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || maximumQuantity < 1}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#004D77] bg-[#004D77] px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:border-[#003a5c] hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300"
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
