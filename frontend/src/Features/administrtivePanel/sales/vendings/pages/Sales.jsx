// src/features/administrtivePanel/sales/pages/Sales.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TopBar          from '../components/TopBar';
import SalesMetricsCards from '../components/SalesMetricsCards';
import SalesTable      from '../components/SalesTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import { SalesServices } from '../services/salesServices'; // ✅ importación corregida
import { filterSales } from '../helpers/salesHelpers';
import Spinner from '../../../../shared/spinner';
const RECORDS_PER_PAGE = 13;
const SALES_FETCH_LIMIT = 100;

const getSalesServiceByType = (type) => {
  const servicesByType = {
    all: (params) => SalesServices.getAll(params),
    manual: (params) => SalesServices.getManual(params),
    direct: (params) => SalesServices.getDirect(params),
    web: (params) => SalesServices.getWeb(params),
  };

  return servicesByType[type] ?? servicesByType.all;
};

const getSaleDateValue = (sale = {}) => {
  const rawDate =
    sale.saleDate ??
    sale.fechaPago ??
    sale.createdAt ??
    sale.creationDate ??
    sale.date ??
    '';

  if (rawDate) {
    const parsedDate = new Date(rawDate);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  }

  const [day, month, year] = String(sale.fecha ?? '').split('/');
  if (day && month && year) {
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
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
  const [sales,       setSales]       = useState([]);
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeType,  setActiveType]  = useState('all');
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [loading,     setLoading]     = useState(false);
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

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const service = getSalesServiceByType(activeType);
      const searchTerm = search.trim();
      const getParams = (page) => ({
        page,
        limit: SALES_FETCH_LIMIT,
        ...(searchTerm ? { search: searchTerm } : {}),
      });
      const firstPage = await service(getParams(1));
      const allSales = [...(firstPage.sales ?? [])];
      const totalPages = firstPage.pagination?.totalPages ?? 1;

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await service(getParams(page));
        allSales.push(...(response.sales ?? []));
      }

      setSales(allSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [activeType, search]);

  // Recargar datos al volver del formulario, cambiar ruta o cambiar seccion
  useEffect(() => {
    const debounceMs = search.trim() ? 300 : 0;
    const timeoutId = window.setTimeout(fetchSales, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [fetchSales, location.pathname]);

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

  const filteredSales = useMemo(() => {
    const salesBySearch = filterSales(sales, search);

    return salesBySearch.filter((sale) => {
      if (!fechaInicial && !fechaFinal) return true;

      const saleDate = getSaleDateValue(sale);
      if (!saleDate) return false;
      if (fechaInicial && saleDate < fechaInicial) return false;
      if (fechaFinal && saleDate > fechaFinal) return false;

      return true;
    });
  }, [sales, search, fechaInicial, fechaFinal]);

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const visibleSales = filteredSales.slice(startIndex, endIndex);
  const totalRecords = filteredSales.length;
  const hasActiveFilters = Boolean(
    search.trim() ||
    fechaInicial ||
    fechaFinal ||
    activeType !== 'all'
  );

  if (loading && sales.length === 0) {
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
        salesToExport={filteredSales}
      />

      <div className="hidden md:block">
        <SalesMetricsCards metrics={metrics} />
      </div>

      {/* Tabla de ventas */}
      <div className="w-full min-w-0 overflow-hidden rounded-xl bg-white shadow-md">
        <SalesTable
          data={visibleSales}
          search={search}
          totalData={totalRecords}
          hasActiveFilters={hasActiveFilters}
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
