import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { chartCard, cardTitle, tooltipBox, tooltipLabel, tooltipValue } from "../helpers/indicatorsHelpers";
import useBreakpoint from "../hooks/useBreakpoint";

const categories = [
  { name: "Papelería", units: 1250, pct: 35, color: "#2563eb" },
  { name: "Oficina",   units: 980,  pct: 28, color: "#3b82f6" },
  { name: "Escolar",   units: 765,  pct: 22, color: "#60a5fa" },
  { name: "Arte",      units: 340,  pct: 10, color: "#93c5fd" },
  { name: "Otros",     units: 175,  pct: 5,  color: "#cbd5e1" },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipBox}>
      <p style={tooltipLabel}>{d.name}</p>
      <p style={tooltipValue}>{d.units.toLocaleString()} und.</p>
      <p style={{ ...tooltipValue, color: "#93c5fd" }}>{d.pct}% del total</p>
    </div>
  );
};

function CategoryDemandChart() {
  const { isMobile } = useBreakpoint();
  
  // Más compacto: menos altura para el donut y menos gap
  const donutHeight = isMobile ? 140 : 130;
  const gapSize = isMobile ? "6px" : "8px";
  
  return (
    <div style={{ ...chartCard, display: "flex", flexDirection: "column", padding: "12px" }}>
      <h3 style={{ ...cardTitle, marginBottom: "8px", fontSize: "14px" }}>Categorías Demandadas</h3>

      {/* Donut más pequeño */}
      <div style={{ width: "100%", height: donutHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%" cy="50%"
              innerRadius={isMobile ? 40 : 35}
              outerRadius={isMobile ? 60 : 52}
              paddingAngle={2}
              dataKey="pct"
              strokeWidth={0}
            >
              {categories.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              isAnimationActive={false}
              wrapperStyle={{ transition: "opacity 0.15s ease" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda más compacta */}
      <div style={{ display: "flex", flexDirection: "column", gap: gapSize, marginTop: "8px" }}>
        {categories.map(cat => (
          <div key={cat.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "#374151", fontWeight: "500" }}>{cat.name}</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e293b" }}>{cat.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryDemandChart;