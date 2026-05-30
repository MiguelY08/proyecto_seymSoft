import axios from 'axios';
import { getSession, saveSession, clearSession } from '../Features/access/helpers/authStorage.js';

/**
 * API CLIENT - CONFIGURACIÓN CENTRALIZADA
 * 
 * Instancia de axios configurada con:
 * - Base URL del API (VITE_API_BASE_URL)
 * - Interceptores para tokens
 * - Manejo de errores global
 * - Refresh token automático
 */

// 1. CREAR INSTANCIA DE AXIOS CON CONFIG BASE
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════════════════════
// INTERCEPTOR DE REQUEST
// Agregar token a cada request
// ═══════════════════════════════════════════════════════════

apiClient.interceptors.request.use(
  (config) => {
    // Obtener tokens del localStorage
    const session = getSession();
    
    if (session && session.accessToken) {
      // Agregar token al header Authorization
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════
// INTERCEPTOR DE RESPONSE
// Manejar errores y refresh token
// ═══════════════════════════════════════════════════════════

apiClient.interceptors.response.use(
  (response) => {
    // Respuesta exitosa - retornar como está
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. Si error es 401 (token expirado) y NO es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Obtener refreshToken del localStorage
        const session = getSession();
        
        if (!session || !session.refreshToken) {
          // No hay refresh token → Hacer logout
          clearSession();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Intentar refrescar el token
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/refresh`,
          { refreshToken: session.refreshToken }
        );

        // Guardar nuevos tokens
        const { accessToken, refreshToken } = response.data.data;
        saveSession({
          user: session.user,
          accessToken,
          refreshToken,
        });

        // Actualizar el header del request original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Reintentar el request original
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Error al refrescar token → Hacer logout
        clearSession();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 2. Otros errores - retornar como están
    return Promise.reject(error);
  }
);

export default apiClient;