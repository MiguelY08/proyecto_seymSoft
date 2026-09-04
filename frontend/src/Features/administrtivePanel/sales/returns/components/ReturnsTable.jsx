import React, { useCallback, useRef, useState } from 'react';
import { Info, Loader2, Plus, RotateCcw, SquarePen, XCircle } from 'lucide-react';
import Permission from '../../../configuration/roles/components/Permission';
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

const normalizeSearch = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeDigits = (value) => String(value ?? '').replace(/\D/g, '');

const mergeRanges = (ranges) => {
  if (!ranges.length) return [];

  return [...ranges]
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .reduce((merged, range) => {
      const last = merged[merged.length - 1];
      if (!last || range.start > last.end) {
        merged.push({ ...range });
      } else {
        last.end = Math.max(last.end, range.end);
      }
      return merged;
    }, []);
};

const getDigitRanges = (text, digitTerm) => {
  if (!digitTerm) return [];

  const chars = Array.from(String(text));
  const digitPositions = [];
  let digits = '';

  chars.forEach((char, index) => {
    if (/\d/.test(char)) {
      digitPositions.push(index);
      digits += char;
    }
  });

  const ranges = [];
  let fromIndex = digits.indexOf(digitTerm);

  while (fromIndex !== -1) {
    const start = digitPositions[fromIndex];
    const end = digitPositions[fromIndex + digitTerm.length - 1] + 1;
    ranges.push({ start, end });
    fromIndex = digits.indexOf(digitTerm, fromIndex + 1);
  }

  return ranges;
};

const getTextRanges = (text, term) => {
  if (!term) return [];

  const original = String(text);
  const normalizedText = normalizeSearch(original);
  const normalizedTerm = normalizeSearch(term);
  const ranges = [];
  let fromIndex = normalizedText.indexOf(normalizedTerm);

  while (fromIndex !== -1) {
    ranges.push({ start: fromIndex, end: fromIndex + normalizedTerm.length });
    fromIndex = normalizedText.indexOf(normalizedTerm, fromIndex + 1);
  }

  return ranges;
};

const highlightText = (text, search) => {
  if (!search || text === null || text === undefined) return text;

  const original = String(text);
  const cleanSearch = String(search).trim();
  if (!cleanSearch) return original;

  const ranges = [];
  const terms = normalizeSearch(cleanSearch).split(/\s+/).filter(Boolean);
  const fullSearchRanges = getTextRanges(original, cleanSearch);

  ranges.push(...fullSearchRanges);
  terms.forEach((term) => ranges.push(...getTextRanges(original, term)));

  const fullDigitTerm = normalizeDigits(cleanSearch);
  ranges.push(...getDigitRanges(original, fullDigitTerm));
  terms.forEach((term) => ranges.push(...getDigitRanges(original, normalizeDigits(term))));

  const mergedRanges = mergeRanges(ranges);
  if (!mergedRanges.length) return original;

  const nodes = [];
  let cursor = 0;

  mergedRanges.forEach(({ start, end }, index) => {
    if (start > cursor) nodes.push(original.slice(cursor, start));
    nodes.push(
      <span key={`${start}-${end}-${index}`} className="rounded bg-[#004d7726] px-0.5 text-[#004D77]">
        {original.slice(start, end)}
      </span>,
    );
    cursor = end;
  });

  if (cursor < original.length) nodes.push(original.slice(cursor));
  return nodes;
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
  if (normalized.includes('proceso') || normalized.includes('pend')) return 'bg-yellow-400';
  if (normalized.includes('reembolso') || normalized.includes('reemplazo')) return 'bg-yellow-400';
  if (normalized.includes('envio') || normalized.includes('envío')) return 'bg-orange-400';
  return 'bg-slate-400';
};

const shouldPulseStatus = (status) => {
  const normalized = normalizeStatus(status).toLocaleLowerCase('es-CO');
  return (
    normalized.includes('proceso') ||
    normalized.includes('pend') ||
    normalized.includes('envio') ||
    normalized.includes('envío')
  );
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

const StatusProcessTooltip = ({ row, status, searchTerm }) => {
  const { ref, position, show, hide } = useFloatingTooltip();
  const details = getProductDetails(row);
  const total = details.length;
  const ready = details.filter((detail) => getDetailStatus(detail) === 'Listo').length;
  const cancelled = details.filter((detail) => getDetailStatus(detail) === 'Anulado').length;
  const activeTotal = Math.max(total - cancelled, 0);
  const pending = details.filter((detail) => {
    const detailStatus = getDetailStatus(detail);
    return detailStatus !== 'Listo' && detailStatus !== 'Anulado';
  }).length;
  const creditApplied = details.filter((detail) => detail.creditApplied === true && detail.creditReversed !== true).length;
  const stockMoved = details.filter((detail) => detail.stockApplied === true && Number(detail.stockDelta || 0) !== 0).length;

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
        className={`inline-flex max-w-full cursor-default items-center justify-center gap-1 truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusStyle(status)}`}
        title={getStatusText(status)}
      >
        <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
          {shouldPulseStatus(status) && (
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${getStatusDotClass(status)}`} />
          )}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${getStatusDotClass(status)}`} />
        </span>
        {highlightText(getStatusText(status), searchTerm)}
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
            <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-white/10 px-2.5 py-2">
                <p className="text-slate-300">Listos</p>
                <p className="font-semibold text-emerald-300">{ready} de {activeTotal}</p>
              </div>
              <div className="rounded-lg bg-white/10 px-2.5 py-2">
                <p className="text-slate-300">Pendientes</p>
                <p className="font-semibold text-yellow-300">{pending}</p>
              </div>
              <div className="rounded-lg bg-white/10 px-2.5 py-2">
                <p className="text-slate-300">Anulados</p>
                <p className="font-semibold text-red-300">{cancelled}</p>
              </div>
            </div>

            {(creditApplied > 0 || stockMoved > 0) && (
              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-blue-500/10 px-2.5 py-2">
                  <p className="text-slate-300">Saldo aplicado</p>
                  <p className="font-semibold text-blue-200">{creditApplied}</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 px-2.5 py-2">
                  <p className="text-slate-300">Stock movido</p>
                  <p className="font-semibold text-emerald-200">{stockMoved}</p>
                </div>
              </div>
            )}

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

function ReturnsTable({ data, startIndex, searchTerm, onInfo, onEdit, onCancel, onCreateReturn }) {
  const { hasPermission } = usePermissions();
  const [loadingCancelId, setLoadingCancelId] = useState(null);
  const canView = hasPermission('devoluciones_en_ventas.ver');
  const canEdit = hasPermission('devoluciones_en_ventas.editar');
  const canAnnul = hasPermission('devoluciones_en_ventas.anular');

  const handleCancelClick = async (row) => {
    if (loadingCancelId !== null) return;

    setLoadingCancelId(row.id);
    try {
      await onCancel?.(row);
    } finally {
      setLoadingCancelId(null);
    }
  };

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
        <Permission permission="devoluciones_en_ventas.crear">
          <button
            type="button"
            onClick={onCreateReturn}
            className="mt-1 flex cursor-pointer items-center gap-1.5 rounded-lg border bg-[#004D77] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#003a5c]"
          >
            <span>Crear devolución</span>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </Permission>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full rounded-xl overflow-x-auto lg:overflow-auto lg:overscroll-contain lg:[-webkit-overflow-scrolling:touch]">
      <table className="min-w-max w-full table-auto">
        <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
          <tr>
            {HEADERS.map((header) => (
              <th
                key={header}
                className="truncate px-3 py-2.5 text-center text-xs font-semibold"
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
              const createdAtText = formatDate(createdAt);
              const total = getField(row, ['totalValor', 'totalAmount'], 0);
              const totalText = `$${formatCurrency(total)}`;
              const status = getField(row, ['estado', 'status'], 'En Proceso');
              const cancelled = status === 'Anulado';
              const isCancelling = loadingCancelId === row.id;
              const rowNumber = String(startIndex + index + 1);

              return (
                <tr key={row.id || returnNumber || index} className={`${rowBg} transition-colors duration-150`}>
                  <td className="px-3 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap">
                    {highlightText(rowNumber, searchTerm)}
                  </td>
                  <td className="truncate px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap" title={returnNumber}>
                    {highlightText(returnNumber, searchTerm)}
                  </td>
                  <td className="truncate px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap" title={invoiceNumber}>
                    {highlightText(invoiceNumber, searchTerm)}
                  </td>
                  <td className="truncate px-3 py-2 text-center text-xs font-medium text-gray-800 whitespace-nowrap" title={client}>
                    {highlightText(client, searchTerm)}
                  </td>
                  <td className="truncate px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap" title={reason}>
                    {highlightText(reason, searchTerm)}
                  </td>
                  <td className="truncate px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap" title={createdAtText}>
                    {highlightText(createdAtText, searchTerm)}
                  </td>
                  <td className="truncate px-3 py-2 text-center text-xs font-semibold text-gray-800 whitespace-nowrap" title={totalText}>
                    {highlightText(totalText, searchTerm)}
                  </td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <StatusProcessTooltip row={row} status={status} searchTerm={searchTerm} />
                      {canView && (
                        <button
                          type="button"
                          
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-300"
                          
                        >
                          <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="mx-auto flex items-center justify-center gap-1 sm:gap-1.5">
                      {canView && (
                        <button
                          type="button"
                          onClick={() => onInfo(row)}
                          className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]"
                          title="Ver detalle"
                        >
                          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          disabled={cancelled}
                          className={`text-gray-400 transition ${
                            cancelled
                              ? 'cursor-not-allowed opacity-30'
                              : 'cursor-pointer hover:scale-110 hover:text-[#004D77]'
                          }`}
                          title={cancelled ? 'No se puede editar una devolución anulada' : 'Editar'}
                        >
                          <SquarePen className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                        </button>
                      )}
                      {canAnnul && (
                        <button
                          type="button"
                          onClick={() => handleCancelClick(row)}
                          disabled={cancelled || isCancelling}
                          className={`text-gray-400 transition ${
                            cancelled || isCancelling
                              ? `opacity-30 ${isCancelling ? 'cursor-wait' : 'cursor-not-allowed'}`
                              : 'cursor-pointer hover:scale-110 hover:text-red-500'
                          }`}
                          title={cancelled ? 'Ya está anulada' : (isCancelling ? 'Procesando...' : 'Anular devolución')}
                        >
                          {isCancelling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                          )}
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
