import apiClient from "../../../setting/apiClient.js";
import { saveSession, clearSession, getSession } from "../helpers/authStorage.js";

/**
 * AUTH SERVICES - CORRECTO
 * 
 * Endpoints:
 * - POST /auth/register     → { full_name, email, pass_word, phone }
 * - POST /auth/login        → { email, pass_word }
 * - POST /auth/logout       → {}
 * - GET /auth/me            → {}
 * - PUT /auth/profile       → { full_name, email, phone, pass_word... }
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 */

// ═══════════════════════════════════════════════════════════
// REGISTER - Registrar nuevo usuario
// ═══════════════════════════════════════════════════════════

export const register = async (userData) => {
  try {
    // userData: { fullName, email, password, phone }
    // Convertir a snake_case para el backend

    const response = await apiClient.post("/auth/register", {
      full_name: userData.fullName,        // ✅ full_name (snake_case)
      email: userData.email,
      pass_word: userData.password,        // ✅ pass_word (snake_case)
      phone: userData.phone,
    });

    // Backend retorna: { user, accessToken, refreshToken }
    const { user, accessToken, refreshToken } = response.data.data;

    // Guardar en localStorage
    saveSession({
      user,
      accessToken,
      refreshToken,
    });

    return {
      success: true,
      user,
      accessToken,
      refreshToken,
    };

  } catch (error) {
    console.error("Error en register:", error);

    const errorMessage = error.response?.data?.message || "Error al registrarse";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// LOGIN - Iniciar sesión
// ═══════════════════════════════════════════════════════════

export const login = async (email, password) => {
  try {
    const response = await apiClient.post("/auth/login", {
      email,
      pass_word: password,               // ✅ pass_word (snake_case)
    });

    // Backend retorna: { user, role, permissions, accessToken, refreshToken }
    const { user, role, permissions, accessToken, refreshToken } = response.data.data;

    // Guardar en localStorage
    saveSession({
      user,
      role,
      accessToken,
      refreshToken,
    });

    return {
      success: true,
      user,
      role,
      permissions,
      accessToken,
      refreshToken,
      redirectTo: role ? "/admin" : "/",
    };

  } catch (error) {
    console.error("Error en login:", error);

    const errorMessage = error.response?.data?.message || "Email o contraseña incorrectos";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// LOGOUT - Cerrar sesión
// ═══════════════════════════════════════════════════════════

export const logout = async () => {
  try {
    const session = getSession();
    
    // Intentar notificar al backend
    if (session?.refreshToken) {
      await apiClient.post("/auth/logout", {
        refresh_token: session.refreshToken,
      });
    }

  } catch (error) {
    console.error("Error en logout:", error);
    // Aunque falle, limpiamos el frontend
  } finally {
    clearSession();
    return {
      success: true,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// GET PROFILE - Obtener perfil del usuario logueado
// ═══════════════════════════════════════════════════════════

export const getProfile = async () => {
  try {
    const response = await apiClient.get("/auth/me");

    const { user, role, permissions } = response.data.data;

    return {
      success: true,
      user,
      role,
      permissions,
    };

  } catch (error) {
    console.error("Error en getProfile:", error);

    // Si error es 401, la sesión expiró
    if (error.response?.status === 401) {
      clearSession();
    }

    return {
      success: false,
      error: "Error al obtener perfil",
    };
  }
};

// ═══════════════════════════════════════════════════════════
// UPDATE PROFILE - Actualizar datos del usuario
// ═══════════════════════════════════════════════════════════

export const updateProfile = async (changes) => {
  try {
    // changes: { fullName, email, phone, ... }
    // Convertir a snake_case para el backend
    
    const body = {};
    
    if (changes.fullName !== undefined) {
      body.full_name = changes.fullName;
    }
    if (changes.email !== undefined) {
      body.email = changes.email;
    }
    if (changes.phone !== undefined) {
      body.phone = changes.phone;
    }
    if (changes.currentPassword !== undefined) {
      body.current_password = changes.currentPassword;
    }
    if (changes.newPassword !== undefined) {
      body.pass_word = changes.newPassword;
    }
    if (changes.confirmPassword !== undefined) {
      body.confirm_password = changes.confirmPassword;
    }

    const response = await apiClient.put("/auth/profile", body);

    const { user, role, permissions } = response.data.data;

    // Actualizar localStorage
    const currentSession = getSession();
    saveSession({
      ...currentSession,
      user,
      role,
      permissions,
    });

    return {
      success: true,
      user,
      role,
      permissions,
    };

  } catch (error) {
    console.error("Error en updateProfile:", error);

    return {
      success: false,
      error: error.response?.data?.message || "Error al actualizar perfil",
    };
  }
};

// ═══════════════════════════════════════════════════════════
// FORGOT PASSWORD - Solicitar reset de contraseña
// ═══════════════════════════════════════════════════════════

export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });

    return {
      success: true,
      message: response.data.message,
    };

  } catch (error) {
    console.error("Error en forgotPassword:", error);

    const errorMessage = error.response?.data?.message || "Error al solicitar reset";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// RESET PASSWORD - Resetear contraseña con código
// ═══════════════════════════════════════════════════════════

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      new_password: newPassword,        // ✅ snake_case como espera backend
      confirm_password: newPassword     // ✅ REQUERIDO por schema
    });

    return {
      success: true,
      message: response.data.message,
    };

  } catch (error) {
    console.error("Error en resetPassword:", error);

    const errorMessage = error.response?.data?.message || "Error al resetear contraseña";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// GOOGLE LOGIN - Manejar Google OAuth callback
// ═══════════════════════════════════════════════════════════

export const googleLogin = (accessToken, refreshToken) => {
  try {
    saveSession({
      accessToken,
      refreshToken,
    });

    return {
      success: true,
    };

  } catch (error) {
    console.error("Error en googleLogin:", error);

    return {
      success: false,
      error: "Error al procesar login de Google",
    };
  }
};