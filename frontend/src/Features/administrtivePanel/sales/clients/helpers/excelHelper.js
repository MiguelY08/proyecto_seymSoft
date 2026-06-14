import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatClientType, formatCurrency, formatDate } from './clientHelpers';

const COMPANY_COLOR = '004D77';
const LIGHT_BLUE = 'DCEBF3';
const LIGHT_GRAY = 'F3F4F6';
const WHITE = 'FFFFFF';

const getStatusText = (active) => (active ? 'Activo' : 'Inactivo');

const buildClientRows = (clients) =>
  clients.map((client) => ({
    documentType: client.documentType || '',
    document: client.document || '',
    fullName: client.isSystem ? 'Cliente Sistema' : client.fullName || '',
    email: client.email || '',
    phone: client.phone || '',
    clientType: formatClientType(client.clientType),
    credit: formatCurrency(Number(client.clientCredit) || 0),
    status: getStatusText(client.active),
    clientSince: formatDate(client.clientSince),
  }));

export const downloadClientsExcel = async (clients = []) => {
  if (!Array.isArray(clients) || clients.length === 0) return false;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Clientes');

  const currentDate = new Date();
  const fileDate = currentDate.toISOString().split('T')[0];

  worksheet.mergeCells('A1:I1');
  worksheet.getCell('A1').value = 'CLIENTES';
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: WHITE } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('A1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COMPANY_COLOR },
  };

  worksheet.mergeCells('A2:I2');
  worksheet.getCell('A2').value = `Fecha de exportación: ${currentDate.toLocaleString('es-CO')}`;
  worksheet.getCell('A2').alignment = { horizontal: 'center' };
  worksheet.getCell('A2').font = { italic: true, color: { argb: COMPANY_COLOR } };

  worksheet.addRow([]);

  const headerRow = worksheet.addRow([
    'Tipo documento',
    'Documento',
    'Nombre',
    'Correo electrónico',
    'Teléfono',
    'Tipo cliente',
    'Crédito',
    'Estado',
    'Cliente desde',
  ]);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COMPANY_COLOR } };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  buildClientRows(clients).forEach((client, index) => {
    const row = worksheet.addRow([
      client.documentType,
      client.document,
      client.fullName,
      client.email,
      client.phone,
      client.clientType,
      client.credit,
      client.status,
      client.clientSince,
    ]);

    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' };
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
  });

  worksheet.columns = [
    { key: 'documentType', width: 18 },
    { key: 'document', width: 18 },
    { key: 'fullName', width: 32 },
    { key: 'email', width: 35 },
    { key: 'phone', width: 18 },
    { key: 'clientType', width: 18 },
    { key: 'credit', width: 18 },
    { key: 'status', width: 14 },
    { key: 'clientSince', width: 18 },
  ];

  worksheet.views = [{ state: 'frozen', ySplit: 4 }];
  worksheet.autoFilter = { from: 'A4', to: 'I4' };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `clientes_${fileDate}.xlsx`);

  return true;
};
