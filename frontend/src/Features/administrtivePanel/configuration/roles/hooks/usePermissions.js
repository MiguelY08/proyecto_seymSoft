import { useMemo } from "react";
import { useAuth } from "../../../../access/context/AuthContext";

export function usePermissions() {

  const { permissions, role } = useAuth();

  // ─────────────────────────────────────
  // NORMALIZAR PERMISOS DEL BACKEND
  // Backend:
  // { module: "Usuarios", privilege: "CREATE" }
  //
  // Front:
  // "usuarios.crear"
  // ─────────────────────────────────────

  const normalizedPermissions = useMemo(() => {

    if (
      !permissions ||
      !Array.isArray(permissions)
    ) {

      return [];

    }

    return permissions.map((permission) => {

      const moduleName =
        permission.module
          ?.toLowerCase()
          ?.trim()
          ?.replaceAll(" ", "_");

      const privilegeName =
        permission.privilege
          ?.toLowerCase()
          ?.trim();

      // Mapeo backend → frontend
      const privilegeMap = {

        read: "ver",

        read_detail:
          "ver_informacion",

        create: "crear",

        update: "editar",

        delete: "eliminar",

        activate_deactivate:
          "activar_desactivar",

        export: "exportar",

        descargar: "descargar",

        abonar: "abonar",

        contactar: "contactar",

        generar_interes:
          "generar_interes",

        anular: "anular",

        devolver: "devolver",

        crear_devolucion:
          "crear_devolucion",

        ordenar: "ordenar",

        subir_imagen:
          "subir_imagen",

        ampliar_imagen:
          "ampliar_imagen"

      };

      const frontendPrivilege =
        privilegeMap[privilegeName];

      return `${moduleName}.${frontendPrivilege}`;

    });

  }, [permissions]);

  // ─────────────────────────────────────
  // VALIDAR PERMISO
  // ─────────────────────────────────────

  const hasPermission = (permission) => {

    if (!permission) {
      return false;
    }

    const roleName =
      role?.nameRole ||
      role?.name ||
      role?.role;

    if (
      permission === "dashboard.ver" &&
      roleName === "Administrador"
    ) {
      return true;
    }

    return normalizedPermissions.includes(
      permission
    );

  };

  // ─────────────────────────────────────
  // VALIDAR ALGUNO
  // ─────────────────────────────────────

  const hasAnyPermission = (
    permissions = []
  ) => {

    if (
      !Array.isArray(permissions)
      ||
      permissions.length === 0
    ) {

      return false;

    }

    return permissions.some((permission) =>
      hasPermission(permission)
    );

  };

  // ─────────────────────────────────────
  // VALIDAR TODOS
  // ─────────────────────────────────────

  const hasAllPermissions = (
    permissions = []
  ) => {

    if (
      !Array.isArray(permissions)
      ||
      permissions.length === 0
    ) {

      return false;

    }

    return permissions.every((permission) =>
      hasPermission(permission)
    );

  };

  return {

    permissions:
      normalizedPermissions,

    hasPermission,

    hasAnyPermission,

    hasAllPermissions,

  };

}
