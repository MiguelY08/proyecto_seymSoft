import { useMemo } from "react";
import { useAuth } from "../../../../access/context/AuthContext";

/**
 * Hook para trabajar con permisos (strings) del usuario actual.
 *
 * Se apoya en el contexto de Auth (que expone `user.permissions`).
 *
 * Ejemplo:
 *   const { hasPermission } = usePermissions();
 *   if (!hasPermission("roles.ver")) return null;
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(
    () => (user?.permissions ? [...user.permissions] : []),
    [user?.permissions],
  );

  // NOTE: Por ahora no se están aplicando restricciones a nivel de acciones/botones.
  // Esto evita que botones desaparezcan mientras no se implemente la lógica de privilegios.
  const hasPermission = (_perm) => {
    return true;
  };

  const hasAnyPermission = (perms = []) => {
    if (!Array.isArray(perms) || perms.length === 0) return false;
    return perms.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (perms = []) => {
    if (!Array.isArray(perms) || perms.length === 0) return false;
    return perms.every((perm) => hasPermission(perm));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
