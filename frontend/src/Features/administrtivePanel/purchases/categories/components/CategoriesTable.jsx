import { Info, Layers, Loader2, Plus, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import ActiveToggle from "./ActiveToggle";
import Permission from "../../../configuration/roles/components/Permission";
import { calculateHoverPosition } from "../../../sales/orders/helpers/hoverPositionHelper";

function SubcategoriesTooltip({ subcategories = [], position = null }) {
  const opensAbove = position?.placement === "top";
  const positionStyle = position
    ? {
        left: `${position.left}px`,
        ...(opensAbove ? { bottom: `${position.bottom}px` } : { top: `${position.top}px` }),
        ...(position.maxHeight ? { maxHeight: `${position.maxHeight}px` } : {}),
      }
    : {};

  return (
    <div
      className={`pointer-events-none fixed z-[9999] min-w-[220px] max-w-[260px] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-xl p-3 opacity-100 shadow-2xl transition-all duration-150 ${
        opensAbove ? "-translate-y-1" : "translate-y-1"
      }`}
      style={{ background: "#1e293b", ...positionStyle }}
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
        Subcategorías
      </p>
      <div className="flex max-h-44 flex-col gap-1.5">
        {subcategories.length === 0 ? (
          <div className="rounded-lg px-2 py-2" style={{ background: "rgba(15, 23, 42, 0.72)" }}>
            <p className="text-xs italic" style={{ color: "#cbd5e1" }}>
              No hay subcategorías
            </p>
          </div>
        ) : (
          subcategories.map((subcategory) => {
            const isActive = subcategory.estado === "Activo";
            return (
              <div
                key={subcategory.id ?? `${subcategory.nombre}-${subcategory.estado}`}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5"
                style={{ background: "rgba(15, 23, 42, 0.72)" }}
              >
                <span className="flex items-center gap-2 truncate text-xs font-medium" style={{ color: "#f8fafc" }}>
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="truncate">{subcategory.nombre || "Sin nombre"}</span>
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive ? "bg-green-400/15 text-green-200" : "bg-red-400/15 text-red-200"
                  }`}
                >
                  {subcategory.estado || "Inactivo"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SubcategoriesBadge({ subcategories = [] }) {
  const total = subcategories.length;
  const [hoverPosition, setHoverPosition] = useState(null);

  const handleMouseEnter = (event) => {
    setHoverPosition(calculateHoverPosition(event.currentTarget, {
      tooltipWidth: 240,
      tooltipMaxHeight: 260,
      margin: 12,
      gap: 8,
    }));
  };

  return (
    <div className="group/sub relative inline-flex justify-center" onMouseEnter={handleMouseEnter} onMouseLeave={() => setHoverPosition(null)}>
      <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-[#004D77]">
        <Layers size={11} />
        {total}
      </span>
      {hoverPosition && <SubcategoriesTooltip subcategories={subcategories} position={hoverPosition} />}
    </div>
  );
}

function EmptyState({ isSearching, onCreateCategory }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004D77]/10">
        <Layers className="h-8 w-8 text-[#004D77]/40" strokeWidth={1.5} />
      </div>

      {isSearching ? (
        <>
          <p className="text-sm font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="max-w-xs text-center text-xs text-gray-400">
            Ninguna categoría coincide con la búsqueda.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-500">No hay categorías registradas</p>
          <p className="max-w-xs text-center text-xs text-gray-400">
            Aún no se han registrado categorías.
          </p>

          <Permission permission="categorias.crear">
            <button
              type="button"
              onClick={onCreateCategory}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-[#004D77] px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#003a5c] sm:px-3"
            >
              <span>Nueva categoría</span>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </Permission>
        </>
      )}
    </div>
  );
}

export const CategoriesTable = ({
  currentData = [],
  startIndex = 0,
  handleToggleStatus,
  handleDelete,
  handleEdit,
  handleViewDetail,
  highlightText,
  isSearching = false,
  onCreateCategory,
  changingStatusId = null,
}) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteClick = async (categoryId) => {
    if (deletingId === categoryId) return;

    setDeletingId(categoryId);
    try {
      await handleDelete(categoryId);
    } finally {
      setDeletingId(null);
    }
  };

  if (currentData.length === 0) {
    return <EmptyState isSearching={isSearching} onCreateCategory={onCreateCategory} />;
  }

  return (
  <div className="min-w-0 w-full overflow-x-auto overscroll-x-contain rounded-xl [-webkit-overflow-scrolling:touch]">
    <table className="min-w-max w-full table-auto">
      <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
        <tr>
          <th className="sticky left-0 z-30 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">#</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Nombre categoría</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Subcategorías</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Estado</th>
          <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {currentData.map((category, index) => {
          const rowBackground = index % 2 === 0 ? "bg-gray-100" : "bg-white";
          const isDeleting = deletingId === category.id;
          return (
            <tr key={category.id} className={`group transition-colors duration-150 ${rowBackground} hover:bg-blue-50`}>
              <td className={`sticky left-0 z-10 px-3 py-2 text-center font-mono text-xs text-gray-700 whitespace-nowrap transition-colors duration-150 ${rowBackground} group-hover:bg-blue-50`}>
                {startIndex + index + 1}
              </td>
              <td className="max-w-sm truncate px-3 py-2 text-center text-xs font-medium text-gray-800 whitespace-nowrap">
                {highlightText(category.nombre || "")}
              </td>
              <td className="px-3 py-2 text-center whitespace-nowrap">
                <SubcategoriesBadge subcategories={category.subcategoriasDetalle || []} />
              </td>
              <td className="px-3 py-2 text-center whitespace-nowrap">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  category.estado === "Activo"
                    ? "border-green-300 bg-green-100 text-green-700"
                    : "border-red-200 bg-red-100 text-red-600"
                }`}>
                  {highlightText(category.estado || "")}
                </span>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                  <Permission permission="categorias.activar_desactivar">
                    <ActiveToggle
                      activo={category.estado === "Activo"}
                      onChange={() => handleToggleStatus(category.id)}
                      disabled={changingStatusId !== null}
                      loading={changingStatusId === category.id}
                    />
                  </Permission>
                  <Permission permission="categorias.ver_informacion">
                    <button type="button" onClick={() => handleViewDetail(category)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]" title="Ver detalle">
                      <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                    </button>
                  </Permission>
                  <Permission permission="categorias.editar">
                    <button type="button" onClick={() => handleEdit(category)} className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-[#004D77]" title="Editar categoría">
                      <SquarePen className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                    </button>
                  </Permission>
                  <Permission permission="categorias.eliminar">
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(category.id)}
                      disabled={isDeleting}
                      className={`text-gray-400 transition ${
                        isDeleting
                          ? "cursor-wait opacity-50"
                          : "cursor-pointer hover:scale-110 hover:text-red-500"
                      }`}
                      title={isDeleting ? "Procesando..." : "Eliminar categoría"}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                      )}
                    </button>
                  </Permission>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
  );
};

export default CategoriesTable;
