// src/features/orders/pages/OrdersList.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import TopBar from '../components/TopBar';
import OrdersTable from '../components/OrdersTable';
import DetailOrder from '../modals/DetailOrder';
import CancelOrder from '../modals/CancelOrder';
import OrdersService, { ESTADOS_LOGISTICOS, ORIGENES } from '../services/ordersService';
import { clientsService } from '../../clients/services/clientsService';
import { useAlert } from '../../../../shared/alerts/useAlert';
import Spinner from '../../../../shared/spinner';
import PaginationAdmin from '../../../../shared/PaginationAdmin';

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

// ─── Componente principal de lista de pedidos ─────────────────────────────────
function OrdersList() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useAlert();

  // Estados
  const [orders, setOrders] = useState([]);
  const [clientMap, setClientMap] = useState({});
  const [search, setSearch] = useState('');
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [origenFilter, setOrigenFilter] = useState('');
  const [pagoEstadoFilter, setPagoEstadoFilter] = useState('');
  const [envioFilter, setEnvioFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [cancelando, setCancelando] = useState(null);
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

  // Cargar pedidos y enviar la busqueda al backend cuando aplique
  useEffect(() => {
  const loadOrders = async () => {
    setLoading(true);
    try {
      const searchTerm = search.trim();
      const rawOrders = await OrdersService.list(
        searchTerm ? { search: searchTerm } : {}
      );
      setOrders(rawOrders);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeoutId = window.setTimeout(loadOrders, 300);

  return () => window.clearTimeout(timeoutId);
}, [search]);

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
    const searchLower = search.toLowerCase();

    return enrichedOrders.filter((order) => {
      // Búsqueda de texto
      const matchesSearch = !search.trim() || (() => {
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
          order.fechaPedido ? new Date(order.fechaPedido).toLocaleDateString('es-CO') : '',
          order.estadoLogistico,
          order.pagoEstado,
          order.total?.toString(),
          `$${order.total?.toLocaleString()}`,
        ];
        return searchableFields.some(
          (field) => field && field.toString().toLowerCase().includes(searchLower)
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

      return matchesSearch && matchesFecha && matchesOrigen && matchesPagoEstado && matchesEnvio;
    });
  }, [enrichedOrders, search, fechaInicial, fechaFinal, origenFilter, pagoEstadoFilter, envioFilter]);

  const pendingShippingOrders = useMemo(() => {
    return enrichedOrders.filter(requiresShippingAmount);
  }, [enrichedOrders]);

  const pendingShippingCount = pendingShippingOrders.length;

  // Paginación
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fechaInicial, fechaFinal, origenFilter, pagoEstadoFilter, envioFilter]);

  // Handlers
  const handleViewDetail = async (order) => {
    setActionLoadingMessage('Cargando detalles del pedido...');
    try {
      const freshOrder = await OrdersService.findById(order.id);
      if (freshOrder) {
        setOrders(prev => prev.map(item => item.id === freshOrder.id ? freshOrder : item));
      }
      setSelectedOrder(freshOrder || order);
      setIsDetailOpen(true);
    } catch (error) {
      showError('Error', error.response?.data?.message || error.message || 'No se pudo cargar el pedido.');
      setSelectedOrder(order);
      setIsDetailOpen(true);
    } finally {
      setActionLoadingMessage('');
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderRefresh = useCallback((updatedOrder) => {
    if (!updatedOrder?.id) return;

    setOrders(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    setSelectedOrder(updatedOrder);
  }, []);

  const handleEdit = (order) => {
    if ([ESTADOS_LOGISTICOS.ENTREGADO, ESTADOS_LOGISTICOS.CANCELADO].includes(order.estadoLogistico)) {
      showWarning('Pedido inmutable', 'Los pedidos entregados o cancelados no pueden editarse.');
      return;
    }
    setActionLoadingMessage('Cargando edicion del pedido...');
    window.setTimeout(() => {
      navigate(`/admin/sales/orders/${order.id}`);
    }, 80);
  };

  const handleEstadoLogisticoChange = async (orderId, nuevoEstado, motivo = null) => {
    const current = orders.find((order) => Number(order.id) === Number(orderId));
    if ([ESTADOS_LOGISTICOS.ENTREGADO, ESTADOS_LOGISTICOS.CANCELADO].includes(current?.estadoLogistico)) {
      showWarning('Pedido inmutable', 'Los pedidos entregados o cancelados no pueden cambiar de estado.');
      return;
    }
    if (nuevoEstado === ESTADOS_LOGISTICOS.CANCELADO) {
      showWarning('Usa el flujo de cancelacion', 'Para cancelar un pedido debes indicar el motivo desde la accion Cancelar.');
      return;
    }
    const updated = await OrdersService.updateEstadoLogistico(orderId, nuevoEstado, motivo);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      showSuccess('Estado actualizado', `El pedido #${updated.numeroPedido} ahora está ${updated.estadoLogistico}.`);
    }
  };

  const handleCancelOrder = useCallback((order) => {
    if ([ESTADOS_LOGISTICOS.ENTREGADO, ESTADOS_LOGISTICOS.CANCELADO].includes(order.estadoLogistico)) {
      showWarning('Pedido inmutable', 'Los pedidos entregados o cancelados no pueden cancelarse.');
      return;
    }
    setCancelando(order);
  }, [showWarning]);

  const handleShowPendingShipping = useCallback(() => {
    setEnvioFilter(ENVIO_FILTERS.PENDIENTE);
    setCurrentPage(1);
  }, []);

  const confirmCancel = useCallback(async (motivo) => {
    if (!cancelando) return;
    const updated = await OrdersService.cancel(cancelando.id, motivo);
    if (updated) {
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      if (isDetailOpen) setIsDetailOpen(false);
      showSuccess('Pedido cancelado', `El pedido #${updated.numeroPedido} ha sido cancelado.`);
    }
    setCancelando(null);
  }, [cancelando, selectedOrder, isDetailOpen, showSuccess]);

  if (loading && orders.length === 0) {
    return (
      <Spinner message="Cargando pedidos..." />
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
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
        setCurrentPage={setCurrentPage}
        orders={filteredOrders}
      />

      {pendingShippingCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Pedidos web con envio pendiente</p>
            <p className="text-xs leading-relaxed text-amber-700">
              {pendingShippingCount === 1
                ? 'Hay 1 pedido web a domicilio sin valor de envio registrado.'
                : `Hay ${pendingShippingCount} pedidos web a domicilio sin valor de envio registrado.`}
              {` Revisa el pedido y registra el envio para actualizar el total a pagar.`}
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

      <div className="bg-white rounded-xl shadow-md">
        <OrdersTable
          orders={currentOrders}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onCancel={handleCancelOrder}
          search={search}
          offset={startIndex}
          totalOrders={filteredOrders.length}
        />
      </div>

      {filteredOrders.length > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={filteredOrders.length}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      {/* Modales (detalle y cancelación) */}
      <DetailOrder
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onCancel={handleCancelOrder}
        onEstadoChange={(order, nuevoEstado) => handleEstadoLogisticoChange(order.id, nuevoEstado)}
        onOrderRefresh={handleOrderRefresh}
      />

      {cancelando && (
        <CancelOrder
          order={cancelando}
          onClose={() => setCancelando(null)}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  );
}

export default OrdersList;
