import { exportStyledWorkbook } from "../../../../shared/excel/exportStyledWorkbook";

export const exportPurchasesExcel = async (purchases = []) => {
  const currentDate = new Date();
  const fileDate = currentDate.toISOString().split("T")[0];
  const totalValue = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.precioTotal ?? 0),
    0
  );
  const totalProducts = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.cantidadProductos ?? 0),
    0
  );

  const summaryRows = purchases.map((purchase) => ({
    invoice: purchase.numeroFacturacion ?? "",
    date: purchase.fechaCompra ?? "",
    provider: purchase.proveedor ?? "",
    products: Number(purchase.cantidadProductos ?? 0),
    total: Number(purchase.precioTotal ?? 0),
    returnLimit: purchase.maxReturnDate ?? "",
    status: purchase.estado ?? "",
  }));

  const statsRows = [
    { metric: "Total compras", value: purchases.length },
    { metric: "Valor total comprado", value: totalValue },
    {
      metric: "Promedio por compra",
      value: purchases.length ? totalValue / purchases.length : 0,
    },
    { metric: "Total productos comprados", value: totalProducts },
    {
      metric: "Compras completadas",
      value: purchases.filter((purchase) => purchase.estado === "Completada").length,
    },
    {
      metric: "Compras anuladas",
      value: purchases.filter((purchase) => purchase.estado === "Anulada").length,
    },
    {
      metric: "Compras en proceso",
      value: purchases.filter(
        (purchase) =>
          purchase.estado !== "Completada" && purchase.estado !== "Anulada"
      ).length,
    },
    { metric: "Fecha de exportación", value: currentDate.toLocaleString("es-CO") },
  ];

  await exportStyledWorkbook({
    fileName: `compras_${fileDate}.xlsx`,
    subtitle: `Fecha de exportación: ${currentDate.toLocaleString("es-CO")}`,
    sheets: [
      {
        name: "Resumen Compras",
        title: "COMPRAS",
        columns: [
          { header: "No. Facturación", key: "invoice", width: 20 },
          { header: "Fecha compra", key: "date", width: 16 },
          { header: "Proveedor", key: "provider", width: 30 },
          { header: "Cantidad productos", key: "products", width: 20 },
          { header: "Precio total", key: "total", width: 18 },
          { header: "Fecha límite devolución", key: "returnLimit", width: 24 },
          { header: "Estado", key: "status", width: 16 },
        ],
        rows: summaryRows,
        currencyColumns: ["total"],
      },
      {
        name: "Estadísticas",
        title: "ESTADÍSTICAS DE COMPRAS",
        columns: [
          { header: "Métrica", key: "metric", width: 34 },
          { header: "Valor", key: "value", width: 24 },
        ],
        rows: statsRows,
        currencyColumns: ["value"],
        currencyRows: [1, 2],
      },
    ],
  });
};
