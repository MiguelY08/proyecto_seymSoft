import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
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
      returns: totals.returns + Number(item.returns || 0),
    }),
    { sales: 0, returns: 0 }
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

function ReturnsSummary({ data }) {
  const totals = getTotals(data);
  const maxValue = Math.max(totals.sales, totals.returns, 1);
  const minVisibleValue = maxValue * 0.035;

  const chartData = [
    {
      name: "Ventas",
      value: totals.sales,
      displayValue: totals.sales > 0 ? Math.max(totals.sales, minVisibleValue) : 0,
      fill: "#2563eb",
    },
    {
      name: "Devoluciones",
      value: totals.returns,
      displayValue: totals.returns > 0 ? Math.max(totals.returns, minVisibleValue) : 0,
      fill: "#ef4444",
    },
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
          width={104}
        />
        <Tooltip
          content={<PeriodTooltip />}
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
          isAnimationActive={false}
          wrapperStyle={{ transition: "opacity 0.15s ease" }}
        />
        <Bar dataKey="displayValue" radius={[0, 8, 8, 0]} barSize={24}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function MonthlySalesReturnsChart({ data = [], isFiltered = false }) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={chartCard}>
      <h3 style={cardTitle}>{isFiltered ? "Métricas de ventas y devoluciones" : "Ventas & Devoluciones Mensuales"}</h3>
      {isFiltered ? (
        <ReturnsSummary data={data} />
      ) : (
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
      )}
    </div>
  );
}

export default MonthlySalesReturnsChart;
