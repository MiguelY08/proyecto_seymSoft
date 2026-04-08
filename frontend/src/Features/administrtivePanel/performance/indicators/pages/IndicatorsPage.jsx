import DashboardStats           from "../components/DashboardStats";
import MonthlySalesReturnsChart from "../components/MonthlySalesReturnsChart";
import SalesPurchasesChart      from "../components/SalesPurchasesChart";
import CategoryDemandChart      from "../components/CategoryDemandChart";
import TopProductsChart         from "../components/TopProductsChart";
import useBreakpoint             from "../hooks/useBreakpoint";

function IndicatorsPage() {
  const { isMobile, isTablet } = useBreakpoint();

  // Fila 2: en móvil apila, en tablet y desktop lado a lado
  const row2Cols = isMobile ? "1fr" : "1fr 1fr";

  // Fila 3: en móvil apila, en tablet 1fr/1fr, en desktop 2fr/1fr
  const row3Cols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "2fr 1fr";

  return (
    <div style={{
      padding:    isMobile ? "12px" : "16px",
      fontFamily: "'Geist', 'DM Sans', 'Segoe UI', system-ui, sans-serif",
      boxSizing:  "border-box",
      width:      "100%",
      minHeight:  "100%",
      background: "#f0f4f8",
      display:    "flex",
      flexDirection: "column",
      gap:        "12px",
    }}>

      {/* Fila 1 – KPI cards */}
      <DashboardStats />

      {/* Fila 2 – Ventas & Compras | Ventas & Devoluciones */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: row2Cols,
        gap:                 "12px",
        alignItems:          "stretch", // 👈 Esto hace que los hijos ocupen toda la altura
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <SalesPurchasesChart />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <MonthlySalesReturnsChart />
        </div>
      </div>

      {/* Fila 3 – Top Productos | Categorías */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: row3Cols,
        gap:                 "12px",
        alignItems:          "stretch", 
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <TopProductsChart />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <CategoryDemandChart />
        </div>
      </div>

    </div>
  );
}

export default IndicatorsPage;