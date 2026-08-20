import React from "react";
import { Calendar, Eraser, FileSpreadsheet, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { useAlert } from "../../../../shared/alerts/useAlert";
import ButtonComponent from "../../../../shared/ButtonComponent";
import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";
import { exportPurchaseReturnsExcel } from "../helpers/returnsExcel";
import FormSelect from "../../../../shared/FormSelect";

const RETURN_STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "Pend. envÃ­o", label: "Pend. envÃ­o" },
  { value: "Pend. reemplazo", label: "Pend. reemplazo" },
  { value: "Pend. reembolso", label: "Pend. reembolso" },
  { value: "Listo", label: "Listo" },
  { value: "Anulado", label: "Anulado" },
  { value: "Prov. rechazÃ³", label: "Prov. rechazÃ³" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const dateOnly = String(dateStr).split("T")[0];
  if (!dateOnly.includes("-")) return dateOnly;
  const [year, month, day] = dateOnly.split("-");
  return `${day}/${month}/${year}`;
};

const getProgressLabel = (returnItem) => {
  const progress = returnItem?.progress ?? {};
  return progress.label ?? `${returnItem?.completedDetails ?? progress.completed ?? 0}/${returnItem?.totalDetails ?? progress.total ?? 0}`;
};

function TopBar({
  search,
  setSearch,
  fechaInicial,
  setFechaInicial,
  fechaFinal,
  setFechaFinal,
  estadoFilter,
  setEstadoFilter,
  setCurrentPage,
  returns = [],
}) {
  const { showWarning, showConfirm, showTimer } = useAlert();
  const { hasPermission } = usePermissions();
  const canExport = hasPermission("devoluciones_en_compras.exportar");

  const handleClearFilters = () => {
    setSearch("");
    setFechaInicial("");
    setFechaFinal("");
    setEstadoFilter("");
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const hayFiltrosActivos = Boolean(search || fechaInicial || fechaFinal || estadoFilter);

  const handleDownloadLegacy = () => {
    if (returns.length === 0) {
      showWarning("Sin registros", "No hay devoluciones en la página actual para exportar.");
      return;
    }

    showConfirm(
      "question",
      "Descargar resumen",
      `Se exportarán ${returns.length} devolución${returns.length !== 1 ? "es" : ""} de la página actual.`,
      { confirmButtonText: "Descargar", cancelButtonText: "Cancelar" }
    ).then((result) => {
      if (!result?.isConfirmed) return;

      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedDateTime = currentDate.toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const headers = [
        "N.º de devolución",
        "Factura",
        "Proveedor",
        "Fecha de devolución",
        "Estado",
        "Progreso",
        "Total detalles",
        "Detalles listos",
      ];

      const rows = returns.map((returnItem) => [
        returnItem.id ?? "",
        returnItem.invoiceNumber ?? returnItem.idCompra ?? "",
        returnItem.proveedor ?? returnItem.provider?.name ?? "",
        formatDate(returnItem.creationDate ?? returnItem.fechaDevolucion),
        returnItem.status ?? returnItem.estado ?? "",
        getProgressLabel(returnItem),
        returnItem.totalDetails ?? returnItem.progress?.total ?? 0,
        returnItem.completedDetails ?? returnItem.progress?.completed ?? 0,
      ]);

      const statusTotals = returns.reduce((acc, returnItem) => {
        const status = returnItem.status ?? returnItem.estado ?? "Sin estado";
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      }, {});

      const statsRows = [
        ["Total devoluciones exportadas", returns.length],
        [""],
        ...Object.entries(statusTotals).map(([status, total]) => [status, total]),
        [""],
        ["Fecha de exportacion", formattedDateTime],
      ];

      const wb = XLSX.utils.book_new();

      const summarySheet = XLSX.utils.aoa_to_sheet([
        ["DEVOLUCIONES DE COMPRAS"],
        [`Fecha de exportacion: ${formattedDate} - ${formattedDateTime}`],
        [""],
        ["RESUMEN DE DEVOLUCIONES"],
        [""],
        headers,
        ...rows,
      ]);

      summarySheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: headers.length - 1 } },
      ];
      summarySheet["!cols"] = [
        { wch: 16 },
        { wch: 18 },
        { wch: 24 },
        { wch: 18 },
        { wch: 18 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
      ];

      const statsSheet = XLSX.utils.aoa_to_sheet([
        ["DEVOLUCIONES DE COMPRAS"],
        [`Fecha de exportacion: ${formattedDate} - ${formattedDateTime}`],
        [""],
        ["ESTADISTICAS"],
        [""],
        ["Metrica", "Valor"],
        ...statsRows,
      ]);

      statsSheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
      ];
      statsSheet["!cols"] = [{ wch: 32 }, { wch: 18 }];

      XLSX.utils.book_append_sheet(wb, summarySheet, "Resumen");
      XLSX.utils.book_append_sheet(wb, statsSheet, "Estadisticas");
      XLSX.writeFile(wb, `devoluciones_compras_${currentDate.toISOString().split("T")[0]}.xlsx`);

      showTimer("success", "Descarga completada", "El resumen de devoluciones se generó correctamente.", 4000);
    });
  };

  const handleDownload = async () => {
    if (returns.length === 0) {
      showWarning(
        "Sin registros",
        "No hay devoluciones en la página actual para exportar."
      );
      return;
    }

    const result = await showConfirm(
      "question",
      "Descargar resumen",
      `Se exportarán ${returns.length} devolución${
        returns.length !== 1 ? "es" : ""
      } de la página actual.`,
      { confirmButtonText: "Descargar", cancelButtonText: "Cancelar" }
    );

    if (!result?.isConfirmed) return;

    try {
      await exportPurchaseReturnsExcel(returns);
      showTimer(
        "success",
        "Descarga completada",
        "El resumen de devoluciones se generó correctamente.",
        4000
      );
    } catch {
      showWarning("Error", "No se pudo generar el archivo Excel.");
    }
  };

  return (
    <div className="flex flex-col gap-3 shrink-0 xl:flex-row xl:items-end xl:justify-between">
      <div className="relative w-full min-w-0 xl:flex-1">
        <input
          type="text"
          placeholder="Buscar por devolución, factura, proveedor o estado..."
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="w-full pl-4 pr-10 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          strokeWidth={2}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 xl:ml-4 xl:w-auto xl:justify-end">
        <div className="w-full sm:w-44">
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              strokeWidth={1.8}
            />
            <input
              type="date"
              value={fechaInicial}
              max={fechaFinal || undefined}
              aria-label="Fecha inicial"
              onChange={(event) => {
                setFechaInicial(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-600"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <FormSelect
            value={estadoFilter}
            options={RETURN_STATUS_OPTIONS}
            onChange={(value) => {
              setEstadoFilter(value);
              setCurrentPage(1);
            }}
            placeholder="Estado"
            ariaLabel="Filtrar por estado"
          />
        </div>

        <div className="w-full sm:w-44">
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              strokeWidth={1.8}
            />
            <input
              type="date"
              value={fechaFinal}
              min={fechaInicial || undefined}
              aria-label="Fecha final"
              onChange={(event) => {
                setFechaFinal(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-600"
            />
          </div>
        </div>

        {hayFiltrosActivos && (
          <div className="w-full sm:w-auto">
            <button
              onClick={handleClearFilters}
              className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium border border-gray-400 rounded-lg text-gray-600 bg-white hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 cursor-pointer whitespace-nowrap sm:w-auto"
            >
              <Eraser className="w-4 h-4" strokeWidth={2} />
              <span>Limpiar filtros</span>
            </button>
          </div>
        )}

        {canExport && (
          <ButtonComponent
            className="w-full sm:w-auto bg-white text-green-600 border-green-600 hover:bg-green-400 px-3 flex items-center justify-center gap-2"
            onClick={handleDownload}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </ButtonComponent>
        )}
      </div>
    </div>
  );
}

export default TopBar;
