import { getRoles } from "../../administrtivePanel/configuration/roles/services/rolesServices";
import { permissionsList } from "../../administrtivePanel/configuration/roles/permissions/permissionsList";
import { flattenPermissions } from "../../administrtivePanel/configuration/roles/helpers/permissionUtils";

const USERS_KEY = "users";


// ─── Obtener usuarios ─────────────────────────────
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


// ─── Guardar usuarios ─────────────────────────────
export const saveUsers = (users) => {

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );

};


// ─── Normalizar datos ─────────────────────────────
const normalizeEmail = (email) =>
  email.trim().toLowerCase();

const normalizePassword = (password) =>
  password.trim();


// ─── Verificar email existente ────────────────────
export const emailExists = (email) => {

  const users = getUsers();

  return users.some(
    user =>
      normalizeEmail(user.email) === normalizeEmail(email)
  );

};


// ─── Verificar documento existente ────────────────
export const documentExists = (document) => {

  const users = getUsers();

  return users.some(
    user => user.document === document
  );

};


// ─── Registrar usuario (Landing) ──────────────────
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

    email: normalizeEmail(userData.email),

    password: normalizePassword(userData.password),

    clientType: "Detal",

    role: null, // clientes no tienen rol administrativo

    createdAt: new Date().toISOString(),

  };

  users.push(newUser);

  saveUsers(users);

  return newUser;

};


// ─── Login ────────────────────────────────────────

export const loginUser = (email, password) => {

  const users = getUsers();

  const user = users.find(
    (u) =>
      normalizeEmail(u.email) === normalizeEmail(email) &&
      normalizePassword(u.password) === normalizePassword(password)
  );

  if (!user) {
    throw new Error("Correo o contraseña incorrectos");
  }

  // ── Validar cuenta activa ────────────────────────
  if (!user.active) {
    throw new Error("Tu cuenta está inactiva. Contacta al administrador.");
  }

  let permissions = [];

  if (user.role) {
    try {
      const roles = getRoles();
      const role = roles.find((r) => r.name === user.role);
      const rolePermissions = role?.permisos || [];
      permissions = flattenPermissions(rolePermissions, permissionsList) || [];
    } catch (error) {
      console.error("Error generando permisos:", error);
    }
  }

  const session = {
    user: {
      ...user,
      permissions
    },
    token:      Date.now(),
    redirectTo: user.role ? '/admin' : '/'  
  };

  return session;

};