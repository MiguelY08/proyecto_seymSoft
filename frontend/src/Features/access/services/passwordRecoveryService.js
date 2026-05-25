import apiClient from "../../../setting/apiClient.js";

/**
 * PASSWORD RECOVERY SERVICE - REFACTORIZADO
 * 
 * Métodos:
 * - requestPasswordRecovery(email)  → POST /auth/forgot-password
 * - resetPassword(token, password)  → POST /auth/reset-password
 * - verifyRecoveryCode(code)        → Valida código en localStorage
 * 
 * Backend envía código por email
 * Frontend valida y luego resetea
 */

const RECOVERY_KEY = "pm_password_recovery";

// ═══════════════════════════════════════════════════════════════════════════
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ═══════════════════════════════════════════════════════════════════════════

export const requestPasswordRecovery = async (email) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    });

    // Guardar en localStorage para tracking
    const recoveryData = {
      email,
      requestedAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
    };

    localStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryData));

    return {
      success: true,
      message: response.data.message,
    };

  } catch (error) {
    console.error("Error en requestPasswordRecovery:", error);

    const errorMessage = error.response?.data?.message || 
                        "Error al solicitar recuperación de contraseña";

    throw new Error(errorMessage);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICAR CÓDIGO (Valida el código ingresado por usuario)
// ═══════════════════════════════════════════════════════════════════════════

export const verifyRecoveryCode = (code) => {
  const recovery = JSON.parse(localStorage.getItem(RECOVERY_KEY));

  if (!recovery) {
    throw new Error("No hay solicitud activa de recuperación");
  }

  if (Date.now() > recovery.expiresAt) {
    localStorage.removeItem(RECOVERY_KEY);
    throw new Error("El código expiró. Solicita uno nuevo");
  }

  // Nota: El código real está en el email del usuario
  // Esta función es más para validar que existe una sesión de recuperación
  // El backend validará el token real en reset-password

  return recovery.email;
};

// ═══════════════════════════════════════════════════════════════════════════
// RESETEAR CONTRASEÑA
// ═══════════════════════════════════════════════════════════════════════════

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiClient.post("/auth/reset-password", {
      token: token.trim(),
      newPassword: newPassword.trim(),
    });

    // Limpiar localStorage después del éxito
    localStorage.removeItem(RECOVERY_KEY);

    return {
      success: true,
      message: response.data.message || "Contraseña actualizada exitosamente",
    };

  } catch (error) {
    console.error("Error en resetPassword:", error);

    const errorMessage = error.response?.data?.message || 
                        "Error al resetear la contraseña";

    throw new Error(errorMessage);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICAR SI HAY RECUPERACIÓN ACTIVA
// ═══════════════════════════════════════════════════════════════════════════

export const hasActiveRecovery = () => {
  const recovery = JSON.parse(localStorage.getItem(RECOVERY_KEY));

  if (!recovery) return false;

  if (Date.now() > recovery.expiresAt) {
    localStorage.removeItem(RECOVERY_KEY);
    return false;
  }

  return true;
};

// ═══════════════════════════════════════════════════════════════════════════
// OBTENER TIEMPO RESTANTE
// ═══════════════════════════════════════════════════════════════════════════

export const getTimeRemaining = () => {
  const recovery = JSON.parse(localStorage.getItem(RECOVERY_KEY));

  if (!recovery) return 0;

  const remaining = recovery.expiresAt - Date.now();
  return remaining > 0 ? Math.floor(remaining / 1000) : 0;
};

// ═══════════════════════════════════════════════════════════════════════════
// LIMPIAR RECUPERACIÓN
// ═══════════════════════════════════════════════════════════════════════════

export const clearRecovery = () => {
  localStorage.removeItem(RECOVERY_KEY);
};