import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DetailOrder from '../modals/DetailOrder';
import OrdersService from '../services/ordersService';
import Spinner from '../../../../shared/spinner';
import { useAlert } from '../../../../shared/alerts/useAlert';

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const result = await OrdersService.findById(id);
      if (!result) {
        showError('Pedido no encontrado', 'No fue posible encontrar el pedido solicitado.');
        navigate('/admin/sales/orders', { replace: true });
        return;
      }
      setOrder(result);
    } catch (error) {
      showError(
        'No se pudo cargar el pedido',
        error.response?.data?.message || error.message || 'Inténtalo nuevamente.'
      );
      navigate('/admin/sales/orders', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showError]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (loading || !order) {
    return <Spinner message="Cargando detalle del pedido..." className="min-h-[calc(100dvh-5rem)]" />;
  }

  return (
    <DetailOrder
      order={order}
      isOpen
      isPage
      onClose={() => navigate('/admin/sales/orders')}
      onEdit={(selectedOrder) => navigate(`/admin/sales/orders/${selectedOrder.id}`)}
      onOrderRefresh={setOrder}
    />
  );
}

export default OrderDetailPage;
