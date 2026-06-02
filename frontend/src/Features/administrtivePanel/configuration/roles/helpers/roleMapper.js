// ─────────────────────────────────────────────
// PRIVILEGIOS BACKEND → FRONT
// ─────────────────────────────────────────────

const privilegeKeyMap = {

  CREATE: "crear",

  READ: "ver",

  READ_DETAIL: "ver_informacion",

  UPDATE: "editar",

  DELETE: "eliminar",

  ACTIVATE_DEACTIVATE:
    "activar_desactivar",

  EXPORT: "exportar",

  ABONAR: "abonar",

  CONTACTAR: "contactar",

  GENERAR_INTERES:
    "generar_interes",

  ANULAR: "anular",

  DEVOLVER: "devolver",

  CREAR_DEVOLUCION:
    "crear_devolucion",

  ORDENAR: "ordenar",

  SUBIR_IMAGEN:
    "subir_imagen"

};

// ─────────────────────────────────────────────
// PRIVILEGIOS FRONT → BACKEND
// ─────────────────────────────────────────────

const privilegeIdMap = {

  crear: 1,

  ver: 2,

  ver_informacion: 3,

  editar: 4,

  eliminar: 5,

  activar_desactivar: 6,

  exportar: 7,

  abonar: 8,

  contactar: 9,

  generar_interes: 10,

  anular: 11,

  devolver: 12,

  crear_devolucion: 13,

  ordenar: 14,

  subir_imagen: 15

};

// ─────────────────────────────────────────────
// MAPEAR ROL API → FRONT
// ─────────────────────────────────────────────

export const mapRoleFromApi = (role) => {

  // convertir permisos backend
  // a estructura visual frontend

  const groupedPermissions = {};

  (role.permissions || []).forEach(

    (permission) => {

      const moduleId =
        permission.id_module;

      const privilegeKey =
        privilegeKeyMap[
          permission.privilege
        ];

      if (!privilegeKey) return;

      if (!groupedPermissions[moduleId]) {

        groupedPermissions[moduleId] = {

          id: moduleId,

          acciones: {}

        };

      }

      groupedPermissions[moduleId]
        .acciones[privilegeKey] = true;

    }

  );

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

    permisos:
      Object.values(
        groupedPermissions
      )

  };

};

// ─────────────────────────────────────────────
// MAPEAR LISTA API → FRONT
// ─────────────────────────────────────────────

export const mapRolesFromApi = (
  roles = []
) => {

  return roles.map(
    mapRoleFromApi
  );

};

// ─────────────────────────────────────────────
// MAPEAR PERMISOS API → FRONT
// ─────────────────────────────────────────────

export const mapPermissionsFromApi = (
  data
) => {

  const modules =
    data.modules || [];

  const privileges =
    data.privileges || [];

  return modules.map((module) => ({

    id:
      module.id_module,

    modulo:
      module.name_module
        .toLowerCase(),

    descripcion:
      module.description,

    acciones:
      privileges.map((privilege) => ({

        key:

          privilegeKeyMap[
            privilege.name_privilege
          ] ||

          privilege.name_privilege
            .toLowerCase(),

        backend:
          privilege.name_privilege,

        id_privilege:
          privilege.id_privilege,

        label:
          privilege.name_privilege
            .replaceAll("_", " ")

      }))

  }));

};

// ─────────────────────────────────────────────
// MAPEAR FRONT → API
// CREAR / EDITAR ROL
// ─────────────────────────────────────────────

export const mapRoleToApi = (
  role
) => {

  const permissions = [];

  role.permisos.forEach(

    (modulo) => {

      Object.entries(
        modulo.acciones
      ).forEach(

        ([accionKey, activo]) => {

          if (!activo) return;

          const privilegeId =
            privilegeIdMap[
              accionKey
            ];

          if (!privilegeId)
            return;

          permissions.push({

            id_module:
              modulo.id,

            id_privilege:
              privilegeId

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