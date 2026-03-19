import { getUsers, saveUsers } from "../Features/access/services/authService";
import {
  getRoles,
  saveRoles,
} from "../Features/administrtivePanel/configuration/roles/services/rolesServices";
import { permissionsList } from "../Features/administrtivePanel/configuration/roles/permissions/permissionsList";

export const initSystem = () => {
  console.log(" Inicializando sistema...");

  let users = getUsers();
  let roles = getRoles();

  /* ===================================================
     CREAR O ACTUALIZAR ROL ADMINISTRADOR
  =================================================== */

  let adminRole = roles.find((role) => role.name === "Administrador");

  const buildAdminPermissions = () =>
    permissionsList.map((modulo) => ({
      id: modulo.id,
      acciones: modulo.acciones.reduce((acc, accion) => {
        acc[accion] = true;
        return acc;
      }, {}),
    }));

  const adminPermissions = buildAdminPermissions();

  if (!adminRole) {
    console.log(" Creando rol Administrador...");

    adminRole = {
      id: Date.now(),
      name: "Administrador",
      description: "Acceso total al sistema",
      active: true,
      createdAt: new Date().toLocaleDateString(),
      permisos: adminPermissions,
    };

    roles.push(adminRole);
    saveRoles(roles);
  } else {
    // Si el rol ya existe (p. ej. creado antes) asegurarnos que tenga todos
    // los permisos actuales (incluyendo activar/desactivar dependiendo de la lista)
    const currentPermsJson = JSON.stringify(adminRole.permisos || []);
    const expectedPermsJson = JSON.stringify(adminPermissions);

    if (currentPermsJson !== expectedPermsJson) {
      console.log("Actualizando permisos del rol Administrador...");
      adminRole.permisos = adminPermissions;
      saveRoles(roles);
    }
  }

  /* ===================================================
     CREAR USUARIO ADMINISTRADOR GLOBAL
  =================================================== */

  let adminUser = users.find((user) => user.email === "admin@magic.com");

  if (!adminUser) {
    console.log(" Creando usuario administrador global...");

    adminUser = {
      id: Date.now(),

      name: "Administrador",

      email: "admin@magic.com",

      password: "12345678",

      role: "Administrador",

      clientType: "Interno",

      active: true,

      createdAt: new Date().toISOString(),
    };

    users.push(adminUser);

    saveUsers(users);
  }

  /* ===================================================
     VERIFICACIÓN FINAL
  =================================================== */

  console.log("Sistema inicializado correctamente");
};
