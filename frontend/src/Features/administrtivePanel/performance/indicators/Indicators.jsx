import DashboardStats          from "./components/Dashboardstats";
import MonthlySalesReturnsChart from "./components/Monthlysalesreturnschart";
import SalesPurchasesChart      from "./components/Salespurchaseschart";
import CategoryDemandChart      from "./components/Categorydemandchart";
import TopProductsChart         from "./components/Topproductschart";
import TopClientsChart          from "./components/Topclientschart";

function Indicators() {
  return (
    <div style={{
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      boxSizing: "border-box",
      width: "100%",
      minHeight: "100%",
      background: "linear-gradient(160deg, #ffffff 0%, #dbeafe 50%, #93c5fd 100%)",
      borderRadius: "8px",
    }}>

      {/* Row 1 – KPI cards con fondo de olas */}
      <DashboardStats />

      {/* Row 2 – Categorías (izq) + Ventas & Compras (der) */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <CategoryDemandChart />
        <SalesPurchasesChart />
      </div>

      {/* Row 3 – Ventas & Devoluciones mensuales */}
      <MonthlySalesReturnsChart />

      {/* Row 4 – Top products + Top clients */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <TopProductsChart />
        <TopClientsChart />
      </div>

    </div>
  );
}

export default Indicators;
