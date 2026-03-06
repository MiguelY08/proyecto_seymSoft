import React, { useState, useMemo } from 'react';
import TopBar from '../components/TopBar';
import OrdersTable from '../components/OrdersTable';
import DetailOrder from '../components/DetailOrder';
import ordersDB from '../services/ordersDB';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const RECORDS_PER_PAGE = 13; // Cambiado a 13

// ─── Paginador (igual que Products) ───────────────────────────────────────────
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
          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {getVisiblePages().map((page, i) =>
        page === '...' ? (
          <span key={`d-${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
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
          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function Orders() {
  const [orders] = useState(ordersDB);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filtrar pedidos por búsqueda (busca en todas las columnas)
  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    
    const searchLower = search.toLowerCase();
    return orders.filter(order => {
      // Buscar en todas las columnas posibles
      const searchableFields = [
        order.numerosPedido,
        order.cliente.nombre,
        order.cliente.telefono,
        order.cliente.email,
        order.cliente.direccion,
        order.fecha,
        order.estado,
        order.total.toString(),
        `$${order.total.toLocaleString()}`,
      ];
      
      return searchableFields.some(field => 
        field && field.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [orders, search]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredOrders.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Handlers
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`h-full flex flex-col gap-3 p-3 sm:p-4 ${isDetailOpen ? 'blur-sm' : ''}`}>
        
        {/* Barra superior */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">
          {/* Buscador */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-black text-sm"
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            />
          </div>

          {/* TopBar (botón exportar) */}
          <TopBar 
            search={search}
            onSearchChange={handleSearchChange}
            orders={filteredOrders}
          />
        </div>

        {/* Tabla de pedidos */}
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              No hay pedidos que coincidan con "{search}". Intenta con otra búsqueda.
            </p>
            <button
              onClick={() => setSearch('')}
              className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium"
              style={{ backgroundColor: '#004D77' }}
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <>
            <OrdersTable 
              orders={currentOrders}
              onViewDetail={handleViewDetail}
              search={search}
              offset={startIndex}
            />

            {/* Footer: registros + paginador */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                {search.trim() ? (
                  <>
                    <span className="text-[#004D77]">{filteredOrders.length}</span>
                    {' '}resultado{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
                  </>
                ) : (
                  <>
                    Mostrando{' '}
                    <span className="text-[#004D77]">{filteredOrders.length > 0 ? startIndex + 1 : 0}</span>
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
          </>
        )}
      </div>

      {/* Modal de detalle del pedido */}
      <DetailOrder 
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
}

export default Orders;