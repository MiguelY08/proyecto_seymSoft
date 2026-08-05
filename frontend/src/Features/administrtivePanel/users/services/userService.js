// Servicio de usuarios con API REST
// Reemplaza localStorage por llamadas HTTP asincronas con Axios.
//
// Endpoints reales (base URL desde .env):
//   GET    /users?page=1&limit=10       -> Lista paginada
//   GET    /users/metrics               -> Metricas generales
//   GET    /users/:id                   -> Detalle completo
//   POST   /users                       -> Crear usuario
//   PUT    /users/:id                   -> Actualizar (soporta modificacion parcial)
//   PATCH  /users/:id/status            -> Cambiar estado (activo/inactivo)
//   DELETE /users/:id                   -> Eliminar usuario
//
// Los roles provienen de otra API (pendiente de integracion).

import apiClient from '../../../../setting/apiClient.js';

const mapStatusToActive = (status) => status?.name === 'Activo';

const normalizeRole = (role) => {
  if (!role) return null;

  const idRole = role.idRole ?? role.id_role ?? role.id ?? null;
  const nameRole = role.nameRole ?? role.name_role ?? role.name ?? null;

  return {
    ...role,
    id: idRole,
    idRole,
    name: nameRole,
    nameRole,
  };
};

const USER_ACTION_ERROR_MESSAGES = {
  SELF_USER_UPDATE_NOT_ALLOWED:
    'No puedes editar tu propio usuario desde este modulo. Usa la seccion de perfil.',
  SELF_USER_STATUS_UPDATE_NOT_ALLOWED:
    'No puedes activar o desactivar tu propio usuario desde este modulo.',
  SELF_USER_DELETE_NOT_ALLOWED:
    'No puedes eliminar tu propio usuario.',
  CANNOT_UPDATE_SYSTEM_USER:
    'No se puede actualizar el usuario del sistema.',
  CANNOT_DELETE_SYSTEM_USER:
    'No se puede eliminar el usuario del sistema.',
  USER_STILL_ACTIVE:
    'El usuario debe estar inactivo para poder ser eliminado.',
  USER_HAS_ASSIGNED_ROLES:
    'No se puede eliminar el usuario porque tiene roles asignados.',
  USER_HAS_ASSOCIATED_CLIENTS:
    'No se puede eliminar el usuario porque tiene clientes asociados.',
  USER_HAS_ASSOCIATED_RECORDS:
    'No se puede eliminar el usuario porque tiene relaciones activas en el sistema.',
  STATUS_ALREADY_ASSIGNED:
    'El usuario ya cuenta con ese estado.',
  INVALID_STATUS:
    'El estado solicitado no es valido.',
  DUPLICATE_EMAIL:
    'El email ya esta registrado.',
  ROLE_NOT_FOUND:
    'El rol seleccionado no existe.',
};

export const getApiErrorCode = (error) =>
  error?.response?.data?.errorCode || null;

export const getApiMessage = (
  error,
  fallback = 'Ocurrio un error. Intenta de nuevo.'
) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export const getApiFieldErrors = (error) =>
  error?.response?.data?.errors || {};

export const getUserActionErrorMessage = (
  error,
  fallback = 'Ocurrio un error. Intenta de nuevo.'
) => {
  const errorCode = getApiErrorCode(error);

  return (
    USER_ACTION_ERROR_MESSAGES[errorCode] ||
    getApiMessage(error, fallback)
  );
};

const mapUserFromApi = (apiUser) => ({
  ...apiUser,
  active: mapStatusToActive(apiUser.status),
  createdAt: apiUser.creationDate || apiUser.createdAt,
  role: normalizeRole(apiUser.role),
  permissions: apiUser.permissions || [],
});

const getResponseMeta = (responseData = {}) => ({
  warning:
    responseData.warning ??
    responseData.meta?.warning ??
    responseData.data?.warning ??
    null,
  warningCode:
    responseData.warningCode ??
    responseData.meta?.warningCode ??
    responseData.data?.warningCode ??
    null,
  errorCode:
    responseData.errorCode ??
    responseData.data?.errorCode ??
    null,
});

export const UserService = {
  async list(page = 1, limit = 10, search = '', status = '') {
    const params = { page, limit };

    if (status) params.status = status;
    if (search?.trim()) params.search = search.trim();

    const response = await apiClient.get('/users', { params });

    const users = (response.data.data || []).map(mapUserFromApi);
    const pagination =
      response.data.pagination ||
      response.data.meta?.pagination ||
      {};

    return { users, pagination };
  },

  async getMetrics() {
    const response = await apiClient.get('/users/metrics');

    return response.data.data;
  },

  async findById(id) {
    const response = await apiClient.get(`/users/${id}`);
    const apiData = response.data.data;

    if (!apiData || !apiData.user) {
      throw new Error('Usuario no encontrado');
    }

    const user = apiData.user;

    return {
      id: user.idUser,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      active: user.idStatus === 1,
      createdAt: user.creationDate,
      role: normalizeRole(apiData.role),
      permissions: apiData.permissions || [],
      client: apiData.client || null,
      requiresPasswordSetup:
        apiData.requiresPasswordSetup === true,
    };
  },

  async create(userData) {
    const payload = {
      fullName: userData.name,
      email: userData.email,
      phone: userData.phone ? Number(userData.phone) : null,
      idRole: userData.roleId ?? null,
    };

    const response = await apiClient.post('/users', payload);

    const responseData = response.data ?? {};
    const createdData =
      responseData.data ??
      responseData.user ??
      responseData;
    const createdUser =
      createdData?.user ??
      createdData?.createdUser ??
      createdData?.data?.user ??
      createdData ??
      {};
    const {
      warning,
      warningCode,
      errorCode,
    } = getResponseMeta(responseData);

    return {
      id: createdUser.idUser ?? createdUser.id ?? null,
      name: createdUser.fullName ?? createdUser.name ?? userData.name,
      email: createdUser.email ?? userData.email,
      phone: createdUser.phone ?? userData.phone ?? null,
      active:
        createdUser.idStatus === 1 ||
        createdUser.status?.id === 1 ||
        createdUser.status?.name === 'Activo' ||
        createdUser.status === 'Activo' ||
        createdUser.active === true,
      createdAt:
        createdUser.creationDate ??
        createdUser.createdAt ??
        null,
      role: normalizeRole(createdData?.role ?? createdUser.role),
      permissions: createdData?.permissions || [],
      warning,
      warningCode,
      errorCode,
    };
  },

  async update(id, changes) {
    const payload = {};
    if (changes.name !== undefined) payload.fullName = changes.name;
    if (changes.email !== undefined) payload.email = changes.email;
    if (changes.phone !== undefined) payload.phone = Number(changes.phone);
    if (changes.roleId !== undefined) payload.idRole = changes.roleId ?? null;

    const response = await apiClient.put(`/users/${id}`, payload);
    const { user, role, permissions } = response.data.data;

    return {
      id: user.idUser,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      active: user.idStatus === 1,
      createdAt: user.creationDate,
      role: normalizeRole(role),
      permissions: permissions || [],
    };
  },

  async toggle(id, active) {
    const response = await apiClient.patch(`/users/${id}/status`, {
      idStatus: active ? 1 : 2,
    });

    const updatedData = response.data.data;

    return {
      id: updatedData.id ?? updatedData.idUser,
      name: updatedData.name ?? updatedData.fullName,
      email: updatedData.email,
      phone: updatedData.phone,
      active:
        updatedData.status?.id === 1 ||
        updatedData.status?.name === 'Activo' ||
        updatedData.idStatus === 1,
      createdAt:
        updatedData.creationDate ??
        updatedData.createdAt,
      role: null,
      permissions: [],
    };
  },

  async delete(id) {
    await apiClient.delete(`/users/${id}`);
  },
};

export default UserService;
