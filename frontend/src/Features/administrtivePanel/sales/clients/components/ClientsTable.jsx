import React from 'react';
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

const TableHeader = () => (
  <thead className="bg-[#004D77] text-white">
    <tr>
      <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">#</th>
      <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">Tipo y Documento</th>
      <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">Nombre</th>
      <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">Crédito</th>
      <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">Teléfono</th>
      <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">Tipo cliente</th>
      <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">Acciones</th>
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
  const sortedClients = [...clients].sort((a, b) => {
    if (a.id === 999999999) return -1;
    if (b.id === 999999999) return 1;
    return 0;
  });

  if (!clients.length) {
    const isSearching = totalData > 0 || searchTerm.trim().length > 0;
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
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
    <div className="min-h-0 min-w-0 w-full overflow-x-auto overscroll-x-contain rounded-xl shadow-md [-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[840px] table-auto lg:min-w-[940px]">
        <TableHeader />

        <tbody>
          {sortedClients.map((client, index) => {
            const rowBg = index % 2 === 0 ? 'bg-gray-100 hover:bg-blue-50' : 'bg-white hover:bg-blue-50';
            const { isCombined, tipoTerm, numTerm } = parseSearchTerm(searchTerm);
            const recordNumber = (startIndex || 0) + index + 1;
            const isSystemClient = client.id === 999999999;

            return (
              <tr key={client.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className="px-4 py-2.5 text-center text-sm text-gray-500 font-medium whitespace-nowrap">
                  {recordNumber}
                </td>

                <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap">
                  {isSystemClient ? '—' : (
                    <>
                      <span className="font-medium">
                        {highlightText(client.documentType, isCombined ? tipoTerm : searchTerm)}
                      </span>{' '}
                      {highlightText(client.document, isCombined ? numTerm : searchTerm)}
                    </>
                  )}
                </td>

                <td className="px-4 py-2.5 text-center text-sm text-gray-800 font-medium whitespace-nowrap">
                  {isSystemClient ? 'Cliente Sistema' : highlightText(client.fullName, searchTerm)}
                </td>

                <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap">
                  {isSystemClient ? '—' : highlightText(formatCurrency(parseInt(client.clientCredit, 10) || 0), searchTerm)}
                </td>

                <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap">
                  {isSystemClient ? '—' : highlightText(client.phone || '—', searchTerm)}
                </td>

                <td className="px-4 py-2.5 text-center text-sm text-gray-700 whitespace-nowrap">
                  {isSystemClient ? '—' : highlightText(formatClientType(client.clientType), searchTerm)}
                </td>

                <td className="px-4 py-2.5">
                  {isSystemClient ? (
                    <div className="flex items-center justify-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#004D77]/10 text-[#004D77] border border-[#004D77]/20 whitespace-nowrap">
                        Sistema
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
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
                          <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={1.5} />
                        </button>
                      </Permission>

                      <Permission permission="clientes.editar">
                        <button
                          onClick={() => onEdit(client)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Editar cliente"
                        >
                          <SquarePen className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={1.5} />
                        </button>
                      </Permission>

                      <Permission permission="clientes.eliminar">
                        <button
                          onClick={() => onDelete(client)}
                          className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={1.5} />
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
