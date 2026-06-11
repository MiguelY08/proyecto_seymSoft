// src/features/administrtivePanel/sales/pages/Sales.jsx
import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TopBar          from '../components/TopBar';
import SalesMetricsCards from '../components/SalesMetricsCards';
import SalesTable      from '../components/SalesTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import { SalesServices } from '../services/salesServices'; // ✅ importación corregida
import Spinner from '../../../../shared/spinner';
import { filterSales } from '../helpers/salesHelpers';

const RECORDS_PER_PAGE = 13;

const parseSaleDate = (value) => {
  if (!value) return null;
  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const colombianDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (colombianDate) {
    const [, day, month, year] = colombianDate;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
};

const filterSalesByDate = (sales, fechaInicial, fechaFinal) => {
  if (!fechaInicial && !fechaFinal) return sales;

  return sales.filter((sale) => {
    const saleDate = parseSaleDate(sale.fecha ?? sale.saleDate ?? sale.createdAt);
    if (!saleDate) return false;
    if (fechaInicial && saleDate < fechaInicial) return false;
    if (fechaFinal && saleDate > fechaFinal) return false;
    return true;
  });
};

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
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [loading,     setLoading]     = useState(false);
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
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    setFechaInicial('');
    setFechaFinal('');
    setCurrentPage(1);
  };

  // Filtrar datos según la búsqueda
  const filteredBySearch = filterSales(data, search);
  const filtered = filterSalesByDate(filteredBySearch, fechaInicial, fechaFinal);

  const paginatedData = filtered;
  const hasLocalFilters = Boolean(search.trim() || fechaInicial || fechaFinal);
  const totalRecords = hasLocalFilters ? filtered.length : (salesPagination.total || filtered.length);

  if (loading && data.length === 0) {
    return (
      <Spinner message="Cargando ventas..." />
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      {/* Barra superior con búsqueda */}
      <TopBar
        search={search}
        onSearchChange={handleSearchChange}
        activeType={activeType}
        onTypeChange={handleTypeChange}
        fechaInicial={fechaInicial}
        setFechaInicial={setFechaInicial}
        fechaFinal={fechaFinal}
        setFechaFinal={setFechaFinal}
        setCurrentPage={setCurrentPage}
      />

      <SalesMetricsCards metrics={metrics} />

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
