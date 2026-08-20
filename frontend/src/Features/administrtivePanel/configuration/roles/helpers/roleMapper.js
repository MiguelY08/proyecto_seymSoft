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
    "ACTIVATE_DEACTIVATE",
    "EXPORT"
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
    "DELETE",
    "ORDENAR",
    "SUBIR_IMAGEN",
    "ACTIVATE_DEACTIVATE",
    "AMPLIAR_IMAGEN"
  ],

  devoluciones_en_compras: [
    "CREATE",
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
    "Descargar",
  
  AMPLIAR_IMAGEN:
    "Ampliar imagen"

};

const getPrivilegeLabel = (
  moduleName,
  privilegeName
) => {

  if (
    moduleName === "dashboard" &&
    privilegeName === "READ"
  ) {

    return "Visualizar metricas de inicio";

  }

  return (
    PRIVILEGE_LABELS[privilegeName] ||
    privilegeName.replaceAll("_", " ")
  );

};

// ─────────────────────────────────────────────
// MAPEAR ROL API → FRONT
// ─────────────────────────────────────────────

const getRoleValue = (role, keys, fallback = null) => {
  for (const key of keys) {
    if (role?.[key] !== undefined && role?.[key] !== null) {
      return role[key];
    }
  }

  return fallback;
};

const getRolePermissions = (role, originalRole) =>
  getRoleValue(
    role,
    [
      "assigned_permissions",
      "assignedPermissions",
      "permissions",
      "permisos",
    ],
    getRoleValue(
      originalRole,
      [
        "assigned_permissions",
        "assignedPermissions",
        "permissions",
        "permisos",
      ],
      []
    )
  );

const mapAssignedPermission = (permission) => ({
  id_module:
    permission.id_module ??
    permission.idModule ??
    permission.module_id ??
    permission.moduleId ??
    permission.module?.id_module ??
    permission.module?.id ??
    null,

  id_privilege:
    permission.id_privilege ??
    permission.idPrivilege ??
    permission.privilege_id ??
    permission.privilegeId ??
    permission.privilege?.id_privilege ??
    permission.privilege?.id ??
    null,
});

const mapRoleActive = (statusId, activeValue) => {
  if (statusId !== null) {
    return Number(statusId) === 1;
  }

  if (activeValue === null) {
    return true;
  }

  if (typeof activeValue === "string") {
    const normalized = activeValue.trim().toLowerCase();

    if (["inactivo", "inactive", "false", "0"].includes(normalized)) {
      return false;
    }

    if (["activo", "active", "true", "1"].includes(normalized)) {
      return true;
    }
  }

  return Boolean(activeValue);
};

export const mapRoleFromApi = (
  role = {}
) => {

  const sourceRole =
    role.role ||
    role.data ||
    role;

  const statusId =
    getRoleValue(
      sourceRole,
      ["id_status", "idStatus"],
      null
    );

  const activeValue =
    getRoleValue(
      sourceRole,
      ["active", "isActive", "status"],
      null
    );

  const permissions =
    getRolePermissions(
      sourceRole,
      role
    );

  return {

    id:
      getRoleValue(
        sourceRole,
        ["id_role", "idRole", "id"]
      ),

    name:
      getRoleValue(
        sourceRole,
        ["name_role", "nameRole", "name"],
        ""
      ),

    description:
      getRoleValue(
        sourceRole,
        ["description"],
        ""
      ),

    createdAt:
      getRoleValue(
        sourceRole,
        ["date_creation", "dateCreation", "createdAt", "created_at"],
        null
      ),

    active:
      mapRoleActive(
        statusId,
        activeValue
      ),

    isAdmin:
      Boolean(
        getRoleValue(
          sourceRole,
          ["is_admin", "isAdmin"],
          false
        )
      ),

    totalPermissions:
      getRoleValue(
        sourceRole,
        ["total_permissions", "totalPermissions"],
        Array.isArray(permissions) ? permissions.length : 0
      ),

    // ✅ MAPEAR PERMISOS
    permisos:

      (Array.isArray(permissions) ? permissions : [])
        .map(mapAssignedPermission)
        .filter(
          (permission) =>
            permission.id_module !== null &&
            permission.id_privilege !== null
        )

        

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
            getPrivilegeLabel(
              moduleName,
              action.name_privilege
            )

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
