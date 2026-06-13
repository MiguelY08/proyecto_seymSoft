import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatPhoneNumber, getStatusText } from './providerHelpers';

const COMPANY_COLOR = '004D77';
const LIGHT_BLUE = 'DCEBF3';
const LIGHT_GRAY = 'F3F4F6';
const WHITE = 'FFFFFF';

const formatCategories = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) return 'Sin categorías';
  return categories.map((category) => category.name).join(', ');
};

const buildProviderRows = (providers) =>
  providers.map((provider) => ({
    documentType: provider.tipo || '',
    document: provider.numero || '',
    name: provider.nombre || '',
    email: provider.correo || '',
    phone: formatPhoneNumber(provider.telefono),
    contactName: provider.pContacto || '',
    contactPhone: formatPhoneNumber(provider.nuContacto),
    categories: formatCategories(provider.categorias),
    maxReturnPeriod: provider.plazoDevoluciones || '',
    status: getStatusText(provider.activo),
  }));

export const downloadProvidersExcel = async (providers = []) => {
  if (!Array.isArray(providers) || providers.length === 0) return false;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Proveedores');

  const currentDate = new Date();
  const fileDate = currentDate.toISOString().split('T')[0];

  worksheet.mergeCells('A1:J1');
  worksheet.getCell('A1').value = 'PROVEEDORES';
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: WHITE } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell('A1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COMPANY_COLOR },
  };

  worksheet.mergeCells('A2:J2');
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
    'Persona contacto',
    'Tel. contacto',
    'Categorías',
    'Plazo devoluciones',
    'Estado',
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

  buildProviderRows(providers).forEach((provider, index) => {
    const row = worksheet.addRow([
      provider.documentType,
      provider.document,
      provider.name,
      provider.email,
      provider.phone,
      provider.contactName,
      provider.contactPhone,
      provider.categories,
      provider.maxReturnPeriod,
      provider.status,
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
    { key: 'name', width: 32 },
    { key: 'email', width: 35 },
    { key: 'phone', width: 18 },
    { key: 'contactName', width: 24 },
    { key: 'contactPhone', width: 18 },
    { key: 'categories', width: 36 },
    { key: 'maxReturnPeriod', width: 20 },
    { key: 'status', width: 14 },
  ];

  worksheet.views = [{ state: 'frozen', ySplit: 4 }];
  worksheet.autoFilter = { from: 'A4', to: 'J4' };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `proveedores_${fileDate}.xlsx`);

  return true;
};
