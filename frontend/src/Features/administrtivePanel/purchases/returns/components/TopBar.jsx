import React from 'react';
import { Search, Calendar, Eraser, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';

/**
 * Componente TopBar — Barra superior para filtros en Devoluciones de Compras.
 * Incluye buscador, filtros de fecha con label, botón limpiar (con label invisible)
 * y botón exportar Excel con formato profesional (3 hojas).
 */
function TopBar({
  search,
  setSearch,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  setCurrentPage,
  returns = [],
  proveedorMap = {},
}) {
  const { showWarning, showConfirm, showTimer } = useAlert();

  const handleClearFilters = () => {
    setSearch('');
    setFechaInicial('');
    setFechaFinal('');
    setCurrentPage(1);
  };

  const hayFiltrosActivos = search || fechaInicial || fechaFinal;

  // ──────────────────────────────────────────────────────────────────
  //  Helpers de formato (moneda y fecha)
  // ──────────────────────────────────────────────────────────────────
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Si viene en formato YYYY-MM-DD, lo pasamos a DD/MM/YYYY
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  // ──────────────────────────────────────────────────────────────────
  //  Exportación a Excel (tres hojas)
  // ──────────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (returns.length === 0) {
      showWarning('Sin registros', 'No hay devoluciones registradas para exportar.');
      return;
    }

    showConfirm(
      'question',
      '¿Desea descargar las devoluciones?',
      `Se exportarán ${returns.length} registro${returns.length !== 1 ? 's' : ''} en formato Excel.`,
      { confirmButtonText: 'Descargar', cancelButtonText: 'Cancelar' }
    ).then((result) => {
      if (!result?.isConfirmed) return;

      // Fechas para encabezados
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      const formattedDateTime = currentDate.toLocaleString('es-CO', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });

      // ======================= HOJA 1: RESUMEN =======================
      const summaryHeaders = [
        'N° Devolución',
        'N° Factura',
        'Proveedor',
        'Fecha Devolución',
        'Estado',
        'Total Unidades',
        'Total Valor Devuelto',
      ];

      const summaryData = returns.map((dev) => {
        const proveedor = proveedorMap[dev.idCompra] ?? '—';
        const productos = dev.productos ?? [];
        const totalUnidades = productos.reduce(
          (sum, p) => sum + (p.cantidadDevolver ?? 0),
          0
        );
        const totalValor = productos.reduce(
          (sum, p) => sum + (p.cantidadDevolver ?? 0) * (p.valorUnit ?? 0),
          0
        );
        return [
          dev.id,
          dev.idCompra,
          proveedor,
          formatDate(dev.fechaDevolucion),
          dev.estado,
          totalUnidades,
          formatCurrency(totalValor),
        ];
      });

      // ======================= HOJA 2: DETALLE DE PRODUCTOS =======================
      const productHeaders = [
        'N° Devolución',
        'N° Factura',
        'Proveedor',
        'Fecha Devolución',
        'Estado',
        'Producto',
        'Código Barras',
        'Cantidad Devuelta',
        'Motivo',
        'Tipo Devolución',
        'Estado Producto',
        'Valor Unitario',
        'IVA %',
        'Total Producto',
      ];

      const productData = [];
      returns.forEach((dev) => {
        const proveedor = proveedorMap[dev.idCompra] ?? '—';
        const productos = dev.productos ?? [];
        if (productos.length === 0) {
          productData.push([
            dev.id,
            dev.idCompra,
            proveedor,
            formatDate(dev.fechaDevolucion),
            dev.estado,
            'Sin productos registrados',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
          ]);
        } else {
          productos.forEach((p) => {
            const cantidad = p.cantidadDevolver ?? 0;
            const valorUnit = p.valorUnit ?? 0;
            const totalProducto = cantidad * valorUnit;
            productData.push([
              dev.id,
              dev.idCompra,
              proveedor,
              formatDate(dev.fechaDevolucion),
              dev.estado,
              p.nombre,
              p.codigoBarras,
              cantidad,
              p.motivo ?? '—',
              p.tipoDevolucion ?? '—',
              p.estado ?? '—',
              formatCurrency(valorUnit),
              p.iva ?? 0,
              formatCurrency(totalProducto),
            ]);
          });
        }
      });

      // ======================= HOJA 3: ESTADÍSTICAS =======================
      const statsHeaders = ['Métrica', 'Valor'];

      const totalReturns = returns.length;
      const totalValue = returns.reduce((sum, dev) => {
        const productos = dev.productos ?? [];
        const devValue = productos.reduce(
          (s, p) => s + (p.cantidadDevolver ?? 0) * (p.valorUnit ?? 0),
          0
        );
        return sum + devValue;
      }, 0);
      const totalUnits = returns.reduce((sum, dev) => {
        const productos = dev.productos ?? [];
        return sum + productos.reduce((s, p) => s + (p.cantidadDevolver ?? 0), 0);
      }, 0);
      const totalProductLines = returns.reduce(
        (sum, dev) => sum + (dev.productos?.length || 0),
        0
      );

      const pendingReturns = returns.filter((d) => d.estado === 'Pendiente').length;
      const approvedReturns = returns.filter((d) => d.estado === 'Aprobada').length;
      const cancelledReturns = returns.filter((d) => d.estado === 'Anulada').length;

      const avgPerReturn = totalReturns > 0 ? totalValue / totalReturns : 0;

      const statsData = [
        ['Total Devoluciones', totalReturns],
        ['Total Valor Devuelto', formatCurrency(totalValue)],
        ['Total Unidades Devueltas', totalUnits],
        ['Total Líneas de Productos', totalProductLines],
        ['Promedio por Devolución', formatCurrency(avgPerReturn)],
        [''],
        ['Devoluciones Pendientes', pendingReturns],
        ['Devoluciones Aprobadas', approvedReturns],
        ['Devoluciones Anuladas', cancelledReturns],
        [''],
        ['Fecha de Exportación', formattedDateTime],
      ];

      // ======================= CREAR LIBRO Y HOJAS =======================
      const wb = XLSX.utils.book_new();

      // --- Hoja Resumen ---
      const summarySheetData = [
        ['DEVOLUCIONES DE COMPRAS'],
        [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
        [''],
        ['RESUMEN DE DEVOLUCIONES'],
        [''],
        summaryHeaders,
        ...summaryData,
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
      summaryWs['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: summaryHeaders.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: summaryHeaders.length - 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: summaryHeaders.length - 1 } },
      ];
      summaryWs['!cols'] = [
        { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 16 },
        { wch: 14 }, { wch: 14 }, { wch: 18 },
      ];

      // --- Hoja Detalle de Productos ---
      const productSheetData = [
        ['DEVOLUCIONES DE COMPRAS'],
        [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
        [''],
        ['DETALLE DE PRODUCTOS DEVUELTOS'],
        [''],
        productHeaders,
        ...productData,
      ];
      const productWs = XLSX.utils.aoa_to_sheet(productSheetData);
      productWs['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: productHeaders.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: productHeaders.length - 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: productHeaders.length - 1 } },
      ];
      productWs['!cols'] = [
        { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 16 },
        { wch: 14 }, { wch: 28 }, { wch: 18 }, { wch: 14 },
        { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 14 },
        { wch: 8 }, { wch: 16 },
      ];

      // --- Hoja Estadísticas ---
      const statsSheetData = [
        ['DEVOLUCIONES DE COMPRAS'],
        [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
        [''],
        ['ESTADÍSTICAS'],
        [''],
        statsHeaders,
        ...statsData,
      ];
      const statsWs = XLSX.utils.aoa_to_sheet(statsSheetData);
      statsWs['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
      ];
      statsWs['!cols'] = [{ wch: 28 }, { wch: 28 }];

      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen Devoluciones');
      XLSX.utils.book_append_sheet(wb, productWs, 'Detalle Productos');
      XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas');

      XLSX.writeFile(wb, `devoluciones_compras_${currentDate.toISOString().split('T')[0]}.xlsx`);
      showTimer('success', 'Descarga completada', 'El archivo Excel se ha generado exitosamente.', 4000);
    });
  };

  // ──────────────────────────────────────────────────────────────────
  //  Renderizado (con labels en fechas y botón limpiar con label invisible)
  // ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-wrap items-end gap-3 shrink-0">
      {/* Buscador (sin label) */}
      <div className="relative w-72">
        <input
          type="text"
          placeholder="Buscar por No. devolución, factura, estado..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300
                     focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                     outline-none bg-white text-gray-700 placeholder-gray-400"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          strokeWidth={2}
        />
      </div>

      {/* Filtros de fecha con label */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500 font-medium pl-0.5">Fecha Inicial</label>
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={1.8}
          />
          <input
            type="date"
            value={fechaInicial}
            max={fechaFinal || undefined}
            onChange={(e) => { setFechaInicial(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300
                       focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                       outline-none bg-white text-gray-600 w-full sm:w-auto"
          />
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-gray-500 font-medium pl-0.5">Fecha Final</label>
        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={1.8}
          />
          <input
            type="date"
            value={fechaFinal}
            min={fechaInicial || undefined}
            onChange={(e) => { setFechaFinal(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300
                       focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20
                       outline-none bg-white text-gray-600 w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Botón Limpiar filtros (con label invisible para alinear altura) */}
      {hayFiltrosActivos && (
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-500 font-medium pl-0.5 invisible">Limpiar</label>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                       border border-gray-400 rounded-lg text-gray-600 bg-white
                       hover:bg-gray-100 hover:text-gray-800 transition-all duration-200
                       cursor-pointer whitespace-nowrap"
          >
            <Eraser className="w-4 h-4" strokeWidth={2} />
            <span>Limpiar filtros</span>
          </button>
        </div>
      )}

      {/* Espaciador flexible para empujar los botones de acción a la derecha */}
      <div className="flex-1" />

      {/* Botón Exportar Excel */}
      <ButtonComponent
        className="bg-white text-green-600 border-green-600 hover:bg-green-400 px-2 flex items-center gap-2"
        onClick={handleDownload}
      >
        <FileSpreadsheet className="w-4 h-4" />
        Exportar Excel
      </ButtonComponent>
    </div>
  );
}

export default TopBar;