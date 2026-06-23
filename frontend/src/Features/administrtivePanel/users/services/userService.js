// ─── Servicio de usuarios con API REST ───────────────────────────────────────
// Reemplaza localStorage por llamadas HTTP asíncronas con Axios.
//
// Endpoints reales (base URL desde .env):
//   GET    /users?page=1&limit=10       → Lista paginada
//   GET    /users/metrics               → Métricas generales
//   GET    /users/:id                   → Detalle completo
//   POST   /users                       → Crear usuario
//   PUT    /users/:id                   → Actualizar (soporta modificación parcial)
//   PATCH  /users/:id/status            → Cambiar estado (activo/inactivo)
//   DELETE /users/:id                   → Eliminar usuario
//
// Los roles provienen de otra API (pendiente de integración).

import apiClient from '../../../../setting/apiClient.js';

// ---------------------------------------------------------------------
// Funciones auxiliares de transformación
// ---------------------------------------------------------------------
// Convierte status { id, name } → booleano active
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
    'No puedes editar tu propio usuario desde este módulo. Usa la sección de perfil.',
  SELF_USER_STATUS_UPDATE_NOT_ALLOWED:
    'No puedes activar o desactivar tu propio usuario desde este módulo.',
  SELF_USER_DELETE_NOT_ALLOWED:
    'No puedes eliminar tu propio usuario.',
};

export const getUserActionErrorMessage = (
  error,
  fallback = 'Ocurrió un error. Intenta de nuevo.'
) => {
  const errorCode = error.response?.data?.errorCode;

  return (
    USER_ACTION_ERROR_MESSAGES[errorCode] ||
    error.response?.data?.message ||
    error.message ||
    fallback
  );
};

// Normaliza un usuario proveniente de la API al formato interno del frontend
const mapUserFromApi = (apiUser) => ({
  ...apiUser,
  active: mapStatusToActive(apiUser.status),
  createdAt: apiUser.creationDate || apiUser.createdAt,
  role: normalizeRole(apiUser.role),
  permissions: apiUser.permissions || [],
});

// ---------------------------------------------------------------------
// Servicio de usuarios (API REST)
// ---------------------------------------------------------------------
export const UserService = {
  /**
   * Lista paginada de usuarios.
   * @param {number} page - Número de página (default 1)
   * @param {number} limit - Elementos por página (default 10)
   * @param {string} search - Texto de búsqueda (opcional)
   * @param {string} status - Filtro por estado (opcional)
   * @returns {Promise<{ users: Array, pagination: Object }>}
   */
  async list(page = 1, limit = 10, search = '', status = '') {
    const params = { page, limit };

    if (status) params.status = status;
    if (search?.trim()) params.search = search.trim();

    const response = await apiClient.get('/users', { params });

    const users = (response.data.data || []).map(mapUserFromApi);
    const pagination = response.data.pagination || {};

    return { users, pagination };
  },

  /**
   * Obtiene las métricas generales del módulo de usuarios.
   * La API devuelve: { success, message, data: { totalUsers, activeUsers, inactiveUsers } }
   * @returns {Promise<{ totalUsers: number, activeUsers: number, inactiveUsers: number }>}
   */
  async getMetrics() {
    const response = await apiClient.get('/users/metrics');

    return response.data.data;
  },

  /**
   * Obtiene un usuario por ID (detalle completo).
   * La API devuelve: { success, message, data: { user: { idUser, fullName, email, phone, creationDate, idStatus }, role, permissions } }
   * @param {number|string} id
   * @returns {Promise<Object>} Usuario normalizado con campos: id, name, email, phone, active, createdAt, role, permissions
   */
  async findById(id) {
    const response = await apiClient.get(`/users/${id}`);
    const apiData = response.data.data;

    if (!apiData || !apiData.user) {
      throw new Error('Usuario no encontrado');
    }

    const user = apiData.user;
    // Mapeo según reglas: idStatus: 1=Activo, 2=Inactivo, otros=Desconocido (se tratará como inactivo por seguridad)
    return {
      id: user.idUser,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      active: user.idStatus === 1,
      createdAt: user.creationDate,
      role: normalizeRole(apiData.role),        // null o el rol proveniente de otra API
      permissions: apiData.permissions || [],
    };
  },

  /**
   * Crea un nuevo usuario.
   * La API espera: { fullName, email, phone, idRole }
   * @param {Object} userData - Datos del usuario (name, email, phone, roleId)
   * @returns {Promise<Object>} Usuario creado y normalizado
   */
  async create(userData) {
    const payload = {
      fullName: userData.name,
      email: userData.email,
      phone: userData.phone ? Number(userData.phone) : null,
      idRole: userData.roleId ?? null,
    };

    const response = await apiClient.post('/users', payload);

    const createdData = response.data.data ?? response.data.user ?? response.data;
    const createdUser = createdData?.user ?? createdData;

    return {
      id: createdUser.idUser ?? createdUser.id,
      name: createdUser.fullName ?? createdUser.name,
      email: createdUser.email,
      phone: createdUser.phone ?? null,
      active:
        createdUser.idStatus === 1 ||
        createdUser.status?.id === 1 ||
        createdUser.status?.name === 'Activo',
      createdAt: createdUser.creationDate ?? createdUser.createdAt,
      role: normalizeRole(createdData?.role ?? createdUser.role),
      permissions: createdData?.permissions || [],
    };
  },

  /**
   * Actualiza un usuario (PUT soporta modificación parcial).
   * La API espera: { fullName?, email?, phone?, idRole? }
   * @param {number|string} id
   * @param {Object} changes - Campos a modificar (name, email, phone, roleId)
   * @returns {Promise<Object>} Usuario actualizado y normalizado
   */
  async update(id, changes) {
    const payload = {};
    if (changes.name !== undefined)   payload.fullName = changes.name;
    if (changes.email !== undefined)  payload.email    = changes.email;
    if (changes.phone !== undefined)  payload.phone    = Number(changes.phone);
    if (changes.roleId !== undefined) payload.idRole   = changes.roleId ?? null;

    const response = await apiClient.put(`/users/${id}`, payload);

    // La API devuelve: { success, message, data: { user, role, permissions } }
    const { user, role, permissions } = response.data.data;

    return {
      id: user.idUser,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      active: user.idStatus === 1, // 1 = Activo
      createdAt: user.creationDate,
      role: normalizeRole(role),        // null o rol desde otra API
      permissions: permissions || [],
    };
  },

  /**
   * Cambia el estado (activo/inactivo) de un usuario.
   * Endpoint específico: PATCH /users/:id/status
   * @param {number|string} id
   * @param {boolean} active - true = activo, false = inactivo
   * @returns {Promise<Object>} Usuario actualizado y normalizado
   */
  async toggle(id, active) {
    // Convertir booleano a idStatus: 1 = Activo, 2 = Inactivo
    const response = await apiClient.patch(`/users/${id}/status`, { idStatus: active ? 1 : 2 });

    // La API devuelve: { message, data: { id, name, email, phone, creationDate, status } }
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
      createdAt: updatedData.creationDate ?? updatedData.createdAt,
      role: null,       // pendiente de integración con API de roles
      permissions: [],  // este endpoint no devuelve permisos
    };
  },

  /**
   * Elimina un usuario permanentemente.
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    await apiClient.delete(`/users/${id}`);
    // Sin contenido de retorno (204)
  },
};

export default UserService;
