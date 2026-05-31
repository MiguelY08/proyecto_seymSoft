// ─────────────────────────────────────────────
// REGLAS DE PRIVILEGIOS POR MÓDULO
// ─────────────────────────────────────────────

const MODULE_RULES = {

  usuarios: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "DELETE",
    "ACTIVATE_DEACTIVATE"
  ],

  roles: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "DELETE",
    "ACTIVATE_DEACTIVATE"
  ],

  clientes: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "DELETE",
    "ACTIVATE_DEACTIVATE"
  ],

  productos: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "DELETE",
    "ACTIVATE_DEACTIVATE",
    "EXPORT"
  ],

  categorias: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "DELETE",
    "ACTIVATE_DEACTIVATE"
  ],

  proveedores: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "DELETE",
    "ACTIVATE_DEACTIVATE"
  ],

  compras: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "ANULAR",
    "DEVOLVER",
    "EXPORT",
    "CREAR_DEVOLUCION"
  ],

  producto_no_conforme: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "DELETE",
    "EXPORT",
    "ANULAR"
  ],

  pedidos: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "ANULAR",
    "EXPORT"
  ],

  ventas: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "ANULAR",
    "EXPORT",
    "CREAR_DEVOLUCION"
  ],

  devoluciones_en_ventas: [
    "CREATE",
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "ANULAR",
    "EXPORT"
  ],

  pagos_y_abonos: [
    "READ",
    "READ_DETAIL",
    "ABONAR",
    "GENERAR_INTERES",
    "CONTACTAR",
    "EXPORT",
    "DESCARGAR",
    "ANULAR"
  ],

  banners: [
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "DELETE",
    "ORDENAR",
    "SUBIR_IMAGEN",
    "ACTIVATE_DEACTIVATE"
  ],

  devoluciones_en_compras: [
    "READ",
    "READ_DETAIL",
    "UPDATE",
    "ANULAR",
    "EXPORT"
  ],

  dashboard: [
    "READ"
  ]

};

// ─────────────────────────────────────────────
// LABELS EN ESPAÑOL
// ─────────────────────────────────────────────

const PRIVILEGE_LABELS = {

  CREATE:
    "Crear",

  READ:
    "Ver listado",

  READ_DETAIL:
    "Ver detalle",

  UPDATE:
    "Editar",

  DELETE:
    "Eliminar",

  ACTIVATE_DEACTIVATE:
    "Activar / Desactivar",

  EXPORT:
    "Exportar",

  CONTACTAR:
    "Contactar",

  ANULAR:
    "Anular",

  DEVOLVER:
    "Devolver",

  CREAR_DEVOLUCION:
    "Crear devolución",

  ABONAR:
    "Registrar abono",

  GENERAR_INTERES:
    "Generar interés",

  ORDENAR:
    "Ordenar",

  SUBIR_IMAGEN:
    "Subir imagen",

  DESCARGAR:
    "Descargar"

};

// ─────────────────────────────────────────────
// MAPEAR ROL API → FRONT
// ─────────────────────────────────────────────

export const mapRoleFromApi = (
  role
) => {

  return {

    id:
      role.id_role,

    name:
      role.name_role,

    description:
      role.description,

    createdAt:
      role.date_creation,

    active:
      role.id_status === 1,

    isAdmin:
      role.is_admin,

    totalPermissions:
      role.total_permissions,

    // ✅ MAPEAR PERMISOS
    permisos:

      (role.assigned_permissions || [])
        .map((permiso) => ({

          id_module:
            permiso.id_module,

          id_privilege:
            permiso.id_privilege

        }))

  };

};




// ─────────────────────────────────────────────
// MAPEAR LISTA DE ROLES
// ─────────────────────────────────────────────

export const mapRolesFromApi = (roles = []) => {

  return roles.map(
    mapRoleFromApi
  );

};

// ─────────────────────────────────────────────
// MAPEAR PERMISOS API → FRONT
// ─────────────────────────────────────────────

export const mapPermissionsFromApi = (data) => {

  const modules =
    data.modules || [];

  return modules.map((module) => {

    const moduleName =
      module.name_module
        .toLowerCase();

    const allowedPrivileges =
      MODULE_RULES[moduleName] ||

      (module.actions || []).map(
        (a) => a.name_privilege
      );

    const acciones =
      (module.actions || [])

        .filter((action) =>

          allowedPrivileges.includes(
            action.name_privilege
          )

        )

        .map((action) => ({

          key:
            action.name_privilege
              .toLowerCase(),

          backend:
            action.name_privilege,

          id_privilege:
            action.id_privilege,

          label:

            PRIVILEGE_LABELS[
              action.name_privilege
            ] ||

            action.name_privilege
              .replaceAll("_", " ")

        }));

    return {

      id:
        module.id_module,

      modulo:
        moduleName,

      descripcion:
        module.description,

      acciones

    };

  });

};

// ─────────────────────────────────────────────
// MAPEAR FRONT → API
// ─────────────────────────────────────────────

export const mapRoleToApi = (
  role
) => {

  const permissions = [];

  role.permisos.forEach(
    (modulo) => {

      Object.entries(

        modulo.selectedActions || {}

      ).forEach(

        ([accionKey, activo]) => {

          if (!activo)
            return;

          const actionData =

            modulo.acciones.find(

              (accion) =>

                accion.key ===
                accionKey

            );

          if (!actionData)
            return;

          permissions.push({

            id_module:
              modulo.id,

            id_privilege:
              actionData.id_privilege

          });

        }

      );

    }

  );

  return {

    name_role:
      role.name,

    description:
      role.description,

    permissions

  };

};