import { exportStyledWorkbook } from "../../../../shared/excel/exportStyledWorkbook";
import { getPurchaseReturnProviderName } from "./returnsHelpers";

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? String(dateValue)
    : date.toLocaleDateString("es-CO");
};

export const exportPurchaseReturnsExcel = async (returns = []) => {
  const currentDate = new Date();
  const fileDate = currentDate.toISOString().split("T")[0];

  const summaryRows = returns.map((returnItem) => {
    const progress = returnItem.progress ?? {};
    const total = returnItem.totalDetails ?? progress.total ?? 0;
    const completed = returnItem.completedDetails ?? progress.completed ?? 0;

    return {
      returnNumber: returnItem.id ?? "",
      invoice: returnItem.invoiceNumber ?? returnItem.idCompra ?? "",
      provider: getPurchaseReturnProviderName(returnItem, ""),
      date: formatDate(returnItem.creationDate ?? returnItem.fechaDevolucion),
      status: returnItem.status ?? returnItem.estado ?? "",
      progress: progress.label ?? `${completed}/${total}`,
      details: total,
      completed,
    };
  });

  const statusTotals = returns.reduce((totals, returnItem) => {
    const status = returnItem.status ?? returnItem.estado ?? "Sin estado";
    totals[status] = (totals[status] ?? 0) + 1;
    return totals;
  }, {});

  const statsRows = [
    { metric: "Total devoluciones", value: returns.length },
    ...Object.entries(statusTotals).map(([status, value]) => ({
      metric: `Estado: ${status}`,
      value,
    })),
    { metric: "Fecha de exportación", value: currentDate.toLocaleString("es-CO") },
  ];

  await exportStyledWorkbook({
    fileName: `devoluciones_compras_${fileDate}.xlsx`,
    subtitle: `Fecha de exportación: ${currentDate.toLocaleString("es-CO")}`,
    sheets: [
      {
        name: "Resumen",
        title: "DEVOLUCIONES DE COMPRAS",
        columns: [
          { header: "No. devolución", key: "returnNumber", width: 18 },
          { header: "Factura", key: "invoice", width: 18 },
          { header: "Proveedor", key: "provider", width: 30 },
          { header: "Fecha devolución", key: "date", width: 18 },
          { header: "Estado", key: "status", width: 20 },
          { header: "Progreso", key: "progress", width: 14 },
          { header: "Total detalles", key: "details", width: 16 },
          { header: "Detalles listos", key: "completed", width: 16 },
        ],
        rows: summaryRows,
      },
      {
        name: "Estadísticas",
        title: "ESTADÍSTICAS DE DEVOLUCIONES",
        columns: [
          { header: "Métrica", key: "metric", width: 38 },
          { header: "Valor", key: "value", width: 22 },
        ],
        rows: statsRows,
      },
    ],
  });
};
