import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const axTick = { fontSize: 11, fill: "#8a94a6" };

const card = {
  background: "white", borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  padding: "8px 10px", flex: 1, minWidth: "200px",
};

const monthlySalesData = [
  { mes: "Ene", ventas: 42, devoluciones: 8  },
  { mes: "Feb", ventas: 45, devoluciones: 7  },
  { mes: "Mar", ventas: 43, devoluciones: 9  },
  { mes: "Abr", ventas: 40, devoluciones: 8  },
  { mes: "May", ventas: 47, devoluciones: 10 },
  { mes: "Jun", ventas: 52, devoluciones: 11 },
  { mes: "Jul", ventas: 49, devoluciones: 10 },
  { mes: "Ago", ventas: 48, devoluciones: 9  },
  { mes: "Sep", ventas: 46, devoluciones: 10 },
  { mes: "Oct", ventas: 44, devoluciones: 9  },
];

function MonthlySalesReturnsChart() {
  return (
    <div style={card}>
      <h3 style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: "600", color: "#1a1a2e" }}>
        Ventas &amp; Devoluciones mensuales
      </h3>
      <ResponsiveContainer width="100%" height={105}>
        <LineChart data={monthlySalesData} margin={{ top: 4, right: 6, left: -18, bottom: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={axTick} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${v}M`} tick={axTick} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip formatter={(v, n) => [`${v}M`, n === "ventas" ? "Ventas" : "Devoluciones"]} />
          <Legend iconType="circle" iconSize={6} formatter={v => v === "ventas" ? "Ventas" : "Devoluciones"} wrapperStyle={{ fontSize: "11px", paddingTop: "0px", lineHeight: "14px" }} />
          <Line type="monotone" dataKey="ventas"       stroke="#0062ff" strokeWidth={1.5} dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="devoluciones" stroke="#ff0000" strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlySalesReturnsChart;
