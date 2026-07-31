import apiClient from "../../../../../setting/apiClient.js";

import {
  mapRolesFromApi,
  mapRoleFromApi,
  mapPermissionsFromApi,
} from "../helpers/roleMapper.js";

// ─────────────────────────────────────────────
// OBTENER ROLES
// ─────────────────────────────────────────────

export const getRoles = async () => {
  try {
    const response = await apiClient.get("/roles/listar");

    const roles = response.data?.data || [];

    return mapRolesFromApi(roles);
  } catch (error) {
    console.error("Error en getRoles:", error);

    throw error;
  }
};

// ─────────────────────────────────────────────
// OBTENER ROL POR ID
// ─────────────────────────────────────────────

export const getRoleById = async (id) => {
  try {
    const response = await apiClient.get(`/roles/${id}`);

    return mapRoleFromApi(response.data.data);
  } catch (error) {
    console.error("Error en getRoleById:", error);

    throw error;
  }
};

// ─────────────────────────────────────────────
// OBTENER MÓDULOS Y PRIVILEGIOS
// ─────────────────────────────────────────────

export const getPermissions = async () => {
  try {
    const response = await apiClient.get("/roles/available-permissions");

    return mapPermissionsFromApi(response.data.data);
  } catch (error) {
    console.error("Error en getPermissions:", error);

    throw error;
  }
};

// ─────────────────────────────────────────────
// MAPEAR PERMISOS → API
// ─────────────────────────────────────────────

export const mapearPermisosParaApi = (roleData, permisosSistema = []) => {
  const permissions = [];

  roleData.permisos.forEach((moduloRol) => {
    const moduloSistema = permisosSistema.find(
      (mod) => mod.id === moduloRol.id,
    );

    if (!moduloSistema) return;

    Object.entries(moduloRol.selectedActions || {}).forEach(
      ([accionKey, activo]) => {
        if (!activo) return;

        const accionSistema = moduloSistema.acciones.find(
          (accion) => accion.key === accionKey,
        );

        if (!accionSistema) return;

        permissions.push({
          id_module: moduloSistema.id,

          id_privilege: accionSistema.id_privilege,
        });
      },
    );
  });

  const payload = {
    name_role: roleData.name,

    permissions,
  };

  console.log("📤 PAYLOAD FINAL:", payload);

  if (
    typeof roleData.description === "string" &&
    roleData.description.length > 0
  ) {
    payload.description = roleData.description;
  }

  return payload;
};

// ─────────────────────────────────────────────
// CREAR ROL
// ─────────────────────────────────────────────

export const buildRoleValidationPayload = (roleData, permisosSistema = []) => {
  const payload = mapearPermisosParaApi(roleData, permisosSistema);

  if (roleData.id) {
    payload.id_role = roleData.id;
  }

  return payload;
};

export const validateRoleName = async ({ name, id }) => {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const params = new URLSearchParams({
    name_role: name,
    ...(id ? { id_role: id } : {}),
  });

  const response = await fetch(
    `${baseUrl}/roles/validate-name/public?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();
  return data;
};

export const validateRolePermissions = async ({ id, permissions }) => {
  const payload = {
    permissions,
    ...(id ? { id_role: id } : {}),
  };

  const response = await apiClient.post("/roles/validate-permissions", payload);

  return response.data;
};

export const validateRoleBeforeSave = async (
  roleData,
  permisosSistema = [],
) => {
  const response = await apiClient.post(
    "/roles/validate",
    buildRoleValidationPayload(roleData, permisosSistema),
  );

  return response.data;
};

export const createRole = async (roleData) => {
  try {
    const permisosSistema = await getPermissions();

    const payload = mapearPermisosParaApi(roleData, permisosSistema);

    const response = await apiClient.post("/roles/crear", payload);

    return response.data;
  } catch (error) {
    console.error("❌ ERROR COMPLETO:", error.response?.data || error.message);

    throw error;
  }
};

// ─────────────────────────────────────────────
// ACTUALIZAR ROL
// ─────────────────────────────────────────────

export const updateRole = async (roleData) => {
  try {
    const permisosSistema = await getPermissions();

    const payload = mapearPermisosParaApi(roleData, permisosSistema);

    const response = await apiClient.put(
      `/roles/${roleData.id}`,

      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error en updateRole:", error);

    throw error;
  }
};

// ─────────────────────────────────────────────
// ACTIVAR / DESACTIVAR ROL
// PATCH /roles/:id/status
// ─────────────────────────────────────────────

export const toggleRoleStatus = async (id, currentStatus) => {
  try {
    // ✅ CALCULAR ESTADO REAL
    const nextStatus = currentStatus ? 2 : 1;

    const payload = {
      id_status: nextStatus,
    };

    console.log("📤 STATUS PAYLOAD:", payload);

    const response = await apiClient.patch(
      `/roles/${id}/status`,

      payload,
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error en toggleRoleStatus:",

      error.response?.data || error,
    );

    throw error;
  }
};

// ─────────────────────────────────────────────
// ELIMINAR ROL
// ─────────────────────────────────────────────

export const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`/roles/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error en deleteRole:", error);

    throw error;
  }
};
