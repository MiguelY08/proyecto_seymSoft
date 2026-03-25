import React from 'react';
import { Download, Calendar, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAlert } from '../../../../shared/alerts/useAlert';

/**
 * TopBar — Barra superior con filtros de fecha y exportar Excel.
 */
function TopBar({
  search,
  onSearchChange,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  setCurrentPage,
  orders,
}) {
  const { showWarning } = useAlert();

  const hayFiltrosFecha = fechaInicial || fechaFinal;

  const handleClearFechas = () => {
    setFechaInicial('');
    setFechaFinal('');
    setCurrentPage(1);
  };

  const handleDownloadExcel = () => {
    if (orders.length === 0) {
      showWarning('Sin registros', 'No hay pedidos registrados para exportar.');
      return;
    }

    const rows = orders.map((order) => ({
      'N° Pedido':          order.numerosPedido,
      'Cliente':            order.cliente.nombre,
      'Teléfono':           order.cliente.telefono,
      'Email':              order.cliente.email,
      'Dirección':          order.cliente.direccion,
      'Fecha':              order.fecha,
      'Total':              `$${order.total.toLocaleString()}`,
      'Estado':             order.estado,
      'Motivo cancelación': order.motivoCancelacion ?? '',
      'Método Pago':        order.metodoPago,
      'Productos':          order.productos.length,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook  = XLSX.utils.book_new();

    worksheet['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 30 },
      { wch: 40 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 40 }, { wch: 18 }, { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

    const fecha = new Date().toLocaleDateString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).replace(/\//g, '-');

    XLSX.writeFile(workbook, `pedidos_${fecha}.xlsx`);
  };

  return (
    <div className="flex items-center gap-2 shrink-0">

      {/* Fecha inicial */}
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

      <span className="text-gray-400 text-sm select-none hidden sm:block">—</span>

      {/* Fecha final */}
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

      {/* Limpiar fechas */}
      {hayFiltrosFecha && (
        <button
          onClick={handleClearFechas}
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold
                     border border-sky-700 rounded-lg text-[#004D77] bg-white
                     hover:bg-sky-50 active:scale-95 transition-all duration-200
                     cursor-pointer whitespace-nowrap"
        >
          <span className="hidden sm:inline">Limpiar</span>
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      )}

      {/* Exportar Excel */}
      <button
        onClick={handleDownloadExcel}
        className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold
                   border border-sky-700 rounded-lg text-[#004D77] bg-white
                   hover:bg-sky-50 active:scale-95 transition-all duration-200
                   cursor-pointer whitespace-nowrap shrink-0"
      >
        <span className="hidden sm:inline">Exportar Excel</span>
        <Download className="w-4 h-4" strokeWidth={1.8} />
      </button>

    </div>
  );
}

export default TopBar;