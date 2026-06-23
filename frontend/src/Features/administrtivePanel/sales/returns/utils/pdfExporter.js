import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './returnsHelpers';

const BLUE = [0, 77, 119];
const LIGHT_BLUE = [232, 242, 248];
const RED = [185, 28, 28];

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const text = (value, fallback = 'No registrado') => {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
};

const normalizeProducts = (saleReturn = {}) =>
  (saleReturn.details || saleReturn.productosDevueltos || []).map((product) => {
    const quantity = Number(product.quantity ?? product.cantidad ?? 1) || 1;
    const unitPrice = Number(
      product.unitPrice ?? product.precioUnit ?? product.valor ?? 0,
    ) || 0;

    return {
      name: text(product.productName ?? product.nombre, 'Producto'),
      reason: text(product.reason ?? product.motivo, '-'),
      description: text(product.description ?? product.descripcionMotivo, ''),
      method: text(product.method ?? product.metodo, '-'),
      status: text(product.status ?? product.estado, 'En Proceso'),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };
  });

const addLabelValue = (doc, label, value, x, y, maxWidth = 78) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(doc.splitTextToSize(text(value), maxWidth), x, y + 5);
};

export const exportReturnToPDF = (saleReturn = {}) => {
  const products = normalizeProducts(saleReturn);
  const returnNumber = text(
    saleReturn.returnNumber ?? saleReturn.numeroDevolucion,
    'Sin número',
  );
  const invoiceNumber = text(
    saleReturn.invoiceNumber ?? saleReturn.numeroFactura,
    'Sin factura',
  );
  const status = text(saleReturn.status ?? saleReturn.estado, 'En Proceso');
  const total =
    Number(saleReturn.totalAmount ?? saleReturn.totalValor) ||
    products.reduce((sum, product) => sum + product.total, 0);
  const units = products.reduce((sum, product) => sum + product.quantity, 0);
  const isCancelled = status.toLowerCase().includes('anulad');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageWidth, 31, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('DEVOLUCIÓN DE VENTA', 14, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Papelería Magic · Comprobante de devolución', 14, 21);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(returnNumber, pageWidth - 14, 17, { align: 'right' });

  let y = 41;
  if (isCancelled) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'FD');
    doc.setTextColor(...RED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DEVOLUCIÓN ANULADA', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(
      doc.splitTextToSize(
        `Motivo: ${text(
          saleReturn.cancellationReason ?? saleReturn.cancelReason,
        )}`,
        pageWidth - 38,
      ),
      18,
      y + 12,
    );
    y += 25;
  }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 39, 2, 2, 'F');
  addLabelValue(doc, 'Factura', invoiceNumber, 19, y + 8);
  addLabelValue(doc, 'Cliente', saleReturn.clientName ?? saleReturn.cliente, 19, y + 23);
  addLabelValue(
    doc,
    'Fecha',
    formatDate(saleReturn.createdAt ?? saleReturn.fechaCreacion),
    108,
    y + 8,
  );
  addLabelValue(doc, 'Estado', status, 108, y + 23);
  y += 47;

  addLabelValue(doc, 'Asesor', saleReturn.employeeName ?? saleReturn.asesor, 14, y);
  addLabelValue(doc, 'Teléfono', saleReturn.clientPhone ?? saleReturn.telefono, 78, y, 50);
  addLabelValue(
    doc,
    'Dirección',
    saleReturn.deliveryAddress ?? saleReturn.clientAddress ?? saleReturn.direccion,
    135,
    y,
    58,
  );
  y += 17;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BLUE);
  doc.text('Productos devueltos', 14, y);

  autoTable(doc, {
    startY: y + 4,
    margin: { left: 14, right: 14 },
    head: [['Producto', 'Motivo / detalle', 'Método', 'Estado', 'Cant.', 'Valor', 'Total']],
    body: products.length
      ? products.map((product) => [
          product.name,
          product.description ? `${product.reason}\n${product.description}` : product.reason,
          product.method,
          product.status,
          product.quantity,
          money(product.unitPrice),
          money(product.total),
        ])
      : [['Sin productos registrados', '-', '-', '-', 0, money(0), money(0)]],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: [220, 230, 236],
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 39 },
      2: { cellWidth: 26 },
      3: { cellWidth: 23 },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' },
    },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generado el ${new Date().toLocaleString('es-CO')}`, 14, pageHeight - 7);
      doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth - 14, pageHeight - 7, {
        align: 'right',
      });
    },
  });

  y = doc.lastAutoTable.finalY + 9;
  if (y > 245) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(...LIGHT_BLUE);
  doc.roundedRect(14, y, 112, 28, 2, 2, 'F');
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DESCRIPCIÓN GENERAL', 18, y + 7);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    doc.splitTextToSize(
      text(saleReturn.description ?? saleReturn.descripcion, 'Sin descripción adicional'),
      104,
    ),
    18,
    y + 13,
  );

  doc.setDrawColor(...BLUE);
  doc.roundedRect(132, y, pageWidth - 146, 28, 2, 2, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${products.length} productos · ${units} unidades`, 137, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BLUE);
  doc.text(money(total), pageWidth - 19, y + 20, { align: 'right' });

  doc.save(`devolucion_${returnNumber.replace(/[^a-z0-9_-]/gi, '_')}.pdf`);
};
