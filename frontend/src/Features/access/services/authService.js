import { getRoles } from "../../administrtivePanel/configuration/roles/services/rolesServices";
import { permissionsList } from "../../administrtivePanel/configuration/roles/permissions/permissionsList";
import { flattenPermissions } from "../../administrtivePanel/configuration/roles/helpers/permissionUtils";

const USERS_KEY = "users";


// ─── Obtener todos los usuarios ────────────────────────────────────
export const getUsers = () => {

  try {

    const users = localStorage.getItem(USERS_KEY);

    return users ? JSON.parse(users) : [];

  } catch (error) {

    console.error("Error leyendo usuarios:", error);

    localStorage.removeItem(USERS_KEY);

    return [];

  }

};


// ─── Guardar usuarios ──────────────────────────────────────────────
export const saveUsers = (users) => {

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

};


// ─── Verificar si un correo ya existe ──────────────────────────────
export const emailExists = (email) => {

  const users = getUsers();

  return users.some(
    user =>
      user.email.trim().toLowerCase() === email.trim().toLowerCase()
  );

};


// ─── Verificar si un documento ya existe ───────────────────────────
export const documentExists = (document) => {

  const users = getUsers();

  return users.some(
    user => user.document === document
  );

};


// ─── Registrar usuario ─────────────────────────────────────────────
export const registerUser = (userData) => {

  const users = getUsers();

  if (emailExists(userData.email)) {
    throw new Error("El correo ya está registrado");
  }

  if (documentExists(userData.document)) {
    throw new Error("El documento ya está registrado");
  }

  const newUser = {

    id: Date.now(),

    ...userData,

    clientType: "Detal",

    role: null,

    createdAt: new Date().toISOString(),

  };

  users.push(newUser);

  saveUsers(users);

  return newUser;

};


// ─── Login ─────────────────────────────────────────────────────────
export const loginUser = (email, password) => {

  const users = getUsers();

  const user = users.find(
    (u) =>
      u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
      u.password.trim() === password.trim()
  );

  if (!user) {
    throw new Error("Correo o contraseña incorrectos");
  }

  let permissions = [];

  try {

    const roles = getRoles();

    const role = roles.find(
      (r) => r.name === user.role
    );

    const rolePermissions = role?.permisos || [];

    permissions = flattenPermissions(
      rolePermissions,
      permissionsList
    ) || [];

  } catch (error) {

    console.error("Error generando permisos:", error);

  }

  const session = {
    user: {
      ...user,
      permissions
    },
    token: Date.now()
  };

  return session;
};