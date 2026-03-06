import { useEffect, useState } from "react";

const card = {
  background: "white", borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  padding: "8px 10px", flex: 1, minWidth: "180px",
};

const products = [
  { name: "Cuadernos",  value: 456 },
  { name: "Bolígrafos", value: 389 },
  { name: "Papel bond", value: 298 },
  { name: "Carpetas",   value: 245 },
  { name: "Marcadores", value: 189 },
  { name: "Tijeras",    value: 156 },
];

const PROD_COLORS = ["#00c8ff", "#44ff00", "#ff8400", "#ff00ae", "#ff0000", "#ea00ff"];

function TopProductsChart() {
  const max = 456;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={card}>
      <h3 style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "600", color: "#1a1a2e" }}>
        Top productos más vendidos
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {products.map((p, i) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500", width: "72px", flexShrink: 0 }}>{p.name}</span>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: "100px", height: "4px", overflow: "hidden" }}>
              <div style={{
                width: animated ? `${(p.value / max) * 100}%` : "0%",
                height: "100%",
                background: PROD_COLORS[i],
                borderRadius: "100px",
                transition: `width 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${i * 80}ms`,
              }} />
            </div>
            <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", width: "26px", textAlign: "right", flexShrink: 0 }}>{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopProductsChart;
