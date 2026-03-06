import { useAuth } from "../context/AuthContext"

export default function PermissionGuard({
  permission,
  children,
  fallback = null
}) {

  const { user } = useAuth()

  if(!user) return fallback

  const permisos = user?.permissions || []   // 👈 corregido

  const hasPermission = permisos.includes(permission)

  if(!hasPermission){
    return fallback
  }

  return children

}