// src/features/orders/pages/OrdersForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

// Servicios
import OrdersService, { PaymentService, ESTADOS_LOGISTICOS, ESTADOS_PAGO, ORIGENES, METODOS_PAGO } from '../services/ordersService';
import { SalesServices } from '../../vendings/services/salesServices';
import ProductsService from '../../../purchases/products/services/productsServices';
import { clientsService } from '../../clients/services/clientsService';
import { useAlert } from '../../../../shared/alerts/useAlert';
import Spinner from '../../../../shared/spinner';
import { getPrimaryProductBarcode } from '../../../../shared/scanner';
import { getProductPriceForClient } from '../../shared/clientPricing';

// Contexto de autenticación
import { useAuth } from '../../../../access/context/AuthContext';

// Componentes de sección
import LeftSectionForm from '../components/LeftSectionForm';
import RightSectionForm from '../components/RightSectionForm';
import PaymentsSection from '../components/PaymentsSection';
import PaymentReceiptsSection from '../components/PaymentReceiptsSection';
import FormClient from '../../clients/modals/FormClient';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const roundMoney = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

const getPrimaryBarcode = (product = {}) => (
  getPrimaryProductBarcode(product)
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
  roundMoney(toNumber(cantidad) * toNumber(precioUnitario));

const calculateLineIva = (subtotal, ivaPercentage = 19) =>
  roundMoney(subtotal - (subtotal / (1 + (toNumber(ivaPercentage, 19) / 100))));

const normalizeClientForForm = (client = {}) => ({
  ...client,
  id: client.id ?? client.idClient,
  fullName:
    client.fullName ??
    client.name ??
    [client.firstName, client.lastName].filter(Boolean).join(' ') ??
    '',
  name:
    client.name ??
    client.fullName ??
    [client.firstName, client.lastName].filter(Boolean).join(' ') ??
    '',
  clientCredit: client.clientCredit ?? client.assignedCredit,
  assignedCredit: client.assignedCredit ?? client.clientCredit,
});

const PAYMENT_METHOD_IDS = {
  [METODOS_PAGO.TRANSFERENCIA]: 1,
  [METODOS_PAGO.EFECTIVO]: 2,
};

const buildDirectSalePaymentMethods = (payments = []) =>
  payments.map((payment) => ({
    idPaymentMethod: PAYMENT_METHOD_IDS[payment.metodoPago],
    amount: roundMoney(payment.monto),
  }));

const getSessionUserId = (user) =>
  user?.idUser ?? user?.id_user ?? user?.id ?? null;

const getSessionEmployeeId = (user) =>
  user?.idEmployee ??
  user?.id_employee ??
  user?.employee?.idEmployee ??
  user?.employee?.id_employee ??
  user?.employeeId ??
  null;

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
    tieneVenta: false,
  });
  const [errors, setErrors] = useState({});
  const [estadoLogisticoOriginal, setEstadoLogisticoOriginal] = useState(null);
  const [itemsChangedFromReady, setItemsChangedFromReady] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [clientes, setClientes] = useState([]);
  const [productosCatalogo, setProductosCatalogo] = useState([]);

  // Pagos existentes (solo en edición)
  const [pagos, setPagos] = useState([]);
  const [paymentReceipts, setPaymentReceipts] = useState([]);
  const [totalPagado, setTotalPagado] = useState(0);

  const total = roundMoney(formData.productos.reduce((sum, p) => sum + toNumber(p.subtotal), 0));
  const iva = roundMoney(formData.productos.reduce((sum, p) => sum + toNumber(p.iva), 0));
  const subtotal = roundMoney(total - iva);
  const selectedClient = clientes.find((cliente) => Number(cliente.id) === Number(formData.clienteId)) ?? null;
  const productosCatalogoConPrecio = productosCatalogo.map((product) => ({
    ...product,
    precioDetalle: getProductPriceForClient(product, selectedClient),
  }));
  const pedidoInmutable = isEditMode && [
    ESTADOS_LOGISTICOS.ENTREGADO,
    ESTADOS_LOGISTICOS.CANCELADO,
  ].includes(estadoLogisticoOriginal);
  const creaVentaDirecta = !isEditMode && formData.estadoLogistico === ESTADOS_LOGISTICOS.ENTREGADO;
  const tieneAbonosPendientes = pagos.some((pago) => !pago.locked && !pago.persisted);
  const pagoCompleto = totalPagado >= total && total > 0;
  const pagoCompletoPendienteGuardar = pagoCompleto && tieneAbonosPendientes;
  const mensajePagoCompleto = (() => {
    if (creaVentaDirecta) {
      return 'Al crear, este pedido se registrara como venta directa porque fue marcado como Entregado.';
    }
    if (pagoCompletoPendienteGuardar) {
      return 'Al guardar, se registrara el pago completo y se generara la venta manual. El estado logistico puede mantenerse en En proceso o Listo hasta la entrega.';
    }
    if (isEditMode) {
      return 'Este pedido ya esta pagado. Si tiene una venta asociada, los productos quedan bloqueados.';
    }
    return 'El pedido quedara pagado al crearlo. Si no esta Entregado, seguira pendiente de gestion logistica.';
  })();

  // Determinar si los productos son editables
  const productosEditables = useMemo(() => {
    if (!isEditMode) return true; // en creación siempre editables
    if (estadoLogisticoOriginal === ESTADOS_LOGISTICOS.CANCELADO) return false;
    if (estadoLogisticoOriginal === ESTADOS_LOGISTICOS.ENTREGADO) return false;
    if (formData.pagoEstado === ESTADOS_PAGO.PAGADO) return false;
    if (formData.tieneVenta) return false;
    return true;
  }, [isEditMode, estadoLogisticoOriginal, formData.pagoEstado, formData.tieneVenta]);

  const getOrderStatusAfterItemsChange = (currentStatus) =>
    currentStatus === ESTADOS_LOGISTICOS.LISTO
      ? ESTADOS_LOGISTICOS.EN_PROCESO
      : currentStatus;

  const notifyReadyOrderReturnsToProcess = () => {
    if (formData.estadoLogistico !== ESTADOS_LOGISTICOS.LISTO) return;
    setItemsChangedFromReady(true);
    showWarning(
      'Pedido vuelve a En proceso',
      'Al modificar productos o cantidades, el pedido deja de estar listo y vuelve a preparacion.'
    );
  };

  // Actualizar asesorId cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, asesorId: getSessionEmployeeId(user) ?? getSessionUserId(user) }));
    }
  }, [user]);

  // Carga inicial de datos maestros, pedido y pagos (si edición)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const clientsResponse = await clientsService.getAll();
        setClientes((clientsResponse.data || clientsResponse || []).map(normalizeClientForForm));

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
          setPaymentReceipts(order.comprobantesPago || []);

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

          // Determinar tipoEntrega basado en la dirección guardada
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
            tieneVenta: order.tieneVenta,
            origen: order.origen,
            motivoCancelacion: order.motivoCancelacion || '',
          });
          setEstadoLogisticoOriginal(order.estadoLogistico);
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
    const rawValue = e.target.value;
    const clienteId = rawValue === '' ? '' : Number(rawValue);
    setFormData(prev => ({ ...prev, clienteId }));

    if (clienteId !== '') {
      const cliente = clientes.find(c => Number(c.id) === Number(clienteId));
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

  const handleQuickCreateClient = async (clientData) => {
    try {
      const createdClient = normalizeClientForForm(await clientsService.create(clientData));
      const createdClientId = createdClient.id;

      setClientes(prev => {
        const exists = prev.some(client => Number(client.id) === Number(createdClientId));
        return exists
          ? prev.map(client => Number(client.id) === Number(createdClientId) ? createdClient : client)
          : [createdClient, ...prev];
      });

      setFormData(prev => ({
        ...prev,
        clienteId: createdClientId,
        direccionEntrega: prev.tipoEntrega === 'recoge'
          ? 'El cliente lo recoge'
          : (createdClient.address || createdClient.direccion || ''),
      }));
      setErrors(prev => ({ ...prev, clienteId: null, direccionEntrega: null }));
      showSuccess('Cliente creado', 'El nuevo cliente fue creado y asignado al pedido.');
      setIsClientModalOpen(false);
      return createdClient;
    } catch (error) {
      showError('Error', error.message || 'No se pudo crear el cliente.');
      throw error;
    }
  };

  const handleTipoEntregaChange = (e) => {
    if (pedidoInmutable) return;
    const nuevoTipo = e.target.value;
    setFormData(prev => {
      const nuevaDireccion = nuevoTipo === 'recoge' ? 'El cliente lo recoge' : prev.direccionEntrega;
      return { ...prev, tipoEntrega: nuevoTipo, direccionEntrega: nuevaDireccion };
    });
  };

  const handleDireccionManualChange = (e) => {
    if (pedidoInmutable) return;
    setFormData(prev => ({ ...prev, direccionEntrega: e.target.value }));
    if (errors.direccionEntrega) setErrors(prev => ({ ...prev, direccionEntrega: null }));
  };

  const handleEstadoLogisticoChange = async (e) => {
    if (pedidoInmutable) return;
    const newEstado = e.target.value;
    if (newEstado === ESTADOS_LOGISTICOS.CANCELADO) {
      showWarning('Usa el flujo de cancelacion', 'Para cancelar un pedido debes usar la accion Cancelar e indicar el motivo.');
      return;
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

    notifyReadyOrderReturnsToProcess();

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
      estadoLogistico: getOrderStatusAfterItemsChange(prev.estadoLogistico),
      productos: [...prev.productos, nuevoProducto],
    }));
  };

  const handleUpdateCantidad = (productoId, nuevaCantidad) => {
    if (!productosEditables) return;
    if (nuevaCantidad < 1) return;
    const producto = formData.productos.find(p => p.id === productoId);
    if (!producto) return;
    const stockDisponible = toNumber(producto?.stock, nuevaCantidad);
    const cantidad = Math.min(nuevaCantidad, stockDisponible);

    if (cantidad < nuevaCantidad) {
      showWarning('Stock insuficiente', `Solo hay ${stockDisponible} unidades disponibles.`);
    }

    if (cantidad === toNumber(producto?.cantidad)) return;

    notifyReadyOrderReturnsToProcess();

    setFormData(prev => ({
      ...prev,
      estadoLogistico: getOrderStatusAfterItemsChange(prev.estadoLogistico),
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
    notifyReadyOrderReturnsToProcess();
    setFormData(prev => ({
      ...prev,
      estadoLogistico: getOrderStatusAfterItemsChange(prev.estadoLogistico),
      productos: prev.productos.filter(p => p.id !== productoId),
    }));
  };

  const handleScannerProductNotFound = (code) => {
    showError(
      'Codigo no registrado',
      `No se encontro ningun producto con el codigo de barras ${code}.`
    );
  };

  // --- Manejador para PaymentsSection ---
  const handleAddPayment = async (paymentData) => {
    if (pedidoInmutable) return;
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

  // --- Validación ---
  const validate = () => {
    const newErrors = {};
    if (pedidoInmutable) {
      newErrors.general = 'Este pedido ya esta entregado o cancelado y no puede modificarse.';
      return newErrors;
    }
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
    if (
      formData.estadoLogistico === ESTADOS_LOGISTICOS.ENTREGADO &&
      Math.round(totalPagado * 100) < Math.round(total * 100)
    ) {
      newErrors.general = 'Para entregar el pedido, el pago debe estar completo.';
    }
    if (creaVentaDirecta) {
      const paymentMethods = buildDirectSalePaymentMethods(pagos);
      if (!getSessionUserId(user)) {
        newErrors.general = 'No se pudo identificar al usuario en sesion.';
      } else if (paymentMethods.length === 0) {
        newErrors.general = 'Para registrar una venta directa, debes agregar al menos un pago.';
      } else if (paymentMethods.some((payment) => !payment.idPaymentMethod)) {
        newErrors.general = 'Hay pagos con un metodo no valido para registrar la venta directa.';
      } else if (paymentMethods.some((payment) => payment.amount <= 0)) {
        newErrors.general = 'Todos los pagos de la venta directa deben ser mayores a cero.';
      } else if (new Set(paymentMethods.map((payment) => payment.idPaymentMethod)).size !== paymentMethods.length) {
        newErrors.general = 'No se puede repetir un metodo de pago en una venta directa.';
      } else if (Math.round(totalPagado * 100) !== Math.round(total * 100)) {
        newErrors.general = 'Para registrar una venta directa, la suma de pagos debe ser igual al total.';
      }
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

  // --- Envío del formulario ---
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showWarning('No se puede guardar', validationErrors.general ?? 'Revisa los campos marcados en rojo.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clienteId: formData.clienteId,
        asesorId: getSessionEmployeeId(user) ?? formData.asesorId,
        usuarioId: getSessionUserId(user),
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
        if (creaVentaDirecta) {
          const paymentMethods = buildDirectSalePaymentMethods(pagos);
          const sessionEmployeeId = getSessionEmployeeId(user);

          await SalesServices.create('direct', {
            ...(sessionEmployeeId && { idEmployee: sessionEmployeeId }),
            idSaleStatus: 1,
            order: {
              idClient: payload.clienteId,
              idOrderStatus: 3,
              deliveryType: payload.tipoEntrega === 'domicilio' ? 'Domicilio' : 'Recoge',
              deliveryAddress: payload.direccionEntrega,
              items: payload.productos.map((producto) => ({
                idProduct: producto.id,
                barcode: producto.codBarras || producto.barcode || '',
                quantity: producto.cantidad,
              })),
            },
            paymentMethods,
          });

          showSuccess('Venta directa registrada', 'El pedido fue entregado y registrado como venta directa.');
          navigate('/admin/sales');
          return;
        }

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
    // ✅ Cambio principal: se reemplaza max-w-7xl mx-auto por w-full
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
            disabled={loading || pedidoInmutable}
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
          readOnly={pedidoInmutable}
          isEditMode={isEditMode}
          estadoLogisticoOriginal={estadoLogisticoOriginal}
          onClienteChange={handleClienteChange}
          onTipoEntregaChange={handleTipoEntregaChange}
          onDireccionManualChange={handleDireccionManualChange}
          onEstadoLogisticoChange={handleEstadoLogisticoChange}
          onMotivoCancelacionChange={handleMotivoCancelacionChange}
          onCreateClient={() => setIsClientModalOpen(true)}
        />

        <RightSectionForm
          productos={formData.productos}
          productosCatalogo={productosCatalogoConPrecio}
          errors={errors}
          loading={loading}
          disabled={!productosEditables || loading || pedidoInmutable}
          subtotal={subtotal}
          iva={iva}
          total={total}
          onAddProduct={handleAddProduct}
          onUpdateCantidad={handleUpdateCantidad}
          onRemoveProduct={handleRemoveProduct}
          scannerField="order-product-search"
          onScannerProductNotFound={handleScannerProductNotFound}
        />
      </div>

      {/* Sección de pagos */}
      {isEditMode && paymentReceipts.length > 0 && (
        <div className="mt-5">
          <PaymentReceiptsSection receipts={paymentReceipts} />
        </div>
      )}

      <div className="mt-5">
        <PaymentsSection
          pedidoId={id ? Number(id) : null}
          total={total}
          pagos={pagos}
          onAddPayment={handleAddPayment}
          onRemovePayment={handleRemovePayment}
          loading={loading}
          disabled={pedidoInmutable}
          isEditMode={isEditMode}
          disallowDuplicateMethods={creaVentaDirecta}
        />
      </div>

      {/* Aviso para pago completado */}
      {pagoCompleto && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Pago completado:</strong> {mensajePagoCompleto}
            {formData.estadoLogistico === ESTADOS_LOGISTICOS.LISTO && ' El pedido está listo para entrega.'}
          </p>
        </div>
      )}

      {/* Aviso de productos no editables */}
      {isEditMode && !productosEditables && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Productos no editables:</strong> Este pedido ya ha sido pagado, tiene una venta asociada, fue entregado o fue cancelado; no se pueden modificar los productos.
          </p>
        </div>
      )}

      {itemsChangedFromReady && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Estado actualizado:</strong> Al modificar productos o cantidades, el pedido volverá a En proceso al guardar.
          </p>
        </div>
      )}

      {pedidoInmutable && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Pedido inmutable:</strong> Los pedidos entregados o cancelados no pueden modificarse.
          </p>
        </div>
      )}

      <FormClient
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        client={null}
        onSave={handleQuickCreateClient}
      />
    </div>
  );
}

export default OrdersForm;


