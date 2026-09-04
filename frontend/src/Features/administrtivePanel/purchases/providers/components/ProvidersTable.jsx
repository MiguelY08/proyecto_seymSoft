import React from "react";
import { Info, Loader2, SquarePen, Trash2, PackageCheck, Plus } from "lucide-react";
import ActiveToggle from "./ActiveToggle";
import { formatPhoneNumber } from "../utils/providerHelpers";
import Permission from "../../../configuration/roles/components/Permission";
import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeHighlightValue = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getDigitMatches = (text, search) => {
  const digitSearch = String(search ?? "").replace(/\D/g, "");
  if (!digitSearch) return [];

  const digitMap = [];
  let digitText = "";

  String(text ?? "").split("").forEach((char, index) => {
    if (/\d/.test(char)) {
      digitText += char;
      digitMap.push(index);
    }
  });

  const matches = [];
  let start = digitText.indexOf(digitSearch);

  while (start !== -1) {
    const endDigitIndex = start + digitSearch.length - 1;
    matches.push({
      start: digitMap[start],
      end: digitMap[endDigitIndex] + 1,
    });
    start = digitText.indexOf(digitSearch, start + 1);
  }

  return matches;
};

const highlightText = (text, search) => {
  const originalText = String(text ?? "");
  const cleanSearch = String(search ?? "").trim();
  if (!cleanSearch || !originalText) return text;

  const terms = cleanSearch
    .split(/\s+/)
    .map(normalizeHighlightValue)
    .filter(Boolean);

  if (terms.length === 0) return text;

  const normalizedText = normalizeHighlightValue(originalText);
  const matches = getDigitMatches(originalText, cleanSearch);

  terms.forEach((term) => {
    const regex = new RegExp(escapeRegExp(term), "g");
    let match;
    while ((match = regex.exec(normalizedText)) !== null) {
      matches.push({ start: match.index, end: match.index + term.length });
    }
  });

  if (matches.length === 0) return text;

  const mergedMatches = matches
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .reduce((acc, match) => {
      const last = acc[acc.length - 1];
      if (!last || match.start > last.end) {
        acc.push({ ...match });
      } else {
        last.end = Math.max(last.end, match.end);
      }
      return acc;
    }, []);

  const parts = [];
  let cursor = 0;

  mergedMatches.forEach((match, index) => {
    if (match.start > cursor) {
      parts.push(originalText.slice(cursor, match.start));
    }

    parts.push(
      <span
        key={`highlight-${index}`}
        className="bg-[#004d7726] text-[#004D77] rounded px-0.5"
      >
        {originalText.slice(match.start, match.end)}
      </span>
    );

    cursor = match.end;
  });

  if (cursor < originalText.length) {
    parts.push(originalText.slice(cursor));
  }

  return parts;
};

const fallbackText = (value) => {
  const text = String(value ?? '').trim();
  return text || 'N/A';
};

const DOCUMENT_TYPES = ["cc", "ce", "nit", "pp"];

const parseSearchTerm = (term) => {
  const parts = String(term || "").trim().split(/\s+/).filter(Boolean);
  const first = normalizeHighlightValue(parts[0]);

  if (parts.length > 1 && DOCUMENT_TYPES.includes(first)) {
    return {
      isCombined: true,
      tipoTerm: parts[0],
      numTerm: parts.slice(1).join(" "),
    };
  }

  return {
    isCombined: false,
    tipoTerm: term,
    numTerm: term,
  };
};

const formatCategories = (categorias) => {
  if (!categorias || !Array.isArray(categorias) || categorias.length === 0) {
    return '-';
  }
  return categorias.map(cat => cat.name).join(', ');
};

const TableTooltipText = ({ value, searchTerm }) => {
  const text = fallbackText(value);

  return (
    <div className="mx-auto min-w-0 max-w-full text-center">
      <span className="block min-w-0 truncate" title={text}>
        {highlightText(text, searchTerm)}
      </span>
    </div>
  );
};

function ProvidersTable({
  providers,
  startIndex = 0,
  searchTerm,
  totalData = 0,
  hasActiveFilters = false,
  onInfo,
  onEdit,
  onToggleActive,
  onDelete,
  onCreateProvider,
  deletingId = null,
}) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission("proveedores.ver");
  const canEdit = hasPermission("proveedores.editar");
  const canToggle = hasPermission("proveedores.activar_desactivar");
  const canDelete = hasPermission("proveedores.eliminar");

  if (!providers.length) {
    const isSearching = hasActiveFilters || totalData > 0 || searchTerm.trim().length > 0;
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004D77]/10">
          <PackageCheck className="h-8 w-8 text-[#004D77]/40" strokeWidth={1.5} />
        </div>

        {isSearching ? (
          <>
            <p className="text-sm font-semibold text-gray-500">No se encontraron resultados</p>
            <p className="max-w-xs text-center text-xs text-gray-400">
              Ningún proveedor coincide con la búsqueda.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-500">No hay proveedores registrados</p>
            <p className="max-w-xs text-center text-xs text-gray-400">
              Aún no se han registrado proveedores.
            </p>

          </>
        )}
        <Permission permission="proveedores.crear">
          <button
            type="button"
            onClick={onCreateProvider}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-[#004D77] px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#003a5c] sm:px-3"
          >
            <span>Crear proveedor</span>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </Permission>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-xl [-webkit-overflow-scrolling:touch]">
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
            const { isCombined, tipoTerm, numTerm } = parseSearchTerm(searchTerm);

            return (
              <tr key={provider.id} className={`group h-[38px] transition-colors duration-150 ${rowBg}`}>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-500 font-medium">
                  {String(recordNumber)}
                </td>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {highlightText(provider.tipo, isCombined ? tipoTerm : searchTerm)}
                </td>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {highlightText(provider.numero, isCombined ? numTerm : searchTerm)}
                </td>
                <td className="px-2.5 py-1.5 text-xs font-medium text-gray-800">
                  <TableTooltipText
                    value={provider.nombre}
                    searchTerm={searchTerm}
                  />
                </td>
                <td className="px-2.5 py-1.5 text-xs text-gray-700">
                  <TableTooltipText
                    value={fallbackText(provider.pContacto)}
                    searchTerm={searchTerm}
                  />
                </td>
                <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1.5 text-center text-xs text-gray-700">
                  {highlightText(fallbackText(formatPhoneNumber(provider.nuContacto)), searchTerm)}
                </td>
                <td className="px-2.5 py-1.5 text-xs text-gray-700">
                  <TableTooltipText
                    value={categoriasTexto}
                    searchTerm={searchTerm}
                  />
                </td>
                <td className="px-2.5 py-1.5">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    {canToggle && (
                      <ActiveToggle
                        activo={provider.activo}
                        onChange={() => onToggleActive(provider.id)}
                      />
                    )}

                    {canView && (
                      <Permission permission="proveedores.ver_informacion">
                        <button
                          type="button"
                          onClick={() => onInfo(provider)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Información del proveedor"
                        >
                          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>
                    )}

                    {canEdit && (
                      <Permission permission="proveedores.editar">
                        <button
                          type="button"
                          onClick={() => onEdit(provider)}
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                          title="Editar proveedor"
                        >
                          <SquarePen className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                        </button>
                      </Permission>
                    )}

                    {canDelete && (
                      <Permission permission="proveedores.eliminar">
                        <button
                          type="button"
                          onClick={() => onDelete(provider)}
                          disabled={deletingId === provider.id}
                          className={`text-gray-400 transition ${
                            deletingId === provider.id
                              ? 'cursor-wait opacity-50'
                              : 'cursor-pointer hover:scale-110 hover:text-red-500'
                          }`}
                          title={deletingId === provider.id ? 'Procesando...' : 'Eliminar proveedor'}
                        >
                          {deletingId === provider.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                          )}
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
