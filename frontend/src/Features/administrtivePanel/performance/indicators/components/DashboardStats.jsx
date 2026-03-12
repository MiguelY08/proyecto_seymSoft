import { ShoppingCart, Users, Package } from "lucide-react";
import useBreakpoint from "../hooks/useBreakpoint";

const stats = [
  {
    icon:      ShoppingCart,
    value:     "$45.2M",
    label:     "Ventas del mes",
    iconColor: "#2563eb",
    iconBg:    "rgba(37,99,235,0.1)",
    trend:     "+8.2%",
    trendUp:   true,
  },
  {
    icon:      Users,
    value:     "324",
    label:     "Clientes activos",
    iconColor: "#059669",
    iconBg:    "rgba(5,150,105,0.1)",
    trend:     "+3.1%",
    trendUp:   true,
  },
  {
    icon:      Package,
    value:     "1,847",
    label:     "Productos en stock",
    iconColor: "#7c3aed",
    iconBg:    "rgba(124,58,237,0.1)",
    trend:     "-0.5%",
    trendUp:   false,
  },
];

const StatCard = ({ icon: Icon, value, label, iconColor, iconBg, trend, trendUp }) => (
  <div style={{
    background:    "#ffffff",
    borderRadius:  "14px",
    boxShadow:     "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
    padding:       "18px 20px",
    display:       "flex",
    flexDirection: "column",
    gap:           "12px",
    flex:           1,
    minWidth:      "0",
  }}>

    {/* Fila 1 – Icono + Label */}
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{
        background:     iconBg,
        borderRadius:   "10px",
        width:          "34px",
        height:         "34px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:      0,
      }}>
        <Icon size={18} color={iconColor} strokeWidth={1.8} />
      </div>
      <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
        {label}
      </span>
    </div>

    {/* Fila 2 – Valor + Tendencia */}
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px" }}>
      <span style={{
        fontSize:      "28px",
        fontWeight:    "700",
        color:         "#0f172a",
        lineHeight:     1,
        letterSpacing: "-0.02em",
      }}>
        {value}
      </span>
      <span style={{
        fontSize:     "13px",
        fontWeight:   "600",
        color:         trendUp ? "#059669" : "#dc2626",
        background:    trendUp ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)",
        borderRadius:  "8px",
        padding:       "4px 10px",
        flexShrink:     0,
        marginBottom:  "2px",
      }}>
        {trend}
      </span>
    </div>

  </div>
);

function DashboardStats() {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap:                 "12px",
    }}>
      {stats.map(s => <StatCard key={s.label} {...s} />)}
    </div>
  );
}

export default DashboardStats;