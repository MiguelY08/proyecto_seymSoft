// src/features/administrtivePanel/sales/pages/SaleForm.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { getPrimaryProductBarcode } from '../../../../shared/scanner';
import { getProductPriceForClient } from '../../shared/clientPricing';

// Servicios
import { SalesServices } from '../services/salesServices';
import ProductsService from '../../../purchases/products/services/productsServices';
import { clientsService } from '../../clients/services/clientsService';
import { getCreditCustomers } from '../../paymentsAndCredits/services/paymentsServices';
import { mapCustomers as mapCreditCustomers } from '../../paymentsAndCredits/mappers/paymentsMapper';
import { useAuth } from '../../../../access/context/AuthContext';

// Componentes reutilizados del módulo de pedidos
import LeftSectionForm from '../../orders/components/LeftSectionForm';
import RightSectionForm from '../../orders/components/RightSectionForm';
import PaymentsSection from '../../orders/components/PaymentsSection';
import FormClient from '../../clients/modals/FormClient';

// Helpers
import { getInitialPaymentAmounts } from '../helpers/salesHelpers';
import { ESTADOS_LOGISTICOS, LocationService, ORIGENES } from '../../orders/services/ordersService';

const PAYMENT_METHOD_IDS = {
  transferencia: 1,
  efectivo: 2,
  credito: 3,
};

const ORDER_STATUS_IDS = {
  [ESTADOS_LOGISTICOS.EN_PROCESO]: 1,
  [ESTADOS_LOGISTICOS.LISTO]: 2,
  entregado: 3,
  [ESTADOS_LOGISTICOS.CANCELADO]: 4,
};

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getPaymentMethodId = (methodName) => {
  const method = normalizeText(methodName);

  if (method.includes('transfer')) return PAYMENT_METHOD_IDS.transferencia;
  if (method.includes('efect')) return PAYMENT_METHOD_IDS.efectivo;
  if (method.includes('credit') || /^cr.*dito$/.test(method)) return PAYMENT_METHOD_IDS.credito;

  return null;
};

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

const getCreditPaymentAmount = (paymentMethods) =>
  paymentMethods
    .filter((payment) => payment.idPaymentMethod === PAYMENT_METHOD_IDS.credito)
    .reduce((sum, payment) => sum + roundMoney(payment.amount), 0);

const getFirstPositiveNumber = (...values) => {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
};

const getCreditValidationInfo = (creditAccount, client) => {
  const assignedCredit = getFirstPositiveNumber(
    creditAccount?.creditoAsignado,
    creditAccount?.assignedCredit,
    client?.assignedCredit,
    client?.clientCredit
  );
  const usedCredit = getFirstPositiveNumber(
    creditAccount?.saldo,
    creditAccount?.usedCredit,
    creditAccount?.deudaTotal,
    creditAccount?.totalDebt,
    client?.usedCredit,
    client?.totalDebt
  );
  const explicitAvailable = getFirstPositiveNumber(
    creditAccount?.cupoDisponible,
    creditAccount?.availableCredit,
    client?.availableCredit
  );
  const calculatedAvailable = Math.max(0, roundMoney(assignedCredit - usedCredit));

  return {
    assignedCredit,
    usedCredit,
    availableCredit: explicitAvailable > 0 ? explicitAvailable : calculatedAvailable,
  };
};

const isCreditOverdue = (account) =>
  normalizeText(account?.estado ?? account?.status).includes('vencido');

const getSessionUserId = (user) =>
  user?.idUser ?? user?.id_user ?? user?.id ?? null;

const getSessionEmployeeId = (user) =>
  user?.idEmployee ??
  user?.id_employee ??
  user?.employee?.idEmployee ??
  user?.employee?.id_employee ??
  user?.employeeId ??
  null;

const getCreditDueDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
};

const normalizeClientList = (response) => response?.data ?? response ?? [];

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
  const barcode = getPrimaryProductBarcode(product);

  return {
    ...product,
    id: product.id ?? product.idProduct,
    nombre: product.nombre ?? product.name,
    retailPrice: Number(product.retailPrice ?? product.precioDetalle ?? 0),
    wholesalePrice: Number(product.wholesalePrice ?? product.precioMayorista ?? product.retailPrice ?? product.precioDetalle ?? 0),
    partnerPrice: Number(product.partnerPrice ?? product.precioColegas ?? product.retailPrice ?? product.precioDetalle ?? 0),
    bulkPrice: Number(product.bulkPrice ?? product.precioPacas ?? product.retailPrice ?? product.precioDetalle ?? 0),
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
  const isDirectSale = vendingType === 'direct';
  const vendingTypeLabel =
    vendingType === 'manual' ? 'Manual' :
    vendingType === 'web' ? 'Web' :
    'Directa';

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
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Datos del formulario (similar a OrdersForm)
  const [formData, setFormData] = useState({
    clienteId: location.state?.newUserId ?? '',
    tipoEntrega: 'recoge',
    direccionEntrega: '',
    departamentoEntregaCodigo: '',
    departamentoEntregaNombre: '',
    ciudadEntregaCodigo: '',
    ciudadEntregaNombre: '',
    shippingAmount: 0,
    productos: [],
    estadoLogistico: isDirectSale ? ESTADOS_LOGISTICOS.ENTREGADO : ESTADOS_LOGISTICOS.EN_PROCESO,
    origen: ORIGENES.MANUAL,
    motivoCancelacion: '',
  });
  const [errors, setErrors] = useState({});

  // Catálogos
  const [clientes, setClientes] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [productosCatalogo, setProductosCatalogo] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  // Pagos (abonos)
  const [pagos, setPagos] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState(getInitialPaymentAmounts());
  const [totalPagado, setTotalPagado] = useState(0);

  // Cálculo de totales
  const selectedClient = clientes.find((cliente) => Number(cliente.id) === Number(formData.clienteId)) ?? null;
  const selectedCreditAccount = creditAccounts.find((account) => Number(account.id) === Number(formData.clienteId)) ?? null;
  const productosCatalogoConPrecio = productosCatalogo.map((product) => ({
    ...product,
    precioDetalle: getProductPriceForClient(product, selectedClient),
  }));
  const productosTotal = roundMoney(formData.productos.reduce((sum, p) => sum + (p.subtotal || 0), 0));
  const shippingAmount = formData.tipoEntrega === 'domicilio' ? roundMoney(formData.shippingAmount) : 0;
  const total = roundMoney(productosTotal + shippingAmount);
  const iva = formData.productos.reduce((sum, p) => sum + (p.ivaAmount || 0), 0);
  const subtotal = roundMoney(productosTotal - iva);
  const saldoPendiente = Math.max(0, total - totalPagado);
  const creditValidationInfo = useMemo(
    () => getCreditValidationInfo(selectedCreditAccount, selectedClient),
    [selectedCreditAccount, selectedClient]
  );

  // ─── Carga inicial de catálogos ──────────────────────────────────────────
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const clients = await clientsService.getAll();
        setClientes(normalizeClientList(clients).map(normalizeClientForForm));

        const creditCustomers = await getCreditCustomers();
        setCreditAccounts(mapCreditCustomers(creditCustomers));

        const departments = await LocationService.getDepartments();
        setDepartamentos(departments);

        const products = await ProductsService.list();
        setProductosCatalogo((products ?? []).map(normalizeProduct));
      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudieron cargar clientes o productos.');
      }
    };

    loadCatalogs();
  }, [showError]);

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
        const cities = await LocationService.getCitiesByDepartment(formData.departamentoEntregaCodigo);
        if (active) {
          setCiudades(cities);
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
    if (formData.productos.length === 0) return;

    setFormData(prev => ({
      ...prev,
      productos: prev.productos.map((line) => {
        const product = productosCatalogo.find(item => item.id === line.id);
        if (!product) return line;

        const precioUnitario = getProductPriceForClient(product, selectedClient);
        const lineTotal = roundMoney(line.cantidad * precioUnitario);

        return {
          ...line,
          precioUnitario,
          subtotal: lineTotal,
          ivaAmount: getIncludedIvaAmount(lineTotal, line.ivaPercentage),
        };
      }),
    }));
  }, [formData.clienteId, productosCatalogo, clientes]);

  useEffect(() => {
    if (!isDirectSale || formData.estadoLogistico === ESTADOS_LOGISTICOS.ENTREGADO) return;
    setFormData(prev => ({ ...prev, estadoLogistico: ESTADOS_LOGISTICOS.ENTREGADO }));
  }, [isDirectSale, formData.estadoLogistico]);

  // ─── Manejadores para LeftSectionForm ─────────────────────────────────────
  const handleClienteChange = (e) => {
    const rawValue = e.target.value;
    const clienteId = rawValue === '' ? '' : Number(rawValue);
    setFormData(prev => ({ ...prev, clienteId }));

    if (clienteId !== '') {
      const cliente = clientes.find(c => Number(c.id) === Number(clienteId));
      if (cliente) {
        const direccionSugerida = cliente.id === 0
          ? 'El cliente lo recoge'
          : (cliente.address || cliente.direccion || '');
        setFormData(prev => ({ ...prev, direccionEntrega: direccionSugerida }));
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

      try {
        const creditCustomers = await getCreditCustomers();
        setCreditAccounts(mapCreditCustomers(creditCustomers));
      } catch (error) {
        console.warn('No se pudo refrescar cartera despues de crear cliente:', error);
      }

      setFormData(prev => ({
        ...prev,
        clienteId: createdClientId,
        direccionEntrega: prev.tipoEntrega === 'recoge'
          ? 'El cliente lo recoge'
          : (createdClient.address || createdClient.direccion || ''),
      }));
      setErrors(prev => ({ ...prev, clienteId: null, direccionEntrega: null }));
      showSuccess('Cliente creado', 'El nuevo cliente fue creado y asignado a la venta.');
      setIsClientModalOpen(false);
      return createdClient;
    } catch (error) {
      showError('Error', error.message || 'No se pudo crear el cliente.');
      throw error;
    }
  };

  const handleTipoEntregaChange = (e) => {
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
    setFormData(prev => ({ ...prev, direccionEntrega: e.target.value }));
    if (errors.direccionEntrega) setErrors(prev => ({ ...prev, direccionEntrega: null }));
  };

  const handleShippingAmountChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, shippingAmount: value }));
    if (errors.shippingAmount) setErrors(prev => ({ ...prev, shippingAmount: null }));
  };

  const handleEstadoLogisticoChange = (e) => {
    if (isDirectSale) return;
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

    const precio = getProductPriceForClient(producto, selectedClient);
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

  const handleScannerProductNotFound = (code) => {
    showError(
      'Codigo no registrado',
      `No se encontro ningun producto con el codigo de barras ${code}.`
    );
  };

  // ─── Manejador para pagos (PaymentsSection) ───────────────────────────────
  const handleAddPayment = (paymentData) => {
    const { metodoPago, monto, comprobante } = paymentData;

    if (pagos.some((pago) => normalizeText(pago.metodoPago) === normalizeText(metodoPago))) {
      showWarning('Metodo repetido', 'No se puede repetir un metodo de pago en la misma venta.');
      return;
    }

    const tempPago = {
      id: `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
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

  const handleRemovePayment = (paymentId) => {
    const payment = pagos.find((pago) => pago.id === paymentId);

    if (!payment) return;

    setPagos(prev => prev.filter((pago) => pago.id !== paymentId));
    setTotalPagado(prev => Math.max(0, roundMoney(prev - roundMoney(payment.monto))));
    setPaymentAmounts(prev => ({
      ...prev,
      [payment.metodoPago]: Math.max(0, roundMoney((prev[payment.metodoPago] || 0) - roundMoney(payment.monto))),
    }));
    showSuccess('Abono eliminado', 'El abono pendiente fue eliminado.');
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
    if (formData.tipoEntrega === 'domicilio') {
      if (!formData.departamentoEntregaCodigo || !formData.departamentoEntregaNombre) {
        newErrors.departamentoEntregaCodigo = 'Debe seleccionar un departamento.';
      }
      if (!formData.ciudadEntregaCodigo || !formData.ciudadEntregaNombre) {
        newErrors.ciudadEntregaCodigo = 'Debe seleccionar un municipio/ciudad.';
      }
      if (roundMoney(formData.shippingAmount) <= 0) {
        newErrors.shippingAmount = 'Debe ingresar un valor de envio mayor a cero.';
      }
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

    if (Math.round(paymentTotal * 100) !== Math.round(total * 100)) {
      showWarning(
        'Pago invalido',
        `La suma de los metodos de pago debe ser igual al total de la venta. Total: $${total.toLocaleString()}, pagado: $${paymentTotal.toLocaleString()}.`
      );
      return;
    }

    let paymentMethods = [];
    setLoading(true);
    try {
      paymentMethods = pagos.map((pago) => ({
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

      if (hasCreditPayment) {
        const creditAmount = getCreditPaymentAmount(paymentMethods);
        const { assignedCredit, availableCredit } = creditValidationInfo;

        if (assignedCredit <= 0) {
          showWarning('Credito no disponible', 'El cliente no tiene cupo de credito asignado.');
          return;
        }

        if (isCreditOverdue(selectedCreditAccount ?? selectedClient)) {
          showWarning('Credito vencido', 'El cliente tiene creditos vencidos. No se puede registrar una venta a credito.');
          return;
        }

        if (roundMoney(creditAmount) > roundMoney(availableCredit)) {
          showWarning(
            'Cupo insuficiente',
            `El monto a credito ($${creditAmount.toLocaleString()}) supera el cupo disponible ($${availableCredit.toLocaleString()}).`
          );
          return;
        }
      }

      const sessionEmployeeId = getSessionEmployeeId(user);

      const payload = {
        ...(sessionEmployeeId && { idEmployee: sessionEmployeeId }),
        idSaleStatus: 1,
        order: {
          idClient: formData.clienteId,
          idOrderStatus: ORDER_STATUS_IDS[formData.estadoLogistico] ?? formData.estadoLogistico,
          deliveryType: formData.tipoEntrega === 'domicilio' ? 'Domicilio' : 'Recoge',
          deliveryAddress: formData.direccionEntrega,
          shippingAmount,
          deliveryDepartmentCode: formData.tipoEntrega === 'domicilio' ? formData.departamentoEntregaCodigo : null,
          deliveryDepartmentName: formData.tipoEntrega === 'domicilio' ? formData.departamentoEntregaNombre : null,
          deliveryCityCode: formData.tipoEntrega === 'domicilio' ? formData.ciudadEntregaCodigo : null,
          deliveryCityName: formData.tipoEntrega === 'domicilio' ? formData.ciudadEntregaNombre : null,
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
      if (error?.message?.includes('metodos de pago')) {
        console.error('Payload venta rechazado por suma de pagos:', {
          totalFront: total,
          totalPagado: paymentTotal,
          productos: formData.productos,
          pagos,
          paymentMethods,
        });
      }
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
            Nueva Venta {vendingTypeLabel}
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
          departamentos={departamentos}
          ciudades={ciudades}
          loadingCiudades={loadingCiudades}
          user={user}
          loading={loading}
          isEditMode={false}
          estadoLogisticoOriginal={isDirectSale ? ESTADOS_LOGISTICOS.ENTREGADO : null}
          showDirectSaleLockedInfo={isDirectSale}
          onClienteChange={handleClienteChange}
          onTipoEntregaChange={handleTipoEntregaChange}
          onDepartamentoEntregaChange={handleDepartamentoEntregaChange}
          onCiudadEntregaChange={handleCiudadEntregaChange}
          onDireccionManualChange={handleDireccionManualChange}
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
          disabled={loading}
          subtotal={subtotal}
          iva={iva}
          shippingAmount={shippingAmount}
          showShippingAmount={formData.tipoEntrega === 'domicilio'}
          total={total}
          onAddProduct={handleAddProduct}
          onUpdateCantidad={handleUpdateCantidad}
          onRemoveProduct={handleRemoveProduct}
          scannerField="sale-product-search"
          onScannerProductNotFound={handleScannerProductNotFound}
        />
      </div>

      {/* Sección de pagos */}
      <div className="mt-6">
        <PaymentsSection
          pedidoId={null}
          total={total}
          pagos={pagos}
          onAddPayment={handleAddPayment}
          onRemovePayment={handleRemovePayment}
          loading={loading}
          isEditMode={false}
          disallowDuplicateMethods
          allowCredit
          creditAvailable={creditValidationInfo.availableCredit}
          creditAssigned={creditValidationInfo.assignedCredit}
        />
      </div>

      <FormClient
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        client={null}
        onSave={handleQuickCreateClient}
      />
    </div>
  );
}

export default SaleForm;
