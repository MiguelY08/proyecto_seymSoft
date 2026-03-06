
// FUNCION PARA FLATTEAR PERMISOS
export const flattenPermissions = (rolePermissions = [], permissionsList = []) => {

  const result = []

  rolePermissions.forEach((permiso) => {

    const moduloSistema = permissionsList.find(
      (mod) => mod.id === permiso.id
    )

    if (!moduloSistema) return

    Object.entries(permiso.acciones).forEach(([accion, activo]) => {

      if (activo) {

        result.push(
          `${moduloSistema.modulo.toLowerCase().replace(/\s+/g, "_")}.${accion}`
        )

      }

    })

  })

  return result
}