import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DetailOrder from '../../orders/modals/DetailOrder';
import { SalesServices } from '../services/salesServices';
import { useAlert } from '../../../../shared/alerts/useAlert';
import Spinner from '../../../../shared/spinner';
import { ESTADOS_PAGO } from '../../orders/services/ordersService';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePaymentStatus = (status, totalPagado, total) => {
  if (total > 0 && totalPagado >= total) return ESTADOS_PAGO.PAGADO;

  const raw = String(status ?? '').toLowerCase();
  if (raw.includes('pagad') || raw.includes('paid')) return ESTADOS_PAGO.PAGADO;
  return ESTADOS_PAGO.PENDIENTE;
};

const mapSaleToOrderDetail = (sale) => {
  const order = sale.order ?? {};
  const customerUser = order.customer?.user ?? {};
  const pagos = (sale.paymentMethods ?? order.payments ?? []).map((payment) => ({
    id: payment.idSalePaymentMethod ?? payment.idOrderPayment ?? payment.id,
    fechaPago: payment.creationDate ?? payment.paymentDate ?? payment.createdAt,
    metodoPago: payment.paymentMethod?.namePaymentMethod ?? payment.metodoPago ?? '-',
    monto: toNumber(payment.amount ?? payment.monto),
  }));
  const total = toNumber(sale.totalNumerico ?? order.total);
  const totalPagado = pagos.reduce((sum, payment) => sum + payment.monto, 0);

  const productos = (sale.items ?? []).map((item) => {
    const cantidad = toNumber(item.cantidad);
    const precioUnitario = toNumber(item.precioUnitario ?? item.product?.precioDetalle);

    return {
      id: item.product?.id,
      nombre: item.product?.nombre ?? 'Producto sin nombre',
      cantidad,
      precioUnitario,
      subtotal: toNumber(item.subtotal, cantidad * precioUnitario),
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
    asesorNombre:
      sale.vendedor ??
      sale.employee?.user?.fullName ??
      sale.employee?.user?.name ??
      '',
    direccionEntrega: order.deliveryAddress ?? order.deliveryAdress ?? sale.direccion,
    total,
    productos,
    pagos,
    totalPagado,
    estadoLogistico: order.orderStatus?.nameStatus?.toLowerCase() ?? order.estadoLogistico ?? '',
    pagoEstado: normalizePaymentStatus(order.paymentStatus ?? order.pagoEstado, totalPagado, total),
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
        <Spinner
          message="Cargando informacion..."
          className="min-h-0 text-white"
        />
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
