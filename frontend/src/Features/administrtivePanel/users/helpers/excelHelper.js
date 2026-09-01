import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from './usersHelpers';
import { createExcelLogoId, prepareExcelLogoHeader } from '../../../shared/excel/logoHeader';

const COMPANY_COLOR = '004D77';
const LIGHT_BLUE = 'DCEBF3';
const LIGHT_GRAY = 'F3F4F6';
const WHITE = 'FFFFFF';

const getStatusText = (active) => (active ? 'Activo' : 'Inactivo');

const getRoleText = (role) => role?.nameRole || role?.name || 'Sin rol';

const buildUserRows = (users) =>
  users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    status: getStatusText(user.active),
    role: getRoleText(user.role),
    createdAt: formatDate(user.createdAt),
  }));

export const downloadUsersExcel = async (users = []) => {
  if (!Array.isArray(users) || users.length === 0) return false;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Usuarios');

  const currentDate = new Date();
  const fileDate = currentDate.toISOString().split('T')[0];

  worksheet.columns = [
    { key: 'id', width: 10 },
    { key: 'name', width: 32 },
    { key: 'email', width: 35 },
    { key: 'phone', width: 18 },
    { key: 'status', width: 14 },
    { key: 'role', width: 22 },
    { key: 'createdAt', width: 18 },
  ];

  /*
  worksheet.columns = [
    { key: 'id', width: 10 },
    { key: 'name', width: 32 },
    { key: 'email', width: 35 },
    { key: 'phone', width: 18 },
    { key: 'status', width: 14 },
    { key: 'role', width: 22 },
    { key: 'createdAt', width: 18 },
  ];
  */

  const logoId = await createExcelLogoId(workbook);
  prepareExcelLogoHeader(worksheet, {
    title: 'USUARIOS',
    subtitle: `Fecha de exportación: ${currentDate.toLocaleString('es-CO')}`,
    columnCount: 7,
    logoId,
    blue: COMPANY_COLOR,
    logoAlign: 'left',
    singleBlueHeader: true,
  });

  /*
  worksheet.mergeCells('A1:G1');
  worksheet.getCell('A1').value = 'USUARIOS';
  worksheet.getCell('A1').font = {
    bold: true,
    size: 18,
    color: { argb: WHITE },
  };
  worksheet.getCell('A1').alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };
  worksheet.getCell('A1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COMPANY_COLOR },
  };

  worksheet.mergeCells('A2:G2');
  worksheet.getCell('A2').value = `Fecha de exportación: ${currentDate.toLocaleString('es-CO')}`;
  worksheet.getCell('A2').alignment = {
    horizontal: 'center',
  };
  worksheet.getCell('A2').font = {
    italic: true,
    color: { argb: COMPANY_COLOR },
  };

  worksheet.addRow([]);
  */

  const headerRow = worksheet.addRow([
    'ID',
    'Nombre completo',
    'Correo electrónico',
    'Teléfono',
    'Estado',
    'Rol',
    'Registrado desde',
  ]);

  headerRow.eachCell((cell) => {
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

  const rows = buildUserRows(users);

  rows.forEach((user, index) => {
    const row = worksheet.addRow([
      user.id,
      user.name,
      user.email,
      user.phone,
      user.status,
      user.role,
      user.createdAt,
    ]);

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
  });

  worksheet.columns = [
    { key: 'id', width: 10 },
    { key: 'name', width: 32 },
    { key: 'email', width: 35 },
    { key: 'phone', width: 18 },
    { key: 'status', width: 14 },
    { key: 'role', width: 22 },
    { key: 'createdAt', width: 18 },
  ];

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: 5,
    },
  ];

  worksheet.autoFilter = {
    from: 'A5',
    to: 'G5',
  };

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `usuarios_${fileDate}.xlsx`);

  return true;
};
