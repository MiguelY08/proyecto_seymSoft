import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Features/access/context/AuthContext";

export default function PublicRoute() {

  const {

    user,
    role,
    loading

  } = useAuth();

  // Esperar inicialización
  if (loading) {

    return null;

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