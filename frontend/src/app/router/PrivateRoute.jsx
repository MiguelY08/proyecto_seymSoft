// PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Features/access/context/AuthContext";

export default function PrivateRouter() {

  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // si está logueado pero no tiene rol → landing
  if (!user.role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}