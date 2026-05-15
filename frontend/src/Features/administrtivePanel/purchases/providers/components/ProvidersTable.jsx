/**
 * Archivo: ProvidersTable.jsx
 *
 * Este archivo contiene el componente encargado de renderizar la tabla de
 * proveedores con todos sus datos y acciones disponibles.
 */

import React from "react";
import { Info, SquarePen, Trash2 } from "lucide-react";
import ActiveToggle from "./ActiveToggle";
import { formatPhoneNumber } from "../utils/providerHelpers";
import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";

const highlightText = (text, search) => {
  if (!search || !text) return text;

  const regex = new RegExp(`(${search})`, "gi");
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
    return (
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-max w-full">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">#</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Número</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nombre</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">P.Contacto</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nu.Contacto</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Categorías</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Funciones</th>
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
    <div className="overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-10 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">#</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Tipo</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Número</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nombre</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">P.Contacto</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nu.Contacto</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Categorías</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Funciones</th>
          </tr>
        </thead>

        <tbody>
          {providers.map((provider, index) => {
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-100";
            const recordNumber = (startIndex || 0) + index + 1;
            const categoriasTexto = formatCategories(provider.categorias);

            return (
              <tr key={provider.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className={`sticky left-0 z-10 ${rowBg} px-3 py-2 text-center text-xs text-gray-500 font-medium whitespace-nowrap`}>
                  {String(recordNumber)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {provider.tipo}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(provider.numero, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium whitespace-nowrap">
                  {highlightText(provider.nombre, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(provider.pContacto, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(formatPhoneNumber(provider.nuContacto), searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(categoriasTexto, searchTerm)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    {canView && (
                      <button
                        onClick={() => onInfo(provider)}
                        className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                        title="Información del proveedor"
                      >
                        <Info className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}

                    {canEdit && (
                      <button
                        onClick={() => onEdit(provider)}
                        className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                        title="Editar proveedor"
                      >
                        <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}

                    {canToggle && (
                      <ActiveToggle
                        activo={provider.activo}
                        onChange={() => onToggleActive(provider.id)}
                      />
                    )}

                    {canDelete && (
                      <button
                        onClick={() => onDelete(provider)}
                        className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                        title="Eliminar proveedor"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
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

export default ProvidersTable;