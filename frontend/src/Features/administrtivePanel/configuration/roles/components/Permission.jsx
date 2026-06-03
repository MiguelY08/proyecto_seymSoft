
import { usePermissions } from "../hooks/usePermissions";

export default function Permission({

  permission,
  children,
  fallback = null

}) {

  const {
    hasPermission
  } = usePermissions();

  //  SI NO HAY PERMISO
  if (
    !hasPermission(permission)
  ) {

    return fallback;

  }

  // RENDERIZAR CONTENIDO
  return children;

}

