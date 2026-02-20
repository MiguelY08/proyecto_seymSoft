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
import Shop from "../../Features/landing/shop/pages/Shop.jsx";
import ShopDetail from "../../Features/landing/shop/pages/ShopDetails.jsx";
import OrdersL from "../../Features/landing/orders/Orders.jsx";
import OrderDetail from "../../Features/landing/orders/OrderDetail.jsx";
import Favorites from "../../Features/landing/favorites/Favorites.jsx";
import ShoppingCart from "../../Features/landing/shoppingCart/ShoppingCart.jsx";
import ReturnsOnOrders from "../../Features/landing/orders/Returns_On_Orders.jsx"
import RegisterReturn from "../../Features/landing/orders/RegisterReturnOnDetail.jsx"



// PANEL ADMINISTRATIVO
import AdminLayout from "../../Features/layouts/AdminLayout";
import DashboardPage from "../../Features/layouts/DashboardPage";

import Indicators from "../../Features/administrtivePanel/performance/indicators/Indicators.jsx";

import Users from '../../Features/administrtivePanel/users/pages/Users.jsx';
import FormUser from '../../Features/administrtivePanel/users/components/FormUser.jsx';
import InfoUser from '../../Features/administrtivePanel/users/components/InfoUser.jsx';

import Categories from "../../Features/administrtivePanel/purchases/categories/pages/Categories.jsx";
import Products from '../../Features/administrtivePanel/purchases/products/Products.jsx';
import Providers from '../../Features/administrtivePanel/purchases/providers/Providers.jsx';
import Purchases from "../../Features/administrtivePanel/purchases/purchases/pages/Purchases.jsx";
import CreatePurchase from "../../Features/administrtivePanel/purchases/purchases/pages/CreatePurchase.jsx";
import ReturnsP from '../../Features/administrtivePanel/purchases/returns/Returns.jsx';
import NonConformingProducts from '../../Features/administrtivePanel/purchases/nonConformingProducts/NonConformingProducts.jsx';

import Clients from '../../Features/administrtivePanel/sales/clients/Clients.jsx';
import OrdersA from '../../Features/administrtivePanel/sales/orders/Orders.jsx';
import Sales from '../../Features/administrtivePanel/sales/sales/Sales.jsx';
import ReturnsS from '../../Features/administrtivePanel/sales/returns/Returns.jsx';
import PaymentAndCredits from '../../Features/administrtivePanel/sales/paymentsAndCredits/PaymentAndCredits.jsx';

import RolesPage from "../../Features/administrtivePanel/configuration/roles/page/RolesPage.jsx";
import Banners from "../../Features/administrtivePanel/appearance/Banners.jsx";


import RolesTable from '../../Features/administrtivePanel/configuration/roles/components/RolesTable.jsx';
import RegisterReturnOnDetail from "../../Features/landing/orders/RegisterReturnOnDetail.jsx";
import DetailReturnsOnOrders from "../../Features/landing/orders/DetailReturnsOnOrders.jsx";
import EditReturn from "../../Features/landing/orders/EditReturn.jsx";
import CreateProduct from "../../Features/administrtivePanel/purchases/products/modals/CreateProduct.jsx";
import FormProduct from "../../Features/administrtivePanel/purchases/products/modals/CreateProduct.jsx";
import EditProduct from "../../Features/administrtivePanel/purchases/products/modals/EditProduct.jsx";


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
          <Route path="purchases/create" element={ <CreatePurchase /> } />
          <Route path="purchases/returns-p" element={ <ReturnsP /> } />
          <Route path="purchases/non-conforming-products" element={ <NonConformingProducts /> } />

          <Route path="sales/clients" element={ <Clients /> } />
          <Route path="sales/orders" element={ <OrdersA/> } />
          <Route path="sales" element={ <Sales /> } />
          <Route path="sales/returns-s" element={ <ReturnsS /> } />
          <Route path="sales/payments-and-credits" element={ <PaymentAndCredits /> } />

      

          <Route path="configuration">
            <Route path="roles" element={<RolesPage />} />
            <Route path="banners" element={ <Banners /> } />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Landing />}>
        <Route index element={ <Home/> } />
        <Route path='shop' element={ <Shop/> }/>
        <Route path='orders-l' element={ <OrdersL/> } /> 
        <Route path='favorites' element={ <Favorites/> } /> 
        <Route path='cart' element={ <ShoppingCart/> }/> 
        <Route path='favorites' element={ <Favorites/> } /> 
        <Route path='cart' element={ <ShoppingCart/> }/> 
        <Route path='shop/detail' element={ <ShopDetail/> }/>
        {/* <Route path='orders-l' element={ <Orders/> } /> */}
        {/* <Route path='favorites' element={ <Favorites/> } /> */}
        {/* <Route path='cart' element={ <Cart/> }/> */}

        <Route path="/login" element={<LoginPage />} />
        <Route path="/orders-l/:id" element={<OrderDetail />} />    
        <Route path='returnsOnOrders' element={ <ReturnsOnOrders/> } />
         <Route path='registerReturn' element={ <RegisterReturn/> } />
         <Route path='favorites' element={ <Favorites/> } /> 
         <Route path='cart' element={ <ShoppingCart/> }/> 
         <Route path='returns/:id' element={ <DetailReturnsOnOrders/> }/> 
         <Route path='edit/:id' element={ <EditReturn/> }/>
         <Route path="/returns/:id" element={<RegisterReturnOnDetail />} />
         <Route path="create" element={<FormProduct/>} />
         <Route path="edit" element={<EditProduct/>} />





        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rescue-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter
