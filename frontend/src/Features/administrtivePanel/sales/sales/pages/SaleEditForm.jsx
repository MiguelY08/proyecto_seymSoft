import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Save,
  Truck,
  MapPin,
  PackageCheck,
  Tag,
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
  const approvedSale = isApprovedStatus(originalSaleStatus);
  const annulledSale = isAnnulledStatus(originalSaleStatus);
  const selectedSaleApproved = isApprovedStatus(formData.idSaleStatus);
  const canChangeSaleStatus = !approvedSale && !annulledSale;
  const canChangeOrderStatus = !annulledSale && (approvedSale || selectedSaleApproved);
  const canEditDelivery = !annulledSale;

  const title = useMemo(() => {
    const invoice = sale?.factura ?? sale?.id ?? sale?.idSale ?? '';
    return invoice ? `Editar venta No. ${invoice}` : 'Editar venta';
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

  const handleOrderStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      idOrderStatus: Number(e.target.value),
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

    if (!formData.deliveryType) {
      newErrors.deliveryType = 'Seleccione el tipo de entrega.';
    }

    if (
      formData.deliveryType === 'delivery' &&
      !formData.deliveryAddress.trim()
    ) {
      newErrors.deliveryAddress = 'La direccion es obligatoria para domicilio.';
    }

    if (!formData.idSaleStatus) {
      newErrors.idSaleStatus = 'Seleccione el estado de la venta.';
    }

    if (!canChangeOrderStatus && Number(formData.idOrderStatus) !== getInitialOrderStatus(sale)) {
      newErrors.idOrderStatus =
        'El estado del pedido solo puede modificarse cuando la venta esta aprobada.';
    }

    if (canChangeOrderStatus && !formData.idOrderStatus) {
      newErrors.idOrderStatus = 'Seleccione el estado del pedido.';
    }

    return newErrors;
  };

  const buildPayload = () => {
    const deliveryType = deliveryTypeToApi(formData.deliveryType);
    const payload = {
      deliveryType,
    };

    if (deliveryType === 'delivery') {
      payload.deliveryAddress = formData.deliveryAddress.trim();
    }

    if (canChangeSaleStatus && Number(formData.idSaleStatus) !== originalSaleStatus) {
      payload.idSaleStatus = Number(formData.idSaleStatus);
    }

    if (canChangeOrderStatus) {
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
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            title="Volver a ventas"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
            <p className="text-sm text-gray-500">
              Las acciones disponibles dependen del estado actual de la venta.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading || annulledSale}
          className="px-4 py-2 text-sm font-medium text-white bg-[#004D77] rounded-lg hover:bg-[#003b5c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">
            Informacion editable de la venta
          </h2>
          <p className="text-xs text-gray-400">
            Productos, pagos, vendedor, subtotal y tipo de venta no se editan aqui.
          </p>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Cliente" value={sale.cliente ?? '-'} />
            <InfoItem label="Vendedor" value={sale.vendedor ?? '-'} />
            <InfoItem label="Estado venta" value={sale.estado ?? '-'} />
            <InfoItem label="Total" value={sale.total ?? '-'} />
          </div>

          {approvedSale && (
            <Notice tone="yellow">
              La venta ya esta aprobada. Su estado no puede cambiar por PUT;
              para anularla se usa el flujo especial de anulacion.
            </Notice>
          )}

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

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Estado de la venta <span className="text-red-500">*</span>
            </label>

            <FormSelect
              value={formData.idSaleStatus}
              options={saleStatusOptions}
              onChange={(value) => handleSaleStatusChange({ target: { value } })}
              icon={Tag}
              disabled={loading || !canChangeSaleStatus}
              error={errors.idSaleStatus}
              placeholder="Estado de la venta"
              ariaLabel="Estado de la venta"
            />

            {errors.idSaleStatus && (
              <p className="text-xs text-red-500">{errors.idSaleStatus}</p>
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
            />

            {errors.deliveryType && (
              <p className="text-xs text-red-500">{errors.deliveryType}</p>
            )}
          </div>

          {formData.deliveryType === 'delivery' ? (
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Direccion de entrega <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />

                <textarea
                  value={formData.deliveryAddress}
                  onChange={handleDeliveryAddressChange}
                  disabled={loading || !canEditDelivery}
                  rows={3}
                  placeholder="Ej: Cra 73 #21-30"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none placeholder-gray-400 resize-none transition-colors disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${
                    errors.deliveryAddress
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                  }`}
                />
              </div>

              {errors.deliveryAddress && (
                <p className="text-xs text-red-500">{errors.deliveryAddress}</p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Direccion de entrega:</span> Cliente recoge.
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
            />

            {!canChangeOrderStatus && !annulledSale && (
              <p className="text-xs text-gray-500">
                Disponible solo cuando la venta esta aprobada.
              </p>
            )}

            {errors.idOrderStatus && (
              <p className="text-xs text-red-500">{errors.idOrderStatus}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-700 mt-1">{value}</p>
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
    <div className={`p-3 border rounded-lg ${classes[tone]}`}>
      <p className="text-sm">{children}</p>
    </div>
  );
}

export default SaleEditForm;
