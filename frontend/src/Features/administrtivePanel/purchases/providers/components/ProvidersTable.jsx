import React from 'react';
import { Info, SquarePen, Trash2 } from 'lucide-react';
import ActiveToggle from './ActiveToggle';
import { formatPhoneNumber } from '../utils/providerHelpers';

// Función highlightText AGREGADA AQUÍ (con JSX)
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

function ProvidersTable({ 
  providers, 
  startIndex,
  searchTerm,
  onInfo, 
  onEdit, 
  onToggleActive, 
  onDelete 
}) {
  if (!providers.length) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="w-full min-w-max">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">#</th>
              <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Tipo</th>
              <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Número</th>
              <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Nombre</th>
              <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">P.Contacto</th>
              <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Nu.Contacto</th>
              <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Categorías</th>
              <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Funciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                No se encontraron proveedores.
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
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">P.Contacto</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Nu.Contacto</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Categorías</th>
            <th className="px-3.5 py-3 text-center text-sm font-semibold whitespace-nowrap">Funciones</th>
          </tr>
        </thead>

        <tbody className="bg-white">
          {providers.map((provider, index) => {
            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            const recordNumber = startIndex + index + 1;
            
            return (
              <tr key={provider.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className="px-3.5 py-3 text-center text-sm text-gray-600 font-medium whitespace-nowrap">
                  {recordNumber}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {provider.tipo}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlightText(provider.numero, searchTerm)}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-800 font-medium whitespace-nowrap">
                  {highlightText(provider.nombre, searchTerm)}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlightText(provider.pContacto, searchTerm)}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlightText(formatPhoneNumber(provider.nuContacto), searchTerm)}
                </td>
                <td className="px-3.5 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                  {highlightText(provider.categorias, searchTerm)}
                </td>
                <td className="px-3.5 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onInfo(provider)}
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer p-1"
                      title="Información"
                    >
                      <Info className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => onEdit(provider)}
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer p-1"
                      title="Editar"
                    >
                      <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <ActiveToggle 
                      activo={provider.activo} 
                      onChange={() => onToggleActive(provider.id)} 
                    />
                    <button
                      onClick={() => onDelete(provider)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                      title="Eliminar"
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

export default ProvidersTable;