import { Info, SquarePen, Trash2 } from 'lucide-react';
import ActiveToggle from './ActiveToggle';
import { formatClientType } from '../helpers/clientHelpers';

const TIPOS_DOC = ['cc', 'ce', 'nit', 'ti', 'pp'];

// Highlights search term matches inside table cells.
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
  onInfo,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  const emptyHeader = (
    <thead className="bg-[#004D77] text-white">
      <tr>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo y Documento</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nombre</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Correo electrónico</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Teléfono</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo cliente</th>
        <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Funciones</th>
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
              <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
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
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo y Documento</th>
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
            const { isCombined, tipoTerm, numTerm } = parseSearchTerm(searchTerm);

            return (
              <tr key={client.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  <span className="font-medium">
                    {highlightText(client.documentType, isCombined ? tipoTerm : searchTerm)}
                  </span>{' '}
                  {highlightText(client.document, isCombined ? numTerm : searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium whitespace-nowrap">
                  {highlightText(client.fullName, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(client.email, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(client.phone, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(formatClientType(client.clientType), searchTerm)}
                </td>
                <td className="px-3 py-2">
                  {client.isSystem ? (
                    <div className="flex items-center justify-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#004D77]/10 text-[#004D77] border border-[#004D77]/20 whitespace-nowrap">
                        Sistema
                      </span>
                    </div>
                  ) : (
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
                        activo={client.active}
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