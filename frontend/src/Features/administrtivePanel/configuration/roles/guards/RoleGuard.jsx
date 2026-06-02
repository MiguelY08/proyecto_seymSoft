import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../../admin/roles/hooks/usePermissions";

export default function RoleGuard({

  permission,
  children,

}) {

  const {

    user,
    role,
    loading,

  } = useAuth();

  const {

    hasPermission,

  } = usePermissions();

  // Esperar carga inicial
  if (loading) {

    return null;

  }

  // No autenticado
  if (!user) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }

  // Validar existencia de rol
  if (!role) {

    return (

      <Navigate
        to="/"
        replace
      />

    );

  }

  // Validar permiso requerido
  if (

    permission &&
    !hasPermission(permission)

  ) {

    return (

      <Navigate
        to="/"
        replace
      />

    );

  }

  return children;

}