// ─────────────────────────────────────────────
// CONVERTIR PERMISOS DE ROL → ARRAY DE STRINGS
// ─────────────────────────────────────────────

export const flattenPermissions = (
  rolePermissions = [],
  permissionsList = []
) => {

  const result = []

  rolePermissions.forEach((permiso) => {

    const moduloSistema = permissionsList.find(
      (mod) => mod.id === permiso.id
    )

    if (!moduloSistema) return

    if (!permiso.acciones) return

    Object.entries(permiso.acciones).forEach(
      ([accion, activo]) => {

        if (activo === true) {

          result.push(
            `${moduloSistema.modulo}.${accion}`
          )

        }

      }
    )

  })

  return result

}