// features/administrtivePanel/purchases/nonConformingProducts/pages/NonConformingProducts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import NonConformingProductsTable from "../components/NonConformingProductsTable";
import FormNonConformingProduct from "./FormNonConformingProduct";
import ViewDetailsPN from "./ViewDetailsPN";
import { PurchasesFilters } from "../../../../shared/DateFilter";
import { Plus, FileSpreadsheet } from "lucide-react";
import { getNonConforming, cancelNonConforming } from "../data/nonConformingService";
import Spinner from "../../../../shared/spinner";
import { normalizeBarcode, useBarcodeScanner } from "../../../../shared/scanner";
import Permission from "../../../configuration/roles/components/Permission";
import { exportStyledWorkbook } from "../../../../shared/excel/exportStyledWorkbook";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";
import PaginationAdmin from "../../../../shared/PaginationAdmin";

const NON_CONFORMING_SEARCH_SCANNER_FIELD = "non-conforming-product-search";
const RECORDS_PER_PAGE = 11;
const SEARCH_FETCH_LIMIT = 100;

const normalizeSearchValue = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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

  const { showConfirm, showSuccess, showError, showInfo } = useAlert();

  const handleScannedReportSearch = useCallback((code) => {
    const normalizedCode = normalizeBarcode(code, { numericOnly: true });
    setSearch(normalizedCode);
    setCurrentPage(1);

    const localReport = findReportByBarcode(reports, normalizedCode);
    if (localReport) {
      setSelectedReport(localReport);
      return;
    }

    showError(
      "Código no registrado",
      `No se encontró ningún reporte con el código de barras ${normalizedCode}.`
    );
  }, [reports, showError]);

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
      const firstPage = await getNonConforming({
        page: 1,
        limit: SEARCH_FETCH_LIMIT,
        startDate: fechaInicial,
        endDate: fechaFinal,
      });
      const allReports = [...firstPage.data];

      for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
        const nextPage = await getNonConforming({
          page,
          limit: SEARCH_FETCH_LIMIT,
          startDate: fechaInicial,
          endDate: fechaFinal,
        });
        allReports.push(...nextPage.data);
      }

      setReports(allReports);
    } catch (err) {
      setError("Error al cargar reportes");
      showError("Error", err.message || "No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal, showError]);

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
      showError(
        "No se puede anular",
        getApiErrorMessage(err, {
          conflictMessage:
            "Este reporte ya fue anulado o tiene movimientos asociados que impiden anularlo.",
          fallback: "No se pudo anular el reporte.",
        })
      );
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setFechaInicial("");
    setFechaFinal("");
    setCurrentPage(1);
    showSuccess("Filtros limpiados", "Todos los filtros han sido eliminados");
  };

  const handleDownloadExcel = async () => {
    if (reports.length === 0) {
      showInfo("Sin datos", "No hay reportes para exportar.");
      return;
    }

    const confirmed = await showConfirm(
      "question",
      "¿Desea descargar productos no conformes?",
      `Se exportarán ${reports.length} reporte${reports.length !== 1 ? "s" : ""} de producto no conforme en formato Excel.`,
      { confirmButtonText: "Descargar", cancelButtonText: "Cancelar" }
    );

    if (!confirmed?.isConfirmed) return;

    try {
      const currentDate = new Date();
      {
      const totalReportes = reports.length;
      const totalAfectados = reports.reduce((s, r) => s + (Number(r.cantidadAfectada) || 0), 0);
      const activos = reports.filter((r) => r.estado === "Activo").length;
      const anulados = reports.filter((r) => r.estado === "Anulado").length;
      const porCategoria = reports.reduce((acc, r) => {
        const cat = r.categoria || "Sin categoría";
        acc[cat] = (acc[cat] || 0) + (Number(r.cantidadAfectada) || 0);
        return acc;
      }, {});

      await exportStyledWorkbook({
        fileName: `productos_no_conformes_${currentDate.toISOString().split("T")[0]}.xlsx`,
        title: "PRODUCTO NO CONFORME",
        sheets: [
          {
            name: "Resumen Reportes",
            columns: [
              { header: "Nombre", key: "nombre", width: 35 },
              { header: "Código de barras", key: "codigoBarras", width: 20 },
              { header: "Categoría", key: "categoria", width: 24 },
              { header: "Cantidad afectada", key: "cantidadAfectada", width: 18 },
              { header: "Fecha detección", key: "fechaDeteccion", width: 18 },
              { header: "Motivo", key: "motivo", width: 45 },
              { header: "Estado", key: "estado", width: 16 },
            ],
            rows: reports.map((r) => ({
              nombre: r.nombre || "",
              codigoBarras: r.codigoBarras || "",
              categoria: r.categoria || "",
              cantidadAfectada: r.cantidadAfectada || 0,
              fechaDeteccion: r.fechaDeteccion || "",
              motivo: r.motivo || "",
              estado: r.estado || "",
            })),
          },
          {
            name: "Estadísticas",
            columns: [
              { header: "Métrica", key: "metric", width: 42 },
              { header: "Valor", key: "value", width: 28 },
            ],
            rows: [
              { metric: "Total reportes", value: totalReportes },
              { metric: "Total unidades afectadas", value: totalAfectados },
              {
                metric: "Promedio afectados por reporte",
                value: totalReportes > 0 ? (totalAfectados / totalReportes).toFixed(2) : 0,
              },
              { metric: "Reportes activos", value: activos },
              { metric: "Reportes anulados", value: anulados },
              ...Object.entries(porCategoria).map(([cat, total]) => ({
                metric: `Unidades afectadas - ${cat}`,
                value: total,
              })),
              {
                metric: "Fecha de exportación",
                value: currentDate.toLocaleString("es-CO", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
              },
            ],
          },
        ],
      });


      showSuccess("Exportación exitosa", "El archivo Excel se generó correctamente");
      return;
      }
      const formattedDate = currentDate.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
      const formattedDateTime = currentDate.toLocaleString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

      const titleRow = [["PRODUCTOS NO CONFORMES"]];
      const dateRow = [[`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`]];
      const emptyRow = [[""]];

      const summaryHeaders = ["Nombre", "Código de barras", "Categoría", "Cantidad afectada", "Fecha detección", "Motivo", "Estado"];
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
        ["Fecha de exportación", formattedDateTime],
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

  const filteredReports = reports.filter((report) => {
    const query = normalizeSearchValue(search);
    if (!query) return true;

    return [
      report.id,
      report.nombre,
      report.codigoBarras,
      report.categoria,
      report.cantidadAfectada,
      report.fechaDeteccion,
      report.motivo,
      report.estado,
    ].some((value) => normalizeSearchValue(value).includes(query));
  });

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentData = filteredReports.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  // Mostrar el spinner durante la carga inicial.
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
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden p-3 sm:p-4">
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
              <span className="hidden sm:inline">Nuevo</span>
              <span className="sm:hidden">Nuevo</span>
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
            </Permission>
          </div>
        </div>

        {!loading && !error && (
          <div className="w-full min-w-0 shrink-0 overflow-hidden rounded-xl bg-white shadow-md">
            <NonConformingProductsTable
              currentData={currentData}
              startIndex={startIndex}
              handleCancel={handleCancel}
              highlightText={highlightText}
              handleViewDetails={(report) => setSelectedReport(report)}
            />
          </div>
        )}

        <div className="min-h-0 flex-1" />

        {filteredReports.length > 0 && (
          <div className="shrink-0">
            <PaginationAdmin
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalRecords={filteredReports.length}
              recordsPerPage={RECORDS_PER_PAGE}
            />
          </div>
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
