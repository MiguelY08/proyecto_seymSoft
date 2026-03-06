import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const card = {
  background: "white", borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  padding: "8px 10px", flex: 1, minWidth: "200px",
};

const categories = [
  { name: "Papelería", units: 1250, pct: 35, color: "#002a6d" },
  { name: "Oficina",   units: 980,  pct: 28, color: "#27588f" },
  { name: "Escolar",   units: 765,  pct: 22, color: "#5982c8" },
  { name: "Arte",      units: 340,  pct: 10, color: "#7b9ed9" },
  { name: "Otros",     units: 175,  pct: 5,  color: "#6b7280" },
];

function CategoryDemandChart() {
  return (
    <div style={card}>
      <h3 style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: "600", color: "#1a1a2e" }}>
        Categorías Más Demandadas
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={26} outerRadius={46} paddingAngle={2} dataKey="pct">
                {categories.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          {categories.map(cat => (
            <div key={cat.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{cat.name}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#8a94a6" }}>{cat.units.toLocaleString()} und.</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a2e", minWidth: "24px", textAlign: "right" }}>{cat.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryDemandChart;
