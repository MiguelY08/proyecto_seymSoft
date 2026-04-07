import React, { useState, useMemo, useCallback } from 'react';
import TopBar from '../components/TopBar';
import OrdersTable from '../components/OrdersTable';
import DetailOrder from '../modals/DetailOrder';
import OrderForm from '../modals/OrderForm';
import CancelOrder from '../modals/CancelOrder';
import OrdersService from '../services/ordersService';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

const RECORDS_PER_PAGE = 13;

// ─── Paginador ─────────────────────────────────────────────
/**
 * Componente de paginación reutilizable.
 * Muestra páginas visibles con elipsis para listas largas.
 *
 * @param {Object} props
 * @param {number} props.currentPage - Página actual.
 * @param {number} props.totalPages - Total de páginas.
 * @param {Function} props.onPageChange - Callback para cambiar página.
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  /**
   * Calcula las páginas visibles (con elipsis si es necesario).
   * @returns {Array<number|string>} Lista de páginas a mostrar.
   */
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

// ─── Página principal ───────────────────────────────────────
/**
 * Página principal de gestión de órdenes.
 * Incluye búsqueda, paginación, tabla de órdenes y modales para detalle, edición y cancelación.
 * Maneja el estado de las órdenes y sincroniza con OrdersService.
 */
function Orders() {
  const { showSuccess } = useAlert();
  const [orders, setOrders]           = useState(() => OrdersService.list());
  const [search, setSearch]           = useState('');
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal,   setFechaFinal]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen]   = useState(false);
  const [isEditOpen, setIsEditOpen]       = useState(false);
  const [editingOrder, setEditingOrder]   = useState(null);
  const [cancelando, setCancelando]       = useState(null);

  // ─── Filtrar pedidos ──────────────────────────────────────
  /**
   * Filtra las órdenes basado en el término de búsqueda.
   * Busca en campos como número de pedido, cliente, dirección, fecha, estado y total.
   */
  const filteredOrders = useMemo(() => {
    const searchLower = search.toLowerCase();

    return orders.filter((order) => {
      // ── Búsqueda de texto ───────────────────────────────────────────────────
      const matchesSearch = !search.trim() || (() => {
        const searchableFields = [
          order.numerosPedido,
          order.cliente.nombre,
          order.cliente.telefono,
          order.cliente.email,
          order.cliente.direccion,
          order.direccionEntrega,
          order.fecha,
          order.estado,
          order.total?.toString(),
          `$${order.total?.toLocaleString()}`,
        ];
        return searchableFields.some(
          (field) => field && field.toString().toLowerCase().includes(searchLower)
        );
      })();

      // ── Filtro de fechas ────────────────────────────────────────────────────
      // Las fechas de los pedidos están en formato DD/MM/YYYY
      // Los inputs devuelven YYYY-MM-DD → convertimos para comparar
      let matchesFecha = true;
      if (fechaInicial || fechaFinal) {
        // Convertir "DD/MM/YYYY" → "YYYY-MM-DD"
        const partes    = (order.fecha ?? '').split('/');
        const fechaOrden = partes.length === 3
          ? `${partes[2]}-${partes[1]}-${partes[0]}`
          : null;

        if (fechaOrden) {
          if (fechaInicial && fechaOrden < fechaInicial) matchesFecha = false;
          if (fechaFinal   && fechaOrden > fechaFinal)   matchesFecha = false;
        }
      }

      return matchesSearch && matchesFecha;
    });
  }, [orders, search, fechaInicial, fechaFinal]);

  // ─── Paginación ───────────────────────────────────────────
  const totalPages   = Math.ceil(filteredOrders.length / RECORDS_PER_PAGE);
  const startIndex   = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex     = startIndex + RECORDS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // ─── Handlers ─────────────────────────────────────────────
  /**
   * Maneja el cambio en el campo de búsqueda y resetea la página a 1.
   * @param {string} value - Nuevo valor de búsqueda.
   */
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  /**
   * Abre el modal de detalle para una orden específica.
   * @param {Object} order - Orden a mostrar.
   */
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  /**
   * Cierra el modal de detalle.
   */
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };

  /**
   * Abre el modal de edición para una orden.
   * @param {Object} order - Orden a editar.
   */
  const handleEdit = (order) => {
    setEditingOrder(order);
    setIsEditOpen(true);
  };

  /**
   * Cambia el estado de una orden usando OrdersService.
   * Actualiza el estado local y el seleccionado si es necesario.
   * @param {Object} order - Orden a cambiar.
   * @param {string} nuevoEstado - Nuevo estado.
   */
  const handleEstadoChange = (order, nuevoEstado) => {
    const updated = OrdersService.updateEstado(order.id, nuevoEstado);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
    }
  };

  /**
   * Cierra el modal de edición.
   */
  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingOrder(null);
  };

  /**
   * Guarda la orden editada y actualiza el estado local.
   * @param {Object} updatedOrder - Orden actualizada.
   */
  const handleSaveEdit = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    if (selectedOrder?.id === updatedOrder.id) setSelectedOrder(updatedOrder);
    handleCloseEdit();
  };

  /**
   * Abre el modal de cancelación para una orden.
   * @param {Object} order - Orden a cancelar.
   */
  const handleCancelOrder = useCallback((order) => {
    setCancelando(order);
  }, []);

  /**
   * Confirma la cancelación de la orden con motivo.
   * Actualiza el estado y cierra modales si es necesario.
   * @param {string} motivo - Motivo de cancelación.
   */
  const confirmCancel = useCallback((motivo) => {
    if (!cancelando) return;
    const updated = OrdersService.updateEstado(cancelando.id, 'Cancelado', motivo);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      if (isDetailOpen) setIsDetailOpen(false);
    }
    setCancelando(null);
  }, [cancelando, selectedOrder, isDetailOpen]);

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

        {/* ── Barra superior ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">
          <div className="relative flex-1 sm:flex-none sm:w-72 md:w-96">
            <input
              type="text"
              placeholder="Buscar por pedido, cliente, estado..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300
                         focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                         outline-none bg-white text-gray-700 placeholder-gray-400"
            />
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              strokeWidth={2}
            />
          </div>
          <TopBar
            orders={filteredOrders}
            search={search}
            onSearchChange={handleSearchChange}
            fechaInicial={fechaInicial}
            setFechaInicial={(val) => { setFechaInicial(val); setCurrentPage(1); }}
            fechaFinal={fechaFinal}
            setFechaFinal={(val) => { setFechaFinal(val); setCurrentPage(1); }}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* ── Tabla ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-md">
          <OrdersTable
            orders={currentOrders}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onCancel={handleCancelOrder}
            search={search}
            offset={startIndex}
            totalOrders={orders.length}
          />
        </div>

        {/* ── Paginador ──────────────────────────────────────────────── */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-700">
              {search.trim() || fechaInicial || fechaFinal ? (
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

      </div>

      {/* Modal — Detalle */}
      <DetailOrder
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onCancel={handleCancelOrder}
        onEstadoChange={handleEstadoChange}
      />

      {/* Modal — Edición */}
      {isEditOpen && editingOrder && (
        <OrderForm
          order={editingOrder}
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}

      {/* Modal — Cancelación */}
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

export default Orders;