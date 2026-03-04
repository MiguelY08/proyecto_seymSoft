import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'pm_sales';

// ─── Generador de Excel ───────────────────────────────────────────────────────
const downloadExcel = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const sales  = stored ? JSON.parse(stored) : [];

  if (sales.length === 0) return false;

  const rows = sales.map((s, index) => ({
    '#':                  index + 1,
    'Cliente':            s.cliente,
    'Vendedor':           s.vendedor,
    'No. Factura':        s.factura,
    'Fecha':              s.fecha,
    'Método de Pago':     s.metodoPago,
    'Total':              s.total,
    'Estado':             s.estado,
    'Registrado Desde':   s.registradoDesde ?? '—',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook  = XLSX.utils.book_new();

  worksheet['!cols'] = [
    { wch: 6  },  // #
    { wch: 28 },  // Cliente
    { wch: 28 },  // Vendedor
    { wch: 16 },  // No. Factura
    { wch: 14 },  // Fecha
    { wch: 18 },  // Método de Pago
    { wch: 14 },  // Total
    { wch: 20 },  // Estado
    { wch: 18 },  // Registrado Desde
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

  const fecha = new Date()
    .toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-');

  XLSX.writeFile(workbook, `ventas_${fecha}.xlsx`);
  return true;
};

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ search, onSearchChange }) {
  const navigate = useNavigate();
  const { showConfirm, showTimer, showWarning } = useAlert();

  const handleDownload = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const sales  = stored ? JSON.parse(stored) : [];

    if (sales.length === 0) {
      showWarning('Sin registros', 'No hay ventas registradas para descargar.');
      return;
    }

    showConfirm(
      'question',
      '¿Desea descargar las ventas?',
      `Se exportarán ${sales.length} registro${sales.length !== 1 ? 's' : ''} en formato Excel.`,
      { confirmButtonText: 'Descargar', cancelButtonText: 'Cancelar' }
    ).then((result) => {
      if (result.isConfirmed) {
        const success = downloadExcel();
        if (success) {
          showTimer('success', 'Descarga completada', 'El archivo Excel se ha generado exitosamente.', 4000);
        }
      }
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">

      {/* Buscador */}
      <div className="relative flex-1 sm:flex-none sm:w-72 md:w-96">
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
      </div>

      {/* Botones */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleDownload}
          title="Descargar ventas"
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <span className="hidden sm:inline">Descargar</span>
          <Download className="w-4 h-4" strokeWidth={1.8} />
        </button>
        <button
          onClick={() => navigate('/admin/sales/form-sale')}
          title="Nueva venta"
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <span className="hidden sm:inline">Nueva venta</span>
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

    </div>
  );
}

export default TopBar;