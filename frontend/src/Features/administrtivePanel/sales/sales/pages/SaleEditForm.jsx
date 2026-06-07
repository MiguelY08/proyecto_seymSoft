import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Truck, MapPin, PackageCheck } from 'lucide-react';

import { SalesServices } from '../services/salesServices';
import { useAlert } from '../../../../shared/alerts/useAlert';

const ORDER_STATUS = {
  EN_PROCESO: 1,
  LISTO: 2,
  ENTREGADO: 3,
  CANCELADO: 4,
};

const normalizeDeliveryType = (value) => {
  const text = String(value ?? '').toLowerCase();

  if (
    text.includes('delivery') ||
    text.includes('domicilio')
  ) {
    return 'delivery';
  }

  return 'pickup';
};

const getInitialDeliveryType = (sale) => {
  return normalizeDeliveryType(
    sale?.order?.deliveryType ??
    sale?.deliveryType ??
    sale?.entrega
  );
};

const getInitialOrderStatus = (sale) => {
  return (
    sale?.order?.idOrderStatus ??
    sale?.idOrderStatus ??
    sale?.order?.orderStatus?.idOrderStatus ??
    ORDER_STATUS.LISTO
  );
};

const isSaleApproved = (sale) => {
  return (
    sale?.idSaleStatus === 1 ||
    sale?.saleStatus?.nameStatus === 'Aprobada' ||
    sale?.estado === 'Aprobada'
  );
};

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
    idOrderStatus: getInitialOrderStatus(saleFromState),
  });

  const approvedSale = useMemo(() => isSaleApproved(sale), [sale]);

  const title = useMemo(() => {
    const invoice = sale?.factura ?? sale?.id ?? sale?.idSale ?? '';
    return invoice ? `Editar venta No. ${invoice}` : 'Editar venta';
  }, [sale]);

  useEffect(() => {
    if (!saleFromState?.id) {
      showError('Error', 'No se encontró información de la venta.');
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

    if (!formData.deliveryType) {
      newErrors.deliveryType = 'Seleccione el tipo de entrega.';
    }

    if (
      formData.deliveryType === 'delivery' &&
      !formData.deliveryAddress.trim()
    ) {
      newErrors.deliveryAddress = 'La dirección es obligatoria para domicilio.';
    }

    if (!formData.idOrderStatus) {
      newErrors.idOrderStatus = 'Seleccione el estado del pedido.';
    }

    return newErrors;
  };

  const buildPayload = () => {
    const deliveryType =
      formData.deliveryType === 'delivery'
        ? 'delivery'
        : 'pickup';

    const payload = {
      deliveryType,
      idOrderStatus: Number(formData.idOrderStatus),
    };

    if (deliveryType === 'delivery') {
      payload.deliveryAddress = formData.deliveryAddress.trim();
    }

    return payload;
  };

  const handleSave = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showWarning('Formulario incompleto', 'Revisa los campos marcados.');
      return;
    }

    setLoading(true);

    try {
      await SalesServices.update(sale.id, buildPayload());

      showSuccess(
        'Venta actualizada',
        'Los datos de entrega fueron actualizados correctamente.'
      );

      navigate('/admin/sales');
    } catch (error) {
      console.error('Error actualizando venta:', error);

      const message =
        error?.response?.data?.message ??
        error?.message ??
        'No se pudo actualizar la venta.';

      showError('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    showConfirm(
      'warning',
      '¿Salir sin guardar?',
      'Los cambios no guardados se perderán.',
      {
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Continuar editando',
      }
    ).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/sales');
      }
    });
  };

  if (!sale) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Volver a ventas"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-sm text-gray-500">
              Solo puedes modificar entrega, dirección y estado del pedido.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#004D77] rounded-lg hover:bg-[#003b5c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            Información editable de la venta
          </h2>
          <p className="text-xs text-gray-400">
            Los productos, pagos, vendedor, subtotal y tipo de venta no se pueden modificar.
          </p>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Cliente" value={sale.cliente ?? '—'} />
            <InfoItem label="Vendedor" value={sale.vendedor ?? '—'} />
            <InfoItem label="Estado venta" value={sale.estado ?? '—'} />
            <InfoItem label="Total" value={sale.total ?? '—'} />
          </div>

          {approvedSale && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                La venta está aprobada. El estado de la venta no se modifica desde este formulario;
                solo se actualizan los datos logísticos permitidos por la API.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de entrega <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

              <select
                value={formData.deliveryType}
                onChange={handleDeliveryTypeChange}
                disabled={loading}
                className={`appearance-none w-full pl-10 pr-8 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 transition-colors ${
                  errors.deliveryType
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                }`}
              >
                <option value="pickup">Cliente recoge</option>
                <option value="delivery">Domicilio</option>
              </select>
            </div>

            {errors.deliveryType && (
              <p className="text-xs text-red-500">{errors.deliveryType}</p>
            )}
          </div>

          {formData.deliveryType === 'delivery' ? (
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Dirección de entrega <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />

                <textarea
                  value={formData.deliveryAddress}
                  onChange={handleDeliveryAddressChange}
                  disabled={loading}
                  rows={3}
                  placeholder="Ej: Cra 73 #21-30"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 resize-none transition-colors ${
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
                <span className="font-medium">Dirección de entrega:</span> Cliente recoge.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Estado del pedido <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <PackageCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

              <select
                value={formData.idOrderStatus}
                onChange={handleOrderStatusChange}
                disabled={loading}
                className={`appearance-none w-full pl-10 pr-8 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 transition-colors ${
                  errors.idOrderStatus
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
                }`}
              >
                <option value={ORDER_STATUS.EN_PROCESO}>En proceso</option>
                <option value={ORDER_STATUS.LISTO}>Listo</option>
                <option value={ORDER_STATUS.ENTREGADO}>Entregado</option>
                <option value={ORDER_STATUS.CANCELADO}>Cancelado</option>
              </select>
            </div>

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

export default SaleEditForm;