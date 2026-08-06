import React, { useState } from 'react';
import { Info, SquarePen, Trash2, Users } from 'lucide-react';
import ActiveToggle from './ActiveToggle';
import { formatClientType, formatCurrency } from '../helpers/clientHelpers';
import Permission from '../../../configuration/roles/components/Permission';

const TIPOS_DOC = ['cc', 'ce', 'nit', 'ti', 'pp'];

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightText = (text, search) => {
  if (!search || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(search)})`, 'gi');
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

const NAME_PREVIEW_LIMIT = 32;

const getPreviewText = (value, limit = NAME_PREVIEW_LIMIT) => {
  const text = String(value || '').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
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
}) {
  const [expandedNames, setExpandedNames] = useState({});

  if (!clients.length) {
    const isSearching = totalData > 0 || searchTerm.trim().length > 0;
    return (
      <div className="flex h-full min-h-[420px] w-full flex-1 flex-col items-center justify-center px-4 py-16 gap-4">
        <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
          <Users className="w-10 h-10 text-[#004D77]/40" strokeWidth={1.5} />
        </div>
        <p className="text-base font-semibold text-gray-500">
          {isSearching ? 'No se encontraron resultados' : 'No hay clientes registrados'}
        </p>
        <p className="text-sm text-gray-400 text-center max-w-xs">
          {isSearching ? 'Ningún cliente coincide con la búsqueda actual.' : 'Aún no se han registrado clientes.'}
        </p>
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
            const shouldCollapseName = !isSystemClient && String(displayName || '').length > NAME_PREVIEW_LIMIT;
            const isNameExpanded = Boolean(expandedNames[client.id]);
            const visibleName = shouldCollapseName && !isNameExpanded
              ? getPreviewText(displayName)
              : displayName;

            return (
              <tr key={client.id} className={`h-[38px] transition-colors duration-150 ${rowBg}`}>
                <td className="px-2.5 py-1.5 text-center text-xs text-gray-500 font-medium whitespace-nowrap">
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
                    <span
                      className={`block min-w-0 ${isNameExpanded ? 'whitespace-normal break-words [overflow-wrap:anywhere]' : 'truncate'}`}
                      title={displayName}
                    >
                      {isSystemClient ? 'Cliente Sistema' : highlightText(visibleName, searchTerm)}
                    </span>
                    {shouldCollapseName && (
                      <button
                        type="button"
                        onClick={() => setExpandedNames((prev) => ({ ...prev, [client.id]: !prev[client.id] }))}
                        className="mt-0.5 text-[10px] font-semibold text-[#004D77] transition hover:underline"
                      >
                        {isNameExpanded ? 'Ver menos' : 'Ver más'}
                      </button>
                    )}
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
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#004D77]/10 text-[#004D77] border border-[#004D77]/20 whitespace-nowrap">
                        Sistema
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <Permission permission="clientes.activar_desactivar">
                        <ActiveToggle
                          activo={client.active}
                          onChange={() => onToggleActive(client.id)}
                        />
                      </Permission>

                      <Permission permission="clientes.ver_informacion">
                        <button
                          onClick={() => onInfo(client)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Información del cliente"
                        >
                          <Info className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>

                      <Permission permission="clientes.editar">
                        <button
                          onClick={() => onEdit(client)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Editar cliente"
                        >
                          <SquarePen className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>

                      <Permission permission="clientes.eliminar">
                        <button
                          onClick={() => onDelete(client)}
                          className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
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
