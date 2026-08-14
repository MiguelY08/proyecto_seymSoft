import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getTotalAbonadoCliente,
  getTotalCreditoCliente,
} from "./paymentHelpers";
import logo from "../../../../../assets/PMLogo_Horizontal.png";

const MARGIN = 12;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const BRAND_COLOR = "#004D77";
const TEXT_COLOR = "#374151";
const MUTED_COLOR = "#6B7280";
const BORDER_COLOR = "#E5E7EB";

const valueOrDash = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getDueDate = (factura) => {
  const explicitDate =
    factura.fechaVencimiento ??
    factura.fecha_vencimiento ??
    factura.dueDate ??
    factura.due_date ??
    factura.expirationDate ??
    factura.expiration_date;

  if (explicitDate) {
    return explicitDate;
  }

  if (!factura.fechaCredito) {
    return null;
  }

  const creditDate = new Date(factura.fechaCredito);

  if (Number.isNaN(creditDate.getTime())) {
    return null;
  }

  const dueDate = new Date(creditDate);
  dueDate.setMonth(dueDate.getMonth() + 2);

  return dueDate;
};

const getFacturaDebtTotal = (factura) => {
  const backendDebt = Number(
    factura.saldoPendiente ??
      factura.deudaTotal ??
      factura.remainingBalance ??
      factura.remaining_balance ??
      0,
  );

  if (backendDebt > 0) return backendDebt;

  return (
    Number(
      factura.capitalPendiente ??
        factura.saldo ??
        factura.remainingCapital ??
        factura.remaining_capital ??
        0,
    ) +
    Number(
      factura.interesPendiente ??
        factura.interes ??
        factura.pendingInterest ??
        factura.pending_interest ??
        0,
    )
  );
};

const getUserName = (user) => {
  if (!user) return null;
  if (typeof user === "string") return user;

  const composedName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    user.nombre ??
    user.fullName ??
    user.name ??
    user.userName ??
    user.username ??
    composedName ??
    getUserName(user.user) ??
    user.email ??
    null
  );
};

const getImageDataUrl = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const ensureSpace = (doc, currentY, neededHeight = 28) => {
  if (currentY + neededHeight <= PAGE_HEIGHT - MARGIN) {
    return currentY;
  }

  doc.addPage();
  return MARGIN;
};

const addHeader = (doc, logoDataUrl) => {
  doc.setFillColor(BRAND_COLOR);
  doc.rect(0, 0, PAGE_WIDTH, 19, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.setTextColor("#FFFFFF");
  doc.text("ESTADO DE CUENTA", MARGIN, 12);

  doc.setFillColor("#FFFFFF");
  doc.roundedRect(PAGE_WIDTH - MARGIN - 43, 3, 42, 12, 1.5, 1.5, "F");

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", PAGE_WIDTH - MARGIN - 35, 5, 26, 8);
  }
};

const addReceiptIntro = (doc, emittedAt) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(BRAND_COLOR);
  doc.text("Estado de Cuenta - Comprobante Oficial", PAGE_WIDTH / 2, 32, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(MUTED_COLOR);
  doc.text("Sistema de Pagos y Abonos - Papeleria Magic", PAGE_WIDTH / 2, 41, {
    align: "center",
  });
  doc.setFontSize(8.5);
  doc.setTextColor("#9CA3AF");
  doc.text(`Generado el ${emittedAt}`, PAGE_WIDTH / 2, 48, {
    align: "center",
  });

  doc.setDrawColor(BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(0, 55, PAGE_WIDTH, 55);
};

const addInfoItem = (doc, label, value, x, y) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#9CA3AF");
  doc.text(label, x, y);

  doc.setFontSize(9);
  doc.setTextColor(TEXT_COLOR);
  doc.text(valueOrDash(value), x, y + 6, { maxWidth: 52 });
};

const addClientCard = (doc, account, y) => {
  const cardX = MARGIN;
  const cardWidth = PAGE_WIDTH - MARGIN * 2;
  const cardHeight = 52;

  y = addSectionTitle(doc, "Datos del Cliente", y);

  doc.setDrawColor(BORDER_COLOR);
  doc.setFillColor("#F9FAFB");
  doc.roundedRect(cardX, y, cardWidth, cardHeight, 3, 3, "FD");

  const col1 = cardX + 6;
  const col2 = cardX + 72;
  const col3 = cardX + 138;
  const row1 = y + 12;
  const row2 = y + 28;
  const row3 = y + 44;

  addInfoItem(doc, "Cliente", account?.nombre, col1, row1);
  addInfoItem(doc, "Documento", account?.documento, col2, row1);
  addInfoItem(doc, "Telefono", account?.telefono, col3, row1);
  addInfoItem(doc, "Correo", account?.correo, col1, row2);
  addInfoItem(doc, "Credito Asignado", formatCOP(account?.creditoAsignado), col2, row2);
  addInfoItem(doc, "Credito Utilizado", formatCOP(account?.saldo), col3, row2);
  addInfoItem(doc, "Cupo Disponible", formatCOP(account?.cupoDisponible), col1, row3);

  return y + cardHeight + 8;
};

const addSectionTitle = (doc, title, y) => {
  const nextY = ensureSpace(doc, y, 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(BRAND_COLOR);
  doc.text(title, MARGIN, nextY);

  return nextY + 4;
};

const addPageNumbers = (doc) => {
  const totalPages = doc.internal.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED_COLOR);
    doc.text(
      `Pagina ${page} de ${totalPages}`,
      PAGE_WIDTH - MARGIN,
      PAGE_HEIGHT - 6,
      { align: "right" },
    );
  }
};

const sanitizeFileName = (name) =>
  String(name || "cliente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/gi, "_")
    .replace(/^_+|_+$/g, "");

export const exportAccountReceiptToPDF = async (account) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const facturas = account?.facturas ?? [];
  const logoDataUrl = await getImageDataUrl(logo);
  const emittedAt = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  addHeader(doc, logoDataUrl);
  addReceiptIntro(doc, emittedAt);

  let y = addClientCard(doc, account, 75);

  const totalCredito = getTotalCreditoCliente(account);
  const totalAbonado = getTotalAbonadoCliente(account);
  const saldoTotal =
    Number(account?.deudaTotal ?? 0) ||
    facturas.reduce((total, factura) => total + getFacturaDebtTotal(factura), 0);

  autoTable(doc, {
    startY: y,
    theme: "plain",
    margin: { left: MARGIN, right: MARGIN },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 1.5 },
    body: [
      ["Total credito otorgado", formatCOP(totalCredito)],
      ["Total abonado", formatCOP(totalAbonado)],
      ["Saldo total pendiente", formatCOP(saldoTotal)],
    ],
    columnStyles: {
      0: { fontStyle: "bold", textColor: MUTED_COLOR, cellWidth: 45 },
      1: { fontStyle: "bold", textColor: BRAND_COLOR },
    },
  });

  y = doc.lastAutoTable.finalY + 8;

  if (!facturas.length) {
    y = addSectionTitle(doc, "Creditos", y);
    autoTable(doc, {
      startY: y,
      theme: "grid",
      margin: { left: MARGIN, right: MARGIN },
      body: [["No hay facturas registradas para este cliente."]],
      styles: { font: "helvetica", fontSize: 9, halign: "center" },
    });
  }

  facturas.forEach((factura) => {
    const saldoFactura = getFacturaDebtTotal(factura);
    const abonos = factura.abonos ?? [];
    const invoiceTitle = `Factura ${valueOrDash(factura.nroFactura)}`;

    y = addSectionTitle(doc, invoiceTitle, y);

    autoTable(doc, {
      startY: y,
      theme: "grid",
      margin: { left: MARGIN, right: MARGIN },
      pageBreak: "avoid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        textColor: TEXT_COLOR,
        lineColor: "#E5E7EB",
        lineWidth: 0.1,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: "#F3F4F6",
        textColor: BRAND_COLOR,
        fontStyle: "bold",
      },
      head: [["Nro Factura", "Valor credito", "Fecha credito", "Fecha vencimiento", "Saldo pendiente"]],
      body: [
        [
          valueOrDash(factura.nroFactura),
          formatCOP(factura.valorCredito),
          formatDate(factura.fechaCredito),
          formatDate(getDueDate(factura)),
          formatCOP(saldoFactura),
        ],
      ],
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 36 },
        2: { cellWidth: 36 },
        3: { cellWidth: 40 },
        4: { cellWidth: 46 },
      },
    });

    y = doc.lastAutoTable.finalY + 4;
    y = ensureSpace(doc, y, 34);

    autoTable(doc, {
      startY: y,
      theme: "grid",
      margin: { left: MARGIN, right: MARGIN },
      showHead: "everyPage",
      rowPageBreak: "avoid",
      styles: {
        font: "helvetica",
        fontSize: 7.5,
        cellPadding: 1.8,
        textColor: TEXT_COLOR,
        lineColor: "#E5E7EB",
        lineWidth: 0.1,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: BRAND_COLOR,
        textColor: "#FFFFFF",
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: { fillColor: "#F9FAFB" },
      head: [[
        "Nro abono",
        "Fecha Abono",
        "Monto Abonado",
        "Medio de Pago",
        "Registrado por",
        "Estado del Abono",
      ]],
      body: abonos.length
        ? abonos.map((abono) => [
            `#${valueOrDash(abono.displayId ?? abono.nroAbono)}`,
            formatDate(abono.fecha),
            formatCOP(abono.monto),
            valueOrDash(abono.medioPago),
            valueOrDash(getUserName(abono.registeredBy)),
            abono.isCancelled || abono.anulado ? "Anulado" : "Activo",
          ])
        : [[
            {
              content: "Sin abonos registrados para esta factura.",
              colSpan: 6,
              styles: { halign: "center", textColor: MUTED_COLOR },
            },
          ]],
      columnStyles: {
        0: { cellWidth: 21, halign: "center" },
        1: { cellWidth: 27, halign: "center" },
        2: { cellWidth: 31, halign: "right" },
        3: { cellWidth: 34 },
        4: { cellWidth: 43 },
        5: { cellWidth: 30, halign: "center" },
      },
    });

    y = doc.lastAutoTable.finalY + 8;
  });

  y = ensureSpace(doc, y, 24);
  doc.setDrawColor("#E5E7EB");
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED_COLOR);
  doc.text(
    "Este comprobante certifica el estado de cuenta del cliente a la fecha de emision. Los abonos anulados no se incluyen en el calculo del saldo.",
    MARGIN,
    y + 6,
    { maxWidth: PAGE_WIDTH - MARGIN * 2 },
  );

  addPageNumbers(doc);
  doc.save(`Comprobante_${sanitizeFileName(account?.nombre)}.pdf`);
};
