import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAlert } from '../../../../shared/alerts/useAlert';

/**
 * TopBar — Barra superior con botón para exportar pedidos a Excel.
 * Incluye validación si no hay pedidos y genera archivo con datos formateados.
 *
 * @param {Object} props
 * @param {Array} props.orders - Lista de pedidos a exportar.
 */
function TopBar({ orders }) {
  const { showWarning } = useAlert();

  /**
   * Exporta los pedidos a un archivo Excel.
   * Valida que haya pedidos, mapea datos, configura columnas y descarga el archivo.
   */
  const handleDownloadExcel = () => {
    if (orders.length === 0) {
      showWarning('Sin registros', 'No hay pedidos registrados para exportar.');
      return;
    }

    // ── Mapear datos para filas ────────────────────────────────────────────────
    const rows = orders.map((order) => ({
      'N° Pedido':        order.numerosPedido,
      'Cliente':          order.cliente.nombre,
      'Teléfono':         order.cliente.telefono,
      'Email':            order.cliente.email,
      'Dirección':        order.cliente.direccion,
      'Fecha':            order.fecha,
      'Total':            `$${order.total.toLocaleString()}`,
      'Estado':           order.estado,
      'Motivo cancelación': order.motivoCancelacion ?? '',
      'Método Pago':      order.metodoPago,
      'Productos':        order.productos.length,
    }));

    // ── Crear hoja y libro ────────────────────────────────────────────────────
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook  = XLSX.utils.book_new();

    // ── Configurar anchos de columnas ─────────────────────────────────────────
    worksheet['!cols'] = [
      { wch: 12 }, // N° Pedido
      { wch: 25 }, // Cliente
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Email
      { wch: 40 }, // Dirección
      { wch: 12 }, // Fecha
      { wch: 15 }, // Total
      { wch: 15 }, // Estado
      { wch: 40 }, // Motivo cancelación
      { wch: 18 }, // Método Pago
      { wch: 10 }, // Productos
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

    // ── Generar nombre de archivo con fecha ───────────────────────────────────
    const fecha = new Date().toLocaleDateString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).replace(/\//g, '-');

    XLSX.writeFile(workbook, `pedidos_${fecha}.xlsx`);
  };

  return (
    <button
      onClick={handleDownloadExcel}
      className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
    >
      <span className="hidden sm:inline">Exportar Excel</span>
      <Download className="w-4 h-4" strokeWidth={1.8} />
    </button>
  );
}

export default TopBar;