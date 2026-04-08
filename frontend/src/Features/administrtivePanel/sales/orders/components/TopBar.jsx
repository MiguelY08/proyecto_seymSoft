import { Search, Calendar, Eraser, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';

/**
 * TopBar — Barra superior con buscador, filtros de fecha y exportar Excel.
 * Sigue el mismo diseño que ReturnsToolbar: buscador a la izquierda,
 * luego fechas con label, botón limpiar (con label invisible) y exportar a la derecha.
 */
function TopBar({
  search,
  setSearch,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  setCurrentPage,
  orders,
}) {
  const { showWarning } = useAlert();

  const hayFiltrosActivos = search || fechaInicial || fechaFinal;

  const handleClearFilters = () => {
    setSearch('');
    setFechaInicial('');
    setFechaFinal('');
    setCurrentPage(1);
  };

  // ======================= EXPORTAR EXCEL REDISEÑADO =======================
  const handleDownloadExcel = () => {
    if (orders.length === 0) {
      showWarning('Sin registros', 'No hay pedidos registrados para exportar.');
      return;
    }

    // Helpers de formato
    const formatCurrency = (value) => {
      if (value === undefined || value === null) return '0';
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(value);
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      return dateStr;
    };

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const formattedDateTime = currentDate.toLocaleString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    // ======================= HOJA 1: RESUMEN DE PEDIDOS =======================
    const summaryHeaders = [
      'N° Pedido', 'Cliente', 'Teléfono', 'Email', 'Dirección', 'Fecha',
      'Total', 'Estado', 'Motivo cancelación', 'Método Pago', 'Cantidad Productos',
    ];

    const summaryData = orders.map((order) => [
      order.numerosPedido || '',
      order.cliente?.nombre || '',
      order.cliente?.telefono || '',
      order.cliente?.email || '',
      order.cliente?.direccion || '',
      formatDate(order.fecha),
      formatCurrency(order.total || 0),
      order.estado || '',
      order.motivoCancelacion ?? '',
      order.metodoPago || '',
      order.productos?.length || 0,
    ]);

    // ======================= HOJA 2: DETALLE DE PRODUCTOS =======================
    const productHeaders = [
      'N° Pedido', 'Cliente', 'Fecha Pedido', 'Producto',
      'Cantidad', 'Precio Unitario', 'Total Producto',
    ];

    const productData = [];
    orders.forEach((order) => {
      const productos = order.productos || [];
      const clienteNombre = order.cliente?.nombre || '';

      if (productos.length === 0) {
        productData.push([
          order.numerosPedido || '',
          clienteNombre,
          formatDate(order.fecha),
          'Sin productos registrados',
          '', '', '',
        ]);
      } else {
        productos.forEach((prod) => {
          const cantidad = prod.cantidad || 1;
          const precioUnit = prod.precioUnit || 0;
          const totalProducto = cantidad * precioUnit;
          productData.push([
            order.numerosPedido || '',
            clienteNombre,
            formatDate(order.fecha),
            prod.nombre || 'Producto sin nombre',
            cantidad,
            formatCurrency(precioUnit),
            formatCurrency(totalProducto),
          ]);
        });
      }
    });

    // ======================= HOJA 3: ESTADÍSTICAS =======================
    const statsHeaders = ['Métrica', 'Valor'];

    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalProductLines = orders.reduce((sum, o) => sum + (o.productos?.length || 0), 0);
    const totalUnits = orders.reduce((sum, o) => {
      const units = (o.productos || []).reduce((acc, p) => acc + (p.cantidad || 0), 0);
      return sum + units;
    }, 0);

    const completedOrders = orders.filter((o) => o.estado === 'Completado').length;
    const pendingOrders = orders.filter((o) => o.estado === 'Pendiente').length;
    const cancelledOrders = orders.filter((o) => o.estado === 'Cancelado').length;
    const avgPerOrder = totalOrders > 0 ? totalValue / totalOrders : 0;

    const statsData = [
      ['Total Pedidos', totalOrders],
      ['Total Valor Vendido', formatCurrency(totalValue)],
      ['Total Líneas de Productos', totalProductLines],
      ['Total Unidades Vendidas', totalUnits],
      ['Promedio por Pedido', formatCurrency(avgPerOrder)],
      [''],
      ['Pedidos Completados', completedOrders],
      ['Pedidos Pendientes', pendingOrders],
      ['Pedidos Cancelados', cancelledOrders],
      [''],
      ['Fecha de Exportación', formattedDateTime],
    ];

    // ======================= CREAR LIBRO Y HOJAS =======================
    const wb = XLSX.utils.book_new();

    // --- Hoja Resumen ---
    const summarySheetData = [
      ['PEDIDOS'],
      [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
      [''],
      ['RESUMEN DE PEDIDOS'],
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
      { wch: 12 }, { wch: 28 }, { wch: 15 }, { wch: 30 },
      { wch: 40 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 35 }, { wch: 15 }, { wch: 12 },
    ];

    // --- Hoja Detalle de Productos ---
    const productSheetData = [
      ['PEDIDOS'],
      [`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`],
      [''],
      ['DETALLE DE PRODUCTOS PEDIDOS'],
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
      { wch: 12 }, { wch: 28 }, { wch: 12 }, { wch: 35 },
      { wch: 12 }, { wch: 16 }, { wch: 16 },
    ];

    // --- Hoja Estadísticas ---
    const statsSheetData = [
      ['PEDIDOS'],
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

    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen Pedidos');
    XLSX.utils.book_append_sheet(wb, productWs, 'Detalle Productos');
    XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas');

    const fileName = `pedidos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="flex flex-wrap items-end gap-3 shrink-0">
      {/* Buscador (sin label) */}
      <div className="relative w-72">
        <input
          type="text"
          placeholder="Buscar por número de pedido, cliente, estado..."
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

      {/* Fecha inicial con label */}
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

      {/* Fecha final con label */}
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

      {/* Espaciador flexible para empujar el botón Exportar a la derecha */}
      <div className="flex-1" />

      {/* Exportar Excel */}
      <ButtonComponent
        className="bg-white text-green-600 border-green-600 hover:bg-green-400 px-2 flex items-center gap-2"
        onClick={handleDownloadExcel}
      >
        <FileSpreadsheet className="w-4 h-4" />
        Exportar Excel
      </ButtonComponent>
    </div>
  );
}

export default TopBar;