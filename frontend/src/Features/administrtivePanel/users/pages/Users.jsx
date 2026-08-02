import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Componentes y servicios
import TopBar          from '../components/TopBar';
import UserMetricsCards from '../components/UserMetricsCards';
import UsersTable      from '../components/UsersTable';
import FormUser from '../components/FormUser';
import InfoUser from '../components/InfoUser';
import FormClient from '../../sales/clients/modals/FormClient';
import { clientsService } from '../../sales/clients/services/clientsService';
import PaginationAdmin from '../../../shared/PaginationAdmin';
import Spinner from '../../../shared/spinner';
import {
  UserService,
  getUserActionErrorMessage,
} from '../services/userService';
import { useAlert }    from '../../../shared/alerts/useAlert';
import { downloadUsersExcel } from '../helpers/excelHelper';
import Permission from "../../configuration/roles/components/Permission";

// Número de registros por página (debe coincidir con el limit que acepta la API)
const RECORDS_PER_PAGE = 11;

const splitUserNameForClient = (name = '') => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] || '',
      lastName: '',
    };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1),
  };
};

const buildClientInitialDataFromUser = (user = null) => {
  const { firstName, lastName } = splitUserNameForClient(user?.name);

  return {
    personType: 'natural',
    documentType: 'CC',
    document: '',
    firstName,
    lastName,
    address: '',
    phone: user?.phone ? String(user.phone) : '',
    email: user?.email || '',
    contactName: '',
    contactPhone: '',
    clientCredit: '',
    saldoFavor: '',
    clientType: '',
    rut: '',
    ciuCode: '',
  };
};

function Users() {
  const { showError, showSuccess } = useAlert();

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
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalOrigin, setModalOrigin] = useState(null);
  const [clientSeedUser, setClientSeedUser] = useState(null);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const clientInitialData = useMemo(
    () => buildClientInitialDataFromUser(clientSeedUser),
    [clientSeedUser]
  );

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

  // ─── Función para cargar métricas ─────────────────────────────
  const fetchMetrics = useCallback(async () => {
    try {
      const result = await UserService.getMetrics();

      setMetrics({
        totalUsers: result.totalUsers ?? 0,
        activeUsers: result.activeUsers ?? 0,
        inactiveUsers: result.inactiveUsers ?? 0,
      });
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  // ─── Recargar cuando cambia la página, la búsqueda o el filtro ─
  useEffect(() => {
    fetchUsers(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, statusFilter, fetchUsers]);

  // ─── Cargar siempre las métricas ─
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

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

  const openInfoModal = useCallback((user, origin = null) => {
    setSelectedUser(user);
    setModalOrigin(origin);
    setIsFormOpen(false);
    setIsInfoOpen(true);
  }, []);

  const openFormModal = useCallback((user = null, origin = null) => {
    setSelectedUser(user);
    setModalOrigin(origin);
    setIsInfoOpen(false);
    setIsFormOpen(true);
  }, []);

  const openCreateModal = useCallback((origin = null) => {
    openFormModal(null, origin);
  }, [openFormModal]);

  const closeInfoModal = useCallback(() => {
    setIsInfoOpen(false);
    setSelectedUser(null);
    setModalOrigin(null);
  }, []);

  const closeFormModal = useCallback(() => {
    setIsFormOpen(false);
    setSelectedUser(null);
    setModalOrigin(null);
  }, []);

  const openMakeClientFlow = useCallback((user) => {
    if (!user) return;

    setClientSeedUser(user);
    setIsClientFormOpen(true);
    setIsFormOpen(false);
    setIsInfoOpen(false);
    setModalOrigin(null);
  }, []);

  const closeClientFormModal = useCallback(() => {
    setIsClientFormOpen(false);
    setClientSeedUser(null);
  }, []);

  const handleMakeClientSave = useCallback(async (clientData) => {
    const userId = Number(clientSeedUser?.id);

    if (!userId) {
      showError(
        'Usuario no identificado',
        'No se pudo identificar el usuario para crear el cliente.'
      );
      throw new Error('USER_ID_REQUIRED');
    }

    try {
      await clientsService.create({
        ...clientData,
        userId,
      });

      await fetchUsers(currentPage, debouncedSearch);

      showSuccess(
        'Cliente creado',
        'El usuario ahora tiene un perfil de cliente asociado.'
      );
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        'No se pudo crear el cliente.';

      showError('Error', errorMessage);
      throw error;
    }
  }, [
    clientSeedUser,
    currentPage,
    debouncedSearch,
    fetchUsers,
    showError,
    showSuccess,
  ]);

  const handleSavedUser = useCallback(async () => {
    await fetchUsers(currentPage, debouncedSearch);
    await fetchMetrics();
    closeFormModal();
  }, [currentPage, debouncedSearch, fetchUsers, fetchMetrics, closeFormModal]);

  const handleToggle = async (userId) => {
    // Encontrar el usuario actual para saber su estado activo
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return;

    try {
      await UserService.toggle(userId, !currentUser.active);
      // Recargar la misma página después de cambiar el estado
      await fetchUsers(currentPage, debouncedSearch);
      // Recargar métricas
      await fetchMetrics();
    } catch (err) {
      const msg = getUserActionErrorMessage(
        err,
        'Error al cambiar el estado del usuario.'
      );
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
      await fetchMetrics();
      showSuccess(
        "Usuario eliminado",
        "El usuario ha sido eliminado exitosamente."
      );
    } catch (err) {
      const msg = getUserActionErrorMessage(
        err,
        'Error al eliminar el usuario.'
      );
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
      <Spinner message="Cargando usuarios..." />
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
        onCreateUser={openCreateModal}
        totalUsers={pagination.total}
      />

      <UserMetricsCards metrics={metrics} />

      {/* Tabla de usuarios */}

      <Permission permission="usuarios.ver">
        <div className="bg-white rounded-xl shadow-md">
          <UsersTable
            data={users}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onViewInfo={openInfoModal}
            onEdit={openFormModal}
            onCreateUser={openCreateModal}
            search={search}
            totalData={pagination.total} // Total real de usuarios (sin paginar)
          />
        </div>
      </Permission>

      {/* Paginación - solo si hay más de una página */}
      {pagination.totalPages > 1 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          totalRecords={pagination.total}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      <InfoUser
        user={selectedUser}
        isOpen={isInfoOpen}
        origin={modalOrigin}
        onClose={closeInfoModal}
        onEdit={openFormModal}
      />

      <FormUser
        userToEdit={selectedUser}
        isOpen={isFormOpen}
        origin={modalOrigin}
        onClose={closeFormModal}
        onSaved={handleSavedUser}
        onMakeClient={openMakeClientFlow}
      />

      <FormClient
        isOpen={isClientFormOpen}
        onClose={closeClientFormModal}
        client={null}
        initialData={clientInitialData}
        linkedUser={clientSeedUser}
        onSave={handleMakeClientSave}
      />
    </div>
  );
}

export default Users;
