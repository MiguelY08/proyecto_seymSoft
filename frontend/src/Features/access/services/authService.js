import { getRoles } from "../../administrtivePanel/configuration/roles/services/rolesServices";
import { permissionsList } from "../../administrtivePanel/configuration/roles/permissions/permissionsList";
import { flattenPermissions } from "../../administrtivePanel/configuration/roles/helpers/permissionUtils";
import { saveSession, getSession } from "../helpers/authStorage";

const USERS_KEY = "users";

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

export const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizePassword = (password) => password.trim();

export const emailExists = (email) => {
  const users = getUsers();
  return users.some(user => normalizeEmail(user.email) === normalizeEmail(email));
};

export const documentExists = (document) => {
  const users = getUsers();
  return users.some(user => user.document === document);
};

export const registerUser = (userData) => {
  const users = getUsers();
  if (emailExists(userData.email)) throw new Error("El correo ya está registrado");
  if (documentExists(userData.document)) throw new Error("El documento ya está registrado");

  const newUser = {
    id:         Date.now(),
    ...userData,
    name:       userData.fullName,
    email:      normalizeEmail(userData.email),
    password:   normalizePassword(userData.password),
    clientType: "Detal",
    role:       null,
    active:     true,
    createdAt:  new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const loginUser = (email, password) => {
  const users = getUsers();

  const user = users.find(
    (u) =>
      normalizeEmail(u.email) === normalizeEmail(email) &&
      normalizePassword(u.password) === normalizePassword(password)
  );

  if (!user) throw new Error("Correo o contraseña incorrectos");
  if (!user.active) throw new Error("Tu cuenta está inactiva. Contacta al administrador.");

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

  return {
    user:       { ...user, permissions },
    token:      Date.now(),
    redirectTo: user.role ? "/admin" : "/",
  };
};

// ─── Actualizar perfil ────────────────────────────
export const updateProfile = (userId, changes) => {

  const users = getUsers();

  if (changes.email) {
    const emailTaken = users.some(
      (u) =>
        u.email.trim().toLowerCase() === changes.email.trim().toLowerCase() &&
        u.id !== userId
    );
    if (emailTaken) throw new Error("Este correo ya está registrado por otro usuario.");
  }

  const updatedUsers = users.map((u) =>
    u.id === userId ? { ...u, ...changes } : u
  );

  saveUsers(updatedUsers);

  const session = getSession();
  if (session) {
    const updatedUser = updatedUsers.find((u) => u.id === userId);
    saveSession({ ...session, user: { ...session.user, ...updatedUser } });
  }

  return updatedUsers.find((u) => u.id === userId);

};