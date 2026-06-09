// src/features/administrtivePanel/sales/pages/SaleForm.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

// Servicios
import { SalesServices } from '../services/salesServices';
import ProductsService from '../../../purchases/products/services/productsServices';
import { clientsService } from '../../clients/services/clientsService';
import { useAuth } from '../../../../access/context/AuthContext';

// Componentes reutilizados del módulo de pedidos
import LeftSectionForm from '../../orders/components/LeftSectionForm';
import RightSectionForm from '../../orders/components/RightSectionForm';
import PaymentsSection from '../../orders/components/PaymentsSection';

// Helpers
import { generateFactura, getInitialPaymentAmounts } from '../helpers/salesHelpers';
import { ESTADOS_LOGISTICOS, ORIGENES } from '../../orders/services/ordersService';

const PAYMENT_METHOD_IDS = {
  transferencia: 1,
  efectivo: 2,
  credito: 3,
};

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getPaymentMethodId = (methodName) =>
  PAYMENT_METHOD_IDS[normalizeText(methodName)] ?? null;

const roundMoney = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

const getIncludedIvaAmount = (totalWithIva, ivaPercentage) => {
  const rate = Number(ivaPercentage || 0) / 100;
  if (rate <= 0) return 0;

  return roundMoney(Number(totalWithIva || 0) - (Number(totalWithIva || 0) / (1 + rate)));
};

const hasDuplicatePaymentMethods = (paymentMethods) => {
  const ids = paymentMethods.map((payment) => payment.idPaymentMethod);
  return new Set(ids).size !== ids.length;
};

const getSessionUserId = (user) =>
  user?.idUser ?? user?.id ?? null;

const getCreditDueDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
};

const normalizeClientList = (response) => response?.data ?? response ?? [];

const getProductStock = (product) => {
  const barcodeStock = product.barcodes?.reduce(
    (sum, item) => sum + Number(item.stock ?? 0),
    0
  );

  return Number(
    product.stock ??
    product.totalStock ??
    product.availableStock ??
    barcodeStock ??
    0
  );
};

const normalizeProduct = (product) => {
  const barcode =
    product.barcode ??
    product.codBarras ??
    product.barcodes?.[0]?.barcode ??
    product.productBarcodes?.[0]?.barcode ??
    product.reference ??
    '';

  return {
    ...product,
    id: product.id ?? product.idProduct,
    nombre: product.nombre ?? product.name,
    precioDetalle: Number(product.precioDetalle ?? product.retailPrice ?? 0),
    ivaPercentage: Number(product.ivaPercentage ?? product.iva ?? 0),
    stock: getProductStock(product),
    barcode,
    codBarras: barcode,
    categorias: product.categorias ?? product.categories?.map((category) => category.name) ?? [],
  };
};

function SaleForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirm, showWarning, showSuccess, showError } = useAlert();
  const { user } = useAuth();

  const saleToEdit = location.state?.sale ?? null;
  const isEditing = saleToEdit !== null;
  const vendingType = location.state?.vendingType ?? 'direct';
  const vendingTypeLabel = vendingType === 'manual' ? 'Manual' : 'Directa';

  // Redirigir a edición de pedido si se intenta editar una venta existente
  useEffect(() => {
    if (isEditing) {
      if (saleToEdit?.pedidoId) {
        navigate(`/admin/sales/orders/${saleToEdit.pedidoId}`, { replace: true });
      } else {
        showError('Error', 'No se encontró el pedido asociado a esta venta.');
        navigate('/admin/sales', { replace: true });
      }
    }
  }, [isEditing, saleToEdit, navigate, showError]);

  // Si es edición, no renderizamos nada (redirige)
  if (isEditing) {
    return null;
  }

  // ─── Estados para nueva venta ─────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [facturaNo] = useState(() => generateFactura());

  // Datos del formulario (similar a OrdersForm)
  const [formData, setFormData] = useState({
    clienteId: location.state?.newUserId ?? '',
    tipoEntrega: 'recoge',
    direccionEntrega: '',
    productos: [],
    estadoLogistico: ESTADOS_LOGISTICOS.EN_PROCESO, // permitir que el usuario decida
    origen: ORIGENES.MANUAL,
    motivoCancelacion: '',
  });
  const [errors, setErrors] = useState({});

  // Catálogos
  const [clientes, setClientes] = useState([]);
  const [productosCatalogo, setProductosCatalogo] = useState([]);

  // Pagos (abonos)
  const [pagos, setPagos] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState(getInitialPaymentAmounts());
  const [totalPagado, setTotalPagado] = useState(0);

  // Cálculo de totales
  const total = roundMoney(formData.productos.reduce((sum, p) => sum + (p.subtotal || 0), 0));
  const iva = formData.productos.reduce((sum, p) => sum + (p.ivaAmount || 0), 0);
  const subtotal = roundMoney(total - iva);
  const saldoPendiente = Math.max(0, total - totalPagado);

  // ─── Carga inicial de catálogos ──────────────────────────────────────────
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const clients = await clientsService.getAll();
        setClientes(normalizeClientList(clients));

        const products = await ProductsService.list();
        setProductosCatalogo((products ?? []).map(normalizeProduct));
      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudieron cargar clientes o productos.');
      }
    };

    loadCatalogs();
  }, [showError]);

  // ─── Manejadores para LeftSectionForm ─────────────────────────────────────
  const handleClienteChange = (e) => {
    const clienteId = Number(e.target.value);
    setFormData(prev => ({ ...prev, clienteId }));

    if (clienteId !== '') {
      const cliente = clientes.find(c => c.id === clienteId);
      if (cliente) {
        const direccionSugerida = cliente.id === 0
          ? 'El cliente lo recoge'
          : (cliente.address || cliente.direccion || '');
        setFormData(prev => ({ ...prev, direccionEntrega: direccionSugerida }));
      }
    }
    if (errors.clienteId) setErrors(prev => ({ ...prev, clienteId: null }));
  };

  const handleTipoEntregaChange = (e) => {
    const nuevoTipo = e.target.value;
    setFormData(prev => {
      const nuevaDireccion = nuevoTipo === 'recoge' ? 'El cliente lo recoge' : prev.direccionEntrega;
      return { ...prev, tipoEntrega: nuevoTipo, direccionEntrega: nuevaDireccion };
    });
  };

  const handleDireccionManualChange = (e) => {
    setFormData(prev => ({ ...prev, direccionEntrega: e.target.value }));
    if (errors.direccionEntrega) setErrors(prev => ({ ...prev, direccionEntrega: null }));
  };

  const handleEstadoLogisticoChange = (e) => {
    const newEstado = e.target.value;
    setFormData(prev => ({ ...prev, estadoLogistico: newEstado }));
    if (errors.estadoLogistico) setErrors(prev => ({ ...prev, estadoLogistico: null }));
  };

  const handleMotivoCancelacionChange = () => {}; // No aplica en venta directa

  // ─── Manejadores para productos (RightSectionForm) ────────────────────────
  const handleAddProduct = (productoId) => {
    const producto = productosCatalogo.find(p => p.id === Number(productoId));
    if (!producto) return;

    if (producto.stock <= 0) {
      showWarning('Sin stock', 'Este producto no tiene unidades disponibles.');
      return;
    }

    const existe = formData.productos.find(p => p.id === producto.id);
    if (existe) {
      showWarning('Producto ya agregado', 'Puedes editar la cantidad en la tabla.');
      return;
    }

    const precio = producto.precioDetalle || 0;
    const ivaPercentage = Number(producto.ivaPercentage ?? 0);
    const ivaAmount = getIncludedIvaAmount(precio, ivaPercentage);
    const nuevoProducto = {
      id: producto.id,
      nombre: producto.nombre,
      barcode: producto.barcode,
      cantidad: 1,
      precioUnitario: precio,
      subtotal: precio,
      ivaPercentage,
      ivaAmount,
      stock: producto.stock,
    };

    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, nuevoProducto],
    }));
  };

  const handleUpdateCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const producto = formData.productos.find(p => p.id === productoId);
    const stockDisponible = producto?.stock ?? nuevaCantidad;
    const cantidad = Math.min(nuevaCantidad, stockDisponible);

    if (cantidad < nuevaCantidad) {
      showWarning('Stock insuficiente', `Solo hay ${stockDisponible} unidades disponibles.`);
    }

    setFormData(prev => ({
      ...prev,
      productos: prev.productos.map(p =>
        p.id === productoId
          ? {
              ...p,
              cantidad,
              subtotal: cantidad * (p.precioUnitario || 0),
              ivaAmount: getIncludedIvaAmount(
                cantidad * (p.precioUnitario || 0),
                p.ivaPercentage
              ),
            }
          : p
      ),
    }));
  };

  const handleRemoveProduct = (productoId) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== productoId),
    }));
  };

  // ─── Manejador para pagos (PaymentsSection) ───────────────────────────────
  const handleAddPayment = (paymentData) => {
    const { metodoPago, monto, comprobante } = paymentData;

    if (pagos.some((pago) => normalizeText(pago.metodoPago) === normalizeText(metodoPago))) {
      showWarning('Metodo repetido', 'No se puede repetir un metodo de pago en la misma venta.');
      return;
    }

    const tempPago = {
      id: Date.now(),
      metodoPago,
      monto: roundMoney(monto),
      comprobante,
      fechaPago: new Date().toISOString(),
    };
    setPagos(prev => [...prev, tempPago]);
    setTotalPagado(prev => roundMoney(prev + roundMoney(monto)));

    // Actualizar paymentAmounts (para compatibilidad con validación)
    setPaymentAmounts(prev => ({
      ...prev,
      [metodoPago]: (prev[metodoPago] || 0) + roundMoney(monto),
    }));

    showSuccess('Abono agregado', `Se ha agregado un abono de $${roundMoney(monto).toLocaleString()}.`);
  };

  // ─── Validación (corregida para aceptar clienteId = 0) ───────────────────
  const validate = () => {
    const newErrors = {};
    if (formData.clienteId === undefined || formData.clienteId === null || formData.clienteId === '') {
      newErrors.clienteId = 'Debe seleccionar un cliente.';
    }
    if (!getSessionUserId(user)) newErrors.idUser = 'No se pudo identificar al usuario en sesion.';
    if (!formData.direccionEntrega?.trim()) {
      newErrors.direccionEntrega = 'La dirección de entrega es obligatoria.';
    }
    if (formData.productos.length === 0) {
      newErrors.productos = 'Debe agregar al menos un producto.';
    }
    return newErrors;
  };

  // ─── Guardar ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.idUser) {
        showError('Sesion no valida', validationErrors.idUser);
      } else {
        showWarning('Formulario incompleto', 'Revisa los campos marcados en rojo.');
      }
      return;
    }

    const paymentTotal = roundMoney(totalPagado);

    if (paymentTotal !== total) {
      showWarning(
        'Pago invalido',
        `La suma de los metodos de pago debe ser igual al total de la venta. Total: $${total.toLocaleString()}, pagado: $${paymentTotal.toLocaleString()}.`
      );
      return;
    }

    setLoading(true);
    try {
      const paymentMethods = pagos.map((pago) => ({
        idPaymentMethod: getPaymentMethodId(pago.metodoPago),
        amount: roundMoney(pago.monto),
      })).filter((payment) => payment.idPaymentMethod !== null);

      if (paymentMethods.length !== pagos.length) {
        showWarning('Metodo de pago no valido', 'Hay pagos con un metodo no reconocido.');
        return;
      }

      if (hasDuplicatePaymentMethods(paymentMethods)) {
        showWarning('Metodo repetido', 'No se puede repetir un metodo de pago en la misma venta.');
        return;
      }

      const hasCreditPayment = paymentMethods.some(
        (payment) => payment.idPaymentMethod === PAYMENT_METHOD_IDS.credito
      );

      const payload = {
        idEmployee: getSessionUserId(user),
        idSaleStatus: 1,
        order: {
          idClient: formData.clienteId,
          deliveryType: formData.tipoEntrega === 'domicilio' ? 'Domicilio' : 'Recoge',
          deliveryAddress: formData.direccionEntrega,
          items: formData.productos.map((producto) => ({
            idProduct: producto.id,
            barcode: producto.barcode,
            quantity: producto.cantidad,
          })),
        },
        paymentMethods,
      };

      if (hasCreditPayment) {
        payload.credit = {
          dueDate: getCreditDueDate(),
          idCreditStatus: 1,
        };
      }

      await SalesServices.create(vendingType, payload);

      showSuccess('Venta creada', 'La venta ha sido registrada exitosamente.');
      navigate('/admin/sales');
    } catch (error) {
      console.error(error);
      showError('Error', error.message || 'No se pudo guardar la venta.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    showConfirm(
      'warning',
      '¿Salir sin guardar?',
      'Los cambios no guardados se perderán.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Continuar editando' }
    ).then((result) => {
      if (result.isConfirmed) navigate('/admin/sales');
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Cabecera */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Volver a ventas"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Nueva Venta {vendingTypeLabel} (Factura No. {facturaNo})
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#004D77] rounded-lg hover:bg-[#003b5c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Crear Venta
              </>
            )}
          </button>
        </div>
      </div>

      {/* Contenido en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeftSectionForm
          formData={formData}
          errors={errors}
          clientes={clientes}
          user={user}
          loading={loading}
          isEditMode={false}
          onClienteChange={handleClienteChange}
          onTipoEntregaChange={handleTipoEntregaChange}
          onDireccionManualChange={handleDireccionManualChange}
          onEstadoLogisticoChange={handleEstadoLogisticoChange}
          onMotivoCancelacionChange={handleMotivoCancelacionChange}
        />

        <RightSectionForm
          productos={formData.productos}
          productosCatalogo={productosCatalogo}
          errors={errors}
          loading={loading}
          disabled={loading}
          subtotal={subtotal}
          iva={iva}
          total={total}
          onAddProduct={handleAddProduct}
          onUpdateCantidad={handleUpdateCantidad}
          onRemoveProduct={handleRemoveProduct}
        />
      </div>

      {/* Sección de pagos */}
      <div className="mt-6">
        <PaymentsSection
          pedidoId={null}
          total={total}
          pagos={pagos}
          onAddPayment={handleAddPayment}
          loading={loading}
          isEditMode={false}
          disallowDuplicateMethods
          allowCredit
        />
      </div>

      {/* Aviso de pago completado */}
      {totalPagado >= total && total > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Pago completado:</strong> La venta está lista para ser registrada.
          </p>
        </div>
      )}
    </div>
  );
}

export default SaleForm;
