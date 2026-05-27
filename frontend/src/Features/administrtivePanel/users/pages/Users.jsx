import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Componentes y servicios
import TopBar          from '../components/TopBar';
import UsersTable      from '../components/UsersTable';
import PaginationAdmin from '../../../shared/PaginationAdmin';
import { UserService } from '../services/userService';
import { useAlert }    from '../../../shared/alerts/useAlert';
import { downloadUsersExcel } from '../helpers/usersHelpers';

// Número de registros por página (debe coincidir con el limit que acepta la API)
const RECORDS_PER_PAGE = 13;

function Users() {
  const location = useLocation();
  const { showError, showWarning, showSuccess } = useAlert();

  // Estados principales
  const [users, setUsers] = useState([]);           // Lista de usuarios de la página actual
  const [pagination, setPagination] = useState({
    page: 1,
    limit: RECORDS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Función para cargar usuarios desde la API ─────────────────────────────
  const fetchUsers = useCallback(async (page, searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      // Si la API soporta búsqueda, se pasa como parámetro. Si no, se puede eliminar.
      // En caso de que no soporte búsqueda, puedes comentar la línea y hacer filtrado local
      const result = await UserService.list(
        page,
        RECORDS_PER_PAGE,
        searchTerm,
        statusFilter
      );
      setUsers(result.users);
      setPagination(result.pagination);
      // Si la API no devuelve la página actual, se puede forzar
      setCurrentPage(result.pagination.page || page);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los usuarios.');
      showError('Error de carga', 'No se pudieron cargar los usuarios. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [showError, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  // ─── Recargar cuando cambia la página, la búsqueda o se vuelve de otra ruta ─
  useEffect(() => {
    fetchUsers(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, statusFilter, location.pathname, fetchUsers]);

  // ─── Manejadores de acciones ───────────────────────────────────────────────
  const handleExportUsers = async () => {
    const result = await UserService.list(
      1,
      pagination.total || RECORDS_PER_PAGE,
      debouncedSearch,
      statusFilter
    );

    return downloadUsersExcel(result.users);
  };

  const handleToggle = async (userId) => {
    // Encontrar el usuario actual para saber su estado activo
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return;

    try {
      await UserService.toggle(userId, !currentUser.active);
      // Recargar la misma página después de cambiar el estado
      await fetchUsers(currentPage, debouncedSearch);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cambiar el estado del usuario.';
      showError('Error', msg);
    }
  };

  const handleDelete = async (user) => {
    try {
      await UserService.delete(user.id);
      let newPage = currentPage;

      if (users.length === 1 && currentPage > 1) {
        newPage = currentPage - 1;
        setCurrentPage(newPage);
      }
      await fetchUsers(newPage, debouncedSearch);
      showSuccess(
        "Usuario eliminado",
        "El usuario ha sido eliminado exitosamente."
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Error al eliminar el usuario.';
      showError('Error', msg);
      throw err;
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1); // Reiniciar a la primera página al buscar
  };

  // ─── Renderizado condicional mientras carga o hay error ────────────────────
  if (loading && users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D77] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Error de carga</p>
          <p>{error}</p>
          <button
            onClick={() => fetchUsers(currentPage, debouncedSearch)}
            className="mt-4 px-4 py-2 bg-[#004D77] text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
      {/* Barra superior con búsqueda y acciones */}
      <TopBar
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onExport={handleExportUsers}
        totalUsers={pagination.total}
      />

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl shadow-md">
        <UsersTable
          data={users}
          onToggle={handleToggle}
          onDelete={handleDelete}
          search={search}
          totalData={pagination.total} // Total real de usuarios (sin paginar)
        />
      </div>

      {/* Paginación - solo si hay más de una página */}
      {pagination.totalPages > 1 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          totalRecords={pagination.total}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      <Outlet />
    </div>
  );
}

export default Users;