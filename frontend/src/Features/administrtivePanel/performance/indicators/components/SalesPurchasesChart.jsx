import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { chartCard, cardTitle, axTick, tooltipBox, tooltipLabel, tooltipValue } from "../helpers/indicatorsHelpers";
import useBreakpoint from "../hooks/useBreakpoint";

const salesPurchasesData = [
  { mes: "Jul", ventas: 50, compras: 30 },
  { mes: "Ago", ventas: 55, compras: 32 },
  { mes: "Sep", ventas: 48, compras: 29 },
  { mes: "Oct", ventas: 45, compras: 27 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipBox}>
      <p style={tooltipLabel}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ ...tooltipValue, color: p.dataKey === "ventas" ? "#93c5fd" : "#bfdbfe" }}>
          {p.dataKey === "ventas" ? "Ventas" : "Compras"}: {p.value}M
        </p>
      ))}
    </div>
  );
};

function SalesPurchasesChart() {
  const { isMobile } = useBreakpoint();
  return (
    <div style={chartCard}>
      <h3 style={cardTitle}>Ventas &amp; Compras</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 180 : 160}>
        <BarChart data={salesPurchasesData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barCategoryGap="36%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="mes" tick={axTick} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${v}M`} tick={axTick} axisLine={false} tickLine={false} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            isAnimationActive={false}
            wrapperStyle={{ transition: "opacity 0.15s ease" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={v => v === "ventas" ? "Ventas" : "Compras"}
            wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
          />
          <Bar dataKey="compras" fill="#93c5fd" radius={[5, 5, 0, 0]} />
          <Bar dataKey="ventas"  fill="#1d4ed8" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesPurchasesChart;