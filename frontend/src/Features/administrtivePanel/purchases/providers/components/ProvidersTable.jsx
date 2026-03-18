/**
 * Archivo: ProvidersTable.jsx
 *
 * Este archivo contiene el componente encargado de renderizar la tabla de
 * proveedores con todos sus datos y acciones disponibles.
 *
 * Responsabilidades:
 * - Mostrar una tabla con la lista de proveedores
 * - Resaltar textos que coincidan con la búsqueda (highlight)
 * - Proporcionar botones de acción para cada proveedor (ver, editar, cambiar estado, eliminar)
 * - Manejar estados pares/impares de filas con colores alternados
 * - Mostrar mensaje cuando no hay proveedores
 */

import React from "react";
import { Info, SquarePen, Trash2 } from "lucide-react";
import ActiveToggle from "./ActiveToggle";
import { formatPhoneNumber } from "../utils/providerHelpers";
import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";

// ======== FUNCIONALIDAD: Resaltar Texto Coincidente ========
/**
 * Resalta (con color de fondo) las partes del texto que coinciden con el término
 * de búsqueda. Se usa para mostrar visualmente dónde está la coincidencia.
 *
 * @param {string|number} text - Texto donde se busca
 * @param {string} search - Término de búsqueda
 * @returns {string|Array} Texto original o array de elementos del texto resaltados
 */
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

/**
 * Componente: ProvidersTable
 *
 * Tabla que muestra la lista completa de proveedores con todas sus propiedades
 * y acciones disponibles (ver información, editar, cambiar estado, eliminar).
 *
 * Props:
 * @param {Array} providers - Lista de proveedores a mostrar
 * @param {number} startIndex - Índice de inicio para numerar filas
 * @param {string} searchTerm - Término de búsqueda para resaltar coincidencias
 * @param {Function} onInfo - Callback para ver información del proveedor
 * @param {Function} onEdit - Callback para editar el proveedor
 * @param {Function} onToggleActive - Callback para cambiar estado del proveedor
 * @param {Function} onDelete - Callback para eliminar el proveedor
 */
function ProvidersTable({
  providers,
  startIndex,
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

  // Si no hay proveedores, muestra tabla vacía con mensaje
  if (!providers.length) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-max w-full">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                #
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Tipo
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Número
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Nombre
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                P.Contacto
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Nu.Contacto
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Categorías
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Funciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={8}
                className="py-8 text-center text-sm text-gray-400"
              >
                {/* Mensaje cuando no hay resultados */}
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
        {/* Encabezados de la tabla con columnas */}
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-10 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              #
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Tipo
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Número
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Nombre
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              P.Contacto
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Nu.Contacto
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Categorías
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Funciones
            </th>
          </tr>
        </thead>

        {/* Filas de la tabla con datos de los proveedores */}
        <tbody>
          {providers.map((provider, index) => {
            // Alterna colores de fondo entre filas pares e impares
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-100";
            // Calcula el número de fila basado en el índice de inicio y el índice actual
            const recordNumber = startIndex + index + 1;

            return (
              <tr
                key={provider.id}
                className={`transition-colors duration-150 ${rowBg}`}
              >
                {/* Columna de número de fila */}
                <td
                  className={`sticky left-0 z-10 ${rowBg} px-3 py-2 text-center text-xs text-gray-500 font-medium whitespace-nowrap`}
                >
                  {recordNumber}
                </td>
                {/* Columna: Tipo de Proveedor */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {provider.tipo}
                </td>
                {/* Columna: Número de Documento (resaltado si coincide con búsqueda) */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(provider.numero, searchTerm)}
                </td>
                {/* Columna: Nombre del Proveedor (resaltado si coincide con búsqueda) */}
                <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium whitespace-nowrap">
                  {highlightText(provider.nombre, searchTerm)}
                </td>
                {/* Columna: Persona de Contacto (resaltado si coincide con búsqueda) */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(provider.pContacto, searchTerm)}
                </td>
                {/* Columna: Número de Contacto (formateado y resaltado si coincide con búsqueda) */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(
                    formatPhoneNumber(provider.nuContacto),
                    searchTerm,
                  )}
                </td>
                {/* Columna: Categorías (resaltado si coincide con búsqueda) */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(provider.categorias, searchTerm)}
                </td>
                {/* Columna: Acciones (botones CRUD) */}
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

                    {!canView && !canEdit && !canToggle && !canDelete && (
                      <span className="text-xs text-gray-400">
                        Sin permisos
                      </span>
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

{
  /* Exporta el componente ProvidersTable como componente por defecto */
}
export default ProvidersTable;
