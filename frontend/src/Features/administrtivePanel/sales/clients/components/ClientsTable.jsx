import React from 'react';
import { Info, SquarePen, Trash2 } from 'lucide-react';
import ActiveToggle from './ActiveToggle';
import { formatPhoneNumber, formatClientType } from '../utils/clientHelpers';

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

function ClientsTable({
  clients,
  startIndex,
  searchTerm,
  onInfo,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  if (!clients.length) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-max w-full">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">#</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Número</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nombre</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Correo electrónico</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Teléfono</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo cliente</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Funciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                No se encontraron clientes.
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
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Número</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nombre</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Correo electrónico</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Teléfono</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo cliente</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Funciones</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client, index) => {
            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
            const recordNumber = startIndex + index + 1;

            return (
              <tr key={client.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className={`sticky left-0 z-10 ${rowBg} px-3 py-2 text-center text-xs text-gray-500 font-medium whitespace-nowrap`}>
                  {recordNumber}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {client.tipo}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(client.numero, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium whitespace-nowrap">
                  {highlightText(client.nombreCompleto, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(client.correo, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(formatPhoneNumber(client.telefono), searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(formatClientType(client.tipoCliente), searchTerm)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onInfo(client)}
                      className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                      title="Información del cliente"
                    >
                      <Info className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    <button
                      onClick={() => onEdit(client)}
                      className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                      title="Editar cliente"
                    >
                      <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    <ActiveToggle
                      activo={client.activo}
                      onChange={() => onToggleActive(client.id)}
                    />

                    <button
                      onClick={() => onDelete(client)}
                      className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
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

export default ClientsTable;