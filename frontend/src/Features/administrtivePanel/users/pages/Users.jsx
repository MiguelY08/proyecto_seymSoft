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
  getApiErrorCode,
  getApiMessage,
  getUserActionErrorMessage,
} from '../services/userService';
import { useAlert }    from '../../../shared/alerts/useAlert';
import { downloadUsersExcel } from '../helpers/excelHelper';
import { userMatchesSearch } from '../helpers/usersHelpers';
import Permission from "../../configuration/roles/components/Permission";

// Número de registros por página (debe coincidir con el limit que acepta la API)
const RECORDS_PER_PAGE = 11;

const userMatchesStatus = (user = {}, statusFilter = '') =>
  !statusFilter ||
  (statusFilter === '1' && user.active === true) ||
  (statusFilter === '2' && user.active === false);

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
  const { showError, showSuccess, showWarning, showInfo } = useAlert();

  // Estados principales
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
  const filteredUsers = useMemo(() => (
    allUsers.filter((user) =>
      userMatchesSearch(user, search) &&
      userMatchesStatus(user, statusFilter)
    )
  ), [allUsers, search, statusFilter]);
  const totalPages = Math.ceil(filteredUsers.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentUsers = useMemo(() => (
    filteredUsers.slice(startIndex, endIndex)
  ), [filteredUsers, startIndex, endIndex]);
  const hasActiveFilters = Boolean(search.trim() || statusFilter);

  // ─── Función para cargar usuarios desde la API ─────────────────────────────
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const loadedUsers = await UserService.listAll();
      const nextTotalPages = Math.ceil(loadedUsers.length / RECORDS_PER_PAGE);
      const nextPage = Math.min(page, nextTotalPages || 1);

      setAllUsers(loadedUsers);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Error fetching users:', err);
      const message = getApiMessage(
        err,
        'No se pudieron cargar los usuarios.'
      );
      setError(message);
      showError('Error de carga', message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

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

  // ─── Recargar cuando cambia la página, la búsqueda o el filtro ─
  useEffect(() => {
    const safePage = Math.min(currentPage, totalPages || 1);
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // ─── Cargar siempre las métricas ─
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // ─── Manejadores de acciones ───────────────────────────────────────────────
  const handleExportUsers = async () => {
    return downloadUsersExcel(filteredUsers);
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
    if (user.isClient === true) {
      showWarning(
        'Usuario ya asociado',
        'Este usuario ya tiene un perfil de cliente asociado.'
      );
      return;
    }

    setClientSeedUser(user);
    setIsClientFormOpen(true);
    setIsFormOpen(false);
    setIsInfoOpen(false);
    setModalOrigin(null);
  }, [showWarning]);

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

      await fetchUsers(currentPage);

      showSuccess(
        'Cliente asociado',
        'Se creo el perfil de cliente para el usuario seleccionado.'
      );
    } catch (error) {
      const backendStatus = error?.response?.status;
      const backendErrorCode = getApiErrorCode(error);

      if (
        backendStatus === 409 &&
        backendErrorCode === 'ALREADY_CLIENT'
      ) {
        await fetchUsers(currentPage);
        showInfo(
          'Usuario ya asociado',
          'Este usuario ya tiene un perfil de cliente asociado.'
        );
        return;
      }

      if (
        backendStatus === 404 &&
        backendErrorCode === 'USER_NOT_FOUND'
      ) {
        await fetchUsers(currentPage);
        showWarning(
          'Usuario no disponible',
          'El usuario ya no existe o no se pudo encontrar para asociarlo como cliente.'
        );
        throw error;
      }

      const errorMessage = getApiMessage(
        error,
        'No se pudo crear el cliente.'
      );

      showError('Error', errorMessage);
      throw error;
    }
  }, [
    clientSeedUser,
    currentPage,
    fetchUsers,
    showError,
    showSuccess,
  ]);

  const handleSavedUser = useCallback(async () => {
    await fetchUsers(currentPage);
    await fetchMetrics();
    closeFormModal();
  }, [currentPage, fetchUsers, fetchMetrics, closeFormModal]);

  const handleToggle = async (userId) => {
    // Encontrar el usuario actual para saber su estado activo
    const currentUser = allUsers.find(u => u.id === userId);
    if (!currentUser) return;

    try {
      await UserService.toggle(userId, !currentUser.active);
      // Recargar la misma página después de cambiar el estado
      await fetchUsers(currentPage);
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

      if (currentUsers.length === 1 && currentPage > 1) {
        newPage = currentPage - 1;
        setCurrentPage(newPage);
      }
      await fetchUsers(newPage);
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
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  if (loading && allUsers.length === 0) {
    return (
      <Spinner message="Cargando usuarios..." />
    );
  }

  if (error && allUsers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Error de carga</p>
          <p>{error}</p>
          <button
            onClick={() => fetchUsers(currentPage)}
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
        onStatusChange={handleStatusChange}
        onExport={handleExportUsers}
        onCreateUser={openCreateModal}
        totalUsers={filteredUsers.length}
      />

      <UserMetricsCards metrics={metrics} />

      {/* Tabla de usuarios */}

      <Permission permission="usuarios.ver">
        <div className="bg-white rounded-xl shadow-md">
          <UsersTable
            data={currentUsers}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onViewInfo={openInfoModal}
            onEdit={openFormModal}
            onCreateUser={openCreateModal}
            search={search}
            totalData={filteredUsers.length} // Total real de usuarios (sin paginar)
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </Permission>

      {/* Paginación - solo si hay más de una página */}
      {totalPages > 1 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          totalRecords={filteredUsers.length}
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
