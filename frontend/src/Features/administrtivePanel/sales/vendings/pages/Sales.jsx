// src/features/administrtivePanel/sales/pages/Sales.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TopBar          from '../components/TopBar';
import SalesMetricsCards from '../components/SalesMetricsCards';
import SalesTable      from '../components/SalesTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import { SalesServices } from '../services/salesServices'; // ✅ importación corregida
import { getAvailableInvoices, getReturns } from '../../returns/data/returnsService';
import { filterSales } from '../helpers/salesHelpers';
import Spinner from '../../../../shared/spinner';
const RECORDS_PER_PAGE = 11;
const SALES_FETCH_LIMIT = 100;
const RETURNS_FETCH_LIMIT = 100;

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

const getSaleReturnSaleId = (saleReturn = {}) =>
  saleReturn.idSale ??
  saleReturn.id_sale ??
  saleReturn.saleId ??
  saleReturn.idVending ??
  saleReturn.id_vending ??
  saleReturn.sale?.idSale ??
  saleReturn.sale?.id ??
  saleReturn.vending?.idSale ??
  saleReturn.vending?.id ??
  null;

const getSaleReturnNumber = (saleReturn = {}) =>
  saleReturn.returnNumber ||
  saleReturn.numeroDevolucion ||
  saleReturn.code ||
  (saleReturn.id ? `DEV-${saleReturn.id}` : '');

const buildSalesReturnIndex = (saleReturns = []) => {
  const index = new Map();

  saleReturns.forEach((saleReturn) => {
    const saleId = getSaleReturnSaleId(saleReturn);
    if (!saleId) return;

    index.set(String(saleId), {
      id: saleReturn.id || saleReturn.id_sales_return,
      returnNumber: getSaleReturnNumber(saleReturn),
      status: saleReturn.status || saleReturn.estado || '',
    });
  });

  return index;
};

const fetchSalesReturnIndex = async () => {
  const firstPage = await getReturns({ page: 1, limit: RETURNS_FETCH_LIMIT });
  const allReturns = [...(firstPage?.data ?? [])];
  const totalPages = firstPage?.pagination?.totalPages ?? 1;

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await getReturns({ page, limit: RETURNS_FETCH_LIMIT });
    allReturns.push(...(response?.data ?? []));
  }

  return buildSalesReturnIndex(allReturns);
};

const buildSalesReturnAvailabilityIndex = (invoices = []) => {
  const index = new Map();

  invoices.forEach((invoice) => {
    const saleId = invoice?.idSale ?? invoice?.id_sale ?? invoice?.id ?? invoice?.invoiceNumber;
    if (!saleId) return;

    index.set(String(saleId), {
      hasReturn: Boolean(invoice.hasReturn),
      returnNumber: invoice.returnNumber || invoice.numeroDevolucion || '',
      canReturn: invoice.canReturn === true,
      returnBlockReason: invoice.returnBlockReason || '',
      deliveredAt: invoice.deliveredAt || null,
      daysSinceDelivery: invoice.daysSinceDelivery ?? null,
      remainingReturnDays: invoice.remainingReturnDays ?? null,
      isAnnulled: Boolean(invoice.isAnnulled),
    });
  });

  return index;
};

const fetchSalesReturnAvailabilityIndex = async () => {
  const invoices = await getAvailableInvoices('');
  return buildSalesReturnAvailabilityIndex(Array.isArray(invoices) ? invoices : []);
};

const attachReturnInfoToSale = (sale, returnsBySaleId, returnAvailabilityBySaleId) => {
  const saleId = sale?.idSale ?? sale?.idVending ?? sale?.id_vending ?? sale?.id;
  const associatedReturn = saleId ? returnsBySaleId.get(String(saleId)) : null;
  const availability = saleId ? returnAvailabilityBySaleId.get(String(saleId)) : null;
  const hasSaleReturn = Boolean(
    associatedReturn ||
    availability?.hasReturn ||
    sale?.hasSaleReturn ||
    sale?.hasReturn
  );

  return {
    ...sale,
    hasSaleReturn,
    saleReturnId: associatedReturn?.id ?? sale?.saleReturnId,
    saleReturnNumber:
      associatedReturn?.returnNumber ||
      availability?.returnNumber ||
      sale?.saleReturnNumber ||
      sale?.returnNumber ||
      '',
    saleReturnStatus: associatedReturn?.status ?? sale?.saleReturnStatus,
    canCreateSaleReturn: availability?.canReturn,
    saleReturnBlockReason: availability?.returnBlockReason || '',
    saleReturnDeliveredAt: availability?.deliveredAt || null,
    saleReturnDaysSinceDelivery: availability?.daysSinceDelivery ?? null,
    saleReturnRemainingDays: availability?.remainingReturnDays ?? null,
    saleReturnIsAnnulled: availability?.isAnnulled ?? false,
  };
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
      const getParams = (page) => ({
        page,
        limit: SALES_FETCH_LIMIT,
      });
      const [firstPage, returnsBySaleId, returnAvailabilityBySaleId] = await Promise.all([
        service(getParams(1)),
        fetchSalesReturnIndex().catch(() => new Map()),
        fetchSalesReturnAvailabilityIndex().catch(() => new Map()),
      ]);
      const allSales = [...(firstPage.sales ?? [])];
      const totalPages = firstPage.pagination?.totalPages ?? 1;

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await service(getParams(page));
        allSales.push(...(response.sales ?? []));
      }

      setSales(allSales.map((sale) => attachReturnInfoToSale(sale, returnsBySaleId, returnAvailabilityBySaleId)));
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  // Recargar datos al volver del formulario, cambiar ruta o cambiar seccion.
  // La busqueda se aplica localmente para evitar doble filtrado backend/frontend.
  useEffect(() => {
    fetchSales();
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
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-x-hidden overflow-y-auto p-3 sm:p-4">

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
      <div className="w-full min-w-0 shrink-0 overflow-hidden rounded-xl bg-white shadow-md">
        <SalesTable
          data={visibleSales}
          search={search}
          totalData={totalRecords}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <div className="min-h-0 flex-1" />

      {/* Paginador, solo si hay datos filtrados */}
      {totalRecords > 0 && (
        <div className="shrink-0">
          <PaginationAdmin
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalRecords={totalRecords}
            recordsPerPage={RECORDS_PER_PAGE}
          />
        </div>
      )}

      {/* Outlet para rutas anidadas como modales */}
      <Outlet />
    </div>
  );
}

export default Sales;
