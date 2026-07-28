import React, { useCallback, useRef, useState } from 'react';
import { Info, RotateCcw, SquarePen, XCircle } from 'lucide-react';
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

const formatReasonLabel = (reason) => {
  if (!reason) return 'Varios motivos';
  const labels = {
    DEFECTUOSO: 'Producto defectuoso',
    PRODUCTO_EQUIVOCADO: 'Producto equivocado',
    PRODUCTO_INCOMPLETO: 'Producto incompleto',
    MAL_ESTADO: 'Producto en mal estado',
    PRODUCTO_USADO: 'Producto usado',
    OTRO: 'Otro motivo',
  };
  const value = String(reason).trim();
  const label = labels[value] || value.replace(/[_-]+/g, ' ');
  const normalized = label.toLocaleLowerCase('es-CO');
  return normalized.charAt(0).toLocaleUpperCase('es-CO') + normalized.slice(1);
};

const normalizeStatus = (status) => String(status || 'Sin estado').trim();

const getDetailStatus = (detail) => normalizeStatus(detail.status || detail.estado);

const getDetailName = (detail) =>
  detail.productName || detail.nombre || detail.name || 'Producto';

const getProductDetails = (row) => {
  const details = row?.details || row?.productosDevueltos || row?.saleReturnDetails || [];
  return Array.isArray(details) ? details : [];
};

const getStatusDotClass = (status) => {
  const normalized = normalizeStatus(status).toLocaleLowerCase('es-CO');
  if (normalized.includes('listo') || normalized.includes('procesad')) return 'bg-emerald-400';
  if (normalized.includes('anulad') || normalized.includes('cancel')) return 'bg-red-400';
  if (normalized.includes('reembolso') || normalized.includes('reemplazo')) return 'bg-yellow-400';
  if (normalized.includes('envio') || normalized.includes('envío')) return 'bg-orange-400';
  return 'bg-slate-400';
};

function useFloatingTooltip() {
  const [position, setPosition] = useState(null);
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const tooltipWidth = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 190 && rect.top > spaceBelow;

    setPosition({
      left: Math.min(Math.max(rect.left + rect.width / 2 - tooltipWidth / 2, 12), window.innerWidth - tooltipWidth - 12),
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      openUp,
    });
  }, []);

  const hide = useCallback(() => setPosition(null), []);

  return { ref, position, show, hide };
}

const FloatingTooltip = ({ position, children }) => {
  if (!position) return null;

  return (
    <div
      className="fixed z-[9999] w-[260px] rounded-xl bg-slate-800 p-3 text-white shadow-2xl"
      style={{
        left: position.left,
        top: position.openUp ? undefined : position.top,
        bottom: position.openUp ? window.innerHeight - position.top : undefined,
      }}
    >
      {children}
    </div>
  );
};

const StatusProcessTooltip = ({ row, status }) => {
  const { ref, position, show, hide } = useFloatingTooltip();
  const details = getProductDetails(row);
  const total = details.length;
  const ready = details.filter((detail) => getDetailStatus(detail) === 'Listo').length;
  const pending = Math.max(total - ready, 0);

  const statusCounts = details.reduce((acc, detail) => {
    const detailStatus = getDetailStatus(detail);
    acc[detailStatus] = (acc[detailStatus] || 0) + 1;
    return acc;
  }, {});

  const statusEntries = Object.entries(statusCounts).sort(([a], [b]) => {
    if (a === 'Listo') return 1;
    if (b === 'Listo') return -1;
    return a.localeCompare(b, 'es-CO');
  });

  const isCancelled = status === 'Anulado';

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={`inline-flex max-w-full cursor-default items-center justify-center truncate rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(status)}`}
        title={getStatusText(status)}
      >
        {getStatusText(status)}
      </span>

      <FloatingTooltip position={position}>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
          Progreso de devolución
        </p>

        {isCancelled ? (
          <div className="rounded-lg bg-red-500/10 px-2.5 py-2 text-xs text-red-100">
            Esta devolución fue anulada.
          </div>
        ) : total > 0 ? (
          <>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/10 px-2.5 py-2">
                <p className="text-slate-300">Listos</p>
                <p className="font-semibold text-emerald-300">{ready} de {total}</p>
              </div>
              <div className="rounded-lg bg-white/10 px-2.5 py-2">
                <p className="text-slate-300">Pendientes</p>
                <p className="font-semibold text-yellow-300">{pending}</p>
              </div>
            </div>

            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Estados de productos
            </p>
            <div className="space-y-1.5">
              {statusEntries.map(([detailStatus, count]) => (
                <div key={detailStatus} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${getStatusDotClass(detailStatus)}`} />
                    <span className="truncate">{detailStatus}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-blue-200">{count}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t border-white/10 pt-2">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Productos
              </p>
              <div className="max-h-24 space-y-1 overflow-hidden">
                {details.slice(0, 3).map((detail, index) => (
                  <div key={`${getDetailName(detail)}-${index}`} className="flex items-center justify-between gap-2 text-[11px] text-slate-200">
                    <span className="truncate">{getDetailName(detail)}</span>
                    <span className="shrink-0 text-slate-400">{getDetailStatus(detail)}</span>
                  </div>
                ))}
                {details.length > 3 && (
                  <p className="text-[11px] text-slate-400">+ {details.length - 3} producto(s) más</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-white/10 px-2.5 py-2 text-xs text-slate-200">
            No hay productos cargados para calcular el progreso.
          </div>
        )}
      </FloatingTooltip>
    </>
  );
};

function ReturnsTable({ data, startIndex, searchTerm, onInfo, onEdit, onCancel }) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('devoluciones_en_ventas.ver');
  const canEdit = hasPermission('devoluciones_en_ventas.editar');
  const canAnnul = hasPermission('devoluciones_en_ventas.anular');

  if (!data?.length) {
    const isSearching = searchTerm?.trim?.().length > 0;

    return (
      <div className="flex h-full min-h-[420px] w-full flex-1 flex-col items-center justify-center gap-4 rounded-xl bg-white px-4 py-16 shadow-md lg:min-h-0 lg:shadow-none">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#004D77]/10">
          <RotateCcw className="h-10 w-10 text-[#004D77]/40" strokeWidth={1.5} />
        </div>
        <p className="text-center text-base font-semibold text-gray-500">
          {isSearching ? 'No se encontraron resultados' : 'No hay devoluciones registradas'}
        </p>
        <p className="max-w-xs text-center text-sm text-gray-400">
          {isSearching
            ? 'Ninguna devolución coincide con la búsqueda actual.'
            : 'Aún no se han registrado devoluciones de ventas.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-white shadow-md lg:max-h-[calc(100vh-330px)] lg:min-w-0 lg:overflow-auto lg:overscroll-contain lg:shadow-none lg:[-webkit-overflow-scrolling:touch]">
      <table className="min-w-[1180px] w-full table-fixed lg:min-w-[1060px] lg:table-auto">
        <colgroup>
          <col className="w-[4%]" />
          <col className="w-[13%]" />
          <col className="w-[10%]" />
          <col className="w-[18%]" />
          <col className="w-[17%]" />
          <col className="w-[10%]" />
          <col className="w-[11%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
        </colgroup>

        <thead className="sticky top-0 z-10 bg-[#004D77] text-white">
          <tr>
            {HEADERS.map((header) => (
              <th
                key={header}
                className="truncate px-4 py-3 text-center text-sm font-semibold"
                title={header}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
              const rowBg = index % 2 === 0 ? 'bg-gray-100 hover:bg-blue-50' : 'bg-white hover:bg-blue-50';
              const returnNumber = getField(row, ['numeroDevolucion', 'returnNumber']);
              const invoiceNumber = getField(row, ['numeroFactura', 'invoiceNumber']);
              const client = getField(row, ['cliente', 'clientName']);
              const reason = formatReasonLabel(getField(row, ['motivo', 'reason'], 'Varios motivos'));
              const createdAt = getField(row, ['fechaCreacion', 'createdAt', 'creationDate']);
              const total = getField(row, ['totalValor', 'totalAmount'], 0);
              const status = getField(row, ['estado', 'status'], 'En Proceso');
              const cancelled = status === 'Anulado';

              return (
                <tr key={row.id || returnNumber || index} className={`${rowBg} transition-colors duration-150`}>
                  <td className="px-4 py-2.5 text-center text-sm font-medium text-gray-500">
                    {startIndex + index + 1}
                  </td>
                  <td className="truncate px-4 py-2.5 text-center text-sm text-gray-700" title={returnNumber}>
                    {highlightText(returnNumber, searchTerm)}
                  </td>
                  <td className="truncate px-4 py-2.5 text-center text-sm text-gray-700" title={invoiceNumber}>
                    {highlightText(invoiceNumber, searchTerm)}
                  </td>
                  <td className="truncate px-4 py-2.5 text-center text-sm font-medium text-gray-800" title={client}>
                    {highlightText(client, searchTerm)}
                  </td>
                  <td className="truncate px-4 py-2.5 text-center text-sm text-gray-700" title={reason}>
                    {highlightText(reason, searchTerm)}
                  </td>
                  <td className="truncate px-4 py-2.5 text-center text-sm text-gray-700">
                    {formatDate(createdAt)}
                  </td>
                  <td className="truncate px-4 py-2.5 text-center text-sm text-gray-700 font-semibold" title={`$${formatCurrency(total)}`}>
                    ${formatCurrency(total)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <StatusProcessTooltip row={row} status={status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="mx-auto flex min-w-[92px] items-center justify-center gap-2.5">
                      {canView && (
                        <button
                          type="button"
                          onClick={() => onInfo(row)}
                          className="text-gray-400 transition-colors duration-200 hover:text-[#004D77] cursor-pointer"
                          title="Ver detalle"
                        >
                          <Info className="h-5 w-5" strokeWidth={1.5} />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          disabled={cancelled}
                          className="text-gray-400 transition-colors duration-200 hover:text-[#004D77] disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                          title={cancelled ? 'No se puede editar una devolución anulada' : 'Editar'}
                        >
                          <SquarePen className="h-5 w-5" strokeWidth={1.5} />
                        </button>
                      )}
                      {canAnnul && (
                        <button
                          type="button"
                          onClick={() => onCancel(row)}
                          disabled={cancelled}
                          className="text-gray-400 transition-colors duration-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                          title={cancelled ? 'Ya está anulada' : 'Anular devolución'}
                        >
                          <XCircle className="h-5 w-5" strokeWidth={1.5} />
                        </button>
                      )}
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
