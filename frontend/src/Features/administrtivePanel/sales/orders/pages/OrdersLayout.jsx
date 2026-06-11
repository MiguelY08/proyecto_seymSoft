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
      <Outlet />
    </div>
  );
}

export default OrdersLayout;