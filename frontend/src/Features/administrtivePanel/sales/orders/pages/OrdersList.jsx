// src/features/orders/pages/OrdersList.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import OrdersTable from '../components/OrdersTable';
import DetailOrder from '../modals/DetailOrder';
import CancelOrder from '../modals/CancelOrder';
import OrdersService, { PaymentService, ESTADOS_LOGISTICOS } from '../services/ordersService';
import { clientsService } from '../../clients/services/clientsService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

const RECORDS_PER_PAGE = 13;

// ─── Paginador (sin cambios) ─────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {getVisiblePages().map((page, i) =>
        page === '...' ? (
          <span key={i} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 ${
              currentPage === page
                ? 'bg-[#004D77] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#004D77]/10 hover:text-[#004D77]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Componente principal de lista de pedidos ─────────────────────────────────
function OrdersList() {
  const navigate = useNavigate();
  const { showSuccess } = useAlert();

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

  // Carga inicial de pedidos y clientes
  useEffect(() => {
    const loadOrders = () => {
      const rawOrders = OrdersService.list();
      setOrders(rawOrders);

      const clients = clientsService.getAll();
      const map = {};
      clients.forEach(c => {
        map[c.id] = {
          nombre: c.name || c.fullName || 'Sin nombre',
          telefono: c.phone || '',
          email: c.email || '',
        };
      });
      setClientMap(map);
    };

    loadOrders();
  }, []);

  // Enriquecer pedidos con datos completos del cliente y estado de pago real
  const enrichedOrders = useMemo(() => {
    return orders.map(order => {
      const clienteInfo = clientMap[order.clienteId] || {
        nombre: `Cliente ID ${order.clienteId}`,
        telefono: '',
        email: '',
      };

      // Calcular pagoEstado real desde los pagos
      const totalPagado = PaymentService.getTotalPagado(order.id);
      const pagoEstadoCalculado = totalPagado >= order.total ? 'pagado' : 'pendiente';

      return {
        ...order,
        clienteNombre: clienteInfo.nombre,
        clienteTelefono: clienteInfo.telefono,
        clienteEmail: clienteInfo.email,
        pagoEstado: pagoEstadoCalculado,
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
  const totalPages = Math.ceil(filteredOrders.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fechaInicial, fechaFinal, origenFilter, pagoEstadoFilter]);

  // Handlers
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleEdit = (order) => {
    navigate(`/admin/sales/orders/${order.id}`);
  };

  const handleEstadoLogisticoChange = (orderId, nuevoEstado, motivo = null) => {
    const updated = OrdersService.updateEstadoLogistico(orderId, nuevoEstado, motivo);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      showSuccess('Estado actualizado', `El pedido #${updated.numeroPedido} ahora está ${updated.estadoLogistico}.`);
    }
  };

  const handleCancelOrder = useCallback((order) => {
    setCancelando(order);
  }, []);

  const confirmCancel = useCallback((motivo) => {
    if (!cancelando) return;
    const updated = OrdersService.updateEstadoLogistico(cancelando.id, ESTADOS_LOGISTICOS.CANCELADO, motivo);
    if (updated) {
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      if (isDetailOpen) setIsDetailOpen(false);
      showSuccess('Pedido cancelado', `El pedido #${updated.numeroPedido} ha sido cancelado.`);
    }
    setCancelando(null);
  }, [cancelando, selectedOrder, isDetailOpen, showSuccess]);

  return (
    <>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            {search.trim() || fechaInicial || fechaFinal || origenFilter || pagoEstadoFilter ? (
              <>
                <span className="text-[#004D77]">{filteredOrders.length}</span>
                {' '}resultado{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                Mostrando{' '}
                <span className="text-[#004D77]">{startIndex + 1}</span>
                {' '}a{' '}
                <span className="text-[#004D77]">{Math.min(endIndex, filteredOrders.length)}</span>
                {' '}de{' '}
                <span className="text-[#004D77]">{filteredOrders.length}</span>
                {' '}pedidos
              </>
            )}
          </p>
          {totalPages > 1 && (
            <div className="bg-white shadow-md rounded-xl px-3 py-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
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
    </>
  );
}

export default OrdersList;