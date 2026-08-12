import axios from "axios";
import {
  getSession,
  saveSession,
  clearSession,
} from "../Features/access/helpers/authStorage.js";

/**
 * API CLIENT - CONFIGURACIÓN CENTRALIZADA
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// ═══════════════════════════════════════════════════════════
// DETECCIÓN EXPLÍCITA DE "REFRESH TOKEN INVÁLIDO"
// clearSession() SOLO debe dispararse cuando el backend
// confirma explícitamente que el refresh token es inválido,
// expiró o fue revocado. Nunca por error de red/500/timeout.
// ═══════════════════════════════════════════════════════════

const REFRESH_INVALID_REGEX =
  /refresh token expired|refresh token invalid|expired or invalid|revoked/i;

function isExplicitRefreshTokenMessage(data) {
  const message = data?.message || data?.error || "";
  return REFRESH_INVALID_REGEX.test(message);
}

/**
 * Determina si el fallo del intento de refresh es un rechazo
 * EXPLÍCITO del backend, o un problema transitorio (red, timeout,
 * 500, respuesta inesperada, excepción). Solo en el primer caso
 * se debe cerrar la sesión.
 */
function isRefreshEndpointRejection(err) {
  if (!err) return false;

  // No había refresh token guardado: no hay nada que preservar
  if (err.message === "NO_REFRESH_TOKEN") return true;

  // Sin err.response = error de red, timeout, o el request nunca
  // llegó a completarse. NO es un rechazo explícito del backend.
  if (!err.response) return false;

  // Mensaje explícito del backend
  if (isExplicitRefreshTokenMessage(err.response.data)) return true;

  // El propio endpoint /auth/refresh respondiendo 401/403 significa
  // que el refresh token fue rechazado por el backend.
  const status = err.response.status;
  if (status === 401 || status === 403) return true;

  // Cualquier otro caso (500, 502, 503, respuesta rara) => NO cerrar sesión
  return false;
}

// ═══════════════════════════════════════════════════════════
// CONTROL DE RACE CONDITION EN REFRESH TOKEN
// ═══════════════════════════════════════════════════════════

let refreshPromise = null;

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const session = getSession();

    if (!session || !session.refreshToken) {
      throw new Error("NO_REFRESH_TOKEN");
    }

    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: session.refreshToken,
    });

    const { accessToken, refreshToken } = response.data?.data || {};

    // ── Validación antes de sobrescribir la sesión ──────────
    // Si falta accessToken o refreshToken, NO se sobrescribe
    // la sesión actual.
    if (!accessToken || !refreshToken) {
      console.error(
        "REFRESH: respuesta del backend incompleta, no se sobrescribe la sesión.",
        response.data,
      );
      const invalidResponseError = new Error("INVALID_REFRESH_RESPONSE");
      invalidResponseError.isInvalidRefreshResponse = true;
      throw invalidResponseError;
    }

    saveSession({
      ...session,
      accessToken,
      refreshToken,
    });

    return accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

// ═══════════════════════════════════════════════════════════
// 1. CREAR INSTANCIA DE AXIOS CON CONFIG BASE
// ═══════════════════════════════════════════════════════════

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ═══════════════════════════════════════════════════════════
// INTERCEPTOR DE REQUEST
// ═══════════════════════════════════════════════════════════

apiClient.interceptors.request.use(
  (config) => {
    const session = getSession();

    if (session && session.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ═══════════════════════════════════════════════════════════
// INTERCEPTOR DE RESPONSE
// ═══════════════════════════════════════════════════════════

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ── Sin respuesta del servidor (timeout / red caída) ────
    // NUNCA cerrar sesión: el refresh token puede seguir siendo válido.
    if (!error.response) {
      if (error.request) {
        return Promise.reject(
          Object.assign(error, {
            isNetworkError: true,
            userMessage:
              "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
          }),
        );
      }
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // ── Rechazo explícito del refresh token en CUALQUIER endpoint ──
    if (isExplicitRefreshTokenMessage(error.response.data)) {
      clearSession();
      sessionStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    const authEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/check-email",
      "/auth/logout",
      "/auth/refresh",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];

    const isAuthRequest = authEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint),
    );

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("REFRESH TOKEN ERROR:", refreshError);

        // ── SOLO cerrar sesión si el rechazo es EXPLÍCITO ───────
        // 500, timeout, red caída, respuesta inesperada o excepción
        // al procesar => la sesión se conserva.
        if (isRefreshEndpointRejection(refreshError)) {
          clearSession();
          sessionStorage.clear();
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
