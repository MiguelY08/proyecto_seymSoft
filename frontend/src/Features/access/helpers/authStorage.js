/**
 * AUTH STORAGE - SIMPLIFICADO Y MEJORADO
 * 
 * Gestiona:
 * - Sesión del usuario (user + role + tokens)
 * - Tokens de forma segura
 * - Validación de datos
 * 
 * Métodos:
 * - saveSession(data)      → Guardar sesión completa
 * - getSession()           → Obtener sesión completa
 * - clearSession()         → Limpiar sesión
 * - saveTokens(access, refresh) → Guardar solo tokens
 * - getAccessToken()       → Obtener access token
 * - getRefreshToken()      → Obtener refresh token
 * - getUser()              → Obtener solo usuario
 * - updateUser(userData)   → Actualizar usuario sin perder tokens
 */

const SESSION_KEY = "session";

// ═══════════════════════════════════════════════════════════
// GUARDAR SESIÓN COMPLETA
// ═══════════════════════════════════════════════════════════

export const saveSession = (sessionData) => {
  try {
    if (!sessionData) {
      console.error("Intentando guardar sesión vacía");
      return false;
    }

    // Validar que tenga al menos los campos básicos
    if (!sessionData.user || !sessionData.accessToken) {
      console.error("Sesión incompleta. Faltan campos requeridos");
      return false;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return true;

  } catch (error) {
    console.error("Error guardando sesión:", error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════
// OBTENER SESIÓN COMPLETA
// ═══════════════════════════════════════════════════════════

export const getSession = () => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;

  } catch (error) {
    console.error("Error leyendo sesión:", error);
    // Si hay error, limpiar sesión corrupta
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// OBTENER SOLO EL USUARIO
// ═══════════════════════════════════════════════════════════

export const getUser = () => {
  try {
    const session = getSession();
    return session?.user || null;

  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// OBTENER ACCESS TOKEN
// ═══════════════════════════════════════════════════════════

export const getAccessToken = () => {
  try {
    const session = getSession();
    return session?.accessToken || null;

  } catch (error) {
    console.error("Error obteniendo access token:", error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// OBTENER REFRESH TOKEN
// ═══════════════════════════════════════════════════════════

export const getRefreshToken = () => {
  try {
    const session = getSession();
    return session?.refreshToken || null;

  } catch (error) {
    console.error("Error obteniendo refresh token:", error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// GUARDAR SOLO TOKENS (Sin perder usuario y rol)
// ═══════════════════════════════════════════════════════════

export const saveTokens = (accessToken, refreshToken) => {
  try {
    const session = getSession();

    if (!session) {
      console.error("No hay sesión para actualizar tokens");
      return false;
    }

    const updatedSession = {
      ...session,
      accessToken,
      refreshToken,
    };

    return saveSession(updatedSession);

  } catch (error) {
    console.error("Error guardando tokens:", error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════
// ACTUALIZAR USUARIO (Sin perder tokens)
// ═══════════════════════════════════════════════════════════

export const updateUser = (userData) => {
  try {
    const session = getSession();

    if (!session) {
      console.error("No hay sesión para actualizar usuario");
      return false;
    }

    const updatedSession = {
      ...session,
      user: {
        ...session.user,
        ...userData,
      },
    };

    return saveSession(updatedSession);

  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════
// ACTUALIZAR ROL Y PERMISOS
// ═══════════════════════════════════════════════════════════

export const updateRole = (roleData, permissionsData) => {
  try {
    const session = getSession();

    if (!session) {
      console.error("No hay sesión para actualizar rol");
      return false;
    }

    const updatedSession = {
      ...session,
      role: roleData,
      permissions: permissionsData || [],
    };

    return saveSession(updatedSession);

  } catch (error) {
    console.error("Error actualizando rol:", error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════
// LIMPIAR SESIÓN (LOGOUT)
// ═══════════════════════════════════════════════════════════

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
    return true;

  } catch (error) {
    console.error("Error limpiando sesión:", error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════
// VERIFICAR SI ESTÁ AUTENTICADO
// ═══════════════════════════════════════════════════════════

export const isAuthenticated = () => {
  const session = getSession();
  return !!(session && session.user && session.accessToken);
};

// ═══════════════════════════════════════════════════════════
// LIMPIAR DATOS SENSIBLES (Por seguridad)
// ═══════════════════════════════════════════════════════════

export const sanitizeSession = () => {
  try {
    const session = getSession();

    if (!session) return null;

    // Retornar sesión sin datos sensibles (si es necesario)
    return {
      user: session.user,
      role: session.role,
      // NO retornar tokens
    };

  } catch (error) {
    console.error("Error sanitizando sesión:", error);
    return null;
  }
};