import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { saveSession } from "../helpers/authStorage.js";
import { getProfile } from "../services/authService.js";
import { useAlert } from "../../shared/alerts/useAlert.js";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setRole, setPermissions, setIsAuthenticated, } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const role = searchParams.get("role") || null; //  leer role de la URL

        if (!accessToken || !refreshToken) {
          throw new Error("Tokens no encontrados");
        }

        // Guardar temporalmente para que getProfile pueda usarlos
        localStorage.setItem(
          "session",
          JSON.stringify({ accessToken, refreshToken })
        );

        const profileResult = await getProfile();
        console.log( "PROFILE RESULT:", profileResult );

        if (!profileResult.success) {
          throw new Error("No se pudo obtener perfil");
        }

        //  Guardar sesión completa con rol
        saveSession({
          user: profileResult.user,
          role: profileResult.role,
          accessToken,
          refreshToken,
        });

        setUser(profileResult.user);
        setRole( profileResult.role || null );
        setPermissions( profileResult.permissions || [] ); 
        setIsAuthenticated(true);

        showSuccess("Bienvenido", profileResult.user.fullName);

          // ✅ Redirigir según rol
          const hasRole =

            profileResult.role
            &&
            (
              profileResult.role.idRole
              ||
              profileResult.role.id_role
            );

          const redirectTo =

            hasRole

              ? "/admin"

              : "/";

          navigate(redirectTo);

      } catch (error) {
        console.error("Error en AuthCallback:", error);

        // Limpiar sesión parcial si algo falló
        localStorage.removeItem("session");

        showError("Error", "No se pudo completar el inicio de sesión con Google");
        navigate("/login");
      }
    };

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900 mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Procesando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallback;