import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { chartCard, cardTitle, axTick, tooltipBox, tooltipLabel, tooltipValue } from "../helpers/indicatorsHelpers";
import useBreakpoint from "../hooks/useBreakpoint";

const formatCompactCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div style={tooltipBox}>
      <p style={tooltipLabel}>{label}</p>
      {payload.map((item) => (
        <p
          key={item.dataKey}
          style={{
            ...tooltipValue,
            color: item.dataKey === "sales" ? "#93c5fd" : "#bfdbfe",
          }}
        >
          {item.dataKey === "sales" ? "Ventas" : "Compras"}:{" "}
          {formatCompactCurrency(item.value)}
        </p>
      ))}
    </div>
  );
};

function SalesPurchasesChart({ data = [] }) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={chartCard}>
      <h3 style={cardTitle}>Ventas &amp; Compras</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 180 : 160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barCategoryGap="36%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={axTick} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatCompactCurrency} tick={axTick} axisLine={false} tickLine={false} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            isAnimationActive={false}
            wrapperStyle={{ transition: "opacity 0.15s ease" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => value === "sales" ? "Ventas" : "Compras"}
            wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
          />
          <Bar dataKey="purchases" fill="#93c5fd" radius={[5, 5, 0, 0]} />
          <Bar dataKey="sales" fill="#1d4ed8" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesPurchasesChart;
