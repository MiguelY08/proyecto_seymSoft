import { Routes, Route } from "react-router-dom";

import AdminLayout from "../../Features/layouts/AdminLayout";
import Home from "../../Features/landing/home/Home.jsx";
import Users from "../../Features/users/users/Users.jsx";
import LoginPage from "../../Features/access/pages/LoginPage.jsx";
import RegisterPage from "../../Features/access/pages/RegisterPage.jsx";
import ForgotPasswordPage from "../../Features/access/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../../Features/access/pages/ResetPasswordPage.jsx";
import RolesTable from "../../Features/configuration/roles/components/RolesTable.jsx";
import DashboardPage from "../../Features/layouts/DashboardPage";

const AppRouter = () => {
  return (
    <Routes>

      {/* 🌍 RUTAS PÚBLICAS */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registrar" element={<RegisterPage />} />
      <Route path="/recuperar" element={<ForgotPasswordPage />} />
      <Route path="/restablecer" element={<ResetPasswordPage />} />

      {/* 🔐 PANEL ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>

        {/* Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Configuración */}
        <Route path="configuracion">
          <Route path="roles" element={<RolesTable />} />
        </Route>

      </Route>

    </Routes>
  );
};

export default AppRouter;