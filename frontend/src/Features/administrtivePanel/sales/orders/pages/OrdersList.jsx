// src/features/orders/pages/OrdersList.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard } from 'lucide-react';
import TopBar from '../components/TopBar';
import OrdersTable from '../components/OrdersTable';
import OrdersService, { ESTADOS_LOGISTICOS, ESTADOS_PAGO, ORIGENES } from '../services/ordersService';
import { clientsService } from '../../clients/services/clientsService';
import { useAlert } from '../../../../shared/alerts/useAlert';
import Spinner from '../../../../shared/spinner';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import { formatDeliveryAddress } from '../helpers/deliveryAddressHelper';

const RECORDS_PER_PAGE = 11;

const ENVIO_FILTERS = {
  PENDIENTE: 'pendiente',
  COMPLETO: 'completo',
};

const requiresShippingAmount = (order = {}) => {
  const origin = String(order.origen ?? order.origin ?? '').toLowerCase();
  const deliveryType = String(order.tipoEntrega ?? order.deliveryType ?? '').toLowerCase();
  const shippingAmount = Number(order.shippingAmount ?? 0);
  return origin === ORIGENES.WEB && deliveryType === 'domicilio' && shippingAmount <= 0;
};

const isActionableWebOrder = (order = {}) => {
  const origin = String(order.origen ?? order.origin ?? '').trim().toLowerCase();
  const logisticStatus = String(order.estadoLogistico ?? order.logisticStatus ?? '').trim().toLowerCase();

  return origin === ORIGENES.WEB && logisticStatus !== ESTADOS_LOGISTICOS.ANULADO;
};

const getDeliverySearchText = (order = {}) => {
  const deliveryType = String(order.tipoEntrega ?? order.deliveryType ?? '').toLowerCase();

  if (deliveryType.includes('recoge') || deliveryType.includes('recibe')) {
    return 'Recoger en tienda';
  }

  return formatDeliveryAddress(order) || 'Sin dirección registrada';
};

const normalizeSearch = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// ─── Componente principal de lista de pedidos ─────────────────────────────────
function OrdersList() {
  const navigate = useNavigate();
  const { showError, showWarning } = useAlert();

  // Estados
  const [orders, setOrders] = useState([]);
  const [clientMap, setClientMap] = useState({});
  const [search, setSearch] = useState('');
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [origenFilter, setOrigenFilter] = useState('');
  const [pagoEstadoFilter, setPagoEstadoFilter] = useState('');
  const [envioFilter, setEnvioFilter] = useState('');
  const [onlyActionableWebPaymentReviews, setOnlyActionableWebPaymentReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoadingMessage, setActionLoadingMessage] = useState('');

  // Carga inicial de clientes
  useEffect(() => {
  const loadClients = async () => {
    try {
      const response = await clientsService.getAll();

      // Extraer el array dependiendo de la estructura
      const clients = response.data || response || [];

      const map = {};
      if (Array.isArray(clients)) {
        clients.forEach(c => {
          map[c.id] = {
            nombre: c.name || c.fullName || 'Sin nombre',
            telefono: c.phone || '',
            email: c.email || '',
            documento: c.document || c.docNumber || c.doc_number || c.documentNumber || '',
          };
        });
      }
      setClientMap(map);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  loadClients();
}, []);

  // Cargar pedidos base. La busqueda se aplica localmente sobre los datos enriquecidos.
  useEffect(() => {
  let active = true;

  const loadOrders = async () => {
    setLoading(true);
    try {
      const rawOrders = await OrdersService.listAll();
      if (active) {
        setOrders(rawOrders);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  };

  loadOrders();

  return () => {
    active = false;
  };
}, []);

  // Enriquecer pedidos con datos completos del cliente y estado de pago real
  const enrichedOrders = useMemo(() => {
    return orders.map(order => {
      const clienteInfo = clientMap[order.clienteId] || {
        nombre: order.clienteNombre || `Cliente ID ${order.clienteId}`,
        telefono: order.clienteTelefono || '',
        email: order.clienteEmail || '',
        documento: order.clienteDocumento || order.customerDocument || '',
      };

      return {
        ...order,
        clienteNombre: clienteInfo.nombre,
        clienteTelefono: clienteInfo.telefono,
        clienteEmail: clienteInfo.email,
        clienteDocumento: clienteInfo.documento,
      };
    });
  }, [orders, clientMap]);

  // Filtrar pedidos (búsqueda + fechas + origen + estado de pago)
  const filteredOrders = useMemo(() => {
    const searchTerm = normalizeSearch(search);

    return enrichedOrders.filter((order) => {
      // Búsqueda de texto
      const matchesSearch = !searchTerm || (() => {
        const searchableFields = [
          order.numeroPedido || String(order.id),
          order.clienteNombre,
          order.clienteTelefono,
          order.clienteEmail,
          order.clienteDocumento,
          order.deliveryRecipientName,
          order.departamentoEntregaNombre,
          order.ciudadEntregaNombre,
          order.direccionEntrega,
          getDeliverySearchText(order),
          requiresShippingAmount(order) ? 'Envío pendiente' : '',
          order.fechaPedido ? new Date(order.fechaPedido).toLocaleDateString('es-CO') : '',
          order.estadoLogistico,
          order.pagoEstado,
          order.total?.toString(),
          `$${order.total?.toLocaleString()}`,
        ];
        return searchableFields.some(
          (field) => field && normalizeSearch(field).includes(searchTerm)
        );
      })();

      // Filtro de fechas (ISO)
      let matchesFecha = true;
      if (fechaInicial || fechaFinal) {
        const fechaOrden = order.fechaPedido ? order.fechaPedido.split('T')[0] : null;
        if (fechaOrden) {
          if (fechaInicial && fechaOrden < fechaInicial) matchesFecha = false;
          if (fechaFinal && fechaOrden > fechaFinal) matchesFecha = false;
        } else {
          matchesFecha = false;
        }
      }

      // Filtro por origen
      const matchesOrigen = !origenFilter || order.origen === origenFilter;

      // Filtro por estado de pago
      const matchesPagoEstado = !pagoEstadoFilter || order.pagoEstado === pagoEstadoFilter;

      const needsShippingAmount = requiresShippingAmount(order);
      const matchesEnvio =
        !envioFilter ||
        (envioFilter === ENVIO_FILTERS.PENDIENTE && needsShippingAmount) ||
        (envioFilter === ENVIO_FILTERS.COMPLETO && !needsShippingAmount);

      const matchesPaymentReviewScope =
        !onlyActionableWebPaymentReviews || (
          isActionableWebOrder(order) && order.paymentReceiptSummary?.hasPendingReceipt
        );

      return matchesSearch && matchesFecha && matchesOrigen && matchesPagoEstado && matchesEnvio && matchesPaymentReviewScope;
    });
  }, [enrichedOrders, search, fechaInicial, fechaFinal, origenFilter, pagoEstadoFilter, envioFilter, onlyActionableWebPaymentReviews]);

  const pendingShippingOrders = useMemo(() => {
    return enrichedOrders.filter(requiresShippingAmount);
  }, [enrichedOrders]);

  const pendingShippingCount = pendingShippingOrders.length;

  const pendingPaymentReview = useMemo(() => {
    const pendingReceiptOrders = enrichedOrders.filter(
      (order) => isActionableWebOrder(order) && order.paymentReceiptSummary?.hasPendingReceipt,
    );

    return {
      total: pendingReceiptOrders.length,
    };
  }, [enrichedOrders]);

  // Paginación
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);
  const hasActiveFilters = Boolean(
    search.trim() ||
    fechaInicial ||
    fechaFinal ||
    origenFilter ||
    pagoEstadoFilter ||
    envioFilter ||
    onlyActionableWebPaymentReviews
  );

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fechaInicial, fechaFinal, origenFilter, pagoEstadoFilter, envioFilter, onlyActionableWebPaymentReviews]);

  // Handlers
  const handleViewDetail = (order) => {
    navigate(`/admin/sales/orders/${order.id}/detail`);
  };

  const handleEdit = (order) => {
    if ([ESTADOS_LOGISTICOS.ENTREGADO, ESTADOS_LOGISTICOS.ANULADO].includes(order.estadoLogistico)) {
      showWarning('Pedido inmutable', 'Los pedidos entregados o anulados no pueden editarse.');
      return;
    }
    setActionLoadingMessage('Cargando edición del pedido...');
    window.setTimeout(() => {
      navigate(`/admin/sales/orders/${order.id}`);
    }, 80);
  };

  const handleCancelOrder = useCallback((order) => {
    if ([ESTADOS_LOGISTICOS.ENTREGADO, ESTADOS_LOGISTICOS.ANULADO].includes(order.estadoLogistico)) {
      showWarning('Pedido inmutable', 'Los pedidos entregados o anulados no pueden anularse.');
      return;
    }
    navigate(`/admin/sales/orders/${order.id}/cancel`);
  }, [navigate, showWarning]);

  const handleShowPendingShipping = useCallback(() => {
    setEnvioFilter(ENVIO_FILTERS.PENDIENTE);
    setCurrentPage(1);
  }, []);

  const handleShowPendingPayments = useCallback(() => {
    setSearch('');
    setFechaInicial('');
    setFechaFinal('');
    setOrigenFilter(ORIGENES.WEB);
    setEnvioFilter('');
    setPagoEstadoFilter('');
    setOnlyActionableWebPaymentReviews(true);
    setCurrentPage(1);
  }, []);

  if (loading && orders.length === 0) {
    return (
      <Spinner
        message="Cargando pedidos..."
        className="min-h-[calc(100dvh-5rem)]"
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-x-hidden overflow-y-auto p-2.5 sm:p-3">
      {actionLoadingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Spinner message={actionLoadingMessage} className="min-h-0" />
        </div>
      )}

      <TopBar
        search={search}
        setSearch={setSearch}
        fechaInicial={fechaInicial}
        setFechaInicial={setFechaInicial}
        fechaFinal={fechaFinal}
        setFechaFinal={setFechaFinal}
        origenFilter={origenFilter}
        setOrigenFilter={setOrigenFilter}
        pagoEstadoFilter={pagoEstadoFilter}
        setPagoEstadoFilter={setPagoEstadoFilter}
        envioFilter={envioFilter}
        setEnvioFilter={setEnvioFilter}
        hasPendingPaymentReviewFilter={onlyActionableWebPaymentReviews}
        clearPendingPaymentReviewFilter={() => setOnlyActionableWebPaymentReviews(false)}
        setCurrentPage={setCurrentPage}
        orders={filteredOrders}
      />

      {pendingShippingCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Pedidos web con envío pendiente</p>
            <p className="text-xs leading-relaxed text-amber-700">
              {pendingShippingCount === 1
                ? 'Hay 1 pedido web a domicilio sin valor de envío registrado.'
                : `Hay ${pendingShippingCount} pedidos web a domicilio sin valor de envío registrado.`}
              {` Revisa el pedido y registra el envío para actualizar el total a pagar.`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleShowPendingShipping}
            className="ml-auto shrink-0 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            Ver pendientes
          </button>
        </div>
      )}

      {pendingPaymentReview.total > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900 shadow-sm">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Pedidos pendientes de revisión de pago</p>
            <p className="text-xs leading-relaxed text-sky-800">
              Hay pedidos de la Web-Tienda que requieren revisión de pago.
            </p>
          </div>
          <button
            type="button"
            onClick={handleShowPendingPayments}
            className="ml-auto shrink-0 rounded-md border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
          >
            Ver pendientes
          </button>
        </div>
      )}

      <div className="w-full min-w-0 shrink-0 overflow-hidden rounded-xl bg-white shadow-md">
        <OrdersTable
          orders={currentOrders}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onCancel={handleCancelOrder}
          search={search}
          offset={startIndex}
          totalOrders={filteredOrders.length}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <div className="min-h-0 flex-1" />

      {filteredOrders.length > 0 && (
        <div className="shrink-0">
          <PaginationAdmin
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalRecords={filteredOrders.length}
            recordsPerPage={RECORDS_PER_PAGE}
          />
        </div>
      )}

    </div>
  );
}

export default OrdersList;
