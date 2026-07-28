import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const BLUE = "004D77";
const LIGHT_BLUE = "DCEBF3";
const LIGHT_GRAY = "F3F4F6";
const WHITE = "FFFFFF";

const moneyFormat = "$ #,##0";
const numberFormat = "#,##0";
const percentFormat = "0.00%";

const formatDate = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CO");
};

const formatRange = (range = {}) => {
  if (!range.startDate || !range.endDate) return "Sin filtro de fechas: vista mensual por defecto";
  return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`;
};

const previousRangeLabel = (range = {}) => {
  if (!range.startDate || !range.endDate) return "Mes anterior al mes actual";

  const dayMs = 24 * 60 * 60 * 1000;
  const start = new Date(`${range.startDate}T00:00:00.000Z`);
  const end = new Date(`${range.endDate}T00:00:00.000Z`);
  const days = Math.max(1, Math.round((end - start) / dayMs) + 1);
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - days + 1);

  return `${formatDate(previousStart.toISOString().slice(0, 10))} - ${formatDate(previousEnd.toISOString().slice(0, 10))}`;
};

const styleTitle = (worksheet, range, title) => {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(":")[0]);
  cell.value = title;
  cell.font = { bold: true, size: 18, color: { argb: WHITE } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
};

const styleHeader = (row) => {
  row.height = 25;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
};

const styleDataRow = (row, index) => {
  row.eachCell((cell) => {
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: index % 2 === 0 ? WHITE : LIGHT_GRAY },
    };
    cell.border = {
      top: { style: "thin", color: { argb: LIGHT_BLUE } },
      left: { style: "thin", color: { argb: LIGHT_BLUE } },
      bottom: { style: "thin", color: { argb: LIGHT_BLUE } },
      right: { style: "thin", color: { argb: LIGHT_BLUE } },
    };
  });
};

const prepareSheet = (worksheet, title, columnCount, range, note) => {
  const lastColumn = worksheet.getColumn(columnCount).letter;
  styleTitle(worksheet, `A1:${lastColumn}1`, title);

  worksheet.mergeCells(`A2:${lastColumn}2`);
  worksheet.getCell("A2").value = `Rango consultado: ${formatRange(range)}`;
  worksheet.getCell("A2").alignment = { horizontal: "center" };
  worksheet.getCell("A2").font = { italic: true, color: { argb: BLUE } };

  worksheet.mergeCells(`A3:${lastColumn}3`);
  worksheet.getCell("A3").value = `Fecha de exportación: ${new Date().toLocaleString("es-CO")}`;
  worksheet.getCell("A3").alignment = { horizontal: "center" };
  worksheet.getCell("A3").font = { italic: true, color: { argb: "64748B" } };

  if (note) {
    worksheet.mergeCells(`A4:${lastColumn}4`);
    worksheet.getCell("A4").value = note;
    worksheet.getCell("A4").alignment = { horizontal: "center", wrapText: true };
    worksheet.getCell("A4").font = { color: { argb: "475569" } };
  }

  worksheet.addRow([]);
};

const addTable = (worksheet, headers, rows, startRowIndex = null) => {
  if (startRowIndex) {
    while (worksheet.rowCount < startRowIndex - 1) worksheet.addRow([]);
  }

  styleHeader(worksheet.addRow(headers));
  rows.forEach((values, index) => {
    const row = worksheet.addRow(values);
    styleDataRow(row, index);
  });
};

const setAutoFilter = (worksheet, from, to) => {
  worksheet.autoFilter = { from, to };
};

export const exportIndicatorsExcel = async (indicators, range = {}) => {
  if (!indicators) return false;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Papelería Magic";
  workbook.created = new Date();

  const summary = workbook.addWorksheet("Resumen general");
  prepareSheet(
    summary,
    "RESUMEN GENERAL DEL DASHBOARD",
    4,
    range,
    "Esta hoja resume las tarjetas principales del dashboard y aclara el periodo anterior usado para comparar crecimiento."
  );
  addTable(summary, ["Indicador", "Valor", "Unidad/Formato", "Explicación"], [
    [
      "Ventas del periodo",
      Number(indicators.monthlySales?.currentMonthSales || 0),
      "COP",
      range.startDate && range.endDate
        ? "Total de ventas aprobadas dentro del rango seleccionado."
        : "Total de ventas aprobadas del mes actual.",
    ],
    [
      "Ventas del periodo anterior",
      Number(indicators.monthlySales?.previousMonthSales || 0),
      "COP",
      `Periodo comparado: ${previousRangeLabel(range)}.`,
    ],
    [
      "Variación de ventas",
      Number(indicators.monthlySales?.growthPercentage || 0) / 100,
      "Porcentaje",
      "Crecimiento o disminución frente al periodo anterior equivalente.",
    ],
    [
      "Clientes activos",
      Number(indicators.activeClients || 0),
      "Clientes",
      "Cantidad actual de clientes activos en el sistema.",
    ],
    [
      "Productos en stock",
      Number(indicators.stock?.totalUnitsInStock || 0),
      "Unidades",
      "Inventario activo actual. Este dato no depende del rango de fechas.",
    ],
    [
      "Primera fecha con métricas",
      indicators.meta?.firstMetricDate ? formatDate(indicators.meta.firstMetricDate) : "No disponible",
      "Fecha",
      "Primera fecha real encontrada entre ventas, compras o devoluciones.",
    ],
  ]);
  summary.getColumn(2).numFmt = moneyFormat;
  summary.getCell("B9").numFmt = percentFormat;
  summary.getCell("B10").numFmt = numberFormat;
  summary.getCell("B11").numFmt = numberFormat;
  summary.columns = [
    { width: 32 },
    { width: 22 },
    { width: 18 },
    { width: 58 },
  ];

  const salesPurchases = workbook.addWorksheet("Ventas vs compras");
  prepareSheet(
    salesPurchases,
    "GRÁFICA: VENTAS VS COMPRAS",
    5,
    range,
    "Corresponde a la gráfica comparativa de ventas y compras del dashboard."
  );
  addTable(
    salesPurchases,
    ["Periodo", "Ventas", "Compras", "Diferencia ventas - compras", "Lectura"],
    (indicators.commercialTrends || []).map((item) => {
      const sales = Number(item.sales || 0);
      const purchases = Number(item.purchases || 0);
      return [
        item.month,
        sales,
        purchases,
        sales - purchases,
        sales >= purchases ? "Ventas iguales o superiores a compras" : "Compras superiores a ventas",
      ];
    })
  );
  salesPurchases.getColumn(2).numFmt = moneyFormat;
  salesPurchases.getColumn(3).numFmt = moneyFormat;
  salesPurchases.getColumn(4).numFmt = moneyFormat;
  salesPurchases.columns = [
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 26 },
    { width: 36 },
  ];

  const salesReturns = workbook.addWorksheet("Ventas vs devoluciones");
  prepareSheet(
    salesReturns,
    "GRÁFICA: VENTAS VS DEVOLUCIONES",
    5,
    range,
    "Corresponde a la gráfica comparativa de ventas y devoluciones de ventas."
  );
  addTable(
    salesReturns,
    ["Periodo", "Ventas", "Devoluciones", "% devoluciones sobre ventas", "Lectura"],
    (indicators.commercialTrends || []).map((item) => {
      const sales = Number(item.sales || 0);
      const returns = Number(item.returns || 0);
      return [
        item.month,
        sales,
        returns,
        sales > 0 ? returns / sales : 0,
        returns > 0 ? "Hubo devoluciones en este periodo" : "Sin devoluciones registradas",
      ];
    })
  );
  salesReturns.getColumn(2).numFmt = moneyFormat;
  salesReturns.getColumn(3).numFmt = moneyFormat;
  salesReturns.getColumn(4).numFmt = percentFormat;
  salesReturns.columns = [
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 28 },
    { width: 34 },
  ];

  const products = workbook.addWorksheet("Productos");
  prepareSheet(
    products,
    "GRÁFICA: TOP PRODUCTOS",
    5,
    range,
    "Se separan los productos más vendidos por cantidad y por valor para que no se mezclen unidades con dinero."
  );
  addTable(products, ["Ranking", "Producto por cantidad", "Unidades vendidas", "Producto por valor", "Valor vendido"], []);
  const quantityProducts = indicators.topProducts?.quantity || [];
  const priceProducts = indicators.topProducts?.price || [];
  const maxProducts = Math.max(quantityProducts.length, priceProducts.length);
  Array.from({ length: maxProducts }).forEach((_, index) => {
    const qty = quantityProducts[index];
    const price = priceProducts[index];
    const row = products.addRow([
      index + 1,
      qty?.productName || "",
      qty ? Number(qty.value || 0) : "",
      price?.productName || "",
      price ? Number(price.value || 0) : "",
    ]);
    row.getCell(3).numFmt = numberFormat;
    row.getCell(5).numFmt = moneyFormat;
    styleDataRow(row, index);
  });
  products.columns = [
    { width: 10 },
    { width: 40 },
    { width: 18 },
    { width: 40 },
    { width: 18 },
  ];

  const categories = workbook.addWorksheet("Categorías");
  prepareSheet(
    categories,
    "GRÁFICA: CATEGORÍAS DEMANDADAS",
    5,
    range,
    "Corresponde a la gráfica circular de categorías demandadas; la participación se calcula sobre las unidades del top mostrado."
  );
  addTable(
    categories,
    ["Ranking", "Categoría", "Unidades vendidas", "Participación", "Lectura"],
    (indicators.categoryDemand || []).map((item, index) => [
      index + 1,
      item.name,
      Number(item.units || 0),
      Number(item.percentage || 0) / 100,
      `${Number(item.percentage || 0).toFixed(1)}% de participación en el top de categorías`,
    ])
  );
  categories.getColumn(3).numFmt = numberFormat;
  categories.getColumn(4).numFmt = percentFormat;
  categories.columns = [
    { width: 10 },
    { width: 34 },
    { width: 20 },
    { width: 18 },
    { width: 44 },
  ];

  const clients = workbook.addWorksheet("Clientes");
  prepareSheet(
    clients,
    "GRÁFICA: TOP CLIENTES",
    5,
    range,
    "Corresponde al top de clientes del periodo según valor comprado."
  );
  const topClientsTotal = (indicators.topClients || []).reduce(
    (total, item) => total + Number(item.value || 0),
    0
  );
  addTable(
    clients,
    ["Ranking", "Cliente", "Valor comprado", "Participación dentro del top", "Lectura"],
    (indicators.topClients || []).map((item, index) => [
      index + 1,
      item.name,
      Number(item.value || 0),
      topClientsTotal > 0 ? Number(item.value || 0) / topClientsTotal : 0,
      "Participación calculada sobre el total del top de clientes mostrado",
    ])
  );
  clients.getColumn(3).numFmt = moneyFormat;
  clients.getColumn(4).numFmt = percentFormat;
  clients.columns = [
    { width: 10 },
    { width: 38 },
    { width: 18 },
    { width: 28 },
    { width: 54 },
  ];

  [summary, salesPurchases, salesReturns, products, categories, clients].forEach((sheet) => {
    sheet.views = [{ state: "frozen", ySplit: 6 }];
    const headerRow = 6;
    const lastColumn = sheet.getColumn(sheet.columnCount).letter;
    setAutoFilter(sheet, `A${headerRow}`, `${lastColumn}${headerRow}`);
  });

  const fileDate = new Date().toISOString().split("T")[0];
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `metricas_dashboard_${fileDate}.xlsx`
  );

  return true;
};
