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

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// ═══════════════════════════════════════════════════════════
// CONTROL DE RACE CONDITION EN REFRESH TOKEN
// Una sola promesa compartida para múltiples peticiones 401
// simultáneas. Mientras el refresh esté en curso, los demás
// requests esperan el mismo resultado en lugar de disparar
// nuevas llamadas a /auth/refresh.
// ═══════════════════════════════════════════════════════════

let refreshPromise = null;

const refreshAccessToken = async () => {
  // Si ya hay un refresh en curso, reutilizar esa promesa
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const session = getSession();

    if (!session || !session.refreshToken) {
      throw new Error('NO_REFRESH_TOKEN');
    }

    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: session.refreshToken,
    });

    const { accessToken, refreshToken } = response.data.data;
    saveSession({
      ...session,
      accessToken,
      refreshToken,
    });

    return accessToken;
  })().finally(() => {
    // Limpiar la promesa al terminar (éxito o error)
    // para que futuros 401 puedan intentar un nuevo refresh
    refreshPromise = null;
  });

  return refreshPromise;
};

// ═══════════════════════════════════════════════════════════
// 1. CREAR INSTANCIA DE AXIOS CON CONFIG BASE
// ═══════════════════════════════════════════════════════════

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 segundos
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
    // ── Problema 4: Sin respuesta del servidor ──────────────
    // Cubre timeouts, sin conexión y errores de red puros.
    // error.request existe cuando la petición se envió pero
    // no se recibió ninguna respuesta.
    if (!error.response) {
      if (error.request) {
        // Petición enviada pero sin respuesta (timeout / red caída)
        return Promise.reject(
          Object.assign(error, {
            isNetworkError: true,
            userMessage: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
          })
        );
      }
      // Error al configurar la petición (raro, ej: URL malformada)
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // ── Problema 1: Race condition en refresh token ─────────
    // Si error es 401 (token expirado) y NO es un retry,
    // usar refreshAccessToken() que serializa peticiones
    // concurrentes en una única llamada a /auth/refresh.
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        // Actualizar el header del request original
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Reintentar el request original
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Error al refrescar token → Hacer logout
        clearSession();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Otros errores - retornar como están
    return Promise.reject(error);
  }
);

export default apiClient;
