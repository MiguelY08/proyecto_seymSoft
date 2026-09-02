import React, { useState, useRef, useCallback } from "react";
import { Info, Loader2, SquarePen, XCircle, PackageX } from "lucide-react";
import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";
import {
  getBadgeEstadoDevolucionClasses,
  getBadgeEstadoProducto,
  getPurchaseReturnProviderName,
  isEstadoAnulado,
} from "../helpers/returnsHelpers";
import { PurchaseReturnsService } from "../services/returnsServices";

// ─── Highlight ────────────────────────────────────────────────────────────────
const highlight = (text, search) => {
  if (!search || !text) return text ?? "-";
  const str   = String(text);
  const regex = new RegExp(
    `(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = str.split(regex);
  if (parts.length === 1) return str;
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
        {part}
      </span>
    ) : part
  );
};

// ─── EstadoBadge ──────────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }) => {
  const classes = getBadgeEstadoDevolucionClasses(estado);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${classes}`}>
      {estado ?? "-"}
    </span>
  );
};

// ─── Hook: posición fija del tooltip ─────────────────────────────────────────
function useTooltipPos() {
  const [pos, setPos] = useState(null);
  const ref           = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const rect       = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp     = spaceBelow < 180 && spaceAbove > spaceBelow;
    setPos({
      left:  Math.min(rect.left, window.innerWidth - 240),
      top:   openUp ? rect.top - 8 : rect.bottom + 8,
      openUp,
    });
  }, []);

  const hide = useCallback(() => setPos(null), []);
  return { ref, pos, show, hide };
}
// ─── FloatingTooltip ─────────────────────────────────────────────────────────
const FloatingTooltip = ({ pos, children }) => {
  if (!pos) return null;
  return (
    <div
      className="fixed z-[9999] min-w-[220px] max-w-[280px] rounded-xl shadow-2xl p-3 pointer-events-none"
      style={{
        background: "#1e293b",
        left:       pos.left,
        top:        pos.openUp ? undefined : pos.top,
        bottom:     pos.openUp ? window.innerHeight - pos.top : undefined,
      }}
    >
      {children}
    </div>
  );
};

// ─── Tooltip Productos ────────────────────────────────────────────────────────
const ProductosTooltip = ({ productos, search, totalDetails = 0, completedDetails = 0, progress, loading = false, onLoadProducts }) => {
  const { ref, pos, show, hide } = useTooltipPos();
  const handleMouseEnter = () => {
    show();
    onLoadProducts?.();
  };

  if (!productos?.length) {
    const total = totalDetails ?? progress?.total ?? 0;
    const completed = completedDetails ?? progress?.completed ?? 0;
    const label = progress?.label ?? `${completed}/${total}`;

    if (!total) return <span className="text-gray-400 text-sm">-</span>;

    return (
      <>
        <div
          ref={ref}
          className="flex items-center gap-1.5 cursor-default justify-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={hide}
        >
          <span className="text-xs text-gray-700 max-w-[170px] truncate">
            {highlight(`${total} producto${total !== 1 ? "s" : ""}`, search)}
          </span>
          <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
        </div>

        <FloatingTooltip pos={pos}>
          {loading ? (
            <p className="text-xs" style={{ color: "#f1f5f9" }}>Cargando productos...</p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94a3b8" }}>
                Resumen de productos
              </p>
              <div className="flex flex-col gap-1.5 text-xs" style={{ color: "#f1f5f9" }}>
                <div className="flex items-center justify-between gap-3">
                  <span>Total de detalles</span>
                  <span className="font-semibold tabular-nums" style={{ color: "#93c5fd" }}>{total}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Listos</span>
                  <span className="font-semibold tabular-nums" style={{ color: "#93c5fd" }}>{completed}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Progreso</span>
                  <span className="font-semibold tabular-nums" style={{ color: "#93c5fd" }}>{label}</span>
                </div>
              </div>
            </>
          )}
        </FloatingTooltip>
      </>
    );
  }

  const names   = productos.map((p) => p.nombre);
  const preview = names.slice(0, 2).join(", ") + (productos.length > 2 ? "..." : "");

  return (
    <>
      <div
        ref={ref}
        className="flex items-center gap-1.5 cursor-default justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hide}
      >
        <span className="text-xs text-gray-700 max-w-[170px] truncate">
          {highlight(preview, search)}
        </span>
        <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
      </div>

      <FloatingTooltip pos={pos}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94a3b8" }}>
          Productos
        </p>
        <ul className="flex flex-col gap-1">
          {productos.map((p, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-xs" style={{ color: "#f1f5f9" }}>
              <span className="truncate max-w-[160px]">• {p.nombre}</span>
              <span className="font-semibold shrink-0 ml-1" style={{ color: "#93c5fd" }}>
                ×{p.cantidadDevolver ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </FloatingTooltip>
    </>
  );
};

// ─── Tooltip Estado ───────────────────────────────────────────────────────────
const EstadoTooltip = ({ devolucion }) => {
  const { ref, pos, show, hide } = useTooltipPos();

  const productos = devolucion?.productos ?? [];
  if (!productos.length) {
    const progress = devolucion?.progress;
    const total = devolucion?.totalDetails ?? progress?.total ?? 0;
    const completed = devolucion?.completedDetails ?? progress?.completed ?? 0;

    if (!total) return <EstadoBadge estado={devolucion?.estado} />;

    return (
      <>
        <div
          ref={ref}
          className="inline-flex items-center gap-1 cursor-default justify-center"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <EstadoBadge estado={devolucion?.estado} />
        </div>

        <FloatingTooltip pos={pos}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94a3b8" }}>
            Progreso de devolución
          </p>
          <div className="flex flex-col gap-1.5 text-xs" style={{ color: "#f1f5f9" }}>
            <div className="flex items-center justify-between gap-3">
              <span>Listos</span>
              <span className="font-semibold tabular-nums" style={{ color: "#93c5fd" }}>
                {completed} de {total}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Pendientes</span>
              <span className="font-semibold tabular-nums" style={{ color: "#93c5fd" }}>
                {Math.max(total - completed, 0)}
              </span>
            </div>
          </div>
        </FloatingTooltip>
      </>
    );
  }

  const conteos = productos.reduce((acc, p) => {
    const e = p.estado ?? "Sin estado";
    acc[e]  = (acc[e] ?? 0) + 1;
    return acc;
  }, {});

  const ORDEN = ["Pend. envío", "Pend. reemplazo", "Pend. reembolso", "Listo"];
  const entriesOrdenadas = [
    ...ORDEN.filter((e) => conteos[e]).map((e) => [e, conteos[e]]),
    ...Object.entries(conteos).filter(([e]) => !ORDEN.includes(e)),
  ];

  return (
    <>
      <div
        ref={ref}
        className="inline-flex items-center gap-1 cursor-default justify-center"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <EstadoBadge estado={devolucion?.estado} />
      </div>

      <FloatingTooltip pos={pos}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94a3b8" }}>
          Estados de productos
        </p>
        <ul className="flex flex-col gap-1.5">
          {entriesOrdenadas.map(([estado, count]) => {
            const color = getBadgeEstadoProducto(estado).color;
            return (
              <li key={estado} className="flex items-center justify-between gap-3 text-xs" style={{ color: "#f1f5f9" }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span>{estado}</span>
                </div>
                <span className="font-semibold shrink-0" style={{ color: "#93c5fd" }}>
                  {count} de {productos.length}
                </span>
              </li>
            );
          })}
        </ul>
      </FloatingTooltip>
    </>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ isSearching }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <PackageX className="w-10 h-10 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      {isSearching ? (
        <>
          <p className="text-base font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Ninguna devolución coincide con los filtros aplicados. Intenta con otros criterios.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-gray-500">No hay devoluciones registradas</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Las devoluciones se crean desde el módulo de Compras, al gestionar una factura.
          </p>
        </>
      )}
    </div>
  );
}

// ─── ReturnsTable ─────────────────────────────────────────────────────────────
function ReturnsTable({
  currentData,
  search,
  isSearching,
  proveedorMap = {},
  onViewDetail,
  onEdit,
  onAnnul,
  annullingId = null,
}) {
  const { hasPermission } = usePermissions();
  const [productsByReturnId, setProductsByReturnId] = useState({});
  const [loadingProductIds, setLoadingProductIds] = useState({});

  const loadReturnProducts = useCallback(async (returnId) => {
    if (!returnId || productsByReturnId[returnId] || loadingProductIds[returnId]) return;

    setLoadingProductIds((current) => ({ ...current, [returnId]: true }));

    try {
      const detail = await PurchaseReturnsService.getById(returnId);
      setProductsByReturnId((current) => ({ ...current, [returnId]: detail?.productos ?? [] }));
    } catch (error) {
      console.error("No se pudieron cargar los productos de la devolución.", error);
    } finally {
      setLoadingProductIds((current) => ({ ...current, [returnId]: false }));
    }
  }, [loadingProductIds, productsByReturnId]);
  const canViewInfo   = hasPermission("devoluciones_en_compras.ver_informacion");
  const canEditGlobal = hasPermission("devoluciones_en_compras.editar");
  const canAnnulGlobal = hasPermission("devoluciones_en_compras.anular");

  const isClosed = (d) => isEstadoAnulado(d.estado) || d.estado === "Listo" || d.estado?.startsWith("Procesada");
  const getDisabledActionTitle = (d) => {
    if (isEstadoAnulado(d.estado)) return "No disponible para devoluciones anuladas";
    if (d.estado === "Listo") return "No disponible para devoluciones listas";
    if (d.estado?.startsWith("Procesada")) return "No disponible para devoluciones procesadas";
    return "No disponible";
  };

  if (currentData.length === 0) {
    return <EmptyState isSearching={isSearching} />;
  }

  return (
    <div className="min-w-0 w-full overflow-x-auto overscroll-x-contain rounded-xl [-webkit-overflow-scrolling:touch]">
      <table className="min-w-max w-full table-auto">

        <thead className="sticky top-0 z-20 bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-30 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">No. Devolución</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Compra</th>
            <th className="w-52 max-w-[13rem] px-3 py-2.5 text-center text-xs font-semibold">Proveedor</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">F. Devolución</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Productos</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Devolver</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Estado</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {currentData.map((devolucion, index) => {
            const rowBg         = index % 2 === 0 ? "bg-gray-100 hover:bg-blue-50" : "bg-white hover:bg-blue-50";
            const stickyCellBg  = index % 2 === 0 ? "bg-gray-100 group-hover:bg-blue-50" : "bg-white group-hover:bg-blue-50";
            const proveedor = getPurchaseReturnProviderName(
              {
                ...devolucion,
                proveedor:
                  devolucion.proveedor ??
                  proveedorMap[devolucion.idCompra],
              },
              "—"
            );
            const progress      = devolucion.progress ?? {};
            const productos = productsByReturnId[devolucion.id] ?? devolucion.productos;
            const totalUnidades = (devolucion.productos ?? []).reduce(
              (sum, p) => sum + (p.cantidadDevolver ?? 0), 0
            ) || devolucion.totalDetails || progress.total || 0;
            const progressLabel = progress.label ?? `${devolucion.completedDetails ?? progress.completed ?? 0}/${devolucion.totalDetails ?? progress.total ?? 0}`;
            const actionsDisabled = isClosed(devolucion);
            const isAnnulling = annullingId === devolucion.id;
            const disabledActionTitle = getDisabledActionTitle(devolucion);

            return (
              <tr key={devolucion.id} className={`group transition-colors duration-150 ${rowBg}`}>

                {/* No. Devolución */}
                <td className={`sticky left-0 z-10 px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap font-mono transition-colors duration-150 ${stickyCellBg}`}>
                  {highlight(devolucion.id, search)}
                </td>

                {/* Compra */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(devolucion.idCompra, search)}
                </td>

                {/* Proveedor */}
                <td className="w-52 max-w-[13rem] px-3 py-2 text-center text-xs text-gray-700">
                  <span className="block truncate" title={String(proveedor)}>
                    {highlight(proveedor, search)}
                  </span>
                </td>

                {/* Fecha */}
                <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(devolucion.fechaDevolucion, search)}
                </td>

                {/* Productos con tooltip */}
                <td className="px-3 py-2 text-xs">
                  <ProductosTooltip
                    productos={productos}
                    search={search}
                    totalDetails={devolucion.totalDetails}
                    completedDetails={devolucion.completedDetails}
                    progress={progress}
                    loading={Boolean(loadingProductIds[devolucion.id])}
                    onLoadProducts={() => loadReturnProducts(devolucion.id)}
                  />
                </td>

                {/* Total unidades a devolver */}
                <td className="px-3 py-2 text-center text-xs text-gray-800 font-semibold whitespace-nowrap">
                  {devolucion.productos?.length
                    ? highlight(String(totalUnidades), search)
                    : highlight(progressLabel, search)}
                </td>

                {/* Estado con tooltip */}
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <EstadoTooltip devolucion={devolucion} />
                </td>

                {/* Acciones */}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    {canViewInfo && (
                      <button
                        type="button"
                        onClick={() => onViewDetail(devolucion)}
                        title="Ver detalle"
                        className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                      </button>
                    )}
                    {canEditGlobal && (
                      actionsDisabled ? (
                        <span className="text-gray-200 cursor-not-allowed" title={disabledActionTitle}>
                          <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onEdit?.(devolucion)}
                          title="Editar devolución"
                          className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                        >
                          <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </button>
                      )
                    )}
                    {canAnnulGlobal && (
                      actionsDisabled ? (
                        <span className="text-gray-200 cursor-not-allowed" title={disabledActionTitle}>
                          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAnnul(devolucion)}
                          disabled={isAnnulling}
                          title={isAnnulling ? "Procesando..." : "Anular devolución"}
                          className={`text-gray-400 transition ${
                            isAnnulling
                              ? "cursor-wait opacity-50"
                              : "cursor-pointer hover:scale-110 hover:text-red-500"
                          }`}
                        >
                          {isAnnulling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                          )}
                        </button>
                      )
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
