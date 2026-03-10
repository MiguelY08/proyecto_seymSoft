import React from 'react';
import { Info, SquarePen, Trash2 } from 'lucide-react';
import ActiveToggle from './ActiveToggle';
import { formatPhoneNumber, formatClientType } from '../utils/clientHelpers';

const highlightText = (text, search) => {
  if (!search || !text) return text;
  
  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.toString().split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={index} className="bg-[#004d7726] text-[#004D77] rounded px-1">
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
  onDelete 
}) {
  if (!clients.length) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="w-full min-w-max">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-4 py-3.5 text-center text-sm font-semibold">#</th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold">Tipo</th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold">Número</th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold">Nombre</th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold">Correo</th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold">Teléfono</th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold">Tipo cliente</th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold">Funciones</th>
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
    <div className="overflow-x-auto rounded-xl shadow-md">
      <table className="w-full min-w-max">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">#</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Tipo</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Número</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Nombre</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Correo electrónico</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Teléfono</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Tipo cliente</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Funciones</th>
          </tr>
        </thead>

        <tbody className="bg-white">
          {clients.map((client, index) => {
            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            const recordNumber = startIndex + index + 1;
            
            return (
              <tr key={client.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className="px-3.5 py-3 text-center text-sm text-gray-600 font-medium whitespace-nowrap">
                  {recordNumber}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {client.tipo}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlightText(client.numero, searchTerm)}  {/* ← ACTUALIZADO */}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-800 font-medium whitespace-nowrap">
                  {highlightText(client.nombreCompleto, searchTerm)}  {/* ← ACTUALIZADO */}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlightText(client.correo, searchTerm)}  {/* ← ACTUALIZADO */}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlightText(formatPhoneNumber(client.telefono), searchTerm)}  {/* ← ACTUALIZADO */}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlightText(formatClientType(client.tipoCliente), searchTerm)}  {/* ← ACTUALIZADO */}
                </td>
                <td className="px-3.5 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onInfo(client)}
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer p-1"
                      title="Información del cliente"
                      aria-label="Ver información"
                    >
                      <Info className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    
                    <button
                      onClick={() => onEdit(client)}
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer p-1"
                      title="Editar cliente"
                      aria-label="Editar cliente"
                    >
                      <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    
                    <ActiveToggle 
                      activo={client.activo} 
                      onChange={() => onToggleActive(client.id)} 
                    />
                    
                    <button
                      onClick={() => onDelete(client)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                      title="Eliminar cliente"
                      aria-label="Eliminar cliente"
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