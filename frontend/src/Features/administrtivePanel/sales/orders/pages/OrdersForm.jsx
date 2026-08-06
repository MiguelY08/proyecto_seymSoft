// src/features/orders/pages/OrdersForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

// Servicios
import OrdersService, { PaymentService, LocationService, ESTADOS_LOGISTICOS, ESTADOS_PAGO, ORIGENES, METODOS_PAGO, PAYMENT_METHOD_IDS } from '../services/ordersService';
import { SalesServices } from '../../vendings/services/salesServices';
import ProductsService from '../../../purchases/products/services/productsServices';
import { clientsService } from '../../clients/services/clientsService';
import { useAlert } from '../../../../shared/alerts/useAlert';
import Spinner from '../../../../shared/spinner';
import { getPrimaryProductBarcode } from '../../../../shared/scanner';
import { getProductPriceForClient } from '../../shared/clientPricing';
import { getClientFavorBalance } from '../../shared/services/clientFavorBalanceService';
import { getClientFavorBalanceValue } from '../../shared/utils/clientFavorBalance';

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
    deliveryRecipientName: '',
    deliveryRecipientPhone: '',
    departamentoEntregaCodigo: '',
    departamentoEntregaNombre: '',
    ciudadEntregaCodigo: '',
    ciudadEntregaNombre: '',
    shippingAmount: 0,
    productos: [],
    estadoLogistico: ESTADOS_LOGISTICOS.EN_PROCESO,
    origen: ORIGENES.MANUAL,
    motivoCancelacion: '',
    tieneVenta: false,
  });
  const [errors, setErrors] = useState({});
  const [estadoLogisticoOriginal, setEstadoLogisticoOriginal] = useState(null);
  const [itemsChangedFromReady, setItemsChangedFromReady] = useState(false);
  const [productosModificados, setProductosModificados] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [clientes, setClientes] = useState([]);
  const [productosCatalogo, setProductosCatalogo] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  // Pagos existentes (solo en edición)
  const [pagos, setPagos] = useState([]);
  const [paymentReceipts, setPaymentReceipts] = useState([]);
  const [totalPagado, setTotalPagado] = useState(0);
  const [favorBalance, setFavorBalance] = useState(0);

  const productosTotal = roundMoney(formData.productos.reduce((sum, p) => sum + toNumber(p.subtotal), 0));
  const shippingAmount = formData.tipoEntrega === 'domicilio' ? roundMoney(formData.shippingAmount) : 0;
  const total = roundMoney(productosTotal + shippingAmount);
  const iva = roundMoney(formData.productos.reduce((sum, p) => sum + toNumber(p.iva), 0));
  const subtotal = roundMoney(productosTotal - iva);
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
  const requiereRevisionEnvio = Boolean(
    isEditMode &&
    String(formData.origen || '').toLowerCase() === ORIGENES.WEB &&
    formData.tipoEntrega === 'domicilio' &&
    toNumber(formData.shippingAmount) <= 0
  );
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

  useEffect(() => {
    let active = true;

    const loadFavorBalance = async () => {
      if (formData.clienteId === '' || formData.clienteId === undefined || formData.clienteId === null) {
        setFavorBalance(0);
        return;
      }

      try {
        setFavorBalance(getClientFavorBalanceValue(selectedClient));

        const balance = await getClientFavorBalance(formData.clienteId);

        if (active) {
          setFavorBalance(balance);
        }
      } catch (error) {
        console.error('No se pudo cargar el saldo a favor del cliente:', error);

        if (active) {
          setFavorBalance(0);
        }
      }
    };

    loadFavorBalance();

    return () => {
      active = false;
    };
  }, [formData.clienteId, selectedClient]);

  // Carga inicial de datos maestros, pedido y pagos (si edición)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const clientsResponse = await clientsService.getAll();
        setClientes((clientsResponse.data || clientsResponse || []).map(normalizeClientForForm));

        const departmentsResponse = await LocationService.getDepartments();
        setDepartamentos(departmentsResponse);

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
            deliveryRecipientName: order.deliveryRecipientName || '',
            deliveryRecipientPhone: order.deliveryRecipientPhone || '',
            departamentoEntregaCodigo: order.departamentoEntregaCodigo || '',
            departamentoEntregaNombre: order.departamentoEntregaNombre || '',
            ciudadEntregaCodigo: order.ciudadEntregaCodigo || '',
            ciudadEntregaNombre: order.ciudadEntregaNombre || '',
            shippingAmount: toNumber(order.shippingAmount),
            productos: productosNormalizados,
            estadoLogistico: order.estadoLogistico,
            pagoEstado: order.pagoEstado, // importante para permisos
            tieneVenta: order.tieneVenta,
            origen: order.origen,
            motivoCancelacion: order.motivoCancelacion || '',
          });
          setEstadoLogisticoOriginal(order.estadoLogistico);
          setProductosModificados(false);
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
    if (formData.tipoEntrega !== 'domicilio' || !formData.departamentoEntregaCodigo) {
      setCiudades([]);
      setLoadingCiudades(false);
      return;
    }

    let active = true;

    const loadCiudades = async () => {
      setLoadingCiudades(true);
      try {
        const citiesResponse = await LocationService.getCitiesByDepartment(formData.departamentoEntregaCodigo);
        if (active) {
          setCiudades(citiesResponse);
        }
      } catch (error) {
        if (active) {
          setCiudades([]);
          showError('Error', 'No se pudieron cargar los municipios del departamento.');
        }
        console.error(error);
      } finally {
        if (active) {
          setLoadingCiudades(false);
        }
      }
    };

    loadCiudades();

    return () => {
      active = false;
    };
  }, [formData.departamentoEntregaCodigo, formData.tipoEntrega, showError]);

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
    if (nuevoTipo === 'recoge') {
      setCiudades([]);
    }
    setFormData(prev => {
      const nuevaDireccion = nuevoTipo === 'recoge' ? 'El cliente lo recoge' : prev.direccionEntrega;
      return {
        ...prev,
        tipoEntrega: nuevoTipo,
        direccionEntrega: nuevaDireccion,
        ...(nuevoTipo === 'recoge' && {
          departamentoEntregaCodigo: '',
          departamentoEntregaNombre: '',
          ciudadEntregaCodigo: '',
          ciudadEntregaNombre: '',
          shippingAmount: 0,
        }),
      };
    });
  };

  const handleDepartamentoEntregaChange = (e) => {
    if (pedidoInmutable) return;
    const departmentCode = e.target.value;
    const selectedDepartment = departamentos.find((department) => department.code === departmentCode);

    setFormData(prev => ({
      ...prev,
      departamentoEntregaCodigo: departmentCode,
      departamentoEntregaNombre: selectedDepartment?.name || '',
      ciudadEntregaCodigo: '',
      ciudadEntregaNombre: '',
    }));

    setErrors(prev => ({
      ...prev,
      departamentoEntregaCodigo: null,
      departamentoEntregaNombre: null,
      ciudadEntregaCodigo: null,
      ciudadEntregaNombre: null,
    }));
  };

  const handleCiudadEntregaChange = (e) => {
    if (pedidoInmutable) return;
    const cityCode = e.target.value;
    const selectedCity = ciudades.find((city) => city.code === cityCode);

    setFormData(prev => ({
      ...prev,
      ciudadEntregaCodigo: cityCode,
      ciudadEntregaNombre: selectedCity?.name || '',
    }));

    setErrors(prev => ({
      ...prev,
      ciudadEntregaCodigo: null,
      ciudadEntregaNombre: null,
    }));
  };
  const handleDireccionManualChange = (e) => {
    if (pedidoInmutable) return;
    setFormData(prev => ({ ...prev, direccionEntrega: e.target.value }));
    if (errors.direccionEntrega) setErrors(prev => ({ ...prev, direccionEntrega: null }));
  };

  const handleDeliveryRecipientNameChange = (e) => {
    if (pedidoInmutable) return;
    setFormData(prev => ({ ...prev, deliveryRecipientName: e.target.value }));
    if (errors.deliveryRecipientName) setErrors(prev => ({ ...prev, deliveryRecipientName: null }));
  };
  const handleDeliveryRecipientPhoneChange = (e) => {
    if (pedidoInmutable) return;
    const value = e.target.value.replace(/[^\d\s()+-]/g, '');
    setFormData(prev => ({ ...prev, deliveryRecipientPhone: value }));
    if (errors.deliveryRecipientPhone) {
      setErrors(prev => ({ ...prev, deliveryRecipientPhone: null }));
    }
  };

  const handleShippingAmountChange = (e) => {
    if (pedidoInmutable) return;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, shippingAmount: value }));
    if (errors.shippingAmount) setErrors(prev => ({ ...prev, shippingAmount: null }));
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
    setProductosModificados(true);

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
    setProductosModificados(true);

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
    setProductosModificados(true);
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
    if (formData.tipoEntrega === 'domicilio' && !formData.deliveryRecipientName?.trim()) {
      newErrors.deliveryRecipientName = 'Debe ingresar el nombre de la persona que recibe el pedido.';
    }
    if (formData.tipoEntrega === 'domicilio') {
      const recipientPhoneDigits = formData.deliveryRecipientPhone.replace(/\D/g, '');
      if (!recipientPhoneDigits) {
        newErrors.deliveryRecipientPhone = 'Debe ingresar el telefono de la persona que recibe el pedido.';
      } else if (recipientPhoneDigits.length < 7 || recipientPhoneDigits.length > 15) {
        newErrors.deliveryRecipientPhone = 'El telefono debe tener entre 7 y 15 digitos.';
      }
    }
    if (!formData.direccionEntrega?.trim()) {
      newErrors.direccionEntrega = 'La dirección de entrega es obligatoria.';
    }
    if (formData.tipoEntrega === 'domicilio') {
      if (!formData.departamentoEntregaCodigo || !formData.departamentoEntregaNombre) {
        newErrors.departamentoEntregaCodigo = 'Debe seleccionar un departamento.';
      }
      if (!formData.ciudadEntregaCodigo || !formData.ciudadEntregaNombre) {
        newErrors.ciudadEntregaCodigo = 'Debe seleccionar un municipio/ciudad.';
      }
      if (toNumber(formData.shippingAmount) <= 0) {
        newErrors.shippingAmount = 'Debe ingresar un valor de envío mayor a cero.';
      }
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
        deliveryRecipientName: formData.tipoEntrega === 'domicilio'
          ? formData.deliveryRecipientName.trim()
          : null,
        deliveryRecipientPhone: formData.tipoEntrega === 'domicilio'
          ? formData.deliveryRecipientPhone.trim()
          : null,
        departamentoEntregaCodigo: formData.departamentoEntregaCodigo,
        departamentoEntregaNombre: formData.departamentoEntregaNombre,
        ciudadEntregaCodigo: formData.ciudadEntregaCodigo,
        ciudadEntregaNombre: formData.ciudadEntregaNombre,
        shippingAmount: formData.tipoEntrega === 'domicilio' ? toNumber(formData.shippingAmount) : 0,
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
          deliveryRecipientName: payload.deliveryRecipientName,
          deliveryRecipientPhone: payload.deliveryRecipientPhone,
          departamentoEntregaCodigo: payload.departamentoEntregaCodigo,
          departamentoEntregaNombre: payload.departamentoEntregaNombre,
          ciudadEntregaCodigo: payload.ciudadEntregaCodigo,
          ciudadEntregaNombre: payload.ciudadEntregaNombre,
          shippingAmount: payload.shippingAmount,
          ...(productosModificados && { productos: payload.productos }),
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

        const createdPayments = [];
        for (const pago of pendingPayments) {
          try {
            const created = await PaymentService.add(orderId, {
              metodoPago: pago.metodoPago,
              monto: pago.monto,
              comprobante: pago.comprobante,
            });
            if (created) createdPayments.push(created);
          } catch (err) {
            console.error('Error registrando abono pendiente:', err);
          }
        }

        // Refrescar pagos y total desde el servidor para mantener consistencia
        try {
          const canonicalPayments = await PaymentService.getByPedidoId(orderId);
          setPagos((canonicalPayments || []).map((p) => ({ ...p, locked: true, persisted: true })));
          setTotalPagado(await PaymentService.getTotalPagado(orderId));
        } catch (err) {
          console.warn('No se pudieron sincronizar pagos tras la actualización:', err);
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
              shippingAmount: payload.shippingAmount,
              deliveryDepartmentCode: payload.departamentoEntregaCodigo,
              deliveryDepartmentName: payload.departamentoEntregaNombre,
              deliveryCityCode: payload.ciudadEntregaCodigo,
              deliveryCityName: payload.ciudadEntregaNombre,
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

        // Si hay abonos pendientes, incluirlos en el payload como `payments`
        // para que el backend los procese atomically al crear el pedido.
        const pendingPayments = (pagos || []).filter((item) => !item.persisted);
        if (pendingPayments.length > 0) {
          const paymentsPayload = pendingPayments.map((p) => ({
            idPaymentMethod: PAYMENT_METHOD_IDS[p.metodoPago] ?? p.idPaymentMethod ?? p.idPaymentMethod,
            amount: roundMoney(p.monto),
            reference: p.comprobante || undefined,
            observations: p.observaciones || p.observations || undefined,
          }));

          // Adjuntar payments al payload de creación
          payload.payments = paymentsPayload;
        }

        orderResult = await OrdersService.create(payload);

        // Sincronizar con la verdad del servidor: obtener pagos y total oficiales
        let canonicalPayments = [];
        try {
          canonicalPayments = await PaymentService.getByPedidoId(orderResult.id);
          setPagos((canonicalPayments || []).map((p) => ({ ...p, locked: true, persisted: true })));
          setTotalPagado(await PaymentService.getTotalPagado(orderResult.id));
        } catch (err) {
          console.warn('No se pudieron obtener los pagos del servidor tras crear el pedido:', err);
        }

        // Registrar localmente los abonos que siguen pendientes y que NO aparecen en el servidor
        const remainingPayments = (pagos || []).filter((item) => !item.persisted);

        const notPresent = remainingPayments.filter((local) => {
          return !(canonicalPayments || []).some((srv) =>
            Math.round(Number(srv.monto || srv.amount || 0) * 100) === Math.round(Number(local.monto || 0) * 100) &&
            (String(srv.metodoPago || srv.paymentMethod || srv.paymentMethodName || '').toLowerCase() === String(local.metodoPago || '').toLowerCase())
          );
        });

        for (const pago of notPresent) {
          try {
            const created = await PaymentService.add(orderResult.id, {
              metodoPago: pago.metodoPago,
              monto: pago.monto,
              comprobante: pago.comprobante,
            });
            if (created) {
              setPagos((prev) => [...prev, { ...created, locked: true, persisted: true }]);
              setTotalPagado(await PaymentService.getTotalPagado(orderResult.id));
            }
          } catch (err) {
            console.error('Error al registrar abono post-create:', err);
          }
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
    <div className="w-full px-3 py-4 sm:px-6 lg:px-8">
      {/* Cabecera */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            onClick={handleCancel}
            className="shrink-0 rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
            title="Volver a pedidos"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.8} />
          </button>
          <h1 className="min-w-0 truncate text-xl font-bold text-gray-900 sm:text-2xl">
            {isEditMode ? `Editando Pedido #${id}` : 'Nuevo Pedido'}
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <button
            onClick={handleCancel}
            className="w-full rounded-lg bg-gray-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 cursor-pointer sm:w-auto sm:px-6"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || pedidoInmutable}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003a5c] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto sm:px-6"
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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LeftSectionForm
          formData={formData}
          errors={errors}
          clientes={clientes}
          departamentos={departamentos}
          ciudades={ciudades}
          loadingCiudades={loadingCiudades}
          user={user}
          loading={loading}
          readOnly={pedidoInmutable}
          isEditMode={isEditMode}
          estadoLogisticoOriginal={estadoLogisticoOriginal}
          showDirectSaleLockedInfo={creaVentaDirecta}
          highlightShippingAmount={requiereRevisionEnvio}
          onClienteChange={handleClienteChange}
          onTipoEntregaChange={handleTipoEntregaChange}
          onDepartamentoEntregaChange={handleDepartamentoEntregaChange}
          onCiudadEntregaChange={handleCiudadEntregaChange}
          onDireccionManualChange={handleDireccionManualChange}
          onDeliveryRecipientNameChange={handleDeliveryRecipientNameChange}
          onDeliveryRecipientPhoneChange={handleDeliveryRecipientPhoneChange}
          onShippingAmountChange={handleShippingAmountChange}
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
          shippingAmount={shippingAmount}
          showShippingAmount={formData.tipoEntrega === 'domicilio'}
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
          allowFavorBalance
          favorBalance={favorBalance}
        />
      </div>

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
