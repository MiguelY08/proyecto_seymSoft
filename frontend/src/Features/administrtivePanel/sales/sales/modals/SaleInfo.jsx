import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DetailOrder from '../../orders/modals/DetailOrder';
import { SalesServices } from '../services/salesServices';
import { useAlert } from '../../../../shared/alerts/useAlert';

const mapSaleToOrderDetail = (sale) => {
  const order = sale.order ?? {};
  const customerUser = order.customer?.user ?? {};
  const pagos = (sale.paymentMethods ?? order.payments ?? []).map((payment) => ({
    id: payment.idSalePaymentMethod ?? payment.idOrderPayment ?? payment.id,
    fechaPago: payment.creationDate ?? payment.paymentDate ?? payment.createdAt,
    metodoPago: payment.paymentMethod?.namePaymentMethod ?? payment.metodoPago ?? '-',
    monto: Number(payment.amount ?? payment.monto ?? 0),
  }));

  const productos = (sale.items ?? []).map((item) => {
    const cantidad = Number(item.cantidad ?? 0);
    const precioUnitario = Number(item.product?.precioDetalle ?? 0);

    return {
      id: item.product?.id,
      nombre: item.product?.nombre ?? 'Producto sin nombre',
      cantidad,
      precioUnitario,
      subtotal: cantidad * precioUnitario,
    };
  });

  return {
    id: order.idOrder ?? sale.pedidoId ?? sale.id,
    numeroPedido: order.idOrder ?? sale.numeroPedido ?? sale.pedidoId,
    fechaPedido: order.orderDate ?? sale.saleDate,
    clienteNombre: sale.cliente,
    clienteTelefono: customerUser.phone ?? '',
    clienteEmail: customerUser.email ?? '',
    asesorId: sale.vendedorId,
    asesorNombre: sale.vendedor,
    direccionEntrega: order.deliveryAddress ?? order.deliveryAdress ?? sale.direccion,
    total: sale.totalNumerico ?? order.total ?? 0,
    productos,
    pagos,
    totalPagado: pagos.reduce((sum, payment) => sum + payment.monto, 0),
    estadoLogistico: order.orderStatus?.nameStatus?.toLowerCase() ?? order.estadoLogistico ?? '',
    pagoEstado: order.paymentStatus?.toLowerCase() ?? order.pagoEstado ?? '',
    motivoCancelacion: sale.motivoAnulacion ?? '',
    fechaCancelacion: sale.fechaAnulacion ?? '',
  };
};

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
      showError('Error', 'No se encontro informacion de la venta.');
      navigate('/admin/sales');
      return;
    }

    const loadSale = async () => {
      try {
        const sale = await SalesServices.getById(saleFromState.id);
        if (!sale) {
          showError('Error', 'La venta no existe.');
          navigate('/admin/sales');
          return;
        }

        setOrder(mapSaleToOrderDetail(sale));
      } catch (error) {
        console.error('Error cargando venta:', error);
        showError('Error', 'Ocurrio un error al cargar la venta.');
        navigate('/admin/sales');
      } finally {
        setLoading(false);
      }
    };

    loadSale();
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
          <p className="text-sm text-gray-600 mt-3">Cargando informacion...</p>
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
