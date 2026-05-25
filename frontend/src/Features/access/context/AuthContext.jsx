import { createContext, useContext, useState, useEffect } from "react";
import { getSession, clearSession } from "../helpers/authStorage.js";
import { login as loginService, register as registerService, logout as logoutService, getProfile, updateProfile as updateProfileService } from "../services/authService.js";
import { useAlert } from "../../shared/alerts/useAlert.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { showSuccess, showError, showWarning, showInfo } = useAlert();

  // ═══════════════════════════════════════════════════════════
  // INICIALIZAR CONTEXTO
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const session = getSession();

        if (session && session.user) {
          setUser(session.user);
          setRole(session.role || null);
          setIsAuthenticated(true);

          const profileResult = await getProfile();
          
          if (profileResult.success) {
            setUser(profileResult.user);
            setRole(profileResult.role);
            setPermissions(profileResult.permissions || []);
          } else {
            clearSession();
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error("Error inicializando auth:", err);
        clearSession();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ═══════════════════════════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════════════════════════

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await loginService(email, password);

      if (result.success) {
        setUser(result.user);
        setRole(result.role);
        setPermissions(result.permissions || []);
        setIsAuthenticated(true);

        showSuccess("¡Bienvenido!", `Hola ${result.user.fullName}`);

        return {
          success: true,
          redirectTo: result.redirectTo || "/",
        };
      } else {
        setError(result.error);
        showError("Error de autenticación", result.error);

        return {
          success: false,
          error: result.error,
        };
      }

    } catch (err) {
      const errorMessage = "Error al iniciar sesión";
      setError(errorMessage);
      showError("Error", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // REGISTER - Acepta OBJETO { fullName, email, password, phone }
  // ═══════════════════════════════════════════════════════════

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // userData puede ser un objeto: { fullName, email, password, phone }
      const result = await registerService(userData);

      if (result.success) {
        setUser(result.user);
        setRole(null); // Nuevo usuario sin rol
        setPermissions([]);
        setIsAuthenticated(true);

        showSuccess("¡Bienvenido!", "Cuenta creada exitosamente");

        return {
          success: true,
          redirectTo: "/",
        };
      } else {
        setError(result.error);
        showError("Error en el registro", result.error);

        return {
          success: false,
          error: result.error,
        };
      }

    } catch (err) {
      const errorMessage = "Error al registrarse";
      setError(errorMessage);
      showError("Error", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════════════════

const logout = async () => {
  try {
    setLoading(true);

    await logoutService();

    // ✅ LIMPIAR sessionStorage
    sessionStorage.removeItem('recovery_email');

    setUser(null);
    setRole(null);
    setPermissions([]);
    setIsAuthenticated(false);
    setError(null);

    showSuccess("Sesión cerrada", "Hasta pronto");

    return {
      success: true,
    };

  } catch (err) {
    console.error("Error en logout:", err);
    
    //  LIMPIAR INCLUSO SI FALLA
    sessionStorage.removeItem('recovery_email');
    
    setUser(null);
    setRole(null);
    setPermissions([]);
    setIsAuthenticated(false);

    return {
      success: true,
    };
  } finally {
    setLoading(false);
  }
};
  // ═══════════════════════════════════════════════════════════
  // UPDATE PROFILE
  // ═══════════════════════════════════════════════════════════

  const updateProfile = async (changes) => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateProfileService(changes);

      if (result.success) {
        setUser(result.user);
        setRole(result.role);
        setPermissions(result.permissions || []);

        showSuccess("Perfil actualizado", "Tus cambios se guardaron correctamente");

        return {
          success: true,
          user: result.user,
        };
      } else {
        setError(result.error);
        showError("Error", result.error);

        return {
          success: false,
          error: result.error,
        };
      }

    } catch (err) {
      const errorMessage = "Error al actualizar perfil";
      setError(errorMessage);
      showError("Error", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // PROVIDER VALUE
  // ═══════════════════════════════════════════════════════════

  const value = {
    user,
    role,
    permissions,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }

  return context;
};