import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { chartCard, cardTitle, axTick, tooltipBox, tooltipLabel, tooltipValue } from "../helpers/indicatorsHelpers";
import useBreakpoint from "../hooks/useBreakpoint";

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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipBox}>
      <p style={tooltipLabel}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ ...tooltipValue, color: p.dataKey === "ventas" ? "#93c5fd" : "#fca5a5" }}>
          {p.dataKey === "ventas" ? "Ventas" : "Devoluciones"}: {p.value}M
        </p>
      ))}
    </div>
  );
};

function MonthlySalesReturnsChart() {
  const { isMobile } = useBreakpoint();
  // Altura más pequeña
  const chartHeight = isMobile ? 140 : 130;
  
  return (
    <div style={{ ...chartCard, padding: "12px" }}>
      <h3 style={{ ...cardTitle, marginBottom: "8px", fontSize: "14px" }}>Ventas &amp; Devoluciones Mensuales</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={monthlySalesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="gradDev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="mes" tick={{ ...axTick, fontSize: "9px" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${v}M`} tick={{ ...axTick, fontSize: "9px" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
          <Tooltip
            content={<CustomTooltip />}
            isAnimationActive={false}
            wrapperStyle={{ transition: "opacity 0.15s ease" }}
          />
          <Legend
            iconType="circle"
            iconSize={6}
            formatter={v => v === "ventas" ? "Ventas" : "Devoluciones"}
            wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }}
          />
          <Area type="monotone" dataKey="ventas"       stroke="#2563eb" strokeWidth={1.5} fill="url(#gradVentas)" dot={false} activeDot={{ r: 3, fill: "#2563eb" }} />
          <Area type="monotone" dataKey="devoluciones" stroke="#ef4444" strokeWidth={1.5} fill="url(#gradDev)"    dot={false} activeDot={{ r: 3, fill: "#ef4444" }} strokeDasharray="5 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlySalesReturnsChart;