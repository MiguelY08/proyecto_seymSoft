import { useMemo, useState } from "react";
import { BarChart3, FileSpreadsheet, Info, RotateCcw } from "lucide-react";

import DashboardStats from "../components/DashboardStats";
import MonthlySalesReturnsChart from "../components/MonthlySalesReturnsChart";
import SalesPurchasesChart from "../components/SalesPurchasesChart";
import CategoryDemandChart from "../components/CategoryDemandChart";
import TopProductsChart from "../components/TopProductsChart";
import TopClientsChart from "../components/TopClientsChart";

import useBreakpoint from "../hooks/useBreakPoint";
import useIndicators from "../hooks/useIndicators";
import { exportIndicatorsExcel } from "../helpers/indicatorsExcel";

import Spinner from "../../../../shared/spinner/Spinner.jsx";
import Permission from "../../../configuration/roles/components/Permission";
import { useAlert } from "../../../../shared/alerts/useAlert";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CO");
};

const hasMetricsData = (indicators) => {
  const trendTotal = (indicators?.commercialTrends || []).reduce(
    (total, item) =>
      total +
      Number(item.sales || 0) +
      Number(item.purchases || 0) +
      Number(item.returns || 0),
    0
  );
  const topProductsTotal =
    (indicators?.topProducts?.quantity || []).length +
    (indicators?.topProducts?.price || []).length;
  const categoriesTotal = (indicators?.categoryDemand || []).length;
  const clientsTotal = (indicators?.topClients || []).length;

  return trendTotal > 0 || topProductsTotal > 0 || categoriesTotal > 0 || clientsTotal > 0;
};

function DashboardFilters({
  isMobile,
  filters,
  onChange,
  onClear,
  onExport,
  exporting,
}) {
  const inputStyle = {
    height: "46px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "0 14px",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
    minWidth: isMobile ? "100%" : "190px",
  };

  const buttonStyle = {
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #004D77",
    background: "#fff",
    color: "#004D77",
    fontWeight: 700,
    padding: isMobile ? "0 14px" : "0 18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    minWidth: isMobile ? "100%" : "150px",
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        padding: "14px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "10px",
          alignItems: isMobile ? "stretch" : "end",
        }}
      >
        <label style={{ display: "grid", gap: "5px", color: "#475569", fontWeight: 600, fontSize: "12px" }}>
          Fecha inicial
          <input
            type="date"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={(event) => onChange("startDate", event.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: "5px", color: "#475569", fontWeight: 600, fontSize: "12px" }}>
          Fecha final
          <input
            type="date"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={(event) => onChange("endDate", event.target.value)}
            style={inputStyle}
          />
        </label>
        {(filters.startDate || filters.endDate) && (
          <button
            type="button"
            onClick={onClear}
            style={{
              ...buttonStyle,
              minWidth: isMobile ? "100%" : "120px",
              borderColor: "#cbd5e1",
              color: "#475569",
            }}
          >
            <RotateCcw size={17} /> Limpiar
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        style={{
          ...buttonStyle,
          borderColor: "#00a84f",
          color: "#00a84f",
          opacity: exporting ? 0.7 : 1,
        }}
      >
        <FileSpreadsheet size={18} />
        {exporting ? "Exportando..." : "Exportar Excel"}
      </button>
    </div>
  );
}

function MetricsAlert({ firstMetricDate }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        border: "1px solid #bfdbfe",
        background: "#eff6ff",
        color: "#1d4ed8",
        borderRadius: "14px",
        padding: "12px 14px",
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      <Info size={19} />
      <span>Las primeras métricas disponibles son desde el {formatDate(firstMetricDate)}.</span>
    </div>
  );
}

function EmptyMetricsState({ firstMetricDate, range, selectedBeforeFirstMetric }) {
  const hasRange = Boolean(range?.startDate && range?.endDate);
  const description = selectedBeforeFirstMetric && firstMetricDate
    ? `Las métricas registradas comienzan desde el ${formatDate(firstMetricDate)}. Ajusta la fecha inicial para consultar información real del dashboard.`
    : hasRange
      ? `No se encontraron ventas, compras, devoluciones, productos, categorías ni clientes destacados entre el ${formatDate(range.startDate)} y el ${formatDate(range.endDate)}.`
      : "Aún no hay información registrada para construir métricas del dashboard.";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        minHeight: "420px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "32px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: "92px",
          height: "92px",
          borderRadius: "999px",
          background: "#e8f1f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#76a9c3",
          marginBottom: "18px",
        }}
      >
        <BarChart3 size={42} strokeWidth={1.7} />
      </div>
      <h3 style={{ margin: 0, fontSize: "20px", color: "#334155", fontWeight: 800 }}>
        Sin métricas para este rango
      </h3>
      <p style={{ margin: "10px 0 0", color: "#94a3b8", maxWidth: "520px", lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
}

function IndicatorsPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const { showSuccess, showError } = useAlert();
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [exporting, setExporting] = useState(false);

  const appliedFilters = useMemo(
    () => (filters.startDate && filters.endDate ? filters : {}),
    [filters]
  );
  const hasDateFilter = Boolean(appliedFilters.startDate && appliedFilters.endDate);

  const {
    indicators,
    loading,
    error,
  } = useIndicators(appliedFilters);

  const firstMetricDate = indicators?.meta?.firstMetricDate;
  const selectedBeforeFirstMetric = Boolean(
    hasDateFilter &&
      firstMetricDate &&
      filters.startDate &&
      filters.startDate < firstMetricDate
  );
  const emptyRange = Boolean(hasDateFilter && indicators && !hasMetricsData(indicators));

  const row2Cols = isMobile ? "1fr" : "1fr 1fr";
  const row3Cols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "2fr 1fr";

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({ startDate: "", endDate: "" });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const success = await exportIndicatorsExcel(indicators, appliedFilters);
      if (success) {
        showSuccess("Excel generado", "Las métricas del dashboard se exportaron correctamente.");
      }
    } catch {
      showError("Error", "No se pudo exportar el Excel del dashboard.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <Spinner message="Cargando indicadores..." />;
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

  return (
    <Permission permission="dashboard.ver">
      <div
        style={{
          padding: isMobile ? "12px" : "16px",
          fontFamily: "'Geist', 'DM Sans', 'Segoe UI', system-ui, sans-serif",
          boxSizing: "border-box",
          width: "100%",
          minHeight: "100%",
          background: "#f0f4f8",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <DashboardFilters
          isMobile={isMobile}
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          onExport={handleExport}
          exporting={exporting}
        />

        {selectedBeforeFirstMetric && (
          <MetricsAlert firstMetricDate={firstMetricDate} />
        )}

        {emptyRange ? (
          <EmptyMetricsState
            firstMetricDate={firstMetricDate}
            range={appliedFilters}
            selectedBeforeFirstMetric={selectedBeforeFirstMetric}
          />
        ) : (
          <>
            <DashboardStats
              monthlySales={indicators?.monthlySales}
              stock={indicators?.stock}
              activeClients={indicators?.activeClients}
              salesLabel={hasDateFilter ? "Ventas del periodo" : "Ventas del mes"}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: row2Cols,
                gap: "12px",
              }}
            >
              <SalesPurchasesChart data={indicators?.commercialTrends} />
              <MonthlySalesReturnsChart data={indicators?.commercialTrends} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: row3Cols,
                gap: "12px",
              }}
            >
              <TopProductsChart
                quantityProducts={indicators?.topProducts?.quantity || []}
                priceProducts={indicators?.topProducts?.price || []}
              />

              <CategoryDemandChart data={indicators?.categoryDemand} />
            </div>

            <TopClientsChart clients={indicators?.topClients} />
          </>
        )}
      </div>
    </Permission>
  );
}

export default IndicatorsPage;
