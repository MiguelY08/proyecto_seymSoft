import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { chartCard, cardTitle, axTick, tooltipBox, tooltipLabel, tooltipValue } from "../helpers/indicatorsHelpers";
import useBreakpoint from "../hooks/useBreakPoint";

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
            color: item.dataKey === "sales" ? "#93c5fd" : "#fca5a5",
          }}
        >
          {item.dataKey === "sales" ? "Ventas" : "Devoluciones"}:{" "}
          {formatCompactCurrency(item.value)}
        </p>
      ))}
    </div>
  );
};

function MonthlySalesReturnsChart({ data = [] }) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={chartCard}>
      <h3 style={cardTitle}>Ventas &amp; Devoluciones Mensuales</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 180 : 160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradDev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={axTick} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatCompactCurrency} tick={axTick} axisLine={false} tickLine={false} domain={[0, "auto"]} />
          <Tooltip
            content={<CustomTooltip />}
            isAnimationActive={false}
            wrapperStyle={{ transition: "opacity 0.15s ease" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => value === "sales" ? "Ventas" : "Devoluciones"}
            wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
          />
          <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} fill="url(#gradVentas)" dot={false} activeDot={{ r: 4, fill: "#2563eb" }} />
          <Area type="monotone" dataKey="returns" stroke="#ef4444" strokeWidth={2} fill="url(#gradDev)" dot={false} activeDot={{ r: 4, fill: "#ef4444" }} strokeDasharray="5 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlySalesReturnsChart;

