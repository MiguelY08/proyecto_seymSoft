import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CancelOrder from '../modals/CancelOrder';
import OrdersService from '../services/ordersService';
import Spinner from '../../../../shared/spinner';
import { useAlert } from '../../../../shared/alerts/useAlert';

function CancelOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      const result = await OrdersService.findById(id);
      if (!result) {
        showError('Pedido no encontrado', 'No fue posible encontrar el pedido solicitado.');
        navigate('/admin/sales/orders', { replace: true });
        return;
      }
      setOrder(result);
    } catch (error) {
      showError('No se pudo cargar el pedido', error.message || 'Inténtalo nuevamente.');
      navigate('/admin/sales/orders', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showError]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (loading || !order) {
    return <Spinner message="Cargando pedido..." className="min-h-[calc(100dvh-5rem)]" />;
  }

  return (
    <CancelOrder
      order={order}
      contexto="pedido"
      isPage
      onConfirm={(motivo) => OrdersService.cancel(order.id, motivo)}
      onClose={() => navigate('/admin/sales/orders')}
    />
  );
}

export default CancelOrderPage;
