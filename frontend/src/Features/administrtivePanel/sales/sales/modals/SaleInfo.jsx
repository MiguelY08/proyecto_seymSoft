// src/features/administrtivePanel/sales/modals/SaleInfo.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DetailOrder from '../../orders/modals/DetailOrder';
import { SalesServices } from '../services/salesServices';
import OrdersService from '../../orders/services/ordersService';
import { clientsService } from '../../clients/services/clientsService';
import { UsersDB } from '../../../users/services/usersDB';
import { useAlert } from '../../../../shared/alerts/useAlert';

/**
 * Modal de información de una venta.
 * Reutiliza DetailOrder en modo 'venta' (solo lectura).
 */
function SaleInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useAlert();

  const saleFromState = location.state?.sale ?? null;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!saleFromState) {
      showError('Error', 'No se encontró información de la venta.');
      navigate('/admin/sales');
      return;
    }

    try {
      const sale = SalesServices.getById(saleFromState.id);
      if (!sale) {
        showError('Error', 'La venta no existe.');
        navigate('/admin/sales');
        return;
      }

      const orderData = OrdersService.findById(sale.pedidoId);
      if (!orderData) {
        showError('Error', 'No se encontró el pedido asociado.');
        navigate('/admin/sales');
        return;
      }

      const cliente = clientsService.getById(orderData.clienteId);
      const clienteNombre = cliente?.name || cliente?.fullName || 'No especificado';
      const clienteTelefono = cliente?.phone || '';
      const clienteEmail = cliente?.email || '';

      const asesor = orderData.asesorId ? UsersDB.findById(orderData.asesorId) : null;
      const asesorNombre = asesor?.name || 'N/A';

      const enrichedOrder = {
        ...orderData,
        clienteNombre,
        clienteTelefono,
        clienteEmail,
        asesorNombre,
      };

      setOrder(enrichedOrder);
    } catch (error) {
      console.error('Error cargando venta:', error);
      showError('Error', 'Ocurrió un error al cargar la venta.');
      navigate('/admin/sales');
    } finally {
      setLoading(false);
    }
  }, [saleFromState, navigate, showError]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => navigate('/admin/sales'), 200);
  };

  const noop = () => {};

  if (loading || !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004D77] mx-auto"></div>
          <p className="text-sm text-gray-600 mt-3">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <DetailOrder
      order={order}
      isOpen={isOpen}
      onClose={handleClose}
      onEdit={noop}
      onCancel={noop}
      onEstadoChange={noop}
      modo="venta"
    />
  );
}

export default SaleInfo;