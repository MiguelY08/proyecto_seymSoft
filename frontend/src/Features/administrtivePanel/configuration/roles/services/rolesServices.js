import apiClient from "../../../../../setting/apiClient.js";
import { mapRolesFromApi, mapRoleFromApi } from "../helpers/roleMapper.js";

/**
 * ROLES SERVICES - Consumir endpoints de roles
 * 
 * Endpoints:
 * - GET /api/roles/listar              - Listar todos
 * - GET /api/roles/:id                 - Obtener uno
 * - POST /api/roles/crear              - Crear
 * - PUT /api/roles/:id                 - Actualizar
 * - PATCH /api/roles/:id/status        - Cambiar status
 * - DELETE /api/roles/:id              - Eliminar
 */

// ═══════════════════════════════════════════════════════════
// LISTAR ROLES
// ═══════════════════════════════════════════════════════════

export const getRoles = async () => {
  try {
    const response = await apiClient.get("/roles/listar");

    const mapped = mapRolesFromApi(response.data.data || []);

    return {
      success: true,
      data: mapped,
    };

  } catch (error) {
    console.error("Error en getRoles:", error);

    const errorMessage = error.response?.data?.message || "Error al obtener roles";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// OBTENER ROL POR ID
// ═══════════════════════════════════════════════════════════

export const getRoleById = async (roleId) => {
  try {
    if (!roleId) {
      return {
        success: false,
        error: "ID de rol requerido",
      };
    }

    const response = await apiClient.get(`/roles/${roleId}`);

    const mapped = mapRoleFromApi(response.data.data);

    return {
      success: true,
      data: mapped,
    };

  } catch (error) {
    console.error("Error en getRoleById:", error);

    const errorMessage = error.response?.data?.message || "Error al obtener el rol";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// CREAR ROL
// ═══════════════════════════════════════════════════════════

export const createRole = async (roleData) => {
  try {
    if (!roleData || !roleData.name_role || !roleData.description) {
      return {
        success: false,
        error: "Nombre y descripción del rol son requeridos",
      };
    }

    const response = await apiClient.post("/roles/crear", {
      name_role: roleData.name_role,
      description: roleData.description,
      id_status: roleData.id_status || 1,
      permissions: roleData.permissions || [],
    });

    const mapped = mapRoleFromApi(response.data.data);

    return {
      success: true,
      data: mapped,
      message: response.data.message,
    };

  } catch (error) {
    console.error("Error en createRole:", error);

    const errorMessage = error.response?.data?.message || "Error al crear rol";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// ACTUALIZAR ROL
// ═══════════════════════════════════════════════════════════

export const updateRole = async (roleId, roleData) => {
  try {
    if (!roleId) {
      return {
        success: false,
        error: "ID de rol requerido",
      };
    }

    const response = await apiClient.put(`/roles/${roleId}`, {
      name_role: roleData.name_role,
      description: roleData.description,
      id_status: roleData.id_status,
      permissions: roleData.permissions || [],
    });

    const mapped = mapRoleFromApi(response.data.data);

    return {
      success: true,
      data: mapped,
      message: response.data.message,
    };

  } catch (error) {
    console.error("Error en updateRole:", error);

    const errorMessage = error.response?.data?.message || "Error al actualizar rol";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// ACTUALIZAR STATUS DEL ROL
// ═══════════════════════════════════════════════════════════

export const updateRoleStatus = async (roleId, idStatus) => {
  try {
    if (!roleId || idStatus === undefined) {
      return {
        success: false,
        error: "ID de rol y status son requeridos",
      };
    }

    const response = await apiClient.patch(`/roles/${roleId}/status`, {
      id_status: idStatus,
    });

    const mapped = mapRoleFromApi(response.data.data);

    return {
      success: true,
      data: mapped,
      message: response.data.message,
    };

  } catch (error) {
    console.error("Error en updateRoleStatus:", error);

    const errorMessage = error.response?.data?.message || "Error al actualizar status";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// ELIMINAR ROL
// ═══════════════════════════════════════════════════════════

export const deleteRole = async (roleId) => {
  try {
    if (!roleId) {
      return {
        success: false,
        error: "ID de rol requerido",
      };
    }

    const response = await apiClient.delete(`/roles/${roleId}`);

    return {
      success: true,
      message: response.data.message,
    };

  } catch (error) {
    console.error("Error en deleteRole:", error);

    const errorMessage = error.response?.data?.message || "Error al eliminar rol";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// OBTENER PERMISOS DEL SISTEMA
// ═══════════════════════════════════════════════════════════

export const getPermissions = async () => {
  try {
    const response = await apiClient.get("/roles/permissions");

    const modules = response.data.data?.modules || [];
    const privileges = response.data.data?.privileges || [];

    const mapped = modules.map((module) => ({
      id: module.id_module,
      modulo: module.name_module,
      descripcion: module.description,
      acciones: privileges.map((privilege) => ({
        key: privilege.name_privilege.toLowerCase(),
        backend: privilege.name_privilege,
        label: privilege.name_privilege.replaceAll("_", " "),
      })),
    }));

    return {
      success: true,
      data: mapped,
    };

  } catch (error) {
    console.error("Error en getPermissions:", error);

    const errorMessage = error.response?.data?.message || "Error al obtener permisos";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const toggleRoleStatus = async (roleId, currentStatus) => {

  const newStatus =
    currentStatus === 1
      ? 2
      : 1;

  return await updateRoleStatus(
    roleId,
    newStatus
  );

};