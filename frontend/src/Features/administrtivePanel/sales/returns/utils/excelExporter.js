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
    ['Fecha de Exportación', formatDate(new Date())]
  ];
  
  // ======================= CREAR LIBRO DE TRABAJO =======================
  
  const wb = XLSX.utils.book_new();
  
  // Crear hoja de resumen de devoluciones
  const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
  
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
  
  // Crear hoja de detalle de productos
  const productWs = XLSX.utils.aoa_to_sheet([productHeaders, ...productData]);
  
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
  
  // Crear hoja de estadísticas
  const statsWs = XLSX.utils.aoa_to_sheet([statsHeaders, ...statsData]);
  
  // Agregar hojas al libro
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen Devoluciones');
  XLSX.utils.book_append_sheet(wb, productWs, 'Detalle Productos');
  XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas');
  
  // Descargar el archivo
  const fileName = `devoluciones_completas_${new Date().toISOString().split('T')[0]}.xlsx`;
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
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  const colWidths = [
    { wch: 18 }, { wch: 15 }, { wch: 30 }, { wch: 25 },
    { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 20 }
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');
  XLSX.writeFile(wb, `devoluciones_resumen_${new Date().toISOString().split('T')[0]}.xlsx`);
};