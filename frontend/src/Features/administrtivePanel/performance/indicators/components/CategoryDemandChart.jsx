import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { chartCard, cardTitle, tooltipBox, tooltipLabel, tooltipValue } from "../helpers/indicatorsHelpers";
import useBreakpoint from "../hooks/useBreakPoint";

const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#cbd5e1"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const category = payload[0].payload;

  return (
    <div style={tooltipBox}>
      <p style={tooltipLabel}>{category.name}</p>
      <p style={tooltipValue}>{category.units.toLocaleString("es-CO")} und.</p>
      <p style={{ ...tooltipValue, color: "#93c5fd" }}>
        {category.percentage.toFixed(1)}% del total
      </p>
    </div>
  );
};

function CategoryDemandChart({ data = [] }) {
  const { isMobile } = useBreakpoint();
  const categories = data.map((category, index) => ({
    ...category,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div style={{ ...chartCard, display: "flex", flexDirection: "column" }}>
      <h3 style={cardTitle}>Categorías Demandadas</h3>

      <div style={{ width: "100%", height: isMobile ? 180 : 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 50 : 42}
              outerRadius={isMobile ? 78 : 65}
              paddingAngle={3}
              dataKey="percentage"
              strokeWidth={0}
            >
              {categories.map((category) => (
                <Cell key={category.idCategory} fill={category.color} />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              isAnimationActive={false}
              wrapperStyle={{ transition: "opacity 0.15s ease" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {categories.map((category) => (
          <div
            key={category.idCategory}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: category.color,
                  flexShrink: 0,
                }}
              />
              <span
                title={category.name}
                style={{
                  fontSize: "13px",
                  color: "#374151",
                  fontWeight: "500",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {category.name}
              </span>
            </div>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
              {category.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryDemandChart;

