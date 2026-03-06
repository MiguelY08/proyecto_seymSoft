import { ShoppingCart, Users, Package } from "lucide-react";

const StatCard = ({ icon: Icon, value, label, iconColor, iconBg }) => (
  <div style={{
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(8px)",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
    minWidth: "140px",
  }}>
    <div style={{ background: iconBg, borderRadius: "11px", padding: "11px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={22} color={iconColor} strokeWidth={1.8} />
    </div>
    <div>
      <div style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#5a6a7e", marginTop: "3px", fontWeight: "500" }}>{label}</div>
    </div>
  </div>
);

function DashboardStats() {
  return (
    <div style={{
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 16px rgba(30,90,180,0.13)",
      background: "linear-gradient(120deg, #b8d9f8 0%, #deeffe 35%, #7ec8f0 65%, #1e4fa0 100%)",
      padding: "20px 20px",
      position: "relative",
    }}>
      <svg viewBox="0 0 1200 160" preserveAspectRatio="none"
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", opacity: 0.18, pointerEvents: "none" }}>
        <path d="M0,80 C200,140 400,20 600,80 C800,140 1000,20 1200,80 L1200,160 L0,160 Z" fill="white" />
        <path d="M0,100 C300,40 600,160 900,80 C1050,40 1150,100 1200,90 L1200,160 L0,160 Z" fill="white" opacity="0.5" />
        <path d="M0,120 C150,80 350,150 600,110 C850,70 1050,140 1200,120 L1200,160 L0,160 Z" fill="#1e4fa0" opacity="0.3" />
      </svg>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        <StatCard icon={ShoppingCart} value="$45.2M" label="Ventas del mes"    iconColor="#3b82f6" iconBg="rgba(239,246,255,0.9)" />
        <StatCard icon={Users}        value="324"    label="Clientes activos"   iconColor="#10b981" iconBg="rgba(236,253,245,0.9)" />
        <StatCard icon={Package}      value="1,847"  label="Productos en stock" iconColor="#3b82f6" iconBg="rgba(245,243,255,0.9)" />
      </div>
    </div>
  );
}

export default DashboardStats;
