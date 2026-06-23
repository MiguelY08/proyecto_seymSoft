// src/features/administrtivePanel/sales/helpers/salesHelpers.js
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { UserService } from '../../../users/services/userService';
import { SalesServices } from '../services/salesServices';

// ─── Claves de almacenamiento (deprecadas, pero mantenidas por compatibilidad) ─
export const SALES_STORAGE_KEY = 'pm_sales';
export const USERS_STORAGE_KEY = 'users';

// ─── Constantes de formulario ─────────────────────────────────────────────────
export const METODOS_PAGO = ['Efectivo', 'Crédito', 'Transferencia'];
export const ESTADOS_VENTA = ['Pagada', 'Cancelada']; // ✅ actualizado
export const ENTREGAS = ['Cliente lo recoge', 'Domicilio'];

export const getClientCreditInfo = () => ({ creditAmount: 0, balance: 0, available: 0 });

// ─── Estructura inicial de montos de pago ─────────────────────────────────────
export const getInitialPaymentAmounts = () => ({
  Efectivo: 0,
  Crédito: 0,
  Transferencia: 0,
});

// ─── Validación de montos de pago ────────────────────────────────────────────
export const validatePaymentAmounts = (paymentAmounts, total) => {
  const suma = Object.values(paymentAmounts).reduce((acc, val) => acc + (Number(val) || 0), 0);
  if (suma > total) {
    const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    return `La suma de los pagos (${formatter.format(suma)}) supera el total de la venta (${formatter.format(total)}).`;
  }
  return null;
};

// ─── Formateador de precios ───────────────────────────────────────────────────
export const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

// ─── Fecha de hoy en formato colombiano ──────────────────────────────────────
export const today = () =>
  new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

// ─── Cargar usuarios desde UserService ───────────────────────────────────────────
export const loadSalesUsers = () => UserService.list();

// ─── Resaltador de texto para la tabla ───────────────────────────────────────
export function highlight(text, term) {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ─── Filtro global para la tabla de ventas (simplificado) ─────────────────────
export const filterSales = (data, search) => {
  const normalizeSearchText = (value) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const term = normalizeSearchText(search);
  if (!term) return data;

  return data.filter((row) => {
    const searchableFields = [
      row.factura,
      row.id,
      row.idSale,
      row.cliente,
      row.clienteId,
      row.clienteDireccion,
      row.vendedor,
      row.vendedorId,
      row.fecha,
      row.metodoPago,
      row.total,
      row.totalNumerico,
      row.estado,
      row.estadoPedido,
      row.estadoPedidoId,
      row.tipoVenta,
      row.entrega,
      row.direccion,
      row.pedidoId,
      row.numeroPedido,
      row.registradoDesde,
    ];

    return searchableFields.some((field) =>
      normalizeSearchText(field).includes(term)
    );
  });
};

// ─── Validación del formulario de venta (sin estado, fijo 'Pagada') ───────────
export const validateForm = (form, items) => {
  const errors = {};
  if (!form.clienteId) errors.clienteId = 'Seleccione un cliente.';
  if (!form.vendedorId) errors.vendedorId = 'Seleccione un vendedor.';
  if (!form.metodoPago || (Array.isArray(form.metodoPago) && form.metodoPago.length === 0))
    errors.metodoPago = 'Seleccione al menos un método de pago.';
  if (!form.entrega) errors.entrega = 'Seleccione una opción de entrega.';
  if (form.entrega === 'Domicilio' && !form.direccion?.trim())
    errors.direccion = 'Ingrese la dirección de entrega.';
  if (items.length === 0) errors.items = 'Agrega al menos un producto al pedido.';
  return errors;
};

// ─── Exportar ventas a Excel (actualizado para usar SalesServices) ────────────
const getSalesForExcel = async () => {
  const firstPage = await SalesServices.getAll({ page: 1, limit: 100 });
  const allSales = [...(firstPage.sales ?? [])];
  const totalPages = firstPage.pagination?.totalPages ?? 1;

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await SalesServices.getAll({ page, limit: 100 });
    allSales.push(...(response.sales ?? []));
  }

  return allSales;
};

const COMPANY_COLOR = '004D77';
const LIGHT_BLUE = 'DCEBF3';
const LIGHT_GRAY = 'F3F4F6';
const WHITE = 'FFFFFF';
const CURRENCY_FORMAT = '"$"#,##0';

const normalizeValue = (value, fallback = '') =>
  value === undefined || value === null || value === '' ? fallback : value;

const getPaymentMethodText = (method) =>
  Array.isArray(method) ? method.filter(Boolean).join(', ') : normalizeValue(method);

const getSaleLineTotal = (item) => {
  const explicitTotal = item.total ?? item.totalLinea ?? item.lineTotal ?? item.subtotal;
  if (explicitTotal !== undefined && explicitTotal !== null && explicitTotal !== '') {
    return Number(explicitTotal) || 0;
  }

  const quantity = Number(item.cantidad ?? item.quantity ?? 0);
  const product = item.product ?? {};
  const unitPrice = Number(item.precioUnitario ?? product.precioDetalle ?? product.retailPrice ?? 0);
  return quantity * unitPrice;
};

const styleTitle = (worksheet, range, title) => {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(':')[0]);
  cell.value = title;
  cell.font = {
    bold: true,
    size: 18,
    color: { argb: WHITE },
  };
  cell.alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COMPANY_COLOR },
  };
};

const styleSubtitle = (worksheet, range, text) => {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(':')[0]);
  cell.value = text;
  cell.alignment = {
    horizontal: 'center',
  };
  cell.font = {
    italic: true,
    color: { argb: COMPANY_COLOR },
  };
};

const styleHeaderRow = (row) => {
  row.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: WHITE },
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COMPANY_COLOR },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
};

const styleDataRow = (row, index) => {
  row.eachCell((cell) => {
    cell.alignment = {
      vertical: 'middle',
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: index % 2 === 0 ? WHITE : LIGHT_GRAY },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: LIGHT_BLUE } },
      left: { style: 'thin', color: { argb: LIGHT_BLUE } },
      bottom: { style: 'thin', color: { argb: LIGHT_BLUE } },
      right: { style: 'thin', color: { argb: LIGHT_BLUE } },
    };
  });
};

const setupWorksheetHeader = (worksheet, title, subtitle, lastColumn) => {
  styleTitle(worksheet, `A1:${lastColumn}1`, title);
  styleSubtitle(worksheet, `A2:${lastColumn}2`, subtitle);
  worksheet.addRow([]);
};

const applyWorksheetTableSettings = (worksheet, headerRowNumber, lastColumn) => {
  worksheet.views = [
    {
      state: 'frozen',
      ySplit: headerRowNumber,
    },
  ];
  worksheet.autoFilter = {
    from: `A${headerRowNumber}`,
    to: `${lastColumn}${headerRowNumber}`,
  };
};

const buildSummarySheet = (workbook, sales, subtitle) => {
  const worksheet = workbook.addWorksheet('Resumen Ventas');
  setupWorksheetHeader(worksheet, 'VENTAS', subtitle, 'I');

  worksheet.columns = [
    { key: 'invoice', width: 16 },
    { key: 'type', width: 16 },
    { key: 'client', width: 30 },
    { key: 'seller', width: 30 },
    { key: 'date', width: 16 },
    { key: 'paymentMethod', width: 22 },
    { key: 'total', width: 16 },
    { key: 'status', width: 18 },
    { key: 'registeredFrom', width: 18 },
  ];

  const headerRow = worksheet.addRow([
    'No. Factura',
    'Tipo',
    'Cliente',
    'Vendedor',
    'Fecha',
    'Metodo de pago',
    'Total',
    'Estado',
    'Registrado desde',
  ]);
  styleHeaderRow(headerRow);

  sales.forEach((sale, index) => {
    const row = worksheet.addRow({
      invoice: normalizeValue(sale.factura),
      type: normalizeValue(sale.tipoVenta, 'Sin tipo'),
      client: normalizeValue(sale.cliente, 'Sin cliente'),
      seller: normalizeValue(sale.vendedor, 'Sin vendedor'),
      date: normalizeValue(sale.fecha),
      paymentMethod: getPaymentMethodText(sale.metodoPago),
      total: Number(sale.totalNumerico ?? 0),
      status: normalizeValue(sale.estado, 'Sin estado'),
      registeredFrom: normalizeValue(sale.registradoDesde),
    });

    row.getCell('total').numFmt = CURRENCY_FORMAT;
    styleDataRow(row, index);
  });

  applyWorksheetTableSettings(worksheet, 4, 'I');
};

const buildProductsSheet = (workbook, sales, subtitle) => {
  const worksheet = workbook.addWorksheet('Detalle Productos');
  setupWorksheetHeader(worksheet, 'DETALLE DE PRODUCTOS VENDIDOS', subtitle, 'H');

  worksheet.columns = [
    { key: 'invoice', width: 16 },
    { key: 'type', width: 16 },
    { key: 'client', width: 30 },
    { key: 'date', width: 16 },
    { key: 'product', width: 38 },
    { key: 'quantity', width: 12 },
    { key: 'unitPrice', width: 16 },
    { key: 'lineTotal', width: 16 },
  ];

  const headerRow = worksheet.addRow([
    'No. Factura',
    'Tipo',
    'Cliente',
    'Fecha venta',
    'Producto',
    'Cantidad',
    'Precio unitario',
    'Total producto',
  ]);
  styleHeaderRow(headerRow);

  let rowIndex = 0;
  sales.forEach((sale) => {
    const items = sale.items ?? [];

    if (items.length === 0) {
      const row = worksheet.addRow({
        invoice: normalizeValue(sale.factura),
        type: normalizeValue(sale.tipoVenta, 'Sin tipo'),
        client: normalizeValue(sale.cliente, 'Sin cliente'),
        date: normalizeValue(sale.fecha),
        product: 'Sin productos registrados',
      });
      styleDataRow(row, rowIndex);
      rowIndex += 1;
      return;
    }

    items.forEach((item) => {
      const product = item.product ?? {};
      const quantity = Number(item.cantidad ?? item.quantity ?? 0);
      const unitPrice = Number(item.precioUnitario ?? product.precioDetalle ?? product.retailPrice ?? 0);
      const row = worksheet.addRow({
        invoice: normalizeValue(sale.factura),
        type: normalizeValue(sale.tipoVenta, 'Sin tipo'),
        client: normalizeValue(sale.cliente, 'Sin cliente'),
        date: normalizeValue(sale.fecha),
        product: normalizeValue(product.nombre ?? item.nombre, 'Producto sin nombre'),
        quantity,
        unitPrice,
        lineTotal: getSaleLineTotal(item),
      });

      row.getCell('unitPrice').numFmt = CURRENCY_FORMAT;
      row.getCell('lineTotal').numFmt = CURRENCY_FORMAT;
      styleDataRow(row, rowIndex);
      rowIndex += 1;
    });
  });

  applyWorksheetTableSettings(worksheet, 4, 'H');
};

const buildStatsSheet = (workbook, sales, subtitle, typeLabel) => {
  const worksheet = workbook.addWorksheet('Estadisticas');
  setupWorksheetHeader(worksheet, 'ESTADISTICAS DE VENTAS', subtitle, 'B');

  worksheet.columns = [
    { key: 'metric', width: 34 },
    { key: 'value', width: 24 },
  ];

  const totalSales = sales.length;
  const totalValue = sales.reduce((sum, sale) => sum + Number(sale.totalNumerico ?? 0), 0);
  const totalItems = sales.reduce((sum, sale) => sum + (sale.items?.length ?? 0), 0);
  const totalUnits = sales.reduce(
    (sum, sale) => sum + (sale.items ?? []).reduce((acc, item) => acc + Number(item.cantidad ?? 0), 0),
    0
  );
  const approvedSales = sales.filter((sale) => sale.estado === 'Aprobada').length;
  const annulledSales = sales.filter((sale) => sale.estado === 'Anulada').length;
  const pendingApprovalSales = sales.filter((sale) => String(sale.estado ?? '').toLowerCase().includes('esp')).length;
  const avgPerSale = totalSales > 0 ? totalValue / totalSales : 0;

  const headerRow = worksheet.addRow(['Metrica', 'Valor']);
  styleHeaderRow(headerRow);

  const rows = [
    ['Filtro exportado', typeLabel],
    ['Total ventas', totalSales],
    ['Total valor vendido', totalValue],
    ['Promedio por venta', avgPerSale],
    ['Total productos (lineas)', totalItems],
    ['Total unidades vendidas', totalUnits],
    ['Ventas aprobadas', approvedSales],
    ['Ventas anuladas', annulledSales],
    ['Ventas en espera de aprobacion', pendingApprovalSales],
  ];

  rows.forEach(([metric, value], index) => {
    const row = worksheet.addRow({ metric, value });
    if (['Total valor vendido', 'Promedio por venta'].includes(metric)) {
      row.getCell('value').numFmt = CURRENCY_FORMAT;
    }
    styleDataRow(row, index);
  });

  applyWorksheetTableSettings(worksheet, 4, 'B');
};

export const downloadSalesExcel = async (salesToExport, options = {}) => {
  const sales = salesToExport ?? await getSalesForExcel();
  if (sales.length === 0) return false;

  const workbook = new ExcelJS.Workbook();
  const currentDate = new Date();
  const fileDate = currentDate.toISOString().split('T')[0];
  const typeLabel = options.typeLabel ?? 'Todas';
  const subtitle = `Fecha de exportacion: ${currentDate.toLocaleString('es-CO')} | Filtro: ${typeLabel}`;

  workbook.creator = 'SeymSoft';
  workbook.created = currentDate;

  buildSummarySheet(workbook, sales, subtitle);
  buildProductsSheet(workbook, sales, subtitle);
  buildStatsSheet(workbook, sales, subtitle, typeLabel);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const normalizedType = String(options.activeType ?? typeLabel)
    .toLowerCase()
    .replace(/\s+/g, '_');

  saveAs(blob, `ventas_${normalizedType}_${fileDate}.xlsx`);
  return true;
};
