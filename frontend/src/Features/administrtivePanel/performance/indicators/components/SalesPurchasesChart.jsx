import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
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

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getTotals = (data = []) =>
  data.reduce(
    (totals, item) => ({
      sales: totals.sales + Number(item.sales || 0),
      purchases: totals.purchases + Number(item.purchases || 0),
    }),
    { sales: 0, purchases: 0 }
  );

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

const PeriodTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div style={tooltipBox}>
      <p style={tooltipLabel}>PERIODO FILTRADO</p>
      <p style={{ ...tooltipValue, color: item.fill }}>
        {item.name}: {formatCurrency(item.value)}
      </p>
    </div>
  );
};

function PeriodSummary({ data }) {
  const totals = getTotals(data);

  const chartData = [
    { name: "Compras", value: totals.purchases, fill: "#93c5fd" },
    { name: "Ventas", value: totals.sales, fill: "#1d4ed8" },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 14, right: 28, left: 18, bottom: 0 }}
        barCategoryGap="34%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatCompactCurrency}
          tick={axTick}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={axTick}
          axisLine={false}
          tickLine={false}
          width={78}
        />
        <Tooltip
          content={<PeriodTooltip />}
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
          isAnimationActive={false}
          wrapperStyle={{ transition: "opacity 0.15s ease" }}
        />
        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SalesPurchasesChart({ data = [], isFiltered = false }) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={chartCard}>
      <h3 style={cardTitle}>{isFiltered ? "Métricas de ventas y compras" : "Ventas & Compras"}</h3>
      {isFiltered ? (
        <PeriodSummary data={data} />
      ) : (
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
      )}
    </div>
  );
}

export default SalesPurchasesChart;
