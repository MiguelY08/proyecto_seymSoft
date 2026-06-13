import React from 'react';
import { Info, SquarePen, Trash2, Users } from 'lucide-react';
import ActiveToggle from './ActiveToggle';
import { formatClientType, formatCurrency } from '../helpers/clientHelpers';
import Permission from '../../../configuration/roles/components/Permission';

const TIPOS_DOC = ['cc', 'ce', 'nit', 'ti', 'pp'];

// Highlights search term matches inside table cells.
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

// Parsea el término de búsqueda para detectar "CC 123456" y devolver
// los términos correctos para resaltar tipo y número por separado.
const parseSearchTerm = (term) => {
  if (!term) return { tipoTerm: term, numTerm: term, isCombined: false };
  const parts = term.trim().split(/\s+/);
  if (parts.length >= 2 && TIPOS_DOC.includes(parts[0].toLowerCase())) {
    return {
      isCombined: true,
      tipoTerm:   parts[0],
      numTerm:    parts.slice(1).join(' '),
    };
  }
  return { isCombined: false, tipoTerm: term, numTerm: term };
};

function ClientsTable({
  clients,
  searchTerm,
  startIndex,
  onInfo,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  // Ordenar clientes: primero el sistema (ID 999999999), luego el resto
  const sortedClients = [...clients].sort((a, b) => {
    if (a.id === 999999999) return -1;
    if (b.id === 999999999) return 1;
    return 0;
  });

  // Header para tabla vacía
  const emptyHeader = (
    <thead className="bg-[#004D77] text-white">
      <tr>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">#</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo y Documento</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nombre</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Crédito</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Teléfono</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo cliente</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Acciones</th>
      </tr>
    </thead>
  );

  if (!clients.length) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-max w-full">
          {emptyHeader}
          <tbody>
            <tr>
              <td colSpan={7}>
                <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
                    <Users className="w-10 h-10 text-[#004D77]/40" strokeWidth={1.5} />
                  </div>
                  <p className="text-base font-semibold text-gray-500">
                    No se encontraron clientes
                  </p>
                  <p className="text-sm text-gray-400 text-center max-w-xs">
                    Ningún cliente coincide con la búsqueda actual.
                  </p>
                </div>
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
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">#</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo y Documento</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nombre</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Crédito</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Teléfono</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo cliente</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {sortedClients.map((client, index) => {
            const rowBg = index % 2 === 0 ? 'bg-gray-100 hover:bg-blue-50' : 'bg-white hover:bg-blue-50';
            const { isCombined, tipoTerm, numTerm } = parseSearchTerm(searchTerm);
            const recordNumber = (startIndex || 0) + index + 1;
            const isSystemClient = client.id === 999999999;

            return (
              <tr key={client.id} className={`transition-colors duration-150 ${rowBg}`}>
                {/* Columna # - Número de registro */}
                <td className="px-3 py-2 text-center text-xs text-gray-500 font-medium whitespace-nowrap">
                  {recordNumber}
                </td>
                
                {/* Columna Tipo y Documento */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {isSystemClient ? '—' : (
                    <>
                      <span className="font-medium">
                        {highlightText(client.documentType, isCombined ? tipoTerm : searchTerm)}
                      </span>{' '}
                      {highlightText(client.document, isCombined ? numTerm : searchTerm)}
                    </>
                  )}
                </td>
                
                {/* Columna Nombre */}
                <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium whitespace-nowrap">
                  {isSystemClient ? 'Cliente Sistema' : highlightText(client.fullName, searchTerm)}
                </td>
                
                {/* Columna Crédito */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {isSystemClient ? '—' : highlightText(formatCurrency(parseInt(client.clientCredit) || 0), searchTerm)}
                </td>
                
                {/* Columna Teléfono */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {isSystemClient ? '—' : highlightText(client.phone || '—', searchTerm)}
                </td>
                
                {/* Columna Tipo cliente */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {isSystemClient ? '—' : highlightText(formatClientType(client.clientType), searchTerm)}
                </td>
                
                {/* Columna Acciones */}
                <td className="px-3 py-2">
                  {isSystemClient ? (
                    <div className="flex items-center justify-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#004D77]/10 text-[#004D77] border border-[#004D77]/20 whitespace-nowrap">
                        Sistema
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <Permission permission = "clientes.activar_desactivar" >
                        <ActiveToggle
                          activo={client.active}
                          onChange={() => onToggleActive(client.id)}
                        />
                      </Permission>
                      <Permission permission = "clientes.ver_informacion" >
                        <button
                          onClick={() => onInfo(client)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Información del cliente"
                        >
                          <Info className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </Permission>
                      < Permission permission = "clientes.editar" >
                        <button
                          onClick={() => onEdit(client)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Editar cliente"
                        >
                          <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </Permission>
                      <Permission permission = "clientes.eliminar" >
                        <button
                          onClick={() => onDelete(client)}
                          className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
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
