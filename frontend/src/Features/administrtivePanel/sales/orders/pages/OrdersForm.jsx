// src/features/orders/pages/OrdersForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

// Servicios
import OrdersService, { PaymentService, ESTADOS_LOGISTICOS, ESTADOS_PAGO, ORIGENES, METODOS_PAGO } from '../services/ordersService';
import ProductsService from '../../../purchases/products/services/productsServices';
import { clientsService } from '../../clients/services/clientsService';
import { useAlert } from '../../../../shared/alerts/useAlert';

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

const calculateLineSubtotal = (cantidad, precioUnitario) =>
  toNumber(cantidad) * toNumber(precioUnitario);

const calculateLineIva = (subtotal, ivaPercentage = 19) =>
  subtotal * (toNumber(ivaPercentage, 19) / 100);

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

  const subtotal = formData.productos.reduce((sum, p) => sum + toNumber(p.subtotal), 0);
  const iva = formData.productos.reduce((sum, p) => sum + toNumber(p.iva), 0);
  const total = subtotal;
  const saldoPendiente = Math.max(0, total - totalPagado);

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

        const productsList = await ProductsService.list();
        setProductosCatalogo(productsList.map(product => ({
          ...product,
          id: product.id,
          nombre: product.nombre || product.name || 'Producto sin nombre',
          codBarras: getPrimaryBarcode(product),
          precioDetalle: getRetailPrice(product),
          stock: getTotalStock(product),
          ivaPercentage: toNumber(product.ivaPercentage, 19),
        })));

        if (isEditMode) {
          const order = await OrdersService.findById(Number(id));
          if (!order) {
            showError('Pedido no encontrado', `El pedido #${id} no existe.`);
            navigate('/admin/sales/orders');
            return;
          }

          // Cargar pagos existentes
          const existingPayments = await PaymentService.getByPedidoId(order.id);
          setPagos(existingPayments);
          setTotalPagado(await PaymentService.getTotalPagado(order.id));

          const productosNormalizados = (order.productos || []).map(p => ({
            ...p,
            precioUnitario: toNumber(p.precioUnitario),
            subtotal: toNumber(p.subtotal, calculateLineSubtotal(p.cantidad, p.precioUnitario)),
            iva: toNumber(p.iva),
          }));

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
        'Al cancelar el pedido se liberarÃ¡ el stock reservado. Esta acciÃ³n no se puede deshacer fÃ¡cilmente.',
        { confirmButtonText: 'SÃ­, cancelar', cancelButtonText: 'Mantener estado' }
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

    const existe = formData.productos.find(p => p.id === producto.id);
    if (existe) {
      showWarning('Producto ya agregado', 'Puedes editar la cantidad en la tabla.');
      return;
    }

    const precio = getRetailPrice(producto);
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
    };

    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, nuevoProducto],
    }));
  };

  const handleUpdateCantidad = (productoId, nuevaCantidad) => {
    if (!productosEditables) return;
    if (nuevaCantidad < 1) return;
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.map(p =>
        p.id === productoId
          ? {
              ...p,
              cantidad: nuevaCantidad,
              subtotal: calculateLineSubtotal(nuevaCantidad, p.precioUnitario),
              iva: calculateLineIva(
                calculateLineSubtotal(nuevaCantidad, p.precioUnitario),
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
      if (isEditMode) {
        await PaymentService.add(Number(id), paymentData);
        setPagos(await PaymentService.getByPedidoId(Number(id)));
        setTotalPagado(await PaymentService.getTotalPagado(Number(id)));
        const updatedOrder = await OrdersService.findById(Number(id));
        if (updatedOrder) {
          setFormData(prev => ({ ...prev, pagoEstado: updatedOrder.pagoEstado }));
        }
        showSuccess('Abono registrado', `Se ha agregado un abono de $${paymentData.monto.toLocaleString()}.`);
      } else {
        const tempPago = {
          ...paymentData,
          id: Date.now(),
          fechaPago: new Date().toISOString(),
        };
        setPagos(prev => [...prev, tempPago]);
        setTotalPagado(prev => prev + paymentData.monto);
        showSuccess('Abono agregado', 'El abono se registrarÃ¡ al crear el pedido.');
      }
    } catch (error) {
      showError(
        'Error al agregar pago',
        error.response?.data?.message || error.response?.data?.error || error.message
      );
    }
  };

  // --- ValidaciÃ³n ---
  const validate = () => {
    const newErrors = {};
    if (formData.clienteId === '' || formData.clienteId === undefined) {
      newErrors.clienteId = 'Debe seleccionar un cliente.';
    }
    if (!formData.direccionEntrega?.trim()) {
      newErrors.direccionEntrega = 'La direcciÃ³n de entrega es obligatoria.';
    }
    if (formData.productos.length === 0) {
      newErrors.productos = 'Debe agregar al menos un producto.';
    } else if (formData.productos.some(product => !product.codBarras && !product.barcode)) {
      newErrors.productos = 'Todos los productos deben tener cÃ³digo de barras.';
    }
    if (formData.estadoLogistico === ESTADOS_LOGISTICOS.CANCELADO) {
      if (!formData.motivoCancelacion?.trim()) {
        newErrors.motivoCancelacion = 'Debe indicar el motivo de cancelaciÃ³n.';
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

        showSuccess('Pedido actualizado', `Pedido #${orderResult.numeroPedido} actualizado correctamente.`);
      } else {
        orderResult = await OrdersService.create(payload);

        for (const pago of pagos) {
          await PaymentService.add(orderResult.id, {
            metodoPago: pago.metodoPago,
            monto: pago.monto,
            comprobante: pago.comprobante,
          });
        }

        showSuccess('Pedido creado', `Pedido #${orderResult.numeroPedido} registrado con Ã©xito.`);
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
      'Â¿Salir sin guardar?',
      'Los cambios no guardados se perderÃ¡n.',
      { confirmButtonText: 'SÃ­, salir', cancelButtonText: 'Continuar editando' }
    );
    if (result?.isConfirmed) {
      navigate('/admin/sales/orders');
    }
  };

  // --- Render ---
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004D77]"></div>
        <span className="ml-3 text-gray-600">Cargando pedido...</span>
      </div>
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
          productosCatalogo={productosCatalogo}
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
          loading={loading}
          isEditMode={isEditMode}
        />
      </div>

      {/* Aviso para pago completado */}
      {totalPagado >= total && total > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Pago completado:</strong> El pedido ha sido pagado en su totalidad.
            {formData.estadoLogistico === ESTADOS_LOGISTICOS.LISTO && ' El pedido estÃ¡ listo para entrega.'}
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


