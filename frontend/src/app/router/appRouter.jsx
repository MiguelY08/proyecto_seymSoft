import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import PermissionGuard from "../../Features/administrtivePanel/configuration/roles/guards/PermissionGuard";

/* ========= ACCESO ========= */
import LoginPage from "../../Features/access/pages/LoginPage.jsx";
import RegisterPage from "../../Features/access/pages/RegisterPage.jsx";
import ForgotPasswordPage from "../../Features/access/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../../Features/access/pages/ResetPasswordPage.jsx";
import EditProfilePage from "../../Features/access/pages/EditProfilePage.jsx";

/* ========= LANDING ========= */
import Landing from "../../Features/landing//pages/Landing.jsx";
import Home from "../../Features/landing/home/Home.jsx";
import Shop from "../../Features/landing/shop/pages/Shop.jsx";
import ShopDetail from "../../Features/landing/shop/pages/ShopDetails.jsx";

import OrdersL from "../../Features/landing/orders/Orders.jsx";
import OrderDetail from "../../Features/landing/orders/OrderDetail.jsx";
import ReturnsOnOrders from "../../Features/landing/orders/Returns_On_Orders.jsx";
import RegisterReturn from "../../Features/landing/orders/RegisterReturnOnDetail.jsx";
import DetailReturnsOnOrders from "../../Features/landing/orders/DetailReturnsOnOrders.jsx";
import EditReturn from "../../Features/landing/orders/EditReturn.jsx";

import Favorites from "../../Features/landing/favorites/Favorites.jsx";
import ShoppingCart from "../../Features/landing/shoppingCart/ShoppingCart.jsx";

/* ========= PANEL ADMIN ========= */
import AdminLayout from "../../Features/layouts/AdminLayout";
import DashboardPage from "../../Features/layouts/DashboardPage";

/* USERS */
import Users from "../../Features/administrtivePanel/users/pages/Users.jsx";
import FormUser from "../../Features/administrtivePanel/users/components/FormUser.jsx";
import InfoUser from "../../Features/administrtivePanel/users/components/InfoUser.jsx";

//*INDICATORS */
import IndicatorsPage from "../../Features/administrtivePanel/performance/indicators/pages/IndicatorsPage.jsx";

/* PURCHASES */
import Categories from "../../Features/administrtivePanel/purchases/categories/pages/Categories.jsx";
import Products from "../../Features/administrtivePanel/purchases/products/pages/Products.jsx";
import ProvidersPage from "../../Features/administrtivePanel/purchases/providers/page/ProvidersPage.jsx";
import Purchases from "../../Features/administrtivePanel/purchases/purchases/pages/Purchases.jsx";
// import CreatePurchase from "../../Features/administrtivePanel/purchases/purchases/pages/CreatePurchase.jsx";
import CreatePurchase from "../../Features/administrtivePanel/purchases/purchases/pages/CreatePurchase.jsx";
import ReturnsP from "../../Features/administrtivePanel/purchases/returns/pages/Returns.jsx";
// import ReturnForm from "../../Features/administrtivePanel/purchases/returns/modals/ReturnForm.jsx";
// import ReturnInfo from "../../Features/administrtivePanel/purchases/returns/modals/ReturnInfo.jsx";
import NonConformingProducts from "../../Features/administrtivePanel/purchases/nonConformingProducts/pages/NonConformingProducts.jsx";

/* SALES */
import ClientsPage from "../../Features/administrtivePanel/sales/clients/page/ClientsPage.jsx";
import OrdersA from "../../Features/administrtivePanel/sales/orders/pages/Orders.jsx";

import Sales from "../../Features/administrtivePanel/sales/sales/pages/Sales.jsx";
// import SaleForm from "../../Features/administrtivePanel/sales/sales/pages/SaleForm.jsx";
import SaleForm from "../../Features/administrtivePanel/sales/sales/pages/SaleForm.jsx";
// import SaleInfo from "../../Features/administrtivePanel/sales/sales/modals/SaleInfo.jsx";
// import AnnularSale from "../../Features/administrtivePanel/sales/sales/modals/AnnularSale.jsx";
import SaleInfo from "../../Features/administrtivePanel/sales/sales/modals/SaleInfo.jsx";
import AnnularSale from "../../Features/administrtivePanel/sales/sales/modals/AnnularSale.jsx";

import ReturnsPage from "../../Features/administrtivePanel/sales/returns/page/ReturnsPage.jsx";

import PaymentsPage from "../../Features/administrtivePanel/sales/paymentsAndCredits/pages/PaymentsPage.jsx";
import AccountDetailsPage from "../../Features/administrtivePanel/sales/paymentsAndCredits/pages/AccountDetailsPage.jsx";

/* CONFIGURATION */
import RolesPage from "../../Features/administrtivePanel/configuration/roles/page/RolesPage.jsx";
import Banners from "../../Features/administrtivePanel/configuration/carousel/pages/Banner.jsx";

/* PRODUCTS */
import FormProduct from "../../Features/administrtivePanel/purchases/products/modals/CreateProduct.jsx";
import EditProduct from "../../Features/administrtivePanel/purchases/products/modals/EditProduct.jsx";

const AppRouter = () => {
  return (
    <Routes>
      {/* ========= ACCESO ========= */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/resetpassword" element={<ResetPasswordPage />} />
      </Route>

      {/* ========= LANDING ========= */}
      <Route path="/" element={<Landing />}>
        <Route index element={<Home />} />

        <Route path="shop" element={<Shop />} />
        <Route path="shop/detail" element={<ShopDetail />} />

        <Route path="orders-l" element={<OrdersL />} />
        <Route path="orders-l/:id" element={<OrderDetail />} />

        <Route path="returnsOnOrders" element={<ReturnsOnOrders />} />
        <Route path="registerReturn" element={<RegisterReturn />} />
        <Route path="returns/:id" element={<DetailReturnsOnOrders />} />
        <Route path="edit/:id" element={<EditReturn />} />

        <Route path="favorites" element={<Favorites />} />
        <Route path="cart" element={<ShoppingCart />} />
      </Route>

      {/* ========= PANEL ADMIN ========= */}

      <Route element={<PrivateRoute requireRole={false} />}>
        {/* Ruta para editar perfil, accesible para cualquier usuario autenticado */}
        <Route path="/perfil/editar" element={<EditProfilePage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={
              <PermissionGuard
                permission="dashboard.ver"
                fallback={<Navigate to="/admin" replace />}
              >
                <DashboardPage />
              </PermissionGuard>
            }
          />

          {/* PERFORMANCE */}
          <Route
            path="dashboard"
            element={
              <PermissionGuard
                permission="dashboard.ver"
                fallback={<Navigate to="/admin" replace />}
              >
                <IndicatorsPage />
              </PermissionGuard>
            }
          />

          {/* USERS */}
          <Route
            path="users"
            element={
              <PermissionGuard
                permission="usuarios.ver"
                fallback={<Navigate to="/admin" replace />}
              >
                <Users />
              </PermissionGuard>
            }
          />
          <Route
            path="users/form-user"
            element={
              <PermissionGuard
                permission="usuarios.ver"
                fallback={<Navigate to="/admin" replace />}
              >
                <FormUser />
              </PermissionGuard>
            }
          />
          <Route
            path="users/info-user"
            element={
              <PermissionGuard
                permission="usuarios.ver"
                fallback={<Navigate to="/admin" replace />}
              >
                <InfoUser />
              </PermissionGuard>
            }
          />

          {/* PURCHASES */}
          <Route
            path="purchases/categories"
            element={
              <PermissionGuard
                permission="categorias.ver"
                fallback={<Navigate to="/admin" replace />}
              >
                <Categories />
              </PermissionGuard>
            }
          />
          <Route
            path="purchases/products"
            element={
              <PermissionGuard
                permission="productos.ver"
                fallback={<Navigate to="/admin" replace />}
              >
                <Products />
              </PermissionGuard>
            }
          />
          <Route
            path="purchases/providers"
            element={
              <PermissionGuard
                permission="proveedores.ver"
                fallback={<Navigate to="/admin" replace />}
              >
                <ProvidersPage />
              </PermissionGuard>
            }
          />
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/create" element={<CreatePurchase />} />
          <Route path="purchases/returns-p" element={<ReturnsP />} />
          {/* <Route
            path="purchases/return-form"
            element={
              <PermissionGuard permission="devoluciones_en_compras.ver" fallback={<Navigate to="/admin" replace />}>
                <ReturnForm />
              </PermissionGuard>
            }
          />
          <Route
            path="purchases/return-info"
            element={
              <PermissionGuard permission="devoluciones_en_compras.ver" fallback={<Navigate to="/admin" replace />}>
                <ReturnInfo />
              </PermissionGuard>
            }
          /> */}
          <Route
            path="purchases/non-conforming-products"
            element={<NonConformingProducts />}
          />

          {/* SALES */}
          <Route path="sales" element={<Sales />} />
          <Route path="sales/form-sale" element={<SaleForm />} />
          <Route path="sales/info-sale" element={<SaleInfo />} />
          <Route path="sales/annular-sale" element={<AnnularSale />} />

          <Route path="sales/clients" element={<ClientsPage />} />
          <Route path="sales/orders" element={<OrdersA />} />
          <Route path="sales/returns-s" element={<ReturnsPage />} />

          {/* PAYMENTS */}
          <Route path="sales/payments-and-credits" element={<PaymentsPage />} />
          <Route
            path="sales/payments-and-credits/:id"
            element={<AccountDetailsPage mode="view" />}
          />
          <Route
            path="sales/payments-and-credits/:id/payment"
            element={<AccountDetailsPage mode="payment" />}
          />

          {/* CONFIGURATION */}
          <Route
            path="configuration/roles"
            element={
              <PermissionGuard
                permission="roles.ver"
                fallback={<Navigate to="/admin" replace />}
              >
                <RolesPage />
              </PermissionGuard>
            }
          />
          <Route path="configuration/banners" element={<Banners />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
