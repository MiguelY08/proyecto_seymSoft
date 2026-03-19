import UsersDB from "../../../users/services/usersDB";

// ─────────────────────────────────────────────
// STORAGE KEY
// ─────────────────────────────────────────────

const STORAGE_KEY = "roles";

// ─────────────────────────────────────────────
// OBTENER ROLES
// ─────────────────────────────────────────────

export const getRoles = () => {
  try {
    const roles = localStorage.getItem(STORAGE_KEY);

    if (!roles) return [];

    return JSON.parse(roles);
  } catch (error) {
    console.error("Error leyendo roles:", error);

    localStorage.removeItem(STORAGE_KEY);

    return [];
  }
};

// ─────────────────────────────────────────────
// GUARDAR ROLES
// ─────────────────────────────────────────────

export const saveRoles = (roles) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
};

// ─────────────────────────────────────────────
// CREAR ROL
// ─────────────────────────────────────────────

export const createRole = (role) => {
  const roles = getRoles();

  // validar duplicados
  const exists = roles.some(
    (r) => r.name.toLowerCase() === role.name.toLowerCase(),
  );

  if (exists) {
    throw new Error("El rol ya existe");
  }

  const newRole = {
    ...role,

    id: Date.now(),

    active: true,

    createdAt: new Date().toISOString(),
  };

  const updatedRoles = [...roles, newRole];

  saveRoles(updatedRoles);

  return newRole;
};

// ─────────────────────────────────────────────
// ACTUALIZAR ROL
// ─────────────────────────────────────────────

export const updateRole = (updatedRole) => {
  const roles = getRoles();

  const updatedRoles = roles.map((role) =>
    role.id === updatedRole.id ? { ...role, ...updatedRole } : role,
  );

  saveRoles(updatedRoles);

  return updatedRole;
};

// ─────────────────────────────────────────────
// ACTIVAR / DESACTIVAR ROL
// ─────────────────────────────────────────────

export const toggleRoleStatus = (id) => {
  const roles = getRoles();

  const updatedRoles = roles.map((role) =>
    role.id === id ? { ...role, active: !role.active } : role,
  );

  saveRoles(updatedRoles);

  return updatedRoles;
};

// ─────────────────────────────────────────────
// DESACTIVAR ROL
// ─────────────────────────────────────────────

export const deactivateRole = (roleId) => {
  const roles = getRoles();

  const updatedRoles = roles.map((role) =>
    role.id === roleId ? { ...role, active: false } : role,
  );

  saveRoles(updatedRoles);

  return updatedRoles;
};

// ─────────────────────────────────────────────
// ELIMINAR ROL
// ─────────────────────────────────────────────

export const deleteRole = (roleId) => {
  const roles = getRoles();

  const role = roles.find((r) => r.id === roleId);

  if (!role) {
    throw new Error("Rol no encontrado");
  }

  // validar si el rol tiene usuarios
  if (roleHasUsers(role.name)) {
    throw new Error("No se puede eliminar un rol con usuarios asignados");
  }

  const updatedRoles = roles.filter((role) => role.id !== roleId);

  saveRoles(updatedRoles);

  return updatedRoles;
};

// ─────────────────────────────────────────────
// VALIDAR SI UN ROL TIENE USUARIOS
// ─────────────────────────────────────────────

export const roleHasUsers = (roleName) => {
  const users = UsersDB.list();

  return users.some((user) => user.role === roleName);
};

// ─────────────────────────────────────────────
// CONTAR USUARIOS POR ROL
// ─────────────────────────────────────────────

export const countUsersByRole = (roleName) => {
  const users = UsersDB.list();

  return users.filter((user) => user.role === roleName).length;
};
