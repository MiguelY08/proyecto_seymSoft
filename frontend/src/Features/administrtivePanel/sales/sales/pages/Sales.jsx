// src/features/administrtivePanel/sales/pages/Sales.jsx
import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TopBar          from '../components/TopBar';
import SalesMetricsCards from '../components/SalesMetricsCards';
import SalesTable      from '../components/SalesTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import { SalesServices } from '../services/salesServices'; // ✅ importación corregida
import { filterSales } from '../helpers/salesHelpers';

const RECORDS_PER_PAGE = 13;
const SALES_TYPE_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'direct', label: 'Directa' },
  { value: 'web', label: 'Web' },
  { value: 'manual', label: 'Manual' },
];

/**
 * Componente principal para la gestión de ventas.
 * Muestra una lista de ventas con opciones de búsqueda, tabla paginada y navegación a formularios.
 * Recarga los datos al volver de otras rutas.
 *
 * @component
 * @returns {JSX.Element} La interfaz de gestión de ventas.
 */
function Sales() {
  const location                     = useLocation();
  const [data,        setData]        = useState([]);
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeType,  setActiveType]  = useState('all');
  const [salesPagination, setSalesPagination] = useState({
    page: 1,
    limit: RECORDS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [metrics,     setMetrics]     = useState({
    totalSales: 0,
    byType: [],
    byStatus: [],
  });

  const fetchMetrics = useCallback(async () => {
    try {
      const result = await SalesServices.getMetrics();
      setMetrics({
        totalSales: result?.totalSales ?? 0,
        byType: result?.byType ?? [],
        byStatus: result?.byStatus ?? [],
      });
    } catch (error) {
      console.error('Error fetching sales metrics:', error);
    }
  }, []);

  const fetchSales = useCallback(async (page = 1) => {
    try {
      if (activeType === 'all') {
        const result = await SalesServices.getAll({
          page,
          limit: RECORDS_PER_PAGE,
        });
        setData(result.sales);
        setSalesPagination(result.pagination);
        return;
      }

      if (activeType === 'manual') {
        const result = await SalesServices.getManual({
          page,
          limit: RECORDS_PER_PAGE,
        });
        setData(result.sales);
        setSalesPagination(result.pagination);
        return;
      }

      if (activeType === 'direct') {
        const result = await SalesServices.getDirect({
          page,
          limit: RECORDS_PER_PAGE,
        });
        setData(result.sales);
        setSalesPagination(result.pagination);
        return;
      }

      if (activeType === 'web') {
        const result = await SalesServices.getWeb({
          page,
          limit: RECORDS_PER_PAGE,
        });
        setData(result.sales);
        setSalesPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      setData([]);
      setSalesPagination({
        page: 1,
        limit: RECORDS_PER_PAGE,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    }
  }, [activeType]);

  // Recargar datos al volver del formulario, cambiar ruta o cambiar seccion
  useEffect(() => {
    fetchSales(currentPage);
  }, [fetchSales, currentPage, location.pathname]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics, location.pathname]);

  /**
   * Maneja el cambio en el campo de búsqueda.
   * Actualiza el estado de búsqueda y resetea la página actual a 1.
   *
   * @param {string} value - El nuevo valor de búsqueda.
   */
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setSearch('');
    setCurrentPage(1);
  };

  // Filtrar datos según la búsqueda
  const filtered = filterSales(data, search);

  const paginatedData = filtered;
  const totalRecords = salesPagination.total || filtered.length;

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      {/* Barra superior con búsqueda */}
      <TopBar
        search={search}
        onSearchChange={handleSearchChange}
      />

      <SalesMetricsCards metrics={metrics} />

      <div className="flex flex-wrap gap-2">
        {SALES_TYPE_OPTIONS.map((option) => {
          const isActive = activeType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTypeChange(option.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                isActive
                  ? 'bg-[#004D77] text-white border-[#004D77]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#004D77] hover:text-[#004D77]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-xl shadow-md">
        <SalesTable
          data={paginatedData}
          search={search}
          totalData={totalRecords}
        />
      </div>

      {/* Paginador, solo si hay datos filtrados */}
      {totalRecords > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={totalRecords}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      {/* Outlet para rutas anidadas como modales */}
      <Outlet />
    </div>
  );
}

export default Sales;
