import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const axTick = { fontSize: 11, fill: "#8a94a6" };

const card = {
  background: "white", borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  padding: "8px 10px", flex: 1, minWidth: "200px",
};

const salesPurchasesData = [
  { mes: "Jul", ventas: 50, compras: 30 },
  { mes: "Ago", ventas: 55, compras: 32 },
  { mes: "Sep", ventas: 48, compras: 29 },
  { mes: "Oct", ventas: 45, compras: 27 },
];

function SalesPurchasesChart() {
  return (
    <div style={card}>
      <h3 style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: "600", color: "#1a1a2e" }}>
        Ventas &amp; Compras
      </h3>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={salesPurchasesData} margin={{ top: 2, right: 6, left: -18, bottom: 0 }} barCategoryGap="32%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="mes" tick={axTick} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${v}M`} tick={axTick} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v, n) => [`${v}M`, n === "ventas" ? "Ventas" : "Compras"]} />
          <Legend iconType="square" iconSize={8} formatter={v => v === "ventas" ? "Ventas" : "Compras"} wrapperStyle={{ fontSize: "11px", paddingTop: "2px" }} />
          <Bar dataKey="compras" fill="#1e3a8a" radius={[3, 3, 0, 0]} />
          <Bar dataKey="ventas"  fill="#60a5fa" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesPurchasesChart;
