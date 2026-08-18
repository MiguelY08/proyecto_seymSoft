import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const normalizePaymentReceipt = (receipt = {}, pedidoId = null) => ({
  id:
    receipt.id ??
    receipt.idPaymentReceipt ??
    receipt.receiptId ??
    receipt.id_order_payment_receipt ??
    receipt.publicId ??
    receipt.url ??
    receipt.imageUrl,
  pedidoId: toNumber(
    receipt.pedidoId ??
      receipt.orderId ??
      receipt.idOrder ??
      receipt.id_order ??
      pedidoId,
    pedidoId
  ),
  imageUrl:
    receipt.imageUrl ??
    receipt.image_url ??
    receipt.secureUrl ??
    receipt.secure_url ??
    receipt.url ??
    receipt.path ??
    '',
  fileName:
    receipt.fileName ??
    receipt.filename ??
    receipt.originalName ??
    receipt.original_name ??
    receipt.name ??
    '',
  uploadedAt:
    receipt.uploadedAt ??
    receipt.createdAt ??
    receipt.created_at ??
    receipt.uploaded_at ??
    receipt.date ??
    new Date().toISOString(),
  status: receipt.status ?? receipt.verificationStatus ?? receipt.verification_status ?? 'pendiente',
  observations: receipt.observations ?? receipt.observaciones ?? '',
  reviewObservations:
    receipt.reviewObservations ??
    receipt.review_observations ??
    receipt.reviewNotes ??
    '',
  reviewedAt: receipt.reviewedAt ?? receipt.reviewed_at ?? null,
  reviewedBy: receipt.reviewedBy ?? receipt.reviewed_by ?? null,
});

const getPaymentReceipts = (sale = {}, order = {}) => {
  const receipts =
    order.comprobantesPago ??
    order.paymentReceipts ??
    order.paymentProofs ??
    order.receipts ??
    sale.comprobantesPago ??
    sale.paymentReceipts ??
    sale.paymentProofs ??
    sale.receipts ??
    [];

  return receipts.map((receipt) =>
    normalizePaymentReceipt(receipt, order.idOrder ?? sale.pedidoId ?? sale.id)
  );
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
    ventaId: sale.id ?? sale.idSale ?? null,
    numeroPedido: order.idOrder ?? sale.numeroPedido ?? sale.pedidoId,
    fechaPedido: order.orderDate ?? sale.saleDate,
    clienteNombre: sale.cliente,
    deliveryRecipientName: sale.deliveryRecipientName ?? order.deliveryRecipientName ?? '',
    deliveryRecipientPhone: sale.deliveryRecipientPhone ?? order.deliveryRecipientPhone ?? '',
    clienteTipoDocumento:
      sale.clienteTipoDocumento ??
      order.clienteTipoDocumento ??
      order.customerDocumentType ??
      order.customer?.documentType ??
      order.customer?.docType ??
      '',
    clienteDocumento:
      sale.clienteDocumento ??
      order.clienteDocumento ??
      order.customerDocument ??
      order.customer?.document ??
      order.customer?.docNumber ??
      order.customer?.doc_number ??
      order.customer?.documentNumber ??
      '',
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
    comprobantesPago: getPaymentReceipts(sale, order),
    totalPagado,
    estadoLogistico: order.orderStatus?.nameStatus?.toLowerCase() ?? order.estadoLogistico ?? '',
    pagoEstado: normalizePaymentStatus(order.paymentStatus ?? order.pagoEstado, totalPagado, total),
    motivoCancelacion: sale.motivoAnulacion ?? '',
    fechaCancelacion: sale.fechaAnulacion ?? '',
  };
};

function SaleInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSale = async () => {
      try {
        const sale = await SalesServices.getById(id);
        if (!sale) {
          showError('Error', 'La venta no existe.');
          navigate('/admin/sales');
          return;
        }

        setOrder(mapSaleToOrderDetail(sale));
      } catch (error) {
        console.error('Error cargando venta:', error);
        showError('Error', 'Ocurrió un error al cargar la venta.');
        navigate('/admin/sales');
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [id, navigate, showError]);

  const handleClose = () => {
    navigate('/admin/sales');
  };

  const noop = () => {};

  if (loading || !order) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center">
        <Spinner
          message="Cargando información..."
          className="min-h-0"
        />
      </div>
    );
  }

  return (
    <DetailOrder
      order={order}
      isOpen
      isPage
      onClose={handleClose}
      onEdit={noop}
      onCancel={noop}
      onEstadoChange={noop}
      modo="venta"
    />
  );
}

export default SaleInfo;
