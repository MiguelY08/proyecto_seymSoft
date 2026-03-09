const STORAGE_KEY = "roles"

// obtener roles
export const getRoles = () => {

  try {

    const roles = localStorage.getItem(STORAGE_KEY)

    if(!roles) return []

    return JSON.parse(roles)

  } catch(error){

    console.error("Error leyendo roles:", error)

    localStorage.removeItem(STORAGE_KEY)

    return []

  }

}

// guardar roles
export const saveRoles = (roles) => {

  localStorage.setItem(STORAGE_KEY, JSON.stringify(roles))

}

// crear rol
export const createRole = (role) => {

  const roles = getRoles()

  const newRole = {
    ...role,
    id: Date.now(),
  }

  const updatedRoles = [...roles, newRole]

  saveRoles(updatedRoles)

  return newRole

}

// actualizar rol
export const updateRole = (updatedRole) => {

  const roles = getRoles()

  const updatedRoles = roles.map(role =>
    role.id === updatedRole.id
      ? updatedRole
      : role
  )

  saveRoles(updatedRoles)

  return updatedRole

}

// cambiar estado
export const toggleRoleStatus = (id) => {

  const roles = getRoles()

  const updatedRoles = roles.map(role =>
    role.id === id
      ? { ...role, active: !role.active }
      : role
  )

  saveRoles(updatedRoles)

}