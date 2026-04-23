/**
 * Archivo: excelExporter.js
 * 
 * Utilidad especializada para exportar devoluciones a formato Excel (.xlsx).
 * Utiliza la librería XLSX para crear y descargar archivos con formato profesional.
 * 
 * Responsabilidades principales:
 * - Formatear datos de devoluciones para Excel
 * - Incluir productos devueltos con todos sus detalles
 * - Crear hoja resumen y hoja de detalles de productos
 * - Generar descarga automática del archivo
 * - Incluir fecha de generación en el nombre del archivo
 */

import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './returnsHelpers';

// ======================= FUNCIONALIDAD: DESCARGAR COMPLETO =======================

/**
 * Exporta un array de devoluciones a un archivo Excel descargable.
 * Crea dos hojas: una con el resumen de devoluciones y otra con el detalle de productos.
 * 
 * @param {Array} returns - Array de devoluciones a exportar
 * @returns {void} Descarga el archivo automáticamente
 */
export const exportReturnsToExcel = (returns) => {
  // Fecha actual para el encabezado
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedDateTime = currentDate.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // ======================= TÍTULO PRINCIPAL =======================
  const titleRow = [['DEVOLUCIÓN DE VENTAS']];
  const dateRow = [[`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`]];
  const emptyRow = [['']];

  // ======================= HOJA 1: RESUMEN DE DEVOLUCIONES =======================
  
  const summaryHeaders = [
    'Número Devolución',
    'Factura',
    'Cliente',
    'Motivo',
    'Fecha',
    'Valor',
    'Estado',
    'Asesor',
    'Teléfono',
    'Dirección',
    'Cantidad Productos',
    'Total Unidades'
  ];
  
  const summaryData = returns.map(r => [
    r.numeroDevolucion || '',
    r.numeroFactura || '',
    r.cliente || '',
    r.motivo || '',
    formatDate(r.fechaCreacion),
    `$${formatCurrency(r.totalValor || 0)}`,
    r.estado || 'Pendiente',
    r.asesor || '',
    r.telefono || '',
    r.direccion || '',
    r.cantidadProductos || (r.productosDevueltos?.length || 0),
    r.totalUnidades || (r.productosDevueltos?.reduce((sum, p) => sum + (p.cantidad || 0), 0) || 0)
  ]);
  
  // ======================= HOJA 2: DETALLE DE PRODUCTOS DEVUELTOS =======================
  
  const productHeaders = [
    'Número Devolución',
    'Factura',
    'Cliente',
    'Fecha Devolución',
    'Producto',
    'Cantidad Devuelta',
    'Precio Unitario',
    'Total Producto',
    'Motivo de Devolución',
    'Método de Devolución',
    'Estado del Producto'
  ];
  
  const productData = [];
  
  // Iterar cada devolución y extraer sus productos
  returns.forEach(returnItem => {
    const productos = returnItem.productosDevueltos || [];
    
    if (productos.length === 0) {
      // Si no hay productos, agregar una fila con datos básicos
      productData.push([
        returnItem.numeroDevolucion || '',
        returnItem.numeroFactura || '',
        returnItem.cliente || '',
        formatDate(returnItem.fechaCreacion),
        'Sin productos registrados',
        '',
        '',
        '',
        returnItem.motivo || '',
        '',
        returnItem.estado || 'Pendiente'
      ]);
    } else {
      // Por cada producto, crear una fila detallada
      productos.forEach(producto => {
        const cantidad = producto.cantidad || 1;
        const precioUnit = producto.precioUnit || 0;
        const totalProducto = cantidad * precioUnit;
        
        productData.push([
          returnItem.numeroDevolucion || '',
          returnItem.numeroFactura || '',
          returnItem.cliente || '',
          formatDate(returnItem.fechaCreacion),
          producto.nombre || 'Producto sin nombre',
          cantidad,
          `$${formatCurrency(precioUnit)}`,
          `$${formatCurrency(totalProducto)}`,
          producto.motivo || returnItem.motivo || '',
          producto.metodo || '',
          producto.estado || returnItem.estado || 'Pendiente'
        ]);
      });
    }
  });
  
  // ======================= HOJA 3: ESTADÍSTICAS =======================
  
  const statsHeaders = [
    'Métrica',
    'Valor'
  ];
  
  // Calcular estadísticas básicas
  const totalReturns = returns.length;
  const totalValue = returns.reduce((sum, r) => sum + (r.totalValor || 0), 0);
  const totalUnits = returns.reduce((sum, r) => sum + (r.totalUnidades || 0), 0);
  const totalProducts = returns.reduce((sum, r) => sum + (r.cantidadProductos || 0), 0);
  
  const pendingReturns = returns.filter(r => r.estado === 'Pendiente').length;
  const approvedReturns = returns.filter(r => r.estado === 'Aprobada').length;
  const cancelledReturns = returns.filter(r => r.estado === 'Anulada').length;
  
  const statsData = [
    ['Total Devoluciones', totalReturns],
    ['Total Valor Devuelto', `$${formatCurrency(totalValue)}`],
    ['Total Unidades Devueltas', totalUnits],
    ['Total Productos Devueltos', totalProducts],
    ['Promedio por Devolución', `$${formatCurrency(totalReturns > 0 ? totalValue / totalReturns : 0)}`],
    [''],
    ['Devoluciones Pendientes', pendingReturns],
    ['Devoluciones Aprobadas', approvedReturns],
    ['Devoluciones Anuladas', cancelledReturns],
    [''],
    ['Fecha de Exportación', formattedDateTime]
  ];
  
  // ======================= CREAR LIBRO DE TRABAJO =======================
  
  const wb = XLSX.utils.book_new();
  
  // ======================= HOJA 1: RESUMEN =======================
  const summarySheetData = [
    ...titleRow,
    ...dateRow,
    ...emptyRow,
    [['RESUMEN DE DEVOLUCIONES']],
    ...emptyRow,
    summaryHeaders,
    ...summaryData
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
  
  // Combinar celdas para el título
  if (!summaryWs['!merges']) summaryWs['!merges'] = [];
  summaryWs['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: summaryHeaders.length - 1 } });
  summaryWs['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: summaryHeaders.length - 1 } });
  summaryWs['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: summaryHeaders.length - 1 } });
  
  // Estilos para el título (opcional - usando propiedades)
  summaryWs['A1'] = { v: 'DEVOLUCIÓN DE VENTAS', t: 's' };
  summaryWs['A2'] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: 's' };
  summaryWs['A4'] = { v: 'RESUMEN DE DEVOLUCIONES', t: 's' };
  
  // Ajustar ancho de columnas para resumen
  const summaryColWidths = [
    { wch: 18 }, // Número Devolución
    { wch: 15 }, // Factura
    { wch: 30 }, // Cliente
    { wch: 25 }, // Motivo
    { wch: 12 }, // Fecha
    { wch: 15 }, // Valor
    { wch: 12 }, // Estado
    { wch: 20 }, // Asesor
    { wch: 15 }, // Teléfono
    { wch: 35 }, // Dirección
    { wch: 12 }, // Cantidad Productos
    { wch: 12 }  // Total Unidades
  ];
  summaryWs['!cols'] = summaryColWidths;
  
  // ======================= HOJA 2: DETALLE DE PRODUCTOS =======================
  const productSheetData = [
    ...titleRow,
    ...dateRow,
    ...emptyRow,
    [['DETALLE DE PRODUCTOS DEVUELTOS']],
    ...emptyRow,
    productHeaders,
    ...productData
  ];
  
  const productWs = XLSX.utils.aoa_to_sheet(productSheetData);
  
  // Combinar celdas para el título
  if (!productWs['!merges']) productWs['!merges'] = [];
  productWs['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: productHeaders.length - 1 } });
  productWs['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: productHeaders.length - 1 } });
  productWs['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: productHeaders.length - 1 } });
  
  productWs['A1'] = { v: 'DEVOLUCIÓN DE VENTAS', t: 's' };
  productWs['A2'] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: 's' };
  productWs['A4'] = { v: 'DETALLE DE PRODUCTOS DEVUELTOS', t: 's' };
  
  // Ajustar ancho de columnas para productos
  const productColWidths = [
    { wch: 18 }, // Número Devolución
    { wch: 15 }, // Factura
    { wch: 30 }, // Cliente
    { wch: 12 }, // Fecha Devolución
    { wch: 35 }, // Producto
    { wch: 10 }, // Cantidad Devuelta
    { wch: 15 }, // Precio Unitario
    { wch: 15 }, // Total Producto
    { wch: 30 }, // Motivo de Devolución
    { wch: 20 }, // Método de Devolución
    { wch: 12 }  // Estado del Producto
  ];
  productWs['!cols'] = productColWidths;
  
  // ======================= HOJA 3: ESTADÍSTICAS =======================
  const statsSheetData = [
    ...titleRow,
    ...dateRow,
    ...emptyRow,
    [['ESTADÍSTICAS']],
    ...emptyRow,
    statsHeaders,
    ...statsData
  ];
  
  const statsWs = XLSX.utils.aoa_to_sheet(statsSheetData);
  
  // Combinar celdas para el título
  if (!statsWs['!merges']) statsWs['!merges'] = [];
  statsWs['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
  statsWs['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } });
  statsWs['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 1 } });
  
  statsWs['A1'] = { v: 'DEVOLUCIÓN DE VENTAS', t: 's' };
  statsWs['A2'] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: 's' };
  statsWs['A4'] = { v: 'ESTADÍSTICAS', t: 's' };
  
  // Agregar hojas al libro
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen Devoluciones');
  XLSX.utils.book_append_sheet(wb, productWs, 'Detalle Productos');
  XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas');
  
  // Descargar el archivo
  const fileName = `devolucion_ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// ======================= FUNCIONALIDAD: EXPORTAR SOLO RESUMEN =======================

/**
 * Exporta un resumen rápido de devoluciones (solo la hoja de resumen).
 * Útil para cuando no se necesita el detalle de productos.
 * 
 * @param {Array} returns - Array de devoluciones a exportar
 * @returns {void} Descarga el archivo automáticamente
 */
export const exportReturnsSummaryToExcel = (returns) => {
  // Fecha actual para el encabezado
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedDateTime = currentDate.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const headers = [
    'Número Devolución',
    'Factura',
    'Cliente',
    'Motivo',
    'Fecha',
    'Valor',
    'Estado',
    'Asesor'
  ];
  
  const data = returns.map(r => [
    r.numeroDevolucion || '',
    r.numeroFactura || '',
    r.cliente || '',
    r.motivo || '',
    formatDate(r.fechaCreacion),
    `$${formatCurrency(r.totalValor || 0)}`,
    r.estado || 'Pendiente',
    r.asesor || ''
  ]);
  
  // Crear hoja con título
  const sheetData = [
    ['DEVOLUCIÓN DE VENTAS'],
    [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
    [''],
    ['RESUMEN DE DEVOLUCIONES'],
    [''],
    headers,
    ...data
  ];
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Combinar celdas para el título
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });
  ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } });
  ws['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } });
  
  ws['A1'] = { v: 'DEVOLUCIÓN DE VENTAS', t: 's' };
  ws['A2'] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: 's' };
  ws['A4'] = { v: 'RESUMEN DE DEVOLUCIONES', t: 's' };
  
  const colWidths = [
    { wch: 18 }, { wch: 15 }, { wch: 30 }, { wch: 25 },
    { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 20 }
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');
  XLSX.writeFile(wb, `devolucion_ventas_resumen_${new Date().toISOString().split('T')[0]}.xlsx`);
};