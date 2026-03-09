import { getUsers, saveUsers } from "../Features/access/services/authService";
import { getRoles, saveRoles } from "../Features/administrtivePanel/configuration/roles/services/rolesServices";
import { permissionsList } from "../Features/administrtivePanel/configuration/roles/permissions/permissionsList";

export const initSystem = () => {

  console.log("INIT SYSTEM EJECUTANDO");


  const users = getUsers();
  const roles = getRoles();

  console.log("INIT SYSTEM EJECUTANDO");

  /* ===============================
     CREAR ROL ADMIN SI NO EXISTE
  =============================== */

  if(roles.length === 0){

    const adminPermissions = permissionsList.map(modulo => ({
      id: modulo.id,
      acciones: modulo.acciones.reduce((acc,accion)=>{
        acc[accion] = true
        return acc
      },{})
    }))

    const adminRole = {

      id: 1,
      name: "Administrador",
      description: "Acceso total al sistema",
      active: true,
      createdAt: new Date().toLocaleDateString(),
      permisos: adminPermissions

    }

    saveRoles([adminRole])

    console.log("Rol administrador creado")

  }

  /* ===============================
     CREAR USUARIO ADMIN SI NO EXISTE
  =============================== */

  if(users.length === 0){

    const adminUser = {

      id: 1,
      name: "Administrador",
      email: "admin@magic.com",
      password: "12345678",
      role: "Administrador",
      clientType: "Interno",
      createdAt: new Date().toISOString()
    }

    saveUsers([adminUser])

    console.log("Usuario administrador creado")

  }

}