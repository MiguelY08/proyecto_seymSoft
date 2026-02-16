import { Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

// ACCESO
import LoginPage from "../../Features/access/pages/LoginPage.jsx";
import RegisterPage from "../../Features/access/pages/RegisterPage.jsx";
import ForgotPasswordPage from "../../Features/access/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../../Features/access/pages/ResetPasswordPage.jsx";

// LANDING
import Landing from "../../Features/landing/Landing.jsx";
import Home from '../../Features/landing/home/Home.jsx';


// PANEL ADMINISTRATIVO
import AdminLayout from "../../Features/layouts/AdminLayout";
import DashboardPage from "../../Features/layouts/DashboardPage";

import Indicators from "../../Features/administrtivePanel/performance/indicators/Indicators.jsx";

import Users from '../../Features/administrtivePanel/users/users/Users.jsx';
import FormUser from '../../Features/administrtivePanel/users/users/modals/FormUser.jsx';
import InfoUser from '../../Features/administrtivePanel/users/users/modals/InfoUser.jsx';

import Categories from '../../Features/administrtivePanel/purchases/categories/Categories.jsx';
import Products from '../../Features/administrtivePanel/purchases/products/Products.jsx';
import Providers from '../../Features/administrtivePanel/purchases/providers/Providers.jsx';
import Purchases from '../../Features/administrtivePanel/purchases/purchases/Purchases.jsx';
import ReturnsP from '../../Features/administrtivePanel/purchases/returns/Returns.jsx';
import NonConformingProducts from '../../Features/administrtivePanel/purchases/nonConformingProducts/NonConformingProducts.jsx';

import Clients from '../../Features/administrtivePanel/sales/clients/Clients.jsx';
import Orders from '../../Features/administrtivePanel/sales/orders/Orders.jsx';
import Sales from '../../Features/administrtivePanel/sales/sales/Sales.jsx';
import ReturnsS from '../../Features/administrtivePanel/sales/returns/Returns.jsx';
import PaymentAndCredits from '../../Features/administrtivePanel/sales/paymentsAndCredits/PaymentAndCredits.jsx';

import Appearance from '../../Features/administrtivePanel/appearance/Appearance.jsx';

import RolesTable from '../../Features/administrtivePanel/configuration/roles/components/RolesTable.jsx';


const AppRouter = () => {
  return (
    <Routes>
      {/* RUTA DE DESARROLLO */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="indicators" element={ <Indicators /> } />

          <Route path="users" element={<Users />}>
            <Route path="form-user" element={ <FormUser /> } />
            <Route path="info-user" element={ <InfoUser /> } />
          </Route>

          <Route path="purchases/categories" element={ <Categories /> } />
          <Route path="purchases/products" element={ <Products /> } />
          <Route path="purchases/providers" element={ <Providers /> } />
          <Route path="purchases" element={ <Purchases /> } />
          <Route path="purchases/returns-p" element={ <ReturnsP /> } />
          <Route path="purchases/non-conforming-products" element={ <NonConformingProducts /> } />

          <Route path="sales/clients" element={ <Clients /> } />
          <Route path="sales/orders" element={ <Orders /> } />
          <Route path="sales" element={ <Sales /> } />
          <Route path="sales/returns-s" element={ <ReturnsS /> } />
          <Route path="sales/payments-and-credits" element={ <PaymentAndCredits /> } />

          <Route path="appearance/carousel" element={ <Appearance /> } />

          <Route path="configuration">
            <Route path="roles" element={<RolesTable />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Landing />}>
        <Route path='home' element={ <Home/> } />
        {/* <Route path='store' element={ <Store/> }/> */}
        {/* <Route path='orders-l' element={ <Orders/> } /> */}
        {/* <Route path='favorites' element={ <Favorites/> } /> */}
        {/* <Route path='cart' element={ <Cart/> }/> */}

        <Route path="/log-inn" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rescue-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
