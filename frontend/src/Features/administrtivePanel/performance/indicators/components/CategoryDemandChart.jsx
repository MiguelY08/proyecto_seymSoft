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
  return (
    <div style={{ ...chartCard, display: "flex", flexDirection: "column" }}>
      <h3 style={cardTitle}>Categorías Demandadas</h3>

      {/* Donut */}
      <div style={{ width: "100%", height: isMobile ? 180 : 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%" cy="50%"
              innerRadius={isMobile ? 50 : 42}
              outerRadius={isMobile ? 78 : 65}
              paddingAngle={3}
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

      {/* Leyenda */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {categories.map(cat => (
          <div key={cat.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{cat.name}</span>
            </div>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{cat.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryDemandChart;