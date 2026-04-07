import React from 'react';
import { Search, Calendar, X, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ButtonComponent from '../../../../shared/ButtonComponent';

/**
 * Componente TopBar — Barra superior para filtros en Devoluciones de Compras.
 * Incluye buscador, filtros de fecha, botón limpiar y botón exportar Excel.
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

  /**
   * Exporta el listado actual de devoluciones a un archivo Excel.
   * Incluye todos los productos de cada devolución en filas separadas.
   */
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

      // Una fila por producto dentro de cada devolución
      const rows = [];
      returns.forEach((dev) => {
        const proveedor = proveedorMap[dev.idCompra] ?? '—';
        (dev.productos ?? []).forEach((p) => {
          rows.push({
            'No. Devolución':  dev.id,
            'No. Factura':     dev.idCompra,
            'Proveedor':       proveedor,
            'F. Devolución':   dev.fechaDevolucion,
            'Estado':          dev.estado,
            'Producto':        p.nombre,
            'Cod. Barras':     p.codigoBarras,
            'Cant. Devolver':  p.cantidadDevolver ?? 0,
            'Motivo':          p.motivo ?? '—',
            'Tipo':            p.tipoDevolucion ?? '—',
            'Estado Producto': p.estado ?? '—',
            'Valor Unit.':     p.valorUnit ?? 0,
            'IVA %':           p.iva ?? 0,
          });
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook  = XLSX.utils.book_new();

      worksheet['!cols'] = [
        { wch: 16 }, // No. Devolución
        { wch: 14 }, // No. Factura
        { wch: 22 }, // Proveedor
        { wch: 16 }, // F. Devolución
        { wch: 16 }, // Estado
        { wch: 28 }, // Producto
        { wch: 18 }, // Cod. Barras
        { wch: 14 }, // Cant. Devolver
        { wch: 22 }, // Motivo
        { wch: 16 }, // Tipo
        { wch: 16 }, // Estado Producto
        { wch: 12 }, // Valor Unit.
        { wch: 8  }, // IVA %
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Devoluciones');

      const fecha = new Date().toLocaleDateString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }).replace(/\//g, '-');

      XLSX.writeFile(workbook, `devoluciones_${fecha}.xlsx`);
      showTimer('success', 'Descarga completada', 'El archivo Excel se ha generado exitosamente.', 4000);
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">

      {/* ── Buscador ──────────────────────────────────────────────────────── */}
      <div className="relative flex-1 sm:flex-none sm:w-72 md:w-96">
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

      {/* ── Fechas + limpiar ──────────────────────────────────────────────── */}
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

        {/* Limpiar filtros */}
        {hayFiltrosActivos && (
          <button
            onClick={handleClearFilters}
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
        <ButtonComponent
          className="bg-white text-green-600 border-green-600 hover:bg-green-400 px-2 flex items-center gap-2"
          onClick={handleDownload}>
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
        </ButtonComponent>

      </div>
    </div>
  );
}

export default TopBar;