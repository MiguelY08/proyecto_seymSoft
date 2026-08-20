import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './returnsHelpers';
import logoUrl from '../../../../../assets/PMLogo_Horizontal.png';

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

const wrapLongTokens = (value, chunkSize = 22) => {
  const normalized = text(value, '');
  if (!normalized) return '';

  return normalized
    .split(/\s+/)
    .map((word) => {
      if (word.length <= chunkSize) return word;
      return word.match(new RegExp(`.{1,${chunkSize}}`, 'g'))?.join(' ') || word;
    })
    .join(' ')
    .trim();
};

const splitLines = (doc, value, maxWidth, chunkSize = 22) =>
  doc.splitTextToSize(wrapLongTokens(value, chunkSize), maxWidth);

const normalizeProducts = (saleReturn = {}) =>
  (saleReturn.details || saleReturn.productosDevueltos || []).map((product) => {
    const quantity = Number(product.quantity ?? product.cantidad ?? 1) || 1;
    const unitPrice =
      Number(product.unitPrice ?? product.precioUnit ?? product.valor ?? 0) || 0;

    return {
      name: wrapLongTokens(text(product.productName ?? product.nombre, 'Producto'), 18),
      reason: wrapLongTokens(text(product.reason ?? product.motivo, '-'), 18),
      description: wrapLongTokens(
        text(product.description ?? product.descripcionMotivo, ''),
        18,
      ),
      method: text(product.method ?? product.metodo, '-'),
      status: text(product.status ?? product.estado, 'En Proceso'),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };
  });

const addLabelValue = (doc, label, value, x, y, maxWidth = 78, chunkSize = 22) => {
  const lines = splitLines(doc, text(value), maxWidth, chunkSize);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(lines, x, y + 5);

  return 6 + lines.length * 4.5;
};

const addFooter = (doc, pageWidth, page, pages) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generado el ${new Date().toLocaleString('es-CO')}`,
    14,
    doc.internal.pageSize.getHeight() - 10,
  );
  doc.text(
    `Página ${page} de ${pages}`,
    pageWidth - 14,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'right' },
  );
};

const loadLogoDataUrl = async () => {
  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const exportReturnToPDF = async (saleReturn = {}) => {
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
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoDataUrl = await loadLogoDataUrl();

  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('DEVOLUCIÓN DE VENTA', 14, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Papelería Magic · Comprobante de devolución', 14, 21);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  if (logoDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 58, 5, 44, 16, 2, 2, 'F');
    doc.addImage(logoDataUrl, 'PNG', pageWidth - 55, 8, 38, 10);
  }

  doc.text(returnNumber, pageWidth - 14, 29, { align: 'right' });

  let y = 44;

  if (isCancelled) {
    const cancellationLines = splitLines(
      doc,
      `Motivo: ${text(saleReturn.cancellationReason ?? saleReturn.cancelReason)}`,
      pageWidth - 38,
      24,
    );
    const cancellationHeight = Math.max(18, 13 + cancellationLines.length * 4);

    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(14, y, pageWidth - 28, cancellationHeight, 2, 2, 'FD');
    doc.setTextColor(...RED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DEVOLUCIÓN ANULADA', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(cancellationLines, 18, y + 12);
    y += cancellationHeight + 7;
  }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 39, 2, 2, 'F');

  const invoiceHeight = addLabelValue(doc, 'Factura', invoiceNumber, 19, y + 8);
  const clientHeight = addLabelValue(
    doc,
    'Cliente',
    saleReturn.clientName ?? saleReturn.cliente,
    19,
    y + 23,
  );
  const dateHeight = addLabelValue(
    doc,
    'Fecha',
    formatDate(saleReturn.createdAt ?? saleReturn.fechaCreacion),
    108,
    y + 8,
  );
  const statusHeight = addLabelValue(doc, 'Estado', status, 108, y + 23);

  y += Math.max(47, 19 + invoiceHeight + clientHeight, 19 + dateHeight + statusHeight);

  const advisorHeight = addLabelValue(
    doc,
    'Asesor',
    saleReturn.employeeName ?? saleReturn.asesor,
    14,
    y,
    55,
  );
  const phoneHeight = addLabelValue(
    doc,
    'Teléfono',
    saleReturn.clientPhone ?? saleReturn.telefono,
    78,
    y,
    45,
  );
  const addressHeight = addLabelValue(
    doc,
    'Dirección',
    saleReturn.deliveryAddress ?? saleReturn.clientAddress ?? saleReturn.direccion,
    135,
    y,
    52,
    18,
  );

  y += Math.max(17, advisorHeight, phoneHeight, addressHeight) + 6;

  if (y > pageHeight - 55) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BLUE);
  doc.text('Productos devueltos', 14, y);

  autoTable(doc, {
    startY: y + 4,
    margin: { left: 14, right: 14, bottom: 18 },
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
      fontSize: 7.3,
      cellPadding: 2,
      lineColor: [220, 230, 236],
      lineWidth: 0.2,
      valign: 'top',
      overflow: 'linebreak',
      minCellHeight: 10,
    },
    headStyles: {
      fillColor: BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 35, overflow: 'linebreak' },
      1: { cellWidth: 39, overflow: 'linebreak' },
      2: { cellWidth: 26, overflow: 'linebreak' },
      3: { cellWidth: 23, overflow: 'linebreak' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' },
    },
    rowPageBreak: 'avoid',
  });

  y = doc.lastAutoTable.finalY + 9;

  const descriptionLines = splitLines(
    doc,
    text(saleReturn.description ?? saleReturn.descripcion, 'Sin descripción adicional'),
    104,
    22,
  );
  const descriptionBoxHeight = Math.max(28, 15 + descriptionLines.length * 3.8);
  const summaryBoxHeight = Math.max(28, descriptionBoxHeight);

  if (y + summaryBoxHeight > pageHeight - 18) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(...LIGHT_BLUE);
  doc.roundedRect(14, y, 112, descriptionBoxHeight, 2, 2, 'F');
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DESCRIPCIÓN GENERAL', 18, y + 7);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(descriptionLines, 18, y + 13);

  doc.setDrawColor(...BLUE);
  doc.roundedRect(132, y, pageWidth - 146, summaryBoxHeight, 2, 2, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${products.length} productos · ${units} unidades`, 137, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BLUE);
  doc.text(money(total), pageWidth - 19, y + 20, { align: 'right' });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    addFooter(doc, pageWidth, page, pages);
  }

  doc.save(`devolucion_${returnNumber.replace(/[^a-z0-9_-]/gi, '_')}.pdf`);
};
