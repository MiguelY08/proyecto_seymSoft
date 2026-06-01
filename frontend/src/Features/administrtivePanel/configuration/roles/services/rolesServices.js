
import apiClient from "../../../../../setting/apiClient.js";

import {

  mapRolesFromApi,
  mapRoleFromApi,
  mapPermissionsFromApi

} from "../helpers/roleMapper.js";

// ─────────────────────────────────────────────
// OBTENER ROLES
// ─────────────────────────────────────────────

export const getRoles = async () => {

  try {

    const response =
      await apiClient.get(
        "/roles/listar"
      );

    const roles =
      response.data?.data || [];

    return mapRolesFromApi(
      roles
    );

  } catch (error) {

    console.error(
      "Error en getRoles:",
      error
    );

    return [];

  }

};

// ─────────────────────────────────────────────
// OBTENER ROL POR ID
// ─────────────────────────────────────────────

export const getRoleById = async (
  id
) => {

  try {

    const response =
      await apiClient.get(
        `/roles/${id}`
      );

    return mapRoleFromApi(
      response.data.data
    );

  } catch (error) {

    console.error(
      "Error en getRoleById:",
      error
    );

    throw error;

  }

};

// ─────────────────────────────────────────────
// OBTENER MÓDULOS Y PRIVILEGIOS
// ─────────────────────────────────────────────

export const getPermissions = async () => {

  try {

    const response =
      await apiClient.get(
        "/roles/available-permissions"
      );

    return mapPermissionsFromApi(
      response.data.data
    );

  } catch (error) {

    console.error(
      "Error en getPermissions:",
      error
    );

    return [];

  }

};

// ─────────────────────────────────────────────
// MAPEAR PERMISOS → API
// ─────────────────────────────────────────────

const mapearPermisosParaApi = (
  roleData,
  permisosSistema = []
) => {

  const permissions = [];

  roleData.permisos.forEach(
    (moduloRol) => {

      const moduloSistema =
        permisosSistema.find(

          (mod) =>
            mod.id === moduloRol.id

        );

      if (!moduloSistema)
        return;

      Object.entries(

        moduloRol.selectedActions || {}

      ).forEach(

        ([accionKey, activo]) => {

          if (!activo)
            return;

          const accionSistema =

            moduloSistema.acciones.find(

              (accion) =>

                accion.key ===
                accionKey

            );

          if (!accionSistema)
            return;

          permissions.push({

            id_module:
              moduloSistema.id,

            id_privilege:
              accionSistema.id_privilege

          });

        }

      );

    }

  );

  const payload = {

    name_role:
      roleData.name,

    description:
      roleData.description,

    permissions

  };

  console.log(
    "📤 PAYLOAD FINAL:",
    payload
  );

  return payload;

};

// ─────────────────────────────────────────────
// CREAR ROL
// ─────────────────────────────────────────────

export const createRole = async (
  roleData
) => {

  try {

    const permisosSistema =
      await getPermissions();

    const payload =
      mapearPermisosParaApi(
        roleData,
        permisosSistema
      );

    const response =
      await apiClient.post(
        "/roles/crear",
        payload
      );

    return response.data;

  } catch (error) {

    console.error(
      "❌ ERROR COMPLETO:",
      error.response?.data ||
      error.message
    );

    throw error;

  }

};

// ─────────────────────────────────────────────
// ACTUALIZAR ROL
// ─────────────────────────────────────────────

export const updateRole = async (
  roleData
) => {

  try {

    const permisosSistema =
      await getPermissions();

    const payload =
      mapearPermisosParaApi(
        roleData,
        permisosSistema
      );

    const response =
      await apiClient.put(

        `/roles/${roleData.id}`,

        payload

      );

    return response.data;

  } catch (error) {

    console.error(
      "Error en updateRole:",
      error
    );

    throw error;

  }

};


// ─────────────────────────────────────────────
// ACTIVAR / DESACTIVAR ROL
// PATCH /roles/:id/status
// ─────────────────────────────────────────────

export const toggleRoleStatus = async (

  id,
  currentStatus

) => {

  try {

    // ✅ CALCULAR ESTADO REAL
    const nextStatus =

      currentStatus
        ? 2
        : 1;

    const payload = {

      id_status:
        nextStatus

    };

    console.log(
      "📤 STATUS PAYLOAD:",
      payload
    );

    const response =
      await apiClient.patch(

        `/roles/${id}/status`,

        payload

      );

    return response.data;

  } catch (error) {

    console.error(

      "Error en toggleRoleStatus:",

      error.response?.data ||
      error

    );

    throw error;

  }

};


// ─────────────────────────────────────────────
// ELIMINAR ROL
// ─────────────────────────────────────────────

export const deleteRole = async (
  id
) => {

  try {

    const response =
      await apiClient.delete(
        `/roles/${id}`
      );

    return response.data;

  } catch (error) {

    console.error(
      "Error en deleteRole:",
      error
    );

    throw error;

  }

};