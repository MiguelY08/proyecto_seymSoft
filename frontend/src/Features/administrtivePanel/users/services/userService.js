// ─── Servicio de usuarios con API REST ───────────────────────────────────────
// Reemplaza localStorage por llamadas HTTP asíncronas con Axios.
//
// Endpoints reales (base URL desde .env):
//   GET    /users?page=1&limit=10       → Lista paginada
//   GET    /users/:id                   → Detalle completo
//   POST   /users                       → Crear usuario
//   PUT    /users/:id                   → Actualizar (soporta modificación parcial)
//   PATCH  /users/:id/status            → Cambiar estado (activo/inactivo)
//   DELETE /users/:id                   → Eliminar usuario
//
// Los roles provienen de otra API (pendiente de integración).

import axios from 'axios';

// ---------------------------------------------------------------------
// Configuración base de Axios
// ---------------------------------------------------------------------
// La variable BASE_URL se define en .env (ej: BASE_URL=http://localhost:3000)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Interceptor para manejo global de errores (logging)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------
// Funciones auxiliares de transformación
// ---------------------------------------------------------------------
// Convierte status { id, name } → booleano active
const mapStatusToActive = (status) => status?.name === 'Activo';

// Normaliza un usuario proveniente de la API al formato interno del frontend
const mapUserFromApi = (apiUser) => ({
  ...apiUser,
  active: mapStatusToActive(apiUser.status),
  createdAt: apiUser.creationDate || apiUser.createdAt,
  role: null, // Se integrará con la API de roles más adelante
});

// ---------------------------------------------------------------------
// Servicio de usuarios (API REST)
// ---------------------------------------------------------------------
export const UserService = {
  /**
   * Lista paginada de usuarios.
   * @param {number} page - Número de página (default 1)
   * @param {number} limit - Elementos por página (default 10)
   * @returns {Promise<{ users: Array, pagination: Object }>}
   */
  async list(page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/users', { params: { page, limit } });
      const users = (response.data.data || []).map(mapUserFromApi);
      const pagination = response.data.pagination || {};
      return { users, pagination };
    } catch (error) {
      console.error('Error en list():', error);
      throw error;
    }
  },

  /**
   * Obtiene un usuario por ID (detalle completo).
   * La API devuelve: { success, message, data: { user: { idUser, fullName, email, phone, creationDate, idStatus }, role, permissions } }
   * @param {number|string} id
   * @returns {Promise<Object>} Usuario normalizado con campos: id, name, email, phone, active, createdAt, role, permissions
   */
  async findById(id) {
    try {
      const response = await apiClient.get(`/users/${id}`);
      const apiData = response.data.data;
      if (!apiData || !apiData.user) {
        throw new Error('Usuario no encontrado');
      }
      const user = apiData.user;
      // Mapeo según reglas: idStatus: 1=Activo, 2=Inactivo, otros=Desconocido (se tratará como inactivo por seguridad)
      const isActive = user.idStatus === 1;
      return {
        id: user.idUser,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        active: isActive,
        createdAt: user.creationDate,
        role: apiData.role,        // null o el rol proveniente de otra API
        permissions: apiData.permissions || [],
      };
    } catch (error) {
      console.error(`Error en findById(${id}):`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo usuario.
   * La API espera: { fullName, email, phone }
   * @param {Object} userData - Datos del usuario (name, email, phone)
   * @returns {Promise<Object>} Usuario creado y normalizado
   */
  async create(userData) {
    try {
      // Construir payload según lo que espera la API
      const payload = {
        fullName: userData.name,     // el frontend usa "name", la API espera "fullName"
        email: userData.email,
        phone: userData.phone ? Number(userData.phone) : null, // convertir a número si es necesario
      };
      const response = await apiClient.post('/users', payload);
      // La API devuelve: { message, user: { id, name, email, phone, creationDate, status } }
      const newUser = response.data.user;
      // Normalizar al formato interno del frontend (similar a mapUserFromApi)
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        active: newUser.status?.name === 'Activo',
        createdAt: newUser.creationDate,
        role: null, // pendiente de integración con API de roles
      };
    } catch (error) {
      console.error('Error en create():', error);
      throw error;
    }
  },

/**
 * Actualiza un usuario (PUT soporta modificación parcial).
 * La API espera: { fullName?, email?, phone? }
 * @param {number|string} id
 * @param {Object} changes - Campos a modificar (name, email, phone)
 * @returns {Promise<Object>} Usuario actualizado y normalizado
 */
async update(id, changes) {
  try {
    // Construir payload solo con los campos que soporta la API
    const payload = {};
    if (changes.name !== undefined) payload.fullName = changes.name;
    if (changes.email !== undefined) payload.email = changes.email;
    if (changes.phone !== undefined) payload.phone = Number(changes.phone); // convertir a número

    const response = await apiClient.put(`/users/${id}`, payload);
    // La API devuelve: { success, message, data: { user, role, permissions } }
    const { user, role, permissions } = response.data.data;
    // Normalizar al formato interno del frontend
    return {
      id: user.idUser,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      active: user.idStatus === 1, // 1 = Activo
      createdAt: user.creationDate,
      role: role,        // null o rol desde otra API
      permissions: permissions || [],
    };
  } catch (error) {
    console.error(`Error en update(${id}):`, error);
    throw error;
  }
},

/**
 * Cambia el estado (activo/inactivo) de un usuario.
 * Endpoint específico: PATCH /users/:id/status
 * @param {number|string} id
 * @param {boolean} active - true = activo, false = inactivo
 * @returns {Promise<Object>} Usuario actualizado y normalizado
 */
async toggle(id, active) {
  try {
    // Convertir booleano a idStatus: 1 = Activo, 2 = Inactivo
    const idStatus = active ? 1 : 2;
    const response = await apiClient.patch(`/users/${id}/status`, { idStatus });
    // La API devuelve: { message, data: { id, name, email, phone, creationDate, status } }
    const updatedData = response.data.data;
    return {
      id: updatedData.id,
      name: updatedData.name,
      email: updatedData.email,
      phone: updatedData.phone,
      active: updatedData.status.id === 1, // true si el nuevo estado es Activo
      createdAt: updatedData.creationDate,
      role: null,      // pendiente de integración con API de roles
      permissions: [], // este endpoint no devuelve permisos
    };
  } catch (error) {
    console.error(`Error en toggle(${id}):`, error);
    throw error;
  }
},

  /**
   * Elimina un usuario permanentemente.
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await apiClient.delete(`/users/${id}`);
      // Sin contenido de retorno (204)
    } catch (error) {
      console.error(`Error en delete(${id}):`, error);
      throw error;
    }
  },
};

export default UserService;