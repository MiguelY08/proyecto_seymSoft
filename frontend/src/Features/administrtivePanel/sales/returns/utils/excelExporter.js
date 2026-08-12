import { exportStyledWorkbook } from "../../../../shared/excel/exportStyledWorkbook";
import { formatDate } from "./returnsHelpers";

const detailsOf = (item) => item.details || item.productosDevueltos || [];

const valueOf = (item, ...keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) return item[key];
  }
  return "";
};

const buildSummaryRows = (returns) =>
  returns.map((item) => {
    const details = detailsOf(item);

    return {
      returnNumber: valueOf(item, "returnNumber", "numeroDevolucion"),
      invoiceNumber: valueOf(item, "invoiceNumber", "numeroFactura"),
      clientName: valueOf(item, "clientName", "cliente"),
      createdAt: formatDate(valueOf(item, "createdAt", "fechaCreacion")),
      status: valueOf(item, "status", "estado") || "En Proceso",
      productsCount: details.length,
      unitsCount: details.reduce(
        (sum, detail) => sum + Number(valueOf(detail, "quantity", "cantidad") || 0),
        0,
      ),
      totalAmount: Number(valueOf(item, "totalAmount", "totalValor")) || 0,
      employeeName: valueOf(item, "employeeName", "asesor"),
      description: valueOf(item, "description", "descripcion"),
    };
  });

const buildProductRows = (returns) => {
  const rows = [];

  returns.forEach((item) => {
    detailsOf(item).forEach((detail) => {
      const quantity = Number(valueOf(detail, "quantity", "cantidad")) || 1;
      const unitPrice = Number(valueOf(detail, "unitPrice", "precioUnit", "valor")) || 0;

      rows.push({
        returnNumber: valueOf(item, "returnNumber", "numeroDevolucion"),
        invoiceNumber: valueOf(item, "invoiceNumber", "numeroFactura"),
        clientName: valueOf(item, "clientName", "cliente"),
        productName: valueOf(detail, "productName", "nombre") || "Producto",
        quantity,
        unitPrice,
        total: quantity * unitPrice,
        reason: valueOf(detail, "reason", "motivo"),
        reasonDescription: valueOf(detail, "description", "descripcionMotivo"),
        method: valueOf(detail, "method", "metodo"),
        productStatus: valueOf(detail, "status", "estado") || "En Proceso",
      });
    });
  });

  return rows;
};

export const exportReturnsToExcel = async (returns = []) => {
  if (!Array.isArray(returns) || returns.length === 0) return false;

  const currentDate = new Date();
  const fileDate = currentDate.toISOString().split("T")[0];

  await exportStyledWorkbook({
    fileName: `devoluciones_ventas_${fileDate}.xlsx`,
    subtitle: `Fecha de exportacion: ${currentDate.toLocaleString("es-CO")}`,
    sheets: [
      {
        name: "Devoluciones",
        title: "DEVOLUCIONES DE VENTAS",
        columns: [
          { header: "N.o devolucion", key: "returnNumber", width: 20 },
          { header: "Factura", key: "invoiceNumber", width: 17 },
          { header: "Cliente", key: "clientName", width: 31 },
          { header: "Fecha", key: "createdAt", width: 15 },
          { header: "Estado", key: "status", width: 17 },
          { header: "Productos", key: "productsCount", width: 12 },
          { header: "Unidades", key: "unitsCount", width: 12 },
          { header: "Valor total", key: "totalAmount", width: 18 },
          { header: "Asesor", key: "employeeName", width: 25 },
          { header: "Descripcion", key: "description", width: 42 },
        ],
        rows: buildSummaryRows(returns),
        currencyColumns: ["totalAmount"],
      },
      {
        name: "Productos devueltos",
        title: "DETALLE DE PRODUCTOS DEVUELTOS",
        columns: [
          { header: "N.o devolucion", key: "returnNumber", width: 20 },
          { header: "Factura", key: "invoiceNumber", width: 17 },
          { header: "Cliente", key: "clientName", width: 30 },
          { header: "Producto", key: "productName", width: 38 },
          { header: "Cantidad", key: "quantity", width: 11 },
          { header: "Precio unitario", key: "unitPrice", width: 18 },
          { header: "Total", key: "total", width: 18 },
          { header: "Motivo", key: "reason", width: 28 },
          { header: "Descripcion motivo", key: "reasonDescription", width: 36 },
          { header: "Metodo", key: "method", width: 22 },
          { header: "Estado producto", key: "productStatus", width: 20 },
        ],
        rows: buildProductRows(returns),
        currencyColumns: ["unitPrice", "total"],
      },
    ],
  });

  return true;
};

export const exportReturnsSummaryToExcel = exportReturnsToExcel;
