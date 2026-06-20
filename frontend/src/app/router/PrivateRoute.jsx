import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Features/access/context/AuthContext";

export default function PrivateRoute({ requireRole = true }) {

  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //  AQUÍ está el fix real
  if (requireRole && !role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
