import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function RoleGuard({
  allowedRoles = [],
  children
}) {

  const { user } = useAuth()

  if(!user){
    return <Navigate to="/login" replace />
  }

  if(!allowedRoles.includes(user.role)){
    return <Navigate to="/" replace />
  }

  return children

}