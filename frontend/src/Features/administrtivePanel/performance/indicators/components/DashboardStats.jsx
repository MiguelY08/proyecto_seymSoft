import { ShoppingCart, Users, Package } from "lucide-react";
import { createElement } from "react";
import useBreakpoint from "../hooks/useBreakpoint";

const StatCard = ({
  icon: Icon,
  value,
  label,
  iconColor,
  iconBg,
  trend,
  trendUp,
}) => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: "14px",
      boxShadow:
        "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      flex: 1,
      minWidth: "0",
    }}
  >
    {/* Fila 1 – Icono + Label */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          background: iconBg,
          borderRadius: "10px",
          width: "34px",
          height: "34px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {createElement(Icon, {
          size: 18,
          color: iconColor,
          strokeWidth: 1.8,
        })}
      </div>

      <span
        style={{
          fontSize: "13px",
          color: "#64748b",
          fontWeight: "500",
        }}
      >
        {label}
      </span>
    </div>

    {/* Fila 2 – Valor + Tendencia */}
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "8px",
      }}
    >
      <span
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#0f172a",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>

      {trend && (
        <span
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: trendUp
              ? "#059669"
              : "#dc2626",
            background: trendUp
              ? "rgba(5,150,105,0.08)"
              : "rgba(220,38,38,0.08)",
            borderRadius: "8px",
            padding: "4px 10px",
            flexShrink: 0,
            marginBottom: "2px",
          }}
        >
          {trend}
        </span>
      )}
    </div>
  </div>
);

function DashboardStats({
  monthlySales,
  stock,
  activeClients = 0,
}) {
  const { isMobile } = useBreakpoint();

  const formatCurrency = (value = 0) => {
    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }
    ).format(value);
  };

  const growth =
    monthlySales?.growthPercentage ?? 0;

  const stats = [
    {
      icon: ShoppingCart,
      value: formatCurrency(
        monthlySales?.currentMonthSales || 0
      ),
      label: "Ventas del mes",
      iconColor: "#2563eb",
      iconBg: "rgba(37,99,235,0.1)",
      trend: `${growth}%`,
      trendUp: growth >= 0,
    },

    {
      icon: Users,
      value: activeClients.toLocaleString("es-CO"),
      label: "Clientes activos",
      iconColor: "#059669",
      iconBg: "rgba(5,150,105,0.1)",
      trend: null,
      trendUp: true,
    },

    {
      icon: Package,
      value: (
        stock?.totalUnitsInStock || 0
      ).toLocaleString("es-CO"),
      label: "Productos en stock",
      iconColor: "#7c3aed",
      iconBg: "rgba(124,58,237,0.1)",
      trend: null,
      trendUp: true,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : "repeat(3, 1fr)",
        gap: "12px",
      }}
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          {...stat}
        />
      ))}
    </div>
  );
}

export default DashboardStats;
