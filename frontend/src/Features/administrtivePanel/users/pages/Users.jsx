import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Importaciones de componentes y servicios locales
import TopBar          from '../components/TopBar';
import UsersTable      from '../components/UsersTable';
import PaginationAdmin from '../../../shared/PaginationAdmin';
import { UsersDB }     from '../services/usersDB';
import { filterUsers } from '../helpers/usersHelpers';

// Constante para definir el número de registros por página
const RECORDS_PER_PAGE = 13;

// ─── Componente principal Users ────────────────────────────────────────────────────────────────────
/**
 * Componente que gestiona la vista de usuarios en el panel administrativo.
 * Permite listar, buscar, paginar, activar/desactivar y eliminar usuarios.
 */
function Users() {
  // Hook para obtener la ubicación actual de la ruta
  const location                     = useLocation();

  // Estado para almacenar la lista de usuarios
  const [data,        setData]        = useState(() => UsersDB.list());

  // Estado para el término de búsqueda
  const [search,      setSearch]      = useState('');

  // Estado para la página actual en la paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Efecto para recargar la lista de usuarios al volver de formularios de creación/edición
  useEffect(() => {
    setData(UsersDB.list());
  }, [location.pathname]);

  // ─── Funciones de manejo de acciones ──────────────────────────────────────────────────────────────

  /**
   * Maneja el cambio de estado activo/inactivo de un usuario.
   * @param {number} id - ID del usuario a alternar.
   */
  const handleToggle = (id) => {
    const updated = UsersDB.toggle(id);
    setData(updated);
  };

  /**
   * Maneja la eliminación de un usuario.
   * @param {object} row - Objeto del usuario a eliminar.
   */
  const handleDelete = (row) => {
    const updated = UsersDB.delete(row.id);
    setData(updated);
  };

  /**
   * Maneja el cambio en el campo de búsqueda y resetea la página a 1.
   * @param {string} value - Nuevo valor de búsqueda.
   */
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // ─── Filtro y paginación ───────────────────────────────────────────────────

  // Filtrar usuarios según el término de búsqueda
  const filtered      = filterUsers(data, search);

  // Obtener los datos paginados para la página actual
  const paginatedData = filtered.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      {/* Barra superior con búsqueda y acciones */}
      <TopBar
        search={search}
        onSearchChange={handleSearchChange}
        users={data}
      />

      {/* ── Tabla de usuarios ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md">
        <UsersTable
          data={paginatedData}
          onToggle={handleToggle}
          onDelete={handleDelete}
          search={search}
          totalData={data.length}
          offset={(currentPage - 1) * RECORDS_PER_PAGE}
        />
      </div>

      {/* ── Componente de paginación ──────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={filtered.length}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      {/* Outlet para renderizar rutas anidadas */}
      <Outlet />
    </div>
  );
}

export default Users;