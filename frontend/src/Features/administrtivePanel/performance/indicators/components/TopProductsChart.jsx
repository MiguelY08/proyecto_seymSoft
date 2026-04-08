import { useState } from "react";
import { chartCard, cardTitle } from "../helpers/indicatorsHelpers";
import useBarAnimation           from "../hooks/useBarAnimation";
import useBreakpoint             from "../hooks/useBreakpoint";

const products = [
  { name: "Cuadernos",    qty: 456, revenue: 1.82 },
  { name: "Bolígrafos",   qty: 389, revenue: 0.97 },
  { name: "Papel bond",   qty: 298, revenue: 1.49 },
  { name: "Carpetas",     qty: 245, revenue: 0.74 },
  { name: "Marcadores",   qty: 189, revenue: 0.57 },
  { name: "Tijeras",      qty: 156, revenue: 0.31 },
  { name: "Resaltadores", qty: 134, revenue: 0.27 },
  { name: "Correctores",  qty: 118, revenue: 0.22 },
  { name: "Grapas",       qty:  97, revenue: 0.14 },
  { name: "Post-its",     qty:  82, revenue: 0.19 },
];

const PROD_COLORS = [
  "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa",
  "#7ca8e0", "#93b8d4", "#a8c4de", "#b8d0e8",
  "#c8daf0", "#d6e4f7",
];

function TopProductsChart() {
  const animated        = useBarAnimation();
  const [mode, setMode] = useState("qty");
  const { isMobile }    = useBreakpoint();

  const activeKey = mode === "qty" ? "qty" : "revenue";
  const sorted    = [...products].sort((a, b) => b[activeKey] - a[activeKey]);
  const maxValue  = sorted[0][activeKey];

  const formatValue = (p) =>
    mode === "qty" ? `${p.qty} uds.` : `$${p.revenue.toFixed(2)}M`;

  return (
    <div style={{ ...chartCard, padding: "12px" }}>

      {/* Header más compacto */}
      <div style={{
        display:        "flex",
        alignItems:     isMobile ? "flex-start" : "center",
        flexDirection:  isMobile ? "column" : "row",
        justifyContent: "space-between",
        gap:            "8px",
        marginBottom:   "10px",
      }}>
        <h3 style={{ ...cardTitle, margin: 0, fontSize: "14px" }}>Top Productos Más Vendidos</h3>

        <div style={{
          display:      "flex",
          background:   "#f1f5f9",
          borderRadius: "8px",
          padding:      "2px",
          gap:          "2px",
          alignSelf:    isMobile ? "flex-start" : "auto",
        }}>
          {[["qty", "Cantidad"], ["revenue", "Precio"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{
                fontSize:     "11px",
                fontWeight:   "600",
                padding:      "4px 10px",
                borderRadius: "6px",
                border:       "none",
                cursor:       "pointer",
                transition:   "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
                background:   mode === key ? "#ffffff" : "transparent",
                color:        mode === key ? "#1d4ed8" : "#94a3b8",
                boxShadow:    mode === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista más compacta: reducido el gap entre items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sorted.map((p, i) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "10px" }}>

            {/* Rank más pequeño */}
            <span style={{
              fontSize:   "10px",
              fontWeight: "700",
              color:      i < 5 ? PROD_COLORS[i] : PROD_COLORS[6],
              width:      "16px",
              flexShrink: 0,
              textAlign:  "right",
            }}>
              {i + 1}
            </span>

            {/* Nombre más pequeño */}
            <span style={{
              fontSize:     "11px",
              color:        "#374151",
              fontWeight:   "500",
              width:        isMobile ? "65px" : "80px",
              flexShrink:   0,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}>
              {p.name}
            </span>

            {/* Barra más delgada */}
            <div style={{ flex: 1, background: "#f1f5f9", borderRadius: "100px", height: "6px", overflow: "hidden" }}>
              <div style={{
                width:        animated ? `${(p[activeKey] / maxValue) * 100}%` : "0%",
                height:       "100%",
                background:   i < 5 ? PROD_COLORS[i] : PROD_COLORS[6],
                borderRadius: "100px",
                transition:   `width 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 40}ms`,
              }} />
            </div>

            {/* Valor más compacto */}
            <span style={{
              fontSize:   "10px",
              color:      "#64748b",
              fontWeight: "600",
              width:      "50px",
              textAlign:  "right",
              flexShrink: 0,
            }}>
              {formatValue(p)}
            </span>

          </div>
        ))}
      </div>
    </div>
  );
}

export default TopProductsChart;