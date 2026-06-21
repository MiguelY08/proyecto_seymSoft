import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Features/access/context/AuthContext";
import Spinner from "../../Features/shared/spinner/Spinner.jsx";

export default function PrivateRoute({ requireRole = true }) {

  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <Spinner
        message="Cargando sesión..."
        className="min-h-screen bg-gray-100"
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //  AQUÍ está el fix real
  if (requireRole && !role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
