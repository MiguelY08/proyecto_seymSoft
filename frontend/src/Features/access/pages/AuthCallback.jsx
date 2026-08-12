import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { saveSession } from "../helpers/authStorage.js";
import { getProfile } from "../services/authService.js";
import { useAlert } from "../../shared/alerts/useAlert.js";
import Spinner from "../../shared/spinner/Spinner.jsx"; 

const AuthCallback = () => {
  const callbackProcessedRef = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setRole, setPermissions, setIsAuthenticated,setClient, setRequiresPasswordSetup  } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    if (callbackProcessedRef.current) return;
    callbackProcessedRef.current = true;

    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        if (!accessToken || !refreshToken) {
          throw new Error("Tokens no encontrados");
        }

        localStorage.setItem(
          "session",
          JSON.stringify({ accessToken, refreshToken })
        );

        const profileResult = await getProfile();

        if (!profileResult.success) {
          throw new Error("No se pudo obtener perfil");
        }

        saveSession({
          user: profileResult.user,
          role: profileResult.role,
          permissions: profileResult.permissions || [],
          accessToken,
          refreshToken,
          client: profileResult.client,
          requiresPasswordSetup: profileResult.requiresPasswordSetup
          
        });

        setUser(profileResult.user);
        setRole( profileResult.role || null );
        setPermissions( profileResult.permissions || [] ); 
        setIsAuthenticated(true);
        setClient( profileResult.client || null );
        setRequiresPasswordSetup( profileResult.requiresPasswordSetup || false );

        showSuccess("Bienvenido", profileResult.user.fullName);

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

        localStorage.removeItem("session");

        showError("Error", "No se pudo completar el inicio de sesión con Google");
        navigate("/login");
      }
    };

    handleCallback();
  }, []);

  // ✅ SPINNER AQUÍ
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner message="Procesando autenticación con Google..." />
    </div>
  );
};

export default AuthCallback;
