/**
 * Archivo: excelExporter.js
 * 
 * Utilidad especializada para exportar devoluciones a formato Excel (.xlsx).
 * Utiliza la librería XLSX para crear y descargar archivos con formato profesional.
 * 
 * Responsabilidades principales:
 * - Formatear datos de devoluciones para Excel
 * - Incluir encabezados informativos
 * - Crear libro de trabajo con datos estructurados
 * - Generar descarga automática del archivo
 * - Incluir fecha de generación en el nombre del archivo
 */

import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './returnsHelpers';

// ======================= FUNCIONALIDAD: DESCARGAR =======================

/**
 * Exporta un array de devoluciones a un archivo Excel descargable.
 * Formatea los datos con encabezados, moneda y fecha según localización.
 * El archivo se descarga automáticamente con nombre y fecha de generación.
 * 
 * @param {Array} returns - Array de devoluciones a exportar
 * @param {string} returns[].numeroDevolucion - Número único de devolución
 * @param {string} returns[].numeroFactura - Número de factura referenciada
 * @param {string} returns[].cliente - Nombre del cliente
 * @param {string} returns[].motivo - Motivo de la devolución
 * @param {string|Date} returns[].fechaCreacion - Fecha de creación
 * @param {number} returns[].totalValor - Valor total
 * @param {string} returns[].estado - Estado actual (Pendiente, Aprobada, etc)
 * @param {string} returns[].asesor - Nombre del asesor que atiende
 * @param {string} returns[].telefono - Teléfono de contacto
 * @param {string} returns[].direccion - Dirección de entrega
 * @returns {void} Descarga el archivo automáticamente
 */
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
  
  // Crear nuevo libro de trabajo
  const wb = XLSX.utils.book_new();
  
  // Convertir datos a hoja de cálculo
  // [headers, ...data] coloca los encabezados en la primera fila
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Agregar la hoja al libro de trabajo
  XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');
  
  // Descargar el archivo con nombre: devoluciones_YYYY-MM-DD.xlsx
  XLSX.writeFile(wb, `devoluciones_${new Date().toISOString().split('T')[0]}.xlsx`);
};