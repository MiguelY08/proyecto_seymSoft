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

import Roles from '../../Features/administrtivePanel/configuration/roles/Roles.jsx';


const AppRouter = () => {
  return (
        <Routes>
          {/* RUTA DE DESARROLLO */}
          <Route element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />

              <Route path="indicators" element={ <Indicators /> } />

              <Route path="users" element={<Users />}>
                <Route path="form-user" element={ <FormUser /> } />
                <Route path="info-user" element={ <InfoUser /> } />
              </Route>

              <Route path="categories" element={ <Categories /> } />
              <Route path="products" element={ <Products /> } />
              <Route path="providers" element={ <Providers /> } />
              <Route path="purchases" element={ <Purchases /> } />
              <Route path="returns-p" element={ <ReturnsP /> } />
              <Route path="non-conforming-products" element={ <NonConformingProducts /> } />

              <Route path="clients" element={ <Clients /> } />
              <Route path="orders" element={ <Orders /> } />
              <Route path="sales" element={ <Sales /> } />
              <Route path="returns-s" element={ <ReturnsS /> } />
              <Route path="payments-and-credits" element={ <PaymentAndCredits /> } />

              <Route path="carousel" element={ <Appearance /> } />
              <Route path="roles" element={ <Roles /> } />
            </Route>
          </Route>

          <Route path="/" element={<Landing />}>
            <Route path='home' element={ <Home/> } />
            {/* <Route path='store' element={ <Store/> }/> */}
            {/* <Route path='orders-l' element={ <Orders/> } /> */}
            {/* <Route path='favorites' element={ <Favorites/> } /> */}
            {/* <Route path='cart' element={ <Cart/> }/> */}

            {/* <Route path='/log-in' element={ <LogIn/> }/> */}
            {/* <Route path='/register' element={ <Register/> }/> */}
          </Route>

          {/* RUTAS REALES */}
          {/* <Route element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Route>

          <Route path="/" element={<Landing />}/>
            <Route path='/home' element={ <Home/> } />
            <Route path='/store' element={ <Store/> }/>
            <Route path='/orders' element={ <Orders/> } />
            <Route path='/favorites' element={ <Favorites/> } />
            <Route path='/cart' element={ <Cart/> }/>

            <Route path='/log-in' element={ <LogIn/> }/>
            <Route path='/register' element={ <Register/> }>
          </Route> */}
        </Routes>
  );
};

export default AppRouter;