import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Save,
  Truck,
  MapPin,
  PackageCheck,
  Tag,
  FileText,
  Info,
  Home,
} from 'lucide-react';

import { SalesServices } from '../services/salesServices';
import { useAlert } from '../../../../shared/alerts/useAlert';
import FormSelect from '../../../../shared/FormSelect';

const SALE_STATUS = {
  APROBADA: 1,
  DENEGADA: 2,
  ESP_APROBACION: 3,
  ANULADA: 4,
  PROC_DEVOLUCION: 5,
};

const ORDER_STATUS = {
  EN_PROCESO: 1,
  LISTO: 2,
  ENTREGADO: 3,
  CANCELADO: 4,
};

const SALE_STATUS_OPTIONS = [
  { id: SALE_STATUS.APROBADA, label: 'Aprobada' },
  { id: SALE_STATUS.DENEGADA, label: 'Denegada' },
  { id: SALE_STATUS.ESP_APROBACION, label: 'Esp. aprobacion' },
];

const ORDER_STATUS_OPTIONS = [
  { id: ORDER_STATUS.EN_PROCESO, label: 'En proceso' },
  { id: ORDER_STATUS.LISTO, label: 'Listo' },
  { id: ORDER_STATUS.ENTREGADO, label: 'Entregado' },
  { id: ORDER_STATUS.CANCELADO, label: 'Cancelado' },
];

const normalizeDeliveryType = (value) => {
  const text = String(value ?? '').toLowerCase();
  return text.includes('delivery') || text.includes('domicilio')
    ? 'delivery'
    : 'pickup';
};

const getInitialDeliveryType = (sale) =>
  normalizeDeliveryType(
    sale?.order?.deliveryType ??
    sale?.deliveryType ??
    sale?.entrega
  );

const getInitialOrderStatus = (sale) =>
  sale?.order?.idOrderStatus ??
  sale?.idOrderStatus ??
  sale?.order?.orderStatus?.idOrderStatus ??
  ORDER_STATUS.EN_PROCESO;

const getInitialSaleStatus = (sale) =>
  sale?.idSaleStatus ??
  sale?.saleStatus?.idSaleStatus ??
  statusNameToId(sale?.saleStatus?.nameStatus ?? sale?.estado);

const statusNameToId = (name) => {
  const normalized = String(name ?? '').toLowerCase();

  if (normalized.includes('aprobada')) return SALE_STATUS.APROBADA;
  if (normalized.includes('denegada')) return SALE_STATUS.DENEGADA;
  if (normalized.includes('esp')) return SALE_STATUS.ESP_APROBACION;
  if (normalized.includes('anulada')) return SALE_STATUS.ANULADA;
  if (normalized.includes('devolucion')) return SALE_STATUS.PROC_DEVOLUCION;

  return SALE_STATUS.ESP_APROBACION;
};

const isApprovedStatus = (idSaleStatus) =>
  Number(idSaleStatus) === SALE_STATUS.APROBADA;

const isAnnulledStatus = (idSaleStatus) =>
  Number(idSaleStatus) === SALE_STATUS.ANULADA;

const isFinalOrderStatus = (idOrderStatus) =>
  [ORDER_STATUS.ENTREGADO, ORDER_STATUS.CANCELADO].includes(Number(idOrderStatus));

const deliveryTypeToApi = (deliveryType) =>
  deliveryType === 'delivery' ? 'delivery' : 'pickup';

function SaleEditForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showWarning, showSuccess, showError, showConfirm } = useAlert();

  const saleFromState = location.state?.sale ?? null;

  const [loading, setLoading] = useState(false);
  const [sale, setSale] = useState(saleFromState);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    deliveryType: getInitialDeliveryType(saleFromState),
    deliveryAddress:
      saleFromState?.order?.deliveryAddress ??
      saleFromState?.direccion ??
      '',
    idSaleStatus: getInitialSaleStatus(saleFromState),
    idOrderStatus: getInitialOrderStatus(saleFromState),
  });

  const originalSaleStatus = useMemo(
    () => getInitialSaleStatus(sale),
    [sale]
  );

  const originalOrderStatus = useMemo(
    () => getInitialOrderStatus(sale),
    [sale]
  );

  const approvedSale = isApprovedStatus(originalSaleStatus);
  const annulledSale = isAnnulledStatus(originalSaleStatus);
  const finalOrder = isFinalOrderStatus(originalOrderStatus);
  const cancelledOrder = Number(originalOrderStatus) === ORDER_STATUS.CANCELADO;
  const deliveredOrder = Number(originalOrderStatus) === ORDER_STATUS.ENTREGADO;
  const selectedSaleApproved = isApprovedStatus(formData.idSaleStatus);
  const canChangeSaleStatus = !approvedSale && !annulledSale;
  const canChangeOrderStatus = !annulledSale && !finalOrder && (approvedSale || selectedSaleApproved);
  const canEditDelivery = !annulledSale && !finalOrder;

  const title = useMemo(() => {
    const invoice = sale?.factura ?? sale?.id ?? sale?.idSale ?? '';
    return invoice ? `Editando venta No. ${invoice}` : 'Editando venta';
  }, [sale]);

  useEffect(() => {
    if (!saleFromState?.id) {
      showError('Error', 'No se encontro informacion de la venta.');
      navigate('/admin/sales', { replace: true });
      return;
    }

    const loadSale = async () => {
      try {
        setLoading(true);

        const freshSale = await SalesServices.getById(saleFromState.id);

        if (!freshSale) {
          showError('Error', 'La venta no existe.');
          navigate('/admin/sales', { replace: true });
          return;
        }

        setSale(freshSale);
        setFormData({
          deliveryType: getInitialDeliveryType(freshSale),
          deliveryAddress:
            freshSale?.order?.deliveryAddress ??
            freshSale?.direccion ??
            '',
          idSaleStatus: getInitialSaleStatus(freshSale),
          idOrderStatus: getInitialOrderStatus(freshSale),
        });
      } catch (error) {
        console.error('Error cargando venta:', error);
        showError('Error', 'No se pudo cargar la venta.');
        navigate('/admin/sales', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [saleFromState?.id, navigate, showError]);

  const handleSaleStatusChange = (e) => {
    const idSaleStatus = Number(e.target.value);

    setFormData((prev) => ({
      ...prev,
      idSaleStatus,
    }));

    if (errors.idSaleStatus || errors.idOrderStatus) {
      setErrors((prev) => ({
        ...prev,
        idSaleStatus: null,
        idOrderStatus: null,
      }));
    }
  };

  const handleDeliveryTypeChange = (e) => {
    if (!canEditDelivery) return;
    const deliveryType = normalizeDeliveryType(e.target.value);

    setFormData((prev) => ({
      ...prev,
      deliveryType,
      deliveryAddress: deliveryType === 'pickup' ? '' : prev.deliveryAddress,
    }));

    if (errors.deliveryType || errors.deliveryAddress) {
      setErrors((prev) => ({
        ...prev,
        deliveryType: null,
        deliveryAddress: null,
      }));
    }
  };

  const handleDeliveryAddressChange = (e) => {
    if (!canEditDelivery) return;

    setFormData((prev) => ({
      ...prev,
      deliveryAddress: e.target.value,
    }));

    if (errors.deliveryAddress) {
      setErrors((prev) => ({
        ...prev,
        deliveryAddress: null,
      }));
    }
  };

  const handleUseClientAddress = () => {
    if (!canEditDelivery) return;

    const clientAddress = String(sale?.clienteDireccion ?? '').trim();

    if (!clientAddress) {
      showWarning(
        'Direccion no disponible',
        'El cliente no tiene una direccion registrada.'
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      deliveryAddress: clientAddress,
    }));

    if (errors.deliveryAddress) {
      setErrors((prev) => ({
        ...prev,
        deliveryAddress: null,
      }));
    }
  };

  const handleOrderStatusChange = (e) => {
    if (!canChangeOrderStatus) return;
    const idOrderStatus = Number(e.target.value);

    if (idOrderStatus === ORDER_STATUS.CANCELADO) {
      setErrors((prev) => ({
        ...prev,
        idOrderStatus: 'Para cancelar el pedido relacionado debes usar el flujo de anulacion de la venta.',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      idOrderStatus,
    }));

    if (errors.idOrderStatus) {
      setErrors((prev) => ({
        ...prev,
        idOrderStatus: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (annulledSale) {
      newErrors.general = 'Una venta anulada no se modifica desde este formulario.';
      return newErrors;
    }

    if (finalOrder && (
      normalizeDeliveryType(formData.deliveryType) !== getInitialDeliveryType(sale) ||
      String(formData.deliveryAddress ?? '').trim() !== String(sale?.order?.deliveryAddress ?? sale?.direccion ?? '').trim()
    )) {
      newErrors.general = 'El pedido relacionado ya esta entregado o cancelado y no puede modificarse.';
      return newErrors;
    }

    if (canEditDelivery && !formData.deliveryType) {
      newErrors.deliveryType = 'Seleccione el tipo de entrega.';
    }

    if (
      canEditDelivery &&
      formData.deliveryType === 'delivery' &&
      !formData.deliveryAddress.trim()
    ) {
      newErrors.deliveryAddress = 'La direccion es obligatoria para domicilio.';
    }

    if (!formData.idSaleStatus) {
      newErrors.idSaleStatus = 'Seleccione el estado de la venta.';
    }

    if (Number(formData.idOrderStatus) === ORDER_STATUS.CANCELADO && Number(formData.idOrderStatus) !== originalOrderStatus) {
      newErrors.idOrderStatus =
        'No se puede cancelar el pedido desde la edicion. Usa el flujo de anulacion de la venta.';
    }

    if (!canChangeOrderStatus && Number(formData.idOrderStatus) !== originalOrderStatus) {
      newErrors.idOrderStatus =
        finalOrder
          ? 'El pedido relacionado ya esta entregado o cancelado y no puede cambiar de estado.'
          : 'El estado del pedido solo puede modificarse cuando la venta esta aprobada.';
    }

    if (canChangeOrderStatus && !formData.idOrderStatus) {
      newErrors.idOrderStatus = 'Seleccione el estado del pedido.';
    }

    return newErrors;
  };

  const buildPayload = () => {
    const payload = {};

    if (canEditDelivery) {
      const deliveryType = deliveryTypeToApi(formData.deliveryType);
      payload.deliveryType = deliveryType;

      if (deliveryType === 'delivery') {
        payload.deliveryAddress = formData.deliveryAddress.trim();
      }
    }

    if (canChangeSaleStatus && Number(formData.idSaleStatus) !== originalSaleStatus) {
      payload.idSaleStatus = Number(formData.idSaleStatus);
    }

    if (canChangeOrderStatus && Number(formData.idOrderStatus) !== ORDER_STATUS.CANCELADO) {
      payload.idOrderStatus = Number(formData.idOrderStatus);
    }

    return payload;
  };

  const handleSave = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showWarning(
        'No se puede guardar',
        validationErrors.general ?? 'Revisa los campos marcados.'
      );
      return;
    }

    setLoading(true);

    try {
      await SalesServices.update(sale.id, buildPayload());

      showSuccess(
        'Venta actualizada',
        'La venta fue actualizada correctamente.'
      );

      navigate('/admin/sales');
    } catch (error) {
      console.error('Error actualizando venta:', error);
      showError('Error', error?.message ?? 'No se pudo actualizar la venta.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    showConfirm(
      'warning',
      'Salir sin guardar?',
      'Los cambios no guardados se perderan.',
      {
        confirmButtonText: 'Si, salir',
        cancelButtonText: 'Continuar editando',
      }
    ).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/sales');
      }
    });
  };

  if (!sale) return null;

  const saleStatusOptions = annulledSale
    ? [{ value: SALE_STATUS.ANULADA, label: 'Anulada' }]
    : approvedSale
      ? [{ value: SALE_STATUS.APROBADA, label: 'Aprobada' }]
      : SALE_STATUS_OPTIONS.map((status) => ({
          value: status.id,
          label: status.label,
        }));

  const deliveryTypeOptions = [
    { value: 'pickup', label: 'Cliente recoge' },
    { value: 'delivery', label: 'Domicilio' },
  ];

  const orderStatusOptions = ORDER_STATUS_OPTIONS.map((status) => ({
      value: status.id,
      label: status.label,
    }))
    .filter((status) => (
      status.value !== ORDER_STATUS.CANCELADO ||
      Number(formData.idOrderStatus) === ORDER_STATUS.CANCELADO
    ));

  return (
    <div className="w-full px-3 py-4 sm:px-5 lg:px-8 lg:py-6">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="shrink-0 rounded-full p-2 transition-colors hover:bg-gray-100"
            title="Volver a ventas"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
              {title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
              Actualiza los datos permitidos según el estado actual de la venta.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 lg:shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto sm:px-4"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || annulledSale}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003b5c] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-5 space-y-3 sm:mb-6">
        {!approvedSale && !annulledSale && (
          <Notice tone="blue">
            Mientras la venta no este aprobada, el pedido no puede avanzar.
            Si apruebas la venta aqui, puedes actualizar el estado del pedido en la misma peticion.
          </Notice>
        )}

        {annulledSale && (
          <Notice tone="red">
            La venta esta anulada. No se puede modificar desde este formulario.
          </Notice>
        )}

        {deliveredOrder && (
          <Notice tone="blue">
            El pedido relacionado ya esta entregado. Su informacion y estado no pueden modificarse.
          </Notice>
        )}

        {cancelledOrder && (
          <Notice tone="red">
            El pedido relacionado esta cancelado. Su informacion y estado no pueden modificarse.
          </Notice>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
        <section className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-sm">
          <SectionHeader
            icon={FileText}
            title="Información editable"
            description="Estado, entrega y pedido relacionado"
          />

          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Estado de la venta <span className="text-red-500">*</span>
                </label>

                <div className="relative group">
                  <FormSelect
                    value={formData.idSaleStatus}
                    options={saleStatusOptions}
                    onChange={(value) => handleSaleStatusChange({ target: { value } })}
                    icon={Tag}
                    disabled={loading || !canChangeSaleStatus}
                    error={errors.idSaleStatus}
                    placeholder="Estado de la venta"
                    ariaLabel="Estado de la venta"
                    dropdownClassName="max-sm:w-full"
                    maxDropdownWidth={340}
                  />

                  {approvedSale && (
                    <div className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 sm:pointer-events-none sm:absolute sm:left-0 sm:top-full sm:z-20 sm:mt-2 sm:hidden sm:w-full sm:min-w-[260px] sm:shadow-lg sm:group-hover:block">
                      <p className="text-xs leading-relaxed text-yellow-800">
                        La venta ya esta aprobada y su estado no se puede cambiar;
                        para anularla se usa el flujo especial de anulación.
                      </p>
                    </div>
                  )}
                </div>

                {errors.idSaleStatus && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.idSaleStatus}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de entrega <span className="text-red-500">*</span>
                </label>

                <FormSelect
                  value={formData.deliveryType}
                  options={deliveryTypeOptions}
                  onChange={(value) => handleDeliveryTypeChange({ target: { value } })}
                  icon={Truck}
                  disabled={loading || !canEditDelivery}
                  error={errors.deliveryType}
                  placeholder="Tipo de entrega"
                  ariaLabel="Tipo de entrega"
                  dropdownClassName="max-sm:w-full"
                  maxDropdownWidth={340}
                />

                {errors.deliveryType && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.deliveryType}</p>
                )}
              </div>
            </div>

            {formData.deliveryType === 'delivery' ? (
              <div className="flex flex-col gap-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Dirección de entrega <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none"
                    strokeWidth={1.8}
                  />

                  <textarea
                    value={formData.deliveryAddress}
                    onChange={handleDeliveryAddressChange}
                    disabled={loading || !canEditDelivery}
                    rows={2}
                    placeholder="Ej: Cra 73 #21-30"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 resize-none transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${
                      errors.deliveryAddress
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                    }`}
                  />
                </div>

                {errors.deliveryAddress && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.deliveryAddress}</p>
                )}

                {canEditDelivery && (
                  <button
                    type="button"
                    onClick={handleUseClientAddress}
                    disabled={loading}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm text-[#004D77] transition-colors duration-200 hover:bg-[#004D77]/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit sm:justify-start sm:py-1"
                  >
                    <Home className="w-3.5 h-3.5" strokeWidth={1.8} />
                    Usar dirección del cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Dirección de entrega:</span> Cliente recoge.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Estado del pedido <span className="text-red-500">*</span>
              </label>

              <FormSelect
                value={formData.idOrderStatus}
                options={orderStatusOptions}
                onChange={(value) => handleOrderStatusChange({ target: { value } })}
                icon={PackageCheck}
                disabled={loading || !canChangeOrderStatus}
                error={errors.idOrderStatus}
                placeholder="Estado del pedido"
                ariaLabel="Estado del pedido"
                dropdownClassName="max-sm:w-full"
                maxDropdownWidth={340}
              />

              {!canChangeOrderStatus && !annulledSale && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {finalOrder
                    ? 'El pedido relacionado ya esta entregado o cancelado.'
                    : 'Disponible solo cuando la venta esta aprobada.'}
                </p>
              )}

              {errors.idOrderStatus && (
                <p className="mt-0.5 text-xs text-red-500">{errors.idOrderStatus}</p>
              )}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <SectionHeader
            icon={Info}
            title="Información general"
            description="Resumen actual de la venta y el pedido"
          />

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
            <InfoItem label="Cliente" value={sale.cliente ?? '-'} />
            <InfoItem label="Vendedor" value={sale.vendedor ?? '-'} />
            <InfoItem label="Estado venta" value={sale.estado ?? '-'} />
            <InfoItem label="Total" value={sale.total ?? '-'} />
          </div>

          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Productos, pagos, vendedor, subtotal y tipo de venta no se editan desde este formulario.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:items-center sm:px-5 sm:py-3.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#004D77]">
        <Icon className="w-4 h-4 text-white" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight text-gray-800">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-700">{value}</p>
    </div>
  );
}

function Notice({ tone, children }) {
  const classes = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`rounded-lg border p-3 sm:p-3.5 ${classes[tone]}`}>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export default SaleEditForm;
