import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Features/access/context/AuthContext";

export default function PublicRoute() {

  const { user } = useAuth();

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}