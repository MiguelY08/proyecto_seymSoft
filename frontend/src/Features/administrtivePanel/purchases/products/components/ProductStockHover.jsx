import { useState } from "react";
import { AlertTriangle, Package } from "lucide-react";
import { HighlightText } from "../helpers/productsHelpers";

const LOW_STOCK_THRESHOLD = 10;

function calculateHoverPosition(target, options = {}) {
  const {
    tooltipWidth = 280,
    tooltipMaxHeight = 320,
    margin = 12,
  } = options;
  const rect = target.getBoundingClientRect();
  const centeredLeft = rect.left + rect.width / 2;
  const minLeft = tooltipWidth / 2 + margin;
  const maxLeft = window.innerWidth - tooltipWidth / 2 - margin;
  const spaceAbove = Math.max(0, rect.top - margin);
  const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - margin);
  const opensAbove = spaceBelow < tooltipMaxHeight && spaceAbove > spaceBelow;
  const availableHeight = opensAbove ? spaceAbove : spaceBelow;

  return {
    left: Math.min(Math.max(centeredLeft, minLeft), maxLeft),
    placement: opensAbove ? "top" : "bottom",
    top: opensAbove ? undefined : rect.bottom,
    bottom: opensAbove ? window.innerHeight - rect.top : undefined,
    maxHeight: Math.min(tooltipMaxHeight, availableHeight),
  };
}

function ProductStockHover({ product, totalStock, lowStock, search }) {
  const [position, setPosition] = useState(null);
  const barcodes = Array.isArray(product?.barcodes) ? product.barcodes : [];
  const opensAbove = position?.placement === "top";
  const positionStyle = position
    ? {
        left: `${position.left}px`,
        ...(opensAbove ? { bottom: `${position.bottom}px` } : { top: `${position.top}px` }),
        maxHeight: `${position.maxHeight}px`,
      }
    : {};
  return (
    <div
      className="group/stock relative inline-flex justify-center"
      onMouseEnter={(event) => setPosition(calculateHoverPosition(event.currentTarget))}
    >
      <div className={`flex h-7 w-24 items-center justify-center gap-1.5 rounded-md border bg-white px-2 shadow-sm ${
        lowStock ? "border-amber-300" : "border-[#004D77]/15"
      }`}>
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
          lowStock ? "bg-amber-100 text-amber-700" : "bg-[#004D77]/10 text-[#004D77]"
        }`}>
          {lowStock ? (
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <Package className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </span>
        <span className={`min-w-0 truncate font-semibold ${
          lowStock ? "text-amber-800" : "text-gray-800"
        }`}>
          <HighlightText
            text={totalStock.toLocaleString("es-CO")}
            highlight={search}
          />
        </span>
      </div>

      <div
        className="pointer-events-none fixed z-[9999] min-w-[240px] max-w-[280px] -translate-x-1/2 overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl p-2.5 opacity-0 shadow-2xl transition-opacity duration-150 group-hover/stock:opacity-100"
        style={{ background: "#1e293b", ...positionStyle }}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Stock por presentación
          </p>
          <span className="shrink-0 rounded-full bg-sky-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-sky-200">
            {barcodes.length} {barcodes.length === 1 ? "presentación" : "presentaciones"}
          </span>
        </div>

        <div className="mb-1.5 flex items-center justify-between gap-2 border-b border-slate-600/70 pb-1.5 text-[11px]">
          <span className="text-slate-300">Stock total</span>
          <span className="font-semibold tabular-nums text-slate-100">
            {totalStock.toLocaleString("es-CO")} und.
          </span>
        </div>

        {barcodes.length > 0 ? (
          <div className="flex flex-col gap-1">
            {barcodes.map((barcode, index) => {
              const presentationStock = Number(barcode.stock || 0);
              const presentationLowStock = presentationStock < LOW_STOCK_THRESHOLD;

              return (
              <div
                key={barcode.id ?? `${barcode.barcode}-${index}`}
                className={`rounded-lg border px-2 py-1 ${
                  presentationLowStock
                    ? "border-amber-400/40 bg-amber-950/40"
                    : "border-transparent"
                }`}
                style={{
                  background: presentationLowStock
                    ? "rgba(120, 53, 15, 0.38)"
                    : "rgba(15, 23, 42, 0.72)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 truncate text-[11px] font-semibold text-slate-100">
                    {presentationLowStock && (
                      <AlertTriangle
                        className="h-3 w-3 shrink-0 text-amber-300"
                        strokeWidth={2}
                        aria-label="Stock bajo"
                      />
                    )}
                    <span className="truncate">
                      {barcode.variantName || `Presentación #${index + 1}`}
                    </span>
                  </span>
                  <span className={`shrink-0 text-[11px] font-semibold tabular-nums ${
                    presentationLowStock ? "text-amber-300" : "text-blue-300"
                  }`}>
                    {presentationStock.toLocaleString("es-CO")} und.
                  </span>
                </div>
                <p className="mt-0.5 break-all text-center font-mono text-[9px] leading-tight text-slate-400">
                  {barcode.barcode || "Código sin registrar"}
                </p>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg px-2 py-2" style={{ background: "rgba(15, 23, 42, 0.72)" }}>
            <p className="text-xs italic text-slate-300">Sin presentaciones registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductStockHover;
