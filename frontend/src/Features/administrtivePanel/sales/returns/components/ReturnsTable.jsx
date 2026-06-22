/**
 * Archivo: ReturnsTable.jsx
 *
 * Componente que renderiza la tabla principal de devoluciones. Muestra todos
 * los registros de devoluciones con su información detallada (número, factura,
 * cliente, motivo, fecha, valor, estado) y botones de acción.
 *
 * Responsabilidades:
 * - Mostrar lista de devoluciones en formato tabla
 * - Resaltar términos de búsqueda en los datos
 * - Alternar colores de fila para mejor legibilidad
 * - Mostrar mensajes cuando no hay registros
 * - Proveer botones de acción (ver, editar, anular)
 */
import React from "react";
import { Info, SquarePen, XCircle } from "lucide-react";
import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";
import {
  formatCurrency,
  formatDate,
  getStatusStyle,
  getStatusText,
} from "../utils/returnsHelpers";

/**
 * Función auxiliar: Obtiene un valor del objeto con múltiples nombres de campo posibles
 */
const getField = (obj, fieldNames, defaultValue = '') => {
  for (const name of fieldNames) {
    if (obj?.[name] !== undefined && obj?.[name] !== null) {
      return obj[name];
    }
  }
  return defaultValue;
};

/**
 * Función auxiliar: Resalta fragmentos de texto que coinciden con la búsqueda.
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

function ReturnsTable({
  data,
  startIndex,
  searchTerm,
  onInfo,
  onEdit,
  onCancel,
}) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission("devoluciones_en_ventas.ver");
  const canEditGlobal = hasPermission("devoluciones_en_ventas.editar");
  const canAnnulGlobal = hasPermission("devoluciones_en_ventas.anular");

  if (!data || data.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-max w-full">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                #
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Número
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Factura
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Cliente
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Motivo
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Fecha
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Valor
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Estado
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={9}
                className="py-8 text-center text-sm text-gray-400"
              >
                No se encontraron devoluciones.
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
            <th className="sticky left-0 z-10 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              #
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Número
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Factura
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Cliente
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Motivo
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Fecha
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Valor
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Estado
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-100";
            const recordNumber = startIndex + index + 1;

            // 🔴 EXTRAER DATOS CON MÚLTIPLES NOMBRES DE CAMPO POSIBLES
            const numeroDevolucion = getField(row, ['numeroDevolucion', 'returnNumber'], '');
            const numeroFactura = getField(row, ['numeroFactura', 'invoiceNumber'], '');
            const cliente = getField(row, ['cliente', 'clientName'], '');
            const motivo = getField(row, ['motivo', 'reason'], '');
            const fechaCreacion = getField(row, ['fechaCreacion', 'createdAt', 'creationDate'], new Date().toISOString());
            const totalValor = getField(row, ['totalValor', 'totalAmount'], 0);
            const estado = getField(row, ['estado', 'status'], 'En Proceso');

            return (
              <tr
                key={row.id || index}
                className={`transition-colors duration-150 ${rowBg}`}
              >
                <td
                  className={`sticky left-0 z-10 ${rowBg} px-3 py-2 text-center text-xs text-gray-500 font-medium whitespace-nowrap`}
                >
                  {recordNumber}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(numeroDevolucion, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlightText(numeroFactura, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-800 font-medium whitespace-nowrap">
                  {highlightText(cliente, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 max-w-[150px] truncate">
                  {highlightText(motivo, searchTerm)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {formatDate(fechaCreacion)}
                </td>
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  ${highlightText(formatCurrency(totalValor), searchTerm)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusStyle(estado)}`}
                  >
                    {getStatusText(estado)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    {canView && (
                      <button
                        onClick={() => onInfo(row)}
                        className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                        title="Ver detalle"
                      >
                        <Info className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}

                    {canEditGlobal && (
                      <button
                        onClick={() => onEdit(row)}
                        className={`text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer ${
                          estado === "Anulado"
                            ? "opacity-30 cursor-not-allowed"
                            : ""
                        }`}
                        title="Editar"
                        disabled={estado === "Anulado"}
                      >
                        <SquarePen className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}

                    {canAnnulGlobal && (
                      <button
                        onClick={() => onCancel(row)}
                        className={`transition cursor-pointer ${
                          estado === "Anulado"
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:scale-110 hover:text-red-500"
                        }`}
                        title={
                          estado === "Anulado"
                            ? "Ya está anulada"
                            : "Anular devolución"
                        }
                        disabled={estado === "Anulado"}
                      >
                        <XCircle className="w-4 h-4" strokeWidth={1.5} />
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

export default ReturnsTable;