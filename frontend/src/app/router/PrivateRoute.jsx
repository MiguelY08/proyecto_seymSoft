import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Features/access/context/AuthContext";

export default function PrivateRoute({ requireRole = true }) {

  // Obtenemos el usuario autenticado del contexto
  const { user } = useAuth();

  // validar si el usuario existe para dirigirlo 
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && !user.role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}