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
    <div className="h-full min-h-0 min-w-0 w-full">
      <Outlet />
    </div>
  );
}

export default OrdersLayout;
