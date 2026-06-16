import DashboardStats from "../components/DashboardStats";
import MonthlySalesReturnsChart from "../components/MonthlySalesReturnsChart";
import SalesPurchasesChart from "../components/SalesPurchasesChart";
import CategoryDemandChart from "../components/CategoryDemandChart";
import TopProductsChart from "../components/TopProductsChart";

import useBreakpoint from "../hooks/useBreakpoint";
import useIndicators from "../hooks/useIndicators";

import Spinner from "../../../../shared/spinner/Spinner.jsx";

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
      />

      {/* Fila 2 – Datos temporales del compañero */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: row2Cols,
          gap: "12px",
        }}
      >
        <SalesPurchasesChart />
        <MonthlySalesReturnsChart />
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
        <CategoryDemandChart />
      </div>
    </div>
  );
}

export default IndicatorsPage;