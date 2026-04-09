// src/features/administrtivePanel/sales/pages/Sales.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TopBar          from '../components/TopBar';
import SalesTable      from '../components/SalesTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import { SalesServices } from '../services/salesServices'; // ✅ importación corregida
import { filterSales } from '../helpers/salesHelpers';

const RECORDS_PER_PAGE = 13;

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
  const [data,        setData]        = useState(() => SalesServices.list());
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Recargar datos al volver del formulario o al cambiar la ruta
  useEffect(() => {
    setData(SalesServices.list());
  }, [location.pathname]);

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

  // Filtrar datos según la búsqueda
  const filtered = filterSales(data, search);

  // Paginar los datos filtrados
  const paginatedData = filtered.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      {/* Barra superior con búsqueda */}
      <TopBar
        search={search}
        onSearchChange={handleSearchChange}
      />

      {/* Tabla de ventas */}
      <div className="bg-white rounded-xl shadow-md">
        <SalesTable
          data={paginatedData}
          search={search}
          totalData={data.length}
        />
      </div>

      {/* Paginador, solo si hay datos filtrados */}
      {filtered.length > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={filtered.length}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      {/* Outlet para rutas anidadas como modales */}
      <Outlet />
    </div>
  );
}

export default Sales;