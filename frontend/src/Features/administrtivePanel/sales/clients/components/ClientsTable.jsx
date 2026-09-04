import React from 'react';
import { Info, Loader2, Plus, SquarePen, Trash2, Users } from 'lucide-react';
import ActiveToggle from './ActiveToggle';
import { formatClientType, formatCurrency } from '../helpers/clientHelpers';
import Permission from '../../../configuration/roles/components/Permission';

const TIPOS_DOC = ['cc', 'ce', 'nit', 'ti', 'pp'];

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeHighlightValue = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getDigitMatches = (text, search) => {
  const digitSearch = String(search ?? '').replace(/\D/g, '');
  if (!digitSearch) return [];

  const digitMap = [];
  let digitText = '';

  String(text ?? '').split('').forEach((char, index) => {
    if (/\d/.test(char)) {
      digitText += char;
      digitMap.push(index);
    }
  });

  const matches = [];
  let start = digitText.indexOf(digitSearch);

  while (start !== -1) {
    const endDigitIndex = start + digitSearch.length - 1;
    matches.push({
      start: digitMap[start],
      end: digitMap[endDigitIndex] + 1,
    });
    start = digitText.indexOf(digitSearch, start + 1);
  }

  return matches;
};

const highlightText = (text, search) => {
  const originalText = String(text ?? '');
  const cleanSearch = String(search ?? '').trim();
  if (!cleanSearch || !originalText) return text;

  const terms = cleanSearch
    .split(/\s+/)
    .map(normalizeHighlightValue)
    .filter(Boolean);

  if (terms.length === 0) return text;

  const normalizedText = normalizeHighlightValue(originalText);
  const matches = getDigitMatches(originalText, cleanSearch);

  terms.forEach((term) => {
    const regex = new RegExp(escapeRegExp(term), 'g');
    let match;
    while ((match = regex.exec(normalizedText)) !== null) {
      matches.push({ start: match.index, end: match.index + term.length });
    }
  });

  if (matches.length === 0) return text;

  const mergedMatches = matches
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .reduce((acc, match) => {
      const last = acc[acc.length - 1];
      if (!last || match.start > last.end) {
        acc.push({ ...match });
      } else {
        last.end = Math.max(last.end, match.end);
      }
      return acc;
    }, []);

  const parts = [];
  let cursor = 0;

  mergedMatches.forEach((match, index) => {
    if (match.start > cursor) {
      parts.push(originalText.slice(cursor, match.start));
    }

    parts.push(
      <span key={`highlight-${index}`} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
        {originalText.slice(match.start, match.end)}
      </span>
    );

    cursor = match.end;
  });

  if (cursor < originalText.length) {
    parts.push(originalText.slice(cursor));
  }

  return parts;
};

const parseSearchTerm = (term) => {
  if (!term) return { tipoTerm: term, numTerm: term, isCombined: false };

  const parts = term.trim().split(/\s+/);
  if (parts.length >= 2 && TIPOS_DOC.includes(parts[0].toLowerCase())) {
    return {
      isCombined: true,
      tipoTerm: parts[0],
      numTerm: parts.slice(1).join(' '),
    };
  }

  return { isCombined: false, tipoTerm: term, numTerm: term };
};

const getClientDisplayName = (client) => {
  if (client.personType === 'juridica') {
    return client.firstName || String(client.fullName || '').replace(/\s+(Empresa|N\/A)$/i, '').trim();
  }

  return client.fullName;
};

const TableHeader = () => (
  <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
    <tr>
      <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">#</th>
      <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Tipo y Documento</th>
      <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Nombre</th>
      <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Crédito</th>
      <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Teléfono</th>
      <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Tipo cliente</th>
      <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Acciones</th>
    </tr>
  </thead>
);

function ClientsTable({
  clients,
  searchTerm,
  startIndex,
  totalData = 0,
  onInfo,
  onEdit,
  onToggleActive,
  onDelete,
  onCreateClient,
  deletingId = null,
}) {
  if (!clients.length) {
    const isSearching = totalData > 0 || searchTerm.trim().length > 0;
    return (
      <div className="flex h-full min-h-[420px] w-full flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#004D77]/10">
          <Users className="h-10 w-10 text-[#004D77]/40" strokeWidth={1.5} />
        </div>
        <p className="text-base font-semibold text-gray-500">
          {isSearching ? 'No se encontraron resultados' : 'No hay clientes registrados'}
        </p>
        <p className="max-w-xs text-center text-sm text-gray-400">
          {isSearching ? 'Ningún cliente coincide con la búsqueda actual.' : 'Aún no se han registrado clientes.'}
        </p>
        <Permission permission="clientes.crear">
          <button
            type="button"
            onClick={onCreateClient}
            className="mt-1 flex cursor-pointer items-center gap-1.5 rounded-lg border bg-[#004D77] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#003a5c]"
          >
            <span>Crear cliente</span>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </Permission>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full overflow-x-scroll overflow-y-hidden overscroll-x-contain rounded-xl pb-2 sm:overflow-x-auto sm:overflow-y-hidden sm:pb-0 [-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[940px] table-fixed">
        <colgroup>
          <col className="w-[6%]" />
          <col className="w-[17%]" />
          <col className="w-[19%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[16%]" />
        </colgroup>
        <TableHeader />

        <tbody>
          {clients.map((client, index) => {
            const rowBg = index % 2 === 0 ? 'bg-gray-100 hover:bg-blue-50' : 'bg-white hover:bg-blue-50';
            const { isCombined, tipoTerm, numTerm } = parseSearchTerm(searchTerm);
            const recordNumber = (startIndex || 0) + index + 1;
            const isSystemClient = client.id === 999999999;
            const displayName = isSystemClient ? 'Cliente Sistema' : getClientDisplayName(client);

            return (
              <tr key={client.id} className={`h-[38px] transition-colors duration-150 ${rowBg}`}>
                <td className="px-2.5 py-1.5 text-center text-xs font-medium whitespace-nowrap text-gray-500">
                  {recordNumber}
                </td>

                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {isSystemClient ? '—' : (
                    <>
                      <span className="font-medium">
                        {highlightText(client.documentType, isCombined ? tipoTerm : searchTerm)}
                      </span>{' '}
                      {highlightText(client.document, isCombined ? numTerm : searchTerm)}
                    </>
                  )}
                </td>

                <td className="px-2.5 py-1.5 text-center text-xs font-medium text-gray-800">
                  <div className="mx-auto min-w-0 max-w-full">
                    <span className="block min-w-0 truncate" title={displayName}>
                      {highlightText(displayName, searchTerm)}
                    </span>
                  </div>
                </td>

                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {isSystemClient ? '—' : highlightText(formatCurrency(parseInt(client.clientCredit, 10) || 0), searchTerm)}
                </td>

                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {isSystemClient ? '—' : highlightText(client.phone || '—', searchTerm)}
                </td>

                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {isSystemClient ? '—' : highlightText(formatClientType(client.clientType), searchTerm)}
                </td>

                <td className="px-2.5 py-1.5">
                  {isSystemClient ? (
                    <div className="flex items-center justify-center">
                      <span className="whitespace-nowrap rounded-full border border-[#004D77]/20 bg-[#004D77]/10 px-2 py-0.5 text-[11px] font-semibold text-[#004D77]">
                        Sistema
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                      <Permission permission="clientes.activar_desactivar">
                        <ActiveToggle
                          activo={client.active}
                          onChange={() => onToggleActive(client.id)}
                        />
                      </Permission>

                      <Permission permission="clientes.ver_informacion">
                        <button
                          type="button"
                          onClick={() => onInfo(client)}
                          className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]"
                          title="Información del cliente"
                        >
                          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>

                      <Permission permission="clientes.editar">
                        <button
                          type="button"
                          onClick={() => onEdit(client)}
                          className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]"
                          title="Editar cliente"
                        >
                          <SquarePen className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>

                      <Permission permission="clientes.eliminar">
                        <button
                          type="button"
                          onClick={() => onDelete(client)}
                          disabled={deletingId === client.id}
                          className={`text-gray-400 transition ${
                            deletingId === client.id
                              ? 'cursor-wait opacity-50'
                              : 'cursor-pointer hover:scale-110 hover:text-red-500'
                          }`}
                          title={deletingId === client.id ? 'Procesando...' : 'Eliminar cliente'}
                        >
                          {deletingId === client.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                          )}
                        </button>
                      </Permission>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ClientsTable;
