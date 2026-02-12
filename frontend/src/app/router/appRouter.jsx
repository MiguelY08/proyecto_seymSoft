
import {  Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
// import AdminLayout from "../../layout/AdminLayout";

// Auth


// Pages
// import DashboardPage from "../../features/dashboard/pages/DashboardPage";
// import UsersPage from "../../features/users/pages/UsersPage";
// import ClientsPage from "../../features/clients/pages/ClientsPage";
// import SalesPage from "../../features/sales/pages/SalesPage";
// import PurchasesPage from "../../features/purchases/pages/PurchasesPage";
// import CategoriesPage from "../../features/categories/pages/CategoriesPage";
// import ProductsPage from "../../features/products/pages/ProductsPage";
// import AppearancePage from "../../features/appearance/pages/AppearancePage";
import Sidebar from "../../Features/layouts/sidebar";
import DashboardPage from "../../Features/layouts/DashboardPage";
import AdminLayout from "../../Features/layouts/AdminLayout";


const AppRouter = () => {
  return (
        <Routes>
          {/* RUTA DE DESARROLLO */}
          <Route path="/sidebar" element={<AdminLayout />} />

          {/* RUTAS REALES */}
          {/* <Route element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Route> */}
        </Routes>
  );
};

export default AppRouter;
