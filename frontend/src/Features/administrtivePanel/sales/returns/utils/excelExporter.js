import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from './returnsHelpers';
import horizontalLogoUrl from '../../../../../assets/PMLogo_Horizontal.png';

const BLUE = '004D77';
const LIGHT_BLUE = 'DCEBF3';
const LIGHT_GRAY = 'F3F4F6';
const WHITE = 'FFFFFF';

const detailsOf = (item) => item.details || item.productosDevueltos || [];
const valueOf = (item, ...keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) return item[key];
  }
  return '';
};

const styleTitle = (worksheet, range, title) => {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(':')[0]);
  cell.value = title;
  cell.font = { bold: true, size: 18, color: { argb: WHITE } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } };
};

const styleHeader = (row) => {
  row.height = 24;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } };
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
    cell.alignment = { vertical: 'middle', wrapText: true };
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

const getColumnLetter = (columnNumber) => {
  let letter = '';
  let number = columnNumber;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    number = Math.floor((number - 1) / 26);
  }
  return letter;
};

const getLogoColumnByWidth = (worksheet, columnCount, targetWidth) => {
  const columnWidths = Array.from(
    { length: columnCount },
    (_, index) => worksheet.getColumn(index + 1).width || 10,
  );

  let accumulated = 0;
  for (let index = 0; index < columnWidths.length; index += 1) {
    const width = columnWidths[index];
    if (targetWidth <= accumulated + width) {
      return index + (targetWidth - accumulated) / width;
    }
    accumulated += width;
  }

  return Math.max(0, columnCount - 1);
};

const getCenteredLogoColumn = (worksheet, columnCount, imageWidthPx) => {
  const imageWidthUnits = imageWidthPx / 7;
  const columnWidths = Array.from(
    { length: columnCount },
    (_, index) => worksheet.getColumn(index + 1).width || 10,
  );
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  return getLogoColumnByWidth(
    worksheet,
    columnCount,
    Math.max(0, (totalWidth - imageWidthUnits) / 2),
  );
};

const prepareSheet = (worksheet, title, columnCount) => {
  const lastColumn = getColumnLetter(columnCount);
  worksheet.getRow(1).height = 52;
  for (let index = 1; index <= columnCount; index += 1) {
    const cell = worksheet.getCell(`${getColumnLetter(index)}1`);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } };
    cell.border = {
      top: { style: 'thin', color: { argb: BLUE } },
      left: { style: 'thin', color: { argb: BLUE } },
      bottom: { style: 'thin', color: { argb: BLUE } },
      right: { style: 'thin', color: { argb: BLUE } },
    };
  }
  styleTitle(worksheet, `A1:${lastColumn}1`, title);
  worksheet.getRow(1).height = 52;
  worksheet.getRow(2).height = 24;
  worksheet.mergeCells(`A2:${lastColumn}2`);
  worksheet.getCell('A2').value =
    `Fecha de exportación: ${new Date().toLocaleString('es-CO')}`;
  worksheet.getCell('A2').alignment = { horizontal: 'center' };
  worksheet.getCell('A2').font = { italic: true, color: { argb: BLUE } };
  worksheet.addRow([]);
};

const addLogo = (worksheet, logoId, columnCount) => {
  if (logoId === null || logoId === undefined) return;

  const logoWidth = 205;
  const logoHeight = 70;
  worksheet.addImage(logoId, {
    tl: { col: 0.03, row: 0.02 },
    ext: { width: logoWidth, height: logoHeight },
    editAs: 'absolute',
  });
};

const createLogoId = async (workbook) => {
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return null;
  }

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = horizontalLogoUrl;
    });

    const width = 760;
    const height = 260;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    context.drawImage(image, 0, 0, width, height);

    const pngBase64 = canvas.toDataURL('image/png').split(',')[1];
    return workbook.addImage({ base64: pngBase64, extension: 'png' });
  } catch {
    return null;
  }
};

export const exportReturnsToExcel = async (returns = []) => {
  if (!Array.isArray(returns) || returns.length === 0) return false;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Papelería Magic';
  workbook.created = new Date();
  const logoId = await createLogoId(workbook);

  const summary = workbook.addWorksheet('Devoluciones');
  const summaryHeaders = [
    'N.º devolución',
    'Factura',
    'Cliente',
    'Fecha',
    'Estado',
    'Productos',
    'Unidades',
    'Valor total',
    'Asesor',
    'Descripción',
  ];
  prepareSheet(summary, 'DEVOLUCIONES DE VENTAS', summaryHeaders.length);
  styleHeader(summary.addRow(summaryHeaders));

  returns.forEach((item, index) => {
    const details = detailsOf(item);
    const row = summary.addRow([
      valueOf(item, 'returnNumber', 'numeroDevolucion'),
      valueOf(item, 'invoiceNumber', 'numeroFactura'),
      valueOf(item, 'clientName', 'cliente'),
      formatDate(valueOf(item, 'createdAt', 'fechaCreacion')),
      valueOf(item, 'status', 'estado') || 'En Proceso',
      details.length,
      details.reduce(
        (sum, detail) => sum + Number(valueOf(detail, 'quantity', 'cantidad') || 0),
        0,
      ),
      Number(valueOf(item, 'totalAmount', 'totalValor')) || 0,
      valueOf(item, 'employeeName', 'asesor'),
      valueOf(item, 'description', 'descripcion'),
    ]);
    row.getCell(8).numFmt = '$ #,##0';
    styleDataRow(row, index);
  });

  summary.columns = [
    { width: 20 },
    { width: 17 },
    { width: 31 },
    { width: 15 },
    { width: 17 },
    { width: 12 },
    { width: 12 },
    { width: 18 },
    { width: 25 },
    { width: 42 },
  ];
  addLogo(summary, logoId, summaryHeaders.length);
  summary.views = [{ state: 'frozen', ySplit: 5 }];
  summary.autoFilter = { from: 'A5', to: 'J5' };

  const products = workbook.addWorksheet('Productos devueltos');
  const productHeaders = [
    'N.º devolución',
    'Factura',
    'Cliente',
    'Producto',
    'Cantidad',
    'Precio unitario',
    'Total',
    'Motivo',
    'Descripción motivo',
    'Método',
    'Estado producto',
  ];
  prepareSheet(products, 'DETALLE DE PRODUCTOS DEVUELTOS', productHeaders.length);
  styleHeader(products.addRow(productHeaders));

  let productIndex = 0;
  returns.forEach((item) => {
    detailsOf(item).forEach((detail) => {
      const quantity = Number(valueOf(detail, 'quantity', 'cantidad')) || 1;
      const unitPrice =
        Number(valueOf(detail, 'unitPrice', 'precioUnit', 'valor')) || 0;
      const row = products.addRow([
        valueOf(item, 'returnNumber', 'numeroDevolucion'),
        valueOf(item, 'invoiceNumber', 'numeroFactura'),
        valueOf(item, 'clientName', 'cliente'),
        valueOf(detail, 'productName', 'nombre') || 'Producto',
        quantity,
        unitPrice,
        quantity * unitPrice,
        valueOf(detail, 'reason', 'motivo'),
        valueOf(detail, 'description', 'descripcionMotivo'),
        valueOf(detail, 'method', 'metodo'),
        valueOf(detail, 'status', 'estado') || 'En Proceso',
      ]);
      row.getCell(6).numFmt = '$ #,##0';
      row.getCell(7).numFmt = '$ #,##0';
      styleDataRow(row, productIndex);
      productIndex += 1;
    });
  });

  products.columns = [
    { width: 20 },
    { width: 17 },
    { width: 30 },
    { width: 38 },
    { width: 11 },
    { width: 18 },
    { width: 18 },
    { width: 28 },
    { width: 36 },
    { width: 22 },
    { width: 20 },
  ];
  addLogo(products, logoId, productHeaders.length);
  products.views = [{ state: 'frozen', ySplit: 5 }];
  products.autoFilter = { from: 'A5', to: 'K5' };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `devoluciones_ventas_${new Date().toISOString().split('T')[0]}.xlsx`,
  );
  return true;
};

export const exportReturnsSummaryToExcel = exportReturnsToExcel;
