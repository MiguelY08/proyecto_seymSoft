import { getRoles } from "../services/rolesServices";

export const validateRole = (
  data
) => {

  const errors = {};

  const nameRegex =
  /^[A-Za-zÁÉÍÓÚáéíóúñÑ][A-Za-zÁÉÍÓÚáéíóúñÑ_\s]*$/;

  if (
    !data.name
    ||
    data.name.trim().length < 5
  ) {

    errors.name =
    "El nombre del rol debe tener mínimo 5 letras";

  }

  else if (

    !nameRegex.test(
      data.name.trim()
    )

  ) {

    errors.name =
    "El nombre no puede iniciar con números";

  }

  if (

    !data.description
    ||
    data.description.trim().length < 10

  ) {

    errors.description =
    "La descripción debe tener mínimo 10 caracteres";

  }

  const hasPermission =

    data.permissions?.some(

      (mod)=>

      Object
      .values(
        mod.acciones
      )
      .some(Boolean)

    );

  if (!hasPermission) {

    errors.permissions =
    "Debe seleccionar al menos un permiso";

  }

  return errors;

};


/* ======================================================
VALIDAR DUPLICADOS DE PERMISOS
====================================================== */

export const rolePermissionsAlreadyExist = (

  permissions

)=>{

  const roles =
  getRoles();

  const normalize = (
    perms
  ) =>

    JSON.stringify(

      perms

      .map((p)=>({

        id:p.id,

        acciones:

        Object.keys(
          p.acciones
        )

        .filter(

          (a)=>
          p.acciones[a]

        )

        .sort()

      }))

      .sort(

        (a,b)=>

        a.id-b.id

      )

    );

  const newPermissions =
  normalize(
    permissions
  );

  return roles.some(

    (role)=>{

      const existing =
      normalize(
        role.permisos
      );

      return (
        existing===
        newPermissions
      );

    }

  );

};