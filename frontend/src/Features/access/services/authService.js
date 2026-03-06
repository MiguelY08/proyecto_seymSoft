import { getRoles } from "../../administrtivePanel/configuration/roles/services/rolesServices";
import { permissionsList } from "../../administrtivePanel/configuration/roles/permissions/permissionsList";
import { flattenPermissions } from "../../administrtivePanel/configuration/roles/helpers/permissionUtils";

const USERS_KEY = "users";


// Obtener todos los usuarios
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


// Guardar usuarios
export const saveUsers = (users) => {

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

};


// Registrar usuario
export const registerUser = (userData) => {

  const users = getUsers();

  const emailExists = users.some(
    (user) =>
      user.email.trim().toLowerCase() === userData.email.trim().toLowerCase()
  );

  if (emailExists) {
    throw new Error("El correo ya está registrado");
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


// Login
export const loginUser = (email, password) => {

  const users = getUsers();

  console.log("EMAIL INGRESADO:", email);
  console.log("PASSWORD INGRESADO:", password);
  console.log("USERS:", users);

  const user = users.find(
    (u) =>
      u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
      u.password.trim() === password.trim()
  );

  console.log("USER FOUND:", user);

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

  console.log("SESSION RETURN:", session);

  return session;
};