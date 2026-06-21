import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Features/access/context/AuthContext";
import Spinner from "../../Features/shared/spinner/Spinner.jsx";

export default function PublicRoute() {

  const {

    user,
    role,
    loading

  } = useAuth();

  // Esperar inicialización
  if (loading) {

    return (
      <Spinner
        message="Iniciando sesión..."
        className="min-h-screen bg-gray-100"
      />
    );

  }

  // Usuario autenticado
  if (user) {

    return (
      <Navigate
        to={role ? "/admin" : "/"}
        replace
      />
    );

  }

  // Usuario no autenticado
  return <Outlet />;

}
