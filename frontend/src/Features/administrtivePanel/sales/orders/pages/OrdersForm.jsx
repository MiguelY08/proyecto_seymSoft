// src/features/orders/pages/OrdersForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

// Servicios
import OrdersService, { PaymentService, ESTADOS_LOGISTICOS, ESTADOS_PAGO, ORIGENES } from '../services/ordersService';
import ProductsService from '../../../purchases/products/services/productsServices';
import { clientsService } from '../../clients/services/clientsService';
import { useAlert } from '../../../../shared/alerts/useAlert';
import Spinner from '../../../../shared/spinner';

// Contexto de autenticaciÃ³n
import { useAuth } from '../../../../access/context/AuthContext';

// Componentes de secciÃ³n
import LeftSectionForm from '../components/LeftSectionForm';
import RightSectionForm from '../components/RightSectionForm';
import PaymentsSection from '../components/PaymentsSection';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const roundMoney = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getPrimaryBarcode = (product = {}) => (
  product.codBarras ||
  product.barcode ||
  product.mainBarcode ||
  product.barcodes?.[0]?.barcode ||
  ''
);

const getTotalStock = (product = {}) => {
  if (product.stock !== undefined || product.quantity !== undefined) {
    return toNumber(product.stock ?? product.quantity);
  }
  if (Array.isArray(product.barcodes)) {
    return product.barcodes.reduce((sum, barcode) => sum + toNumber(barcode.stock), 0);
  }
  return 0;
};

const getRetailPrice = (product = {}) => toNumber(
  product.precioDetalle ?? product.retailPrice ?? product.price
);

const getProductPriceForClient = (product = {}, client = null) => {
  const clientType = normalizeText(client?.clientType);

  if (clientType.includes('mayor')) {
    return roundMoney(product.wholesalePrice ?? product.precioMayorista ?? product.retailPrice ?? product.precioDetalle ?? 0);
  }

  if (clientType.includes('colega') || clientType.includes('partner')) {
    return roundMoney(product.partnerPrice ?? product.precioColegas ?? product.retailPrice ?? product.precioDetalle ?? 0);
  }

  if (clientType.includes('paca') || clientType.includes('bulk')) {
    return roundMoney(product.bulkPrice ?? product.precioPacas ?? product.retailPrice ?? product.precioDetalle ?? 0);
  }

  return roundMoney(product.retailPrice ?? product.precioDetalle ?? product.price ?? 0);
};

const calculateLineSubtotal = (cantidad, precioUnitario) =>
  roundMoney(toNumber(cantidad) * toNumber(precioUnitario));

const calculateLineIva = (subtotal, ivaPercentage = 19) =>
  roundMoney(subtotal - (subtotal / (1 + (toNumber(ivaPercentage, 19) / 100))));

function OrdersForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showConfirm, showWarning, showSuccess, showError } = useAlert();
  const { user } = useAuth();

  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // --- Estado del formulario ---
  const [formData, setFormData] = useState({
    clienteId: '',
    asesorId: user?.id || null,
    tipoEntrega: 'recoge',
    direccionEntrega: '',
    productos: [],
    estadoLogistico: ESTADOS_LOGISTICOS.EN_PROCESO,
    origen: ORIGENES.MANUAL,
    motivoCancelacion: '',
  });
  const [errors, setErrors] = useState({});

  const [clientes, setClientes] = useState([]);
  const [productosCatalogo, setProductosCatalogo] = useState([]);

  // Pagos existentes (solo en ediciÃ³n)
  const [pagos, setPagos] = useState([]);
  const [totalPagado, setTotalPagado] = useState(0);

  const total = roundMoney(formData.productos.reduce((sum, p) => sum + toNumber(p.subtotal), 0));
  const iva = roundMoney(formData.productos.reduce((sum, p) => sum + toNumber(p.iva), 0));
  const subtotal = roundMoney(total - iva);
  const saldoPendiente = Math.max(0, total - totalPagado);
  const selectedClient = clientes.find((cliente) => Number(cliente.id) === Number(formData.clienteId)) ?? null;
  const productosCatalogoConPrecio = productosCatalogo.map((product) => ({
    ...product,
    precioDetalle: getProductPriceForClient(product, selectedClient),
  }));

  // Determinar si los productos son editables
  const productosEditables = useMemo(() => {
    if (!isEditMode) return true; // en creaciÃ³n siempre editables
    if (formData.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) return false;
    if (formData.pagoEstado === ESTADOS_PAGO.PAGADO) return false;
    return true;
  }, [isEditMode, formData.estadoLogistico, formData.pagoEstado]);

  // Actualizar asesorId cuando el usuario estÃ© disponible
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, asesorId: user.id }));
    }
  }, [user]);

  // Carga inicial de datos maestros, pedido y pagos (si ediciÃ³n)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const clientsResponse = await clientsService.getAll();
        setClientes(clientsResponse.data || clientsResponse || []);

        const rawProductsList = await ProductsService.list();
        const normalizedProductsList = rawProductsList.map(product => ({
          ...product,
          id: product.id,
          nombre: product.nombre || product.name || 'Producto sin nombre',
          codBarras: getPrimaryBarcode(product),
          retailPrice: toNumber(product.retailPrice ?? product.precioDetalle ?? product.price),
          wholesalePrice: toNumber(product.wholesalePrice ?? product.precioMayorista ?? product.retailPrice ?? product.precioDetalle ?? product.price),
          partnerPrice: toNumber(product.partnerPrice ?? product.precioColegas ?? product.retailPrice ?? product.precioDetalle ?? product.price),
          bulkPrice: toNumber(product.bulkPrice ?? product.precioPacas ?? product.retailPrice ?? product.precioDetalle ?? product.price),
          precioDetalle: getRetailPrice(product),
          stock: getTotalStock(product),
          ivaPercentage: toNumber(product.ivaPercentage, 19),
        }));

        setProductosCatalogo(normalizedProductsList);

        if (isEditMode) {
          const order = await OrdersService.findById(Number(id));
          if (!order) {
            showError('Pedido no encontrado', `El pedido #${id} no existe.`);
            navigate('/admin/sales/orders');
            return;
          }

          // Cargar pagos existentes
          const existingPayments = await PaymentService.getByPedidoId(order.id);
          setPagos(existingPayments.map((payment) => ({
            ...payment,
            locked: true,
            persisted: true,
          })));
          setTotalPagado(await PaymentService.getTotalPagado(order.id));

          const productosNormalizados = (order.productos || []).map(p => {
            const catalogProduct = normalizedProductsList.find(product => product.id === p.id || product.idProduct === p.id);
            const catalogStock = catalogProduct ? toNumber(catalogProduct.stock) : 0;
            const stock = toNumber(p.stock) > 0 ? toNumber(p.stock) : (catalogStock || toNumber(p.cantidad));
            const subtotalLinea = toNumber(p.subtotal, calculateLineSubtotal(p.cantidad, p.precioUnitario));

            return {
              ...p,
              precioUnitario: toNumber(p.precioUnitario),
              subtotal: subtotalLinea,
              iva: toNumber(p.iva, calculateLineIva(subtotalLinea, p.ivaPercentage)),
              stock,
            };
          });

          // Determinar tipoEntrega basado en la direcciÃ³n guardada
          const direccion = order.direccionEntrega || '';
          const tipoEntrega = direccion === 'El cliente lo recoge' ? 'recoge' : 'domicilio';

          setFormData({
            clienteId: order.clienteId,
            asesorId: order.asesorId,
            tipoEntrega,
            direccionEntrega: direccion,
            productos: productosNormalizados,
            estadoLogistico: order.estadoLogistico,
            pagoEstado: order.pagoEstado, // importante para permisos
            origen: order.origen,
            motivoCancelacion: order.motivoCancelacion || '',
          });
        }
      } catch (error) {
        showError('Error', 'No se pudieron cargar los datos iniciales.');
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [id, isEditMode, navigate, showError]);

  useEffect(() => {
    if (isEditMode || formData.productos.length === 0) return;

    setFormData(prev => ({
      ...prev,
      productos: prev.productos.map((line) => {
        const product = productosCatalogo.find(item => item.id === line.id);
        if (!product) return line;

        const precioUnitario = getProductPriceForClient(product, selectedClient);
        const lineTotal = calculateLineSubtotal(line.cantidad, precioUnitario);

        return {
          ...line,
          precioUnitario,
          subtotal: lineTotal,
          iva: calculateLineIva(lineTotal, line.ivaPercentage),
        };
      }),
    }));
  }, [formData.clienteId, productosCatalogo, clientes, isEditMode]);

  // --- Manejadores para LeftSectionForm ---
  const handleClienteChange = (e) => {
    if (isEditMode) return;
    const clienteId = Number(e.target.value);
    setFormData(prev => ({ ...prev, clienteId }));

    if (clienteId !== '') {
      const cliente = clientes.find(c => c.id === clienteId);
      if (cliente) {
        if (formData.tipoEntrega === 'recoge') {
          setFormData(prev => ({ ...prev, direccionEntrega: 'El cliente lo recoge' }));
        } else {
          const direccionSugerida = cliente.id === 0
            ? 'El cliente lo recoge'
            : (cliente.address || cliente.direccion || '');
          setFormData(prev => ({ ...prev, direccionEntrega: direccionSugerida }));
        }
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

  const handleEstadoLogisticoChange = async (e) => {
    const newEstado = e.target.value;
    if (newEstado === ESTADOS_LOGISTICOS.CANCELADO) {
      const result = await showConfirm(
        'warning',
        'Cancelar pedido',
        'Al cancelar el pedido se liberará el stock reservado. Esta acción no se puede deshacer fácilmente.',
        { confirmButtonText: 'Sí, cancelar', cancelButtonText: 'Mantener estado' }
      );
      if (!result?.isConfirmed) return;
    }
    setFormData(prev => ({ ...prev, estadoLogistico: newEstado }));
    if (errors.estadoLogistico) setErrors(prev => ({ ...prev, estadoLogistico: null }));
  };

  const handleMotivoCancelacionChange = (e) => {
    setFormData(prev => ({ ...prev, motivoCancelacion: e.target.value }));
    if (errors.motivoCancelacion) setErrors(prev => ({ ...prev, motivoCancelacion: null }));
  };

  // --- Manejadores para RightSectionForm (productos) ---
  const handleAddProduct = (productoId) => {
    if (!productosEditables) return;
    const producto = productosCatalogo.find(p => p.id === Number(productoId));
    if (!producto) return;

    if (toNumber(producto.stock) <= 0) {
      showWarning('Sin stock', 'Este producto no tiene unidades disponibles.');
      return;
    }

    const existe = formData.productos.find(p => p.id === producto.id);
    if (existe) {
      showWarning('Producto ya agregado', 'Puedes editar la cantidad en la tabla.');
      return;
    }

    const precio = getProductPriceForClient(producto, selectedClient);
    const subtotalLinea = calculateLineSubtotal(1, precio);
    const nuevoProducto = {
      id: producto.id,
      nombre: producto.nombre,
      codBarras: getPrimaryBarcode(producto),
      cantidad: 1,
      precioUnitario: precio,
      ivaPercentage: toNumber(producto.ivaPercentage),
      iva: calculateLineIva(subtotalLinea, producto.ivaPercentage),
      subtotal: subtotalLinea,
      stock: toNumber(producto.stock),
    };

    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, nuevoProducto],
    }));
  };

  const handleUpdateCantidad = (productoId, nuevaCantidad) => {
    if (!productosEditables) return;
    if (nuevaCantidad < 1) return;
    const producto = formData.productos.find(p => p.id === productoId);
    const stockDisponible = toNumber(producto?.stock, nuevaCantidad);
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
              subtotal: calculateLineSubtotal(cantidad, p.precioUnitario),
              iva: calculateLineIva(
                calculateLineSubtotal(cantidad, p.precioUnitario),
                p.ivaPercentage
              ),
            }
          : p
      ),
    }));
  };

  const handleRemoveProduct = (productoId) => {
    if (!productosEditables) return;
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== productoId),
    }));
  };

  // --- Manejador para PaymentsSection ---
  const handleAddPayment = async (paymentData) => {
    try {
      const tempPago = {
        ...paymentData,
        id: `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        fechaPago: new Date().toISOString(),
        pending: true,
      };

      setPagos(prev => [...prev, tempPago]);
      setTotalPagado(prev => roundMoney(prev + paymentData.monto));
      showSuccess(
        'Abono agregado',
        isEditMode
          ? 'El abono se registrará al guardar los cambios.'
          : 'El abono se registrará al crear el pedido.'
      );
    } catch (error) {
      showError(
        'Error al agregar pago',
        error.response?.data?.message || error.response?.data?.error || error.message
      );
    }
  };

  const handleRemovePayment = (paymentId) => {
    const payment = pagos.find((pago) => pago.id === paymentId);

    if (!payment || payment.locked || payment.persisted) return;

    setPagos(prev => prev.filter((pago) => pago.id !== paymentId));
    setTotalPagado(prev => Math.max(0, roundMoney(prev - toNumber(payment.monto))));
    showSuccess('Abono eliminado', 'El abono pendiente fue eliminado.');
  };

  // --- ValidaciÃ³n ---
  const validate = () => {
    const newErrors = {};
    if (formData.clienteId === '' || formData.clienteId === undefined) {
      newErrors.clienteId = 'Debe seleccionar un cliente.';
    }
    if (!formData.direccionEntrega?.trim()) {
      newErrors.direccionEntrega = 'La dirección de entrega es obligatoria.';
    }
    if (formData.productos.length === 0) {
      newErrors.productos = 'Debe agregar al menos un producto.';
    } else if (formData.productos.some(product => !product.codBarras && !product.barcode)) {
      newErrors.productos = 'Todos los productos deben tener código de barras.';
    }
    if (formData.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) {
      if (!formData.motivoCancelacion?.trim()) {
        newErrors.motivoCancelacion = 'Debe indicar el motivo de cancelación.';
      } else if (formData.motivoCancelacion.trim().length < 10) {
        newErrors.motivoCancelacion = 'El motivo debe tener al menos 10 caracteres.';
      }
    }
    return newErrors;
  };

  // --- EnvÃ­o del formulario ---
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showWarning('Formulario incompleto', 'Revisa los campos marcados en rojo.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clienteId: formData.clienteId,
        asesorId: formData.asesorId,
        tipoEntrega: formData.tipoEntrega,
        direccionEntrega: formData.direccionEntrega.trim(),
        productos: formData.productos,
        estadoLogistico: formData.estadoLogistico,
        origen: ORIGENES.MANUAL,
      };

      let orderResult;
      if (isEditMode) {
        const orderId = Number(id);
        const currentOrder = await OrdersService.findById(orderId);

        orderResult = await OrdersService.update({
          id: orderId,
          clienteId: payload.clienteId,
          tipoEntrega: payload.tipoEntrega,
          direccionEntrega: payload.direccionEntrega,
          productos: payload.productos,
          estadoLogistico: payload.estadoLogistico,
          motivoCancelacion: formData.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO ? formData.motivoCancelacion : null,
        });

        const oldTotal = currentOrder?.total || 0;
        const newTotal = orderResult?.total || total;
        const excedente = newTotal < oldTotal && totalPagado > newTotal ? totalPagado - newTotal : 0;

        if (excedente > 0) {
          const result = await showConfirm(
            'warning',
            'Excedente detectado',
            `El total del pedido ha disminuido de $${oldTotal.toLocaleString()} a $${newTotal.toLocaleString()}. ` +
            `El cliente ha pagado $${totalPagado.toLocaleString()}, por lo que hay un excedente de $${excedente.toLocaleString()}. ` +
            `¿Qué deseas hacer con este excedente?`,
            {
              confirmButtonText: 'Saldo a favor',
              cancelButtonText: 'Devolver en efectivo',
              showCancelButton: true,
            }
          );

          if (result.isConfirmed) {
            try {
              await clientsService.aplicarSaldoFavor(
                orderResult.clienteId,
                excedente,
                `Excedente por modificación de pedido #${orderResult.numeroPedido}`
              );
              showSuccess(
                'Saldo a favor aplicado',
                `Se ha registrado un saldo a favor de $${excedente.toLocaleString()} para el cliente.`
              );
            } catch (error) {
              showError('Error', 'No se pudo aplicar el saldo a favor. ' + error.message);
            }
          } else if (result.isDismissed) {
            try {
              await PaymentService.addDevolucion(orderId, excedente);
              showSuccess(
                'Devolución registrada',
                `Se ha registrado una devolución en efectivo de $${excedente.toLocaleString()}.`
              );
            } catch (error) {
              showError('Error', 'No se pudo registrar la devolución. ' + error.message);
            }
          }
        }

        const pendingPayments = pagos.filter((pago) => !pago.locked && !pago.persisted);
        for (const pago of pendingPayments) {
          await PaymentService.add(orderId, {
            metodoPago: pago.metodoPago,
            monto: pago.monto,
            comprobante: pago.comprobante,
          });
        }

        showSuccess('Pedido actualizado', `Pedido #${orderResult.numeroPedido} actualizado correctamente.`);
      } else {
        orderResult = await OrdersService.create(payload);

        for (const pago of pagos.filter((item) => !item.persisted)) {
          await PaymentService.add(orderResult.id, {
            metodoPago: pago.metodoPago,
            monto: pago.monto,
            comprobante: pago.comprobante,
          });
        }

        showSuccess('Pedido creado', `Pedido #${orderResult.numeroPedido} registrado con éxito.`);
      }

      navigate('/admin/sales/orders');
    } catch (error) {
      console.error(error);
      showError('Error', error.response?.data?.message || error.response?.data?.error || error.message || 'Ocurrió un error al guardar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const result = await showConfirm(
      'warning',
      '¿Salir sin guardar?',
      'Los cambios no guardados se perderán.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Continuar editando' }
    );
    if (result?.isConfirmed) {
      navigate('/admin/sales/orders');
    }
  };

  // --- Render ---
  if (initialLoading) {
    return (
      <Spinner message="Cargando pedido..." />
    );
  }

  return (
    // âœ… Cambio principal: se reemplaza max-w-7xl mx-auto por w-full
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      {/* Cabecera */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            title="Volver a pedidos"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.8} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? `Editando Pedido #${id}` : 'Nuevo Pedido'}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={1.8} />
                {isEditMode ? 'Guardar cambios' : 'Crear pedido'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Contenido del formulario en dos columnas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LeftSectionForm
          formData={formData}
          errors={errors}
          clientes={clientes}
          user={user}
          loading={loading}
          isEditMode={isEditMode}
          onClienteChange={handleClienteChange}
          onTipoEntregaChange={handleTipoEntregaChange}
          onDireccionManualChange={handleDireccionManualChange}
          onEstadoLogisticoChange={handleEstadoLogisticoChange}
          onMotivoCancelacionChange={handleMotivoCancelacionChange}
        />

        <RightSectionForm
          productos={formData.productos}
          productosCatalogo={productosCatalogoConPrecio}
          errors={errors}
          loading={loading}
          disabled={!productosEditables || loading}
          subtotal={subtotal}
          iva={iva}
          total={total}
          onAddProduct={handleAddProduct}
          onUpdateCantidad={handleUpdateCantidad}
          onRemoveProduct={handleRemoveProduct}
        />
      </div>

      {/* SecciÃ³n de pagos */}
      <div className="mt-5">
        <PaymentsSection
          pedidoId={id ? Number(id) : null}
          total={total}
          pagos={pagos}
          onAddPayment={handleAddPayment}
          onRemovePayment={handleRemovePayment}
          loading={loading}
          isEditMode={isEditMode}
        />
      </div>

      {/* Aviso para pago completado */}
      {totalPagado >= total && total > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Pago completado:</strong> El pedido ha sido pagado en su totalidad.
            {formData.estadoLogistico === ESTADOS_LOGISTICOS.LISTO && ' El pedido está listo para entrega.'}
          </p>
        </div>
      )}

      {/* Aviso de productos no editables */}
      {isEditMode && !productosEditables && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Productos no editables:</strong> Este pedido ya ha sido pagado o cancelado, no se pueden modificar los productos.
          </p>
        </div>
      )}
    </div>
  );
}

export default OrdersForm;


