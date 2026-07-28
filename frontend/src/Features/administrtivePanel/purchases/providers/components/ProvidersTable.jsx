import React from "react";
import { Info, SquarePen, Trash2, PackageCheck } from "lucide-react";
import ActiveToggle from "./ActiveToggle";
import { formatPhoneNumber } from "../utils/providerHelpers";
import Permission from "../../../configuration/roles/components/Permission";
import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightText = (text, search) => {
  if (!search || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(search)})`, "gi");
  const parts = text.toString().split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span
        key={index}
        className="bg-[#004d7726] text-[#004D77] rounded px-0.5"
      >
        {part}
      </span>
    ) : (
      part
    ),
  );
};

const fallbackText = (value) => {
  const text = String(value ?? '').trim();
  return text || 'N/A';
};

const formatCategories = (categorias) => {
  if (!categorias || !Array.isArray(categorias) || categorias.length === 0) {
    return '—';
  }
  return categorias.map(cat => cat.name).join(', ');
};

function ProvidersTable({
  providers,
  startIndex = 0,
  searchTerm,
  totalData = 0,
  onInfo,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission("proveedores.ver");
  const canEdit = hasPermission("proveedores.editar");
  const canToggle = hasPermission("proveedores.activar_desactivar");
  const canDelete = hasPermission("proveedores.eliminar");

  if (!providers.length) {
    const isSearching = totalData > 0 || searchTerm.trim().length > 0;
    return (
      <div className="flex h-full min-h-[420px] w-full flex-1 flex-col items-center justify-center px-4 py-16 gap-4">
        <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
          <PackageCheck className="w-10 h-10 text-[#004D77]/40" strokeWidth={1.5} />
        </div>
        <p className="text-base font-semibold text-gray-500">
          {isSearching ? 'No se encontraron resultados' : 'No hay proveedores registrados'}
        </p>
        <p className="text-sm text-gray-400 text-center max-w-xs">
          {isSearching ? 'Ningún proveedor coincide con la búsqueda actual.' : 'Aún no se han registrado proveedores.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-170px)] min-w-0 w-full overflow-auto overscroll-contain rounded-xl [-webkit-overflow-scrolling:touch]">
      <table className="min-w-[1080px] w-full table-fixed">
        <colgroup>
          <col className="w-[6%]" />
          <col className="w-[10%]" />
          <col className="w-[14%]" />
          <col className="w-[18%]" />
          <col className="w-[13%]" />
          <col className="w-[13%]" />
          <col className="w-[14%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">#</th>
            <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Tipo</th>
            <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Número</th>
            <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Nombre</th>
            <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">P.Contacto</th>
            <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Nu.Contacto</th>
            <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Categorías</th>
            <th className="px-2.5 py-2 text-center text-xs font-semibold whitespace-nowrap">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {providers.map((provider, index) => {
            const rowBg = index % 2 === 0 ? "bg-gray-100 hover:bg-blue-50" : "bg-white hover:bg-blue-50";
            const recordNumber = (startIndex || 0) + index + 1;
            const categoriasTexto = formatCategories(provider.categorias);

            return (
              <tr key={provider.id} className={`group h-[38px] transition-colors duration-150 ${rowBg}`}>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-500 font-medium">
                  {String(recordNumber)}
                </td>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {provider.tipo}
                </td>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {highlightText(provider.numero, searchTerm)}
                </td>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-800 font-medium">
                  {highlightText(provider.nombre, searchTerm)}
                </td>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {highlightText(fallbackText(provider.pContacto), searchTerm)}
                </td>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {highlightText(fallbackText(formatPhoneNumber(provider.nuContacto)), searchTerm)}
                </td>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {highlightText(categoriasTexto, searchTerm)}
                </td>
                <td className="px-2.5 py-1.5">
                  <div className="flex items-center justify-center gap-1.5">
                    {canToggle && (
                      <ActiveToggle
                        activo={provider.activo}
                        onChange={() => onToggleActive(provider.id)}
                      />
                    )}

                    {canView && (
                      <Permission permission="proveedores.ver_informacion">
                        <button
                          onClick={() => onInfo(provider)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Información del proveedor"
                        >
                          <Info className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>
                    )}

                    {canEdit && (
                      <Permission permission="proveedores.editar">
                        <button
                          onClick={() => onEdit(provider)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Editar proveedor"
                        >
                          <SquarePen className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>
                    )}

                    {canDelete && (
                      <Permission permission="proveedores.eliminar">
                        <button
                          onClick={() => onDelete(provider)}
                          className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                          title="Eliminar proveedor"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>
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

export default ProvidersTable;

