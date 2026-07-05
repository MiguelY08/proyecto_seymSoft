// features/administrtivePanel/purchases/nonConformingProducts/pages/NonConformingProducts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import NonConformingProductsTable from "../components/NonConformingProductsTable";
import FormNonConformingProduct from "./FormNonConformingProduct";
import ViewDetailsPN from "./ViewDetailsPN";
import { PurchasesFilters } from "../../../../shared/DateFilter";
import { Plus, FileSpreadsheet } from "lucide-react";
import { getNonConforming, cancelNonConforming } from "../data/nonConformingService";
import Spinner from "../../../../shared/spinner"; // ← IMPORTAR SPINNER
import * as XLSX from "xlsx";
import { normalizeBarcode, useBarcodeScanner } from "../../../../shared/scanner";
import Permission from "../../../configuration/roles/components/Permission";

const NON_CONFORMING_SEARCH_SCANNER_FIELD = "non-conforming-product-search";

const findReportByBarcode = (reports, barcode) =>
  reports.find(
    (report) => normalizeBarcode(report.codigoBarras, { numericOnly: true }) === barcode
  );

export const NonConformingProducts = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const { showConfirm, showSuccess, showError, showInfo } = useAlert();

  const handleScannedReportSearch = useCallback(async (code) => {
    const normalizedCode = normalizeBarcode(code, { numericOnly: true });
    setSearch(normalizedCode);
    setCurrentPage(1);

    const localReport = findReportByBarcode(reports, normalizedCode);
    if (localReport) {
      setSelectedReport(localReport);
      return;
    }

    try {
      const result = await getNonConforming({
        page: 1,
        limit: 13,
        search: normalizedCode,
        startDate: fechaInicial,
        endDate: fechaFinal,
      });

      setReports(result.data);
      setPagination(result.pagination);

      const matchedReport = findReportByBarcode(result.data, normalizedCode);
      if (matchedReport) {
        setSelectedReport(matchedReport);
        return;
      }

      showError(
        "Codigo no registrado",
        `No se encontro ningun reporte con el codigo de barras ${normalizedCode}.`
      );
    } catch (err) {
      showError("Error", err.message || "No se pudo buscar el reporte.");
    }
  }, [fechaFinal, fechaInicial, reports, showError]);

  useBarcodeScanner({
    enabled: !showModal,
    numericOnly: true,
    minLength: 6,
    maxLength: 20,
    scannerFields: [NON_CONFORMING_SEARCH_SCANNER_FIELD],
    duplicateDelayMs: 800,
    preventDefault: false,
    onScan: ({ code, scannerField }) => {
      if (scannerField !== NON_CONFORMING_SEARCH_SCANNER_FIELD) return;
      handleScannedReportSearch(code);
    },
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getNonConforming({
        page: currentPage,
        limit: 13,
        search,
        startDate: fechaInicial,
        endDate: fechaFinal,
      });
      setReports(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError("Error al cargar reportes");
      showError("Error", err.message || "No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, fechaInicial, fechaFinal, showError]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleCancel = async (id) => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    if (report.estado === "Anulado") {
      showInfo("Ya anulado", "Este reporte ya se encuentra anulado.");
      return;
    }
    const result = await showConfirm(
      "warning",
      "Anular reporte",
      `¿Deseas anular el reporte de "${report.nombre}"?`,
      { confirmButtonText: "Sí, anular", cancelButtonText: "Cancelar" }
    );
    if (!result?.isConfirmed) return;

    try {
      await cancelNonConforming(id, "Anulado por el usuario");
      await fetchReports();
      showSuccess("Anulado", "El reporte fue anulado correctamente.");
    } catch (err) {
      showError("Error", err.message || "No se pudo anular el reporte.");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setFechaInicial("");
    setFechaFinal("");
    setCurrentPage(1);
    showSuccess("Filtros limpiados", "Todos los filtros han sido eliminados");
  };

  const handleDownloadExcel = () => {
    if (reports.length === 0) {
      showInfo("Sin datos", "No hay reportes para exportar.");
      return;
    }

    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
      const formattedDateTime = currentDate.toLocaleString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

      const titleRow = [["PRODUCTOS NO CONFORMES"]];
      const dateRow = [[`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`]];
      const emptyRow = [[""]];

      const summaryHeaders = ["Nombre", "Código de Barras", "Categoría", "Cantidad Afectada", "Fecha Detección", "Motivo", "Estado"];
      const summaryData = reports.map((r) => [
        r.nombre || "",
        r.codigoBarras || "",
        r.categoria || "",
        r.cantidadAfectada || 0,
        r.fechaDeteccion || "",
        r.motivo || "",
        r.estado || "",
      ]);

      const summarySheetData = [...titleRow, ...dateRow, ...emptyRow, [["RESUMEN DE REPORTES"]], ...emptyRow, summaryHeaders, ...summaryData];
      const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
      if (!summaryWs["!merges"]) summaryWs["!merges"] = [];
      summaryWs["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: summaryHeaders.length - 1 } });
      summaryWs["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: summaryHeaders.length - 1 } });
      summaryWs["!merges"].push({ s: { r: 3, c: 0 }, e: { r: 3, c: summaryHeaders.length - 1 } });
      summaryWs["A1"] = { v: "PRODUCTOS NO CONFORMES", t: "s" };
      summaryWs["A2"] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: "s" };
      summaryWs["A4"] = { v: "RESUMEN DE REPORTES", t: "s" };
      summaryWs["!cols"] = [{ wch: 35 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 12 }];

      const totalReportes = reports.length;
      const totalAfectados = reports.reduce((s, r) => s + (Number(r.cantidadAfectada) || 0), 0);
      const activos = reports.filter((r) => r.estado === "Activo").length;
      const anulados = reports.filter((r) => r.estado === "Anulado").length;
      const porCategoria = reports.reduce((acc, r) => {
        const cat = r.categoria || "Sin categoría";
        acc[cat] = (acc[cat] || 0) + (Number(r.cantidadAfectada) || 0);
        return acc;
      }, {});

      const statsHeaders = ["Métrica", "Valor"];
      const statsData = [
        ["Total Reportes", totalReportes],
        ["Total Unidades Afectadas", totalAfectados],
        ["Promedio Afectados por Reporte", totalReportes > 0 ? (totalAfectados / totalReportes).toFixed(2) : 0],
        [""],
        ["Reportes Activos", activos],
        ["Reportes Anulados", anulados],
        [""],
        ["— Unidades afectadas por categoría —", ""],
        ...Object.entries(porCategoria).map(([cat, total]) => [cat, total]),
        [""],
        ["Fecha de Exportación", formattedDateTime],
      ];

      const statsSheetData = [...titleRow, ...dateRow, ...emptyRow, [["ESTADÍSTICAS"]], ...emptyRow, statsHeaders, ...statsData];
      const statsWs = XLSX.utils.aoa_to_sheet(statsSheetData);
      if (!statsWs["!merges"]) statsWs["!merges"] = [];
      statsWs["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
      statsWs["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } });
      statsWs["!merges"].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 1 } });
      statsWs["A1"] = { v: "PRODUCTOS NO CONFORMES", t: "s" };
      statsWs["A2"] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: "s" };
      statsWs["A4"] = { v: "ESTADÍSTICAS", t: "s" };
      statsWs["!cols"] = [{ wch: 35 }, { wch: 20 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen Reportes");
      XLSX.utils.book_append_sheet(wb, statsWs, "Estadísticas");
      XLSX.writeFile(wb, `productos_no_conformes_${new Date().toISOString().split("T")[0]}.xlsx`);

      showSuccess("Exportación exitosa", "El archivo Excel se generó correctamente");
    } catch {
      showError("Error", "No se pudo exportar el archivo");
    }
  };

  const highlightText = (text = "") => {
    if (!search) return text;
    const safeText = String(text);
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safeSearch})`, "gi");
    return safeText.split(regex).map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={index} className="bg-[#004d7726] text-[#004D77] rounded px-1 font-semibold">{part}</span>
      ) : part
    );
  };

  const totalPages = pagination.totalPages || 1;
  const startIndex = (currentPage - 1) * 13;
  const endIndex = startIndex + 13;
  const currentData = reports;

  // ✅ USAR SPINNER IGUAL QUE EN LAS DEMÁS PÁGINAS
  if (loading && reports.length === 0) {
    return <Spinner message="Cargando reportes..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-3">
          <PurchasesFilters
            search={search}
            setSearch={setSearch}
            fechaInicial={fechaInicial}
            setFechaInicial={setFechaInicial}
            fechaFinal={fechaFinal}
            setFechaFinal={setFechaFinal}
            setCurrentPage={setCurrentPage}
            onClearFilters={handleClearFilters}
            searchScannerField={NON_CONFORMING_SEARCH_SCANNER_FIELD}
          />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Permission permission="producto_no_conforme.exportar">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-green-600 rounded-lg text-green-600 bg-white hover:bg-green-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            </Permission>
            <Permission permission="producto_no_conforme.crear">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold border border-[#004D77] rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Crear Reporte</span>
              <span className="sm:hidden">Nuevo</span>
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
            </Permission>
          </div>
        </div>

        {!loading && !error && reports.length > 0 && (
          <NonConformingProductsTable
            currentData={currentData}
            filteredReports={reports}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            handleCancel={handleCancel}
            highlightText={highlightText}
            handleViewDetails={(report) => setSelectedReport(report)}
          />
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay reportes de productos no conformes.</div>
        )}
      </div>

      {showModal && (
        <FormNonConformingProduct 
          onClose={() => setShowModal(false)} 
          onSuccess={fetchReports}
        />
      )}
      {selectedReport && (
        <ViewDetailsPN report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </>
  );
};

export default NonConformingProducts;
