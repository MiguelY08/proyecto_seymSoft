// src/features/orders/pages/OrdersLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout principal para la sección de Pedidos.
 * Proporciona el contenedor común (fondo, padding) para todas las subrutas.
 * Las rutas hijas (lista, nuevo pedido, edición) se renderizan dentro del Outlet.
 */
function OrdersLayout() {
  return (
    <div className="min-h-screen">
      <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
        <Outlet />
      </div>
    </div>
  );
}

export default OrdersLayout;