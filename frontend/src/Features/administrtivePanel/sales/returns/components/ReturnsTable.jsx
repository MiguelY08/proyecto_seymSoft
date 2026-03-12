// components/ReturnsTable.jsx
import React from 'react';
import { Info, SquarePen, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, getStatusStyle, getStatusText } from '../utils/returnsHelpers';

const highlightText = (text, search) => {
  if (!search || !text) return text;

  const regex = new RegExp(`(${search})`, 'gi');
  const parts = text.toString().split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={index} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
        {part}
      </span>
    ) : (
      part
    )
  );
};

function ReturnsTable({ data, startIndex, searchTerm, onInfo, onEdit, onCancel }) {
  if (!data || data.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-max w-full">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">#</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Número</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Factura</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Cliente</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Motivo</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Fecha</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Valor</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Estado</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} className="py-8 text-center text-sm text-gray-400">
                No se encontraron devoluciones.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-10 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">#</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Número</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Factura</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Cliente</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Motivo</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Fecha</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Valor</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Estado</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
            const recordNumber = startIndex + index + 1;

            return (
              <tr key={row.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className={`sticky left-0 z-10 ${rowBg} px-3 py-2 text-center text-xs text-gray-500 font-medium whitespace-nowrap`}>
                  {recordNumber}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(row.numeroDevolucion, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(row.numeroFactura, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium whitespace-nowrap">
                  {highlightText(row.cliente, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 max-w-[150px] truncate">
                  {highlightText(row.motivo, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {formatDate(row.fechaCreacion)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  ${highlightText(formatCurrency(row.totalValor), searchTerm)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusStyle(row.estado)}`}>
                    {getStatusText(row.estado)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onInfo(row)}
                      className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                      title="Ver detalle"
                    >
                      <Info className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => onEdit(row)}
                      className={`text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer ${
                        row.estado === 'Anulada' ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      title="Editar"
                      disabled={row.estado === 'Anulada'}
                    >
                      <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => onCancel(row)}
                      className={`transition cursor-pointer ${
                        row.estado === 'Anulada' 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-400 hover:scale-110 hover:text-red-500'
                      }`}
                      title={row.estado === 'Anulada' ? 'Ya está anulada' : 'Anular devolución'}
                      disabled={row.estado === 'Anulada'}
                    >
                      <XCircle className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ReturnsTable;