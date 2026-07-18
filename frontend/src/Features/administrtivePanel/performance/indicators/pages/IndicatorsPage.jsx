import DashboardStats from "../components/DashboardStats";
import MonthlySalesReturnsChart from "../components/MonthlySalesReturnsChart";
import SalesPurchasesChart from "../components/SalesPurchasesChart";
import CategoryDemandChart from "../components/CategoryDemandChart";
import TopProductsChart from "../components/TopProductsChart";
import TopClientsChart from "../components/TopClientsChart";

import useBreakpoint from "../hooks/useBreakPoint";
import useIndicators from "../hooks/useIndicators";

import Spinner from "../../../../shared/spinner/Spinner.jsx";
import Permission from "../../../configuration/roles/components/Permission";

function IndicatorsPage() {
  const { isMobile, isTablet } = useBreakpoint();

  const {
    indicators,
    loading,
    error,
  } = useIndicators();

  if (loading) {
    return (
      <Spinner message="Cargando indicadores..." />
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          color: "#dc2626",
          fontWeight: "600",
        }}
      >
        {error}
      </div>
    );
  }

  // Fila 2: en móvil apila, en tablet y desktop lado a lado
  const row2Cols =
    isMobile ? "1fr" : "1fr 1fr";

  // Fila 3: en móvil apila, en tablet 1fr/1fr, en desktop 2fr/1fr
  const row3Cols =
    isMobile
      ? "1fr"
      : isTablet
      ? "1fr 1fr"
      : "2fr 1fr";

  return (
    <Permission permission="dashboard.ver">
      <div
        style={{
          padding: isMobile ? "12px" : "16px",
          fontFamily:
            "'Geist', 'DM Sans', 'Segoe UI', system-ui, sans-serif",
          boxSizing: "border-box",
          width: "100%",
          minHeight: "100%",
          background: "#f0f4f8",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
      {/* Fila 1 – KPI cards */}
      <DashboardStats
        monthlySales={
          indicators?.monthlySales
        }
        stock={
          indicators?.stock
        }
        activeClients={
          indicators?.activeClients
        }
      />

      {/* Fila 2 – Comparativos mensuales */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: row2Cols,
          gap: "12px",
        }}
      >
        <SalesPurchasesChart
          data={indicators?.commercialTrends}
        />
        <MonthlySalesReturnsChart
          data={indicators?.commercialTrends}
        />
      </div>

      {/* Fila 3 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: row3Cols,
          gap: "12px",
        }}
      >
        <TopProductsChart
          quantityProducts={
            indicators?.topProducts
              ?.quantity || []
          }
          priceProducts={
            indicators?.topProducts
              ?.price || []
          }
        />

        {/* Temporal hasta que el compañero conecte backend */}
        <CategoryDemandChart
          data={indicators?.categoryDemand}
        />
      </div>

      <TopClientsChart
        clients={indicators?.topClients}
      />
      </div>
    </Permission>
  );
}

export default IndicatorsPage;

