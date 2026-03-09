import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";


/* ========= ACCESO ========= */
import LoginPage from "../../Features/access/pages/LoginPage.jsx";
import RegisterPage from "../../Features/access/pages/RegisterPage.jsx";
import ForgotPasswordPage from "../../Features/access/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../../Features/access/pages/ResetPasswordPage.jsx";

/* ========= LANDING ========= */
import Landing from "../../Features/landing/Landing.jsx";
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
import Products from "../../Features/administrtivePanel/purchases/products/Products.jsx";
import Providers from "../../Features/administrtivePanel/purchases/providers/Providers.jsx";
import Purchases from "../../Features/administrtivePanel/purchases/purchases/pages/Purchases.jsx";
import CreatePurchase from "../../Features/administrtivePanel/purchases/purchases/pages/CreatePurchase.jsx";
import ReturnsP from "../../Features/administrtivePanel/purchases/returns/Returns.jsx";
import NonConformingProducts from "../../Features/administrtivePanel/purchases/nonConformingProducts/pages/NonConformingProducts.jsx";

/* SALES */
import Clients from "../../Features/administrtivePanel/sales/clients/Clients.jsx";
import OrdersA from "../../Features/administrtivePanel/sales/orders/pages/Orders.jsx";

import Sales from "../../Features/administrtivePanel/sales/sales/pages/Sales.jsx";
import SaleForm from "../../Features/administrtivePanel/sales/sales/pages/SaleForm.jsx";
import SaleInfo from "../../Features/administrtivePanel/sales/sales/components/SaleInfo.jsx";

import ReturnsS from "../../Features/administrtivePanel/sales/returns/Returns.jsx";

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
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminLayout />}>

          <Route index element={<DashboardPage />} />

          {/* PERFORMANCE */}
          <Route path="dashboard" element={<IndicatorsPage/>} />

          {/* USERS */}
          <Route path="users" element={<Users />} />
          <Route path="users/form-user" element={<FormUser />} />
          <Route path="users/info-user" element={<InfoUser />} />

          {/* PURCHASES */}
          <Route path="purchases/categories" element={<Categories />} />
          <Route path="purchases/products" element={<Products />} />
          <Route path="purchases/providers" element={<Providers />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/create" element={<CreatePurchase />} />
          <Route path="purchases/returns-p" element={<ReturnsP />} />
          <Route path="purchases/non-conforming-products" element={<NonConformingProducts />} />

          {/* SALES */}
          <Route path="sales" element={<Sales />} />
          <Route path="sales/form-sale" element={<SaleForm />} />
          <Route path="sales/info-sale" element={<SaleInfo />} />

          <Route path="sales/clients" element={<Clients />} />
          <Route path="sales/orders" element={<OrdersA />} />
          <Route path="sales/returns-s" element={<ReturnsS />} />

          {/* PAYMENTS */}
          <Route path="sales/payments-and-credits" element={<PaymentsPage />} />
          <Route path="sales/payments-and-credits/:id" element={<AccountDetailsPage mode="view" />} />
          <Route path="sales/payments-and-credits/:id/payment" element={<AccountDetailsPage mode="payment" />} />

          {/* CONFIGURATION */}
          <Route path="configuration/roles" element={<RolesPage />} />
          <Route path="configuration/banners" element={<Banners />} />

          {/* PRODUCTS MODALS */}
          <Route path="create" element={<FormProduct />} />
          <Route path="edit" element={<EditProduct />} />

        </Route>
      </Route>

    </Routes>
  );
};

export default AppRouter;