// utils/excelExporter.js
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './returnsHelpers';

export const exportReturnsToExcel = (returns) => {
  const headers = [
    'Número Devolución',
    'Factura',
    'Cliente',
    'Motivo',
    'Fecha',
    'Valor',
    'Estado',
    'Asesor',
    'Teléfono',
    'Dirección'
  ];
  
  const data = returns.map(r => [
    r.numeroDevolucion,
    r.numeroFactura,
    r.cliente,
    r.motivo,
    formatDate(r.fechaCreacion),
    `$${formatCurrency(r.totalValor)}`,
    r.estado,
    r.asesor || '',
    r.telefono || '',
    r.direccion || ''
  ]);
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');
  XLSX.writeFile(wb, `devoluciones_${new Date().toISOString().split('T')[0]}.xlsx`);
};