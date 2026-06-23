import React from 'react';
import { Info, SquarePen, XCircle } from 'lucide-react';
import { usePermissions } from '../../../configuration/roles/hooks/usePermissions';
import {
  formatCurrency,
  formatDate,
  getStatusStyle,
  getStatusText,
} from '../utils/returnsHelpers';

const getField = (object, names, fallback = '') => {
  for (const name of names) {
    if (object?.[name] !== undefined && object?.[name] !== null) return object[name];
  }
  return fallback;
};

const highlightText = (text, search) => {
  if (!search || text === null || text === undefined) return text;
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'));

  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={`${part}-${index}`} className="rounded bg-[#004d7726] px-0.5 text-[#004D77]">
        {part}
      </span>
    ) : (
      part
    ),
  );
};

const HEADERS = ['#', 'Número', 'Factura', 'Cliente', 'Motivo', 'Fecha', 'Valor', 'Estado', 'Acciones'];

function ReturnsTable({ data, startIndex, searchTerm, onInfo, onEdit, onCancel }) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('devoluciones_en_ventas.ver');
  const canEdit = hasPermission('devoluciones_en_ventas.editar');
  const canAnnul = hasPermission('devoluciones_en_ventas.anular');

  return (
    <div className="w-full overflow-hidden rounded-xl shadow-md">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-[4%]" />
          <col className="w-[13%]" />
          <col className="w-[10%]" />
          <col className="w-[18%]" />
          <col className="w-[17%]" />
          <col className="w-[10%]" />
          <col className="w-[11%]" />
          <col className="w-[10%]" />
          <col className="w-[7%]" />
        </colgroup>

        <thead className="bg-[#004D77] text-white">
          <tr>
            {HEADERS.map((header) => (
              <th
                key={header}
                className="truncate px-1 py-2 text-center text-[10px] font-semibold"
                title={header}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {!data?.length ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-xs text-gray-400">
                No se encontraron devoluciones.
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
              const returnNumber = getField(row, ['numeroDevolucion', 'returnNumber']);
              const invoiceNumber = getField(row, ['numeroFactura', 'invoiceNumber']);
              const client = getField(row, ['cliente', 'clientName']);
              const reason = getField(row, ['motivo', 'reason'], 'Varios motivos');
              const createdAt = getField(row, ['fechaCreacion', 'createdAt', 'creationDate']);
              const total = getField(row, ['totalValor', 'totalAmount'], 0);
              const status = getField(row, ['estado', 'status'], 'En Proceso');
              const cancelled = status === 'Anulado';

              return (
                <tr key={row.id || returnNumber || index} className={`${rowBg} transition-colors`}>
                  <td className="px-1 py-1.5 text-center text-[10px] font-medium text-gray-500">
                    {startIndex + index + 1}
                  </td>
                  <td className="truncate px-1 py-1.5 text-center text-[10px] text-gray-700" title={returnNumber}>
                    {highlightText(returnNumber, searchTerm)}
                  </td>
                  <td className="truncate px-1 py-1.5 text-center text-[10px] text-gray-700" title={invoiceNumber}>
                    {highlightText(invoiceNumber, searchTerm)}
                  </td>
                  <td className="truncate px-1 py-1.5 text-center text-[10px] font-medium text-gray-800" title={client}>
                    {highlightText(client, searchTerm)}
                  </td>
                  <td className="truncate px-1 py-1.5 text-center text-[10px] text-gray-700" title={reason}>
                    {highlightText(reason, searchTerm)}
                  </td>
                  <td className="truncate px-1 py-1.5 text-center text-[10px] text-gray-700">
                    {formatDate(createdAt)}
                  </td>
                  <td className="truncate px-1 py-1.5 text-center text-[10px] text-gray-700" title={`$${formatCurrency(total)}`}>
                    ${formatCurrency(total)}
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    <span
                      className={`inline-block max-w-full truncate rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${getStatusStyle(status)}`}
                      title={getStatusText(status)}
                    >
                      {getStatusText(status)}
                    </span>
                  </td>
                  <td className="px-0.5 py-1.5">
                    <div className="flex items-center justify-center gap-1">
                      {canView && (
                        <button
                          type="button"
                          onClick={() => onInfo(row)}
                          className="text-gray-400 transition hover:text-[#004D77]"
                          title="Ver detalle"
                        >
                          <Info className="h-3.5 w-3.5" strokeWidth={1.6} />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          disabled={cancelled}
                          className="text-gray-400 transition hover:text-[#004D77] disabled:cursor-not-allowed disabled:opacity-30"
                          title={cancelled ? 'No se puede editar una devolución anulada' : 'Editar'}
                        >
                          <SquarePen className="h-3.5 w-3.5" strokeWidth={1.6} />
                        </button>
                      )}
                      {canAnnul && (
                        <button
                          type="button"
                          onClick={() => onCancel(row)}
                          disabled={cancelled}
                          className="text-gray-400 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                          title={cancelled ? 'Ya está anulada' : 'Anular devolución'}
                        >
                          <XCircle className="h-3.5 w-3.5" strokeWidth={1.6} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReturnsTable;
