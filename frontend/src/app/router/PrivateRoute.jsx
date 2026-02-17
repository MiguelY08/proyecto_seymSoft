import { Outlet } from "react-router-dom"

const PrivateRoute = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default PrivateRoute
