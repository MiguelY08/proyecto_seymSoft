// src/features/orders/pages/OrdersList.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import OrdersTable from '../components/OrdersTable';
import DetailOrder from '../modals/DetailOrder';
import CancelOrder from '../modals/CancelOrder';
import OrdersService, { ESTADOS_LOGISTICOS } from '../services/ordersService';
import { clientsService } from '../../clients/services/clientsService';
import { useAlert } from '../../../../shared/alerts/useAlert';
import Spinner from '../../../../shared/spinner';
import PaginationAdmin from '../../../../shared/PaginationAdmin';

const RECORDS_PER_PAGE = 11;

// ─── Componente principal de lista de pedidos ─────────────────────────────────
function OrdersList() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  // Estados
  const [orders, setOrders] = useState([]);
  const [clientMap, setClientMap] = useState({});
  const [search, setSearch] = useState('');
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [origenFilter, setOrigenFilter] = useState('');
  const [pagoEstadoFilter, setPagoEstadoFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [cancelando, setCancelando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingMessage, setActionLoadingMessage] = useState('');

  // Carga inicial de pedidos y clientes
  useEffect(() => {
  const loadOrders = async () => {
    setLoading(true);
    try {
      // Cargar pedidos
      const rawOrders = await OrdersService.list();
      setOrders(rawOrders);

      // Cargar clientes
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
          };
        });
      }
      setClientMap(map);
    } catch (error) {
      console.error('Error al cargar pedidos y clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  loadOrders();
}, []);

  // Enriquecer pedidos con datos completos del cliente y estado de pago real
  const enrichedOrders = useMemo(() => {
    return orders.map(order => {
      const clienteInfo = clientMap[order.clienteId] || {
        nombre: order.clienteNombre || `Cliente ID ${order.clienteId}`,
        telefono: order.clienteTelefono || '',
        email: order.clienteEmail || '',
      };

      return {
        ...order,
        clienteNombre: clienteInfo.nombre,
        clienteTelefono: clienteInfo.telefono,
        clienteEmail: clienteInfo.email,
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

      return matchesSearch && matchesFecha && matchesOrigen && matchesPagoEstado;
    });
  }, [enrichedOrders, search, fechaInicial, fechaFinal, origenFilter, pagoEstadoFilter]);

  // Paginación
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fechaInicial, fechaFinal, origenFilter, pagoEstadoFilter]);

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

  const handleEdit = (order) => {
    setActionLoadingMessage('Cargando edicion del pedido...');
    window.setTimeout(() => {
      navigate(`/admin/sales/orders/${order.id}`);
    }, 80);
  };

  const handleEstadoLogisticoChange = async (orderId, nuevoEstado, motivo = null) => {
    const updated = await OrdersService.updateEstadoLogistico(orderId, nuevoEstado, motivo);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      showSuccess('Estado actualizado', `El pedido #${updated.numeroPedido} ahora está ${updated.estadoLogistico}.`);
    }
  };

  const handleCancelOrder = useCallback((order) => {
    setCancelando(order);
  }, []);

  const confirmCancel = useCallback(async (motivo) => {
    if (!cancelando) return;
    const updated = await OrdersService.updateEstadoLogistico(cancelando.id, ESTADOS_LOGISTICOS.CANCELADO, motivo);
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
        setCurrentPage={setCurrentPage}
        orders={filteredOrders}
      />

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
