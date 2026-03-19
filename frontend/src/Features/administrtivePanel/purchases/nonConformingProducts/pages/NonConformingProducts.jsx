import React, { useState, useEffect, useRef } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import NonConformingProductsTable from "../components/NonConformingProductsTable";
import FormNonConformingProduct from "./FormNonConformingProduct";
import { PurchasesFilters } from "../../../../shared/DateFilter";
import { Plus, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import ViewDetailsPN from "./ViewDetailsPN";
import * as XLSX from "xlsx";

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
  const alertShownRef = useRef(false);

  // 🔥 Mock con estado
  const mockReports = [
    { id: 1, nombre: "Cuaderno 100 hojas Prisma", codigoBarras: "0124532", categoria: "Útiles Escolares", cantidadAfectada: 7, fechaDeteccion: "21/10/25", motivo: "Hojas dobladas", estado: "Activo" },
    { id: 2, nombre: "Calculadora Casio", codigoBarras: "1023634", categoria: "Útiles Escolares", cantidadAfectada: 3, fechaDeteccion: "21/10/25", motivo: "Partida", estado: "Activo" },
    { id: 3, nombre: "Resaltadores Stabilo x5", codigoBarras: "4587963", categoria: "Papelería", cantidadAfectada: 5, fechaDeteccion: "20/10/25", motivo: "Secos", estado: "Activo" },
    { id: 4, nombre: "Marcador Permanente Sharpie", codigoBarras: "7745123", categoria: "Papelería", cantidadAfectada: 2, fechaDeteccion: "19/10/25", motivo: "Sin tinta", estado: "Anulado" },
    { id: 5, nombre: "Carpeta Plástica Oficio", codigoBarras: "8896321", categoria: "Oficina", cantidadAfectada: 10, fechaDeteccion: "18/10/25", motivo: "Rota", estado: "Activo" },
    { id: 6, nombre: "Bolígrafos Bic Azul x12", codigoBarras: "6654789", categoria: "Papelería", cantidadAfectada: 4, fechaDeteccion: "17/10/25", motivo: "Tinta corrida", estado: "Activo" },
    { id: 7, nombre: "Regla Metálica 30cm", codigoBarras: "3214789", categoria: "Útiles Escolares", cantidadAfectada: 1, fechaDeteccion: "16/10/25", motivo: "Doblada", estado: "Anulado" },
    { id: 8, nombre: "Corrector Líquido Pelikan", codigoBarras: "9987456", categoria: "Papelería", cantidadAfectada: 6, fechaDeteccion: "15/10/25", motivo: "Derramado", estado: "Activo" },
    { id: 9, nombre: "Tijeras Escolares Punta Roma", codigoBarras: "5478963", categoria: "Útiles Escolares", cantidadAfectada: 2, fechaDeteccion: "14/10/25", motivo: "Sin filo", estado: "Activo" },
    { id: 10, nombre: "Archivador AZ Tamaño Carta", codigoBarras: "7412589", categoria: "Oficina", cantidadAfectada: 8, fechaDeteccion: "13/10/25", motivo: "Anillas dañadas", estado: "Anulado" },
  ];

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setReports(mockReports);
    } catch {
      setError("Error al cargar reportes");
      showError("Error", "No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  // 🔥 Exportar Excel
  const handleDownloadExcel = () => {
    if (filteredReports.length === 0) {
      showInfo("Sin datos", "No hay reportes para exportar.");
      return;
    }

    const rows = filteredReports.map((r) => ({
      "Nombre":            r.nombre,
      "Código de Barras":  r.codigoBarras,
      "Categoría":         r.categoria,
      "Cantidad Afectada": r.cantidadAfectada,
      "Fecha Detección":   r.fechaDeteccion,
      "Motivo":            r.motivo,
      "Estado":            r.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook  = XLSX.utils.book_new();

    worksheet["!cols"] = [
      { wch: 35 }, // Nombre
      { wch: 18 }, // Código
      { wch: 20 }, // Categoría
      { wch: 18 }, // Cantidad
      { wch: 18 }, // Fecha
      { wch: 25 }, // Motivo
      { wch: 12 }, // Estado
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos No Conformes");

    const fecha = new Date()
      .toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })
      .replace(/\//g, "-");

    XLSX.writeFile(workbook, `productos_no_conformes_${fecha}.xlsx`);
  };

  // 🔥 Anular
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

    setReports(reports.map((r) => r.id === id ? { ...r, estado: "Anulado" } : r));
    showSuccess("Anulado", "El reporte fue anulado correctamente.");
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split("/");
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(fullYear, month - 1, day);
  };

  // 🔥 Filtro
  const filteredReports = reports.filter((report) => {
    const matchesSearch = Object.values(report).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
    const reportDate = parseDate(report.fechaDeteccion);
    const startDate  = fechaInicial ? new Date(fechaInicial) : null;
    const endDate    = fechaFinal   ? new Date(fechaFinal)   : null;
    const matchesFecha =
      (!startDate || reportDate >= startDate) &&
      (!endDate   || reportDate <= endDate);
    return matchesSearch && matchesFecha;
  });

  // 🔥 Alerta sin resultados
  useEffect(() => {
    const hayFiltroActivo = search !== "";
    if (!loading && !error && filteredReports.length === 0 && hayFiltroActivo && !alertShownRef.current) {
      showInfo("Sin resultados", "No se encontraron reportes con el filtro aplicado.");
      alertShownRef.current = true;
    }
    if (filteredReports.length > 0) alertShownRef.current = false;
  }, [filteredReports, search, loading, error]);

  // 🔥 Highlight
  const highlightText = (text = "") => {
    if (!search) return text;
    const safeText   = String(text);
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex      = new RegExp(`(${safeSearch})`, "gi");
    return safeText.split(regex).map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={index} className="bg-[#004d7726] text-[#004D77] rounded px-1 font-semibold">{part}</span>
      ) : part
    );
  };

  useEffect(() => { setCurrentPage(1); }, [search]);

  const RECORDS_PER_PAGE = 13;
  const totalPages  = Math.ceil(filteredReports.length / RECORDS_PER_PAGE);
  const startIndex  = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex    = startIndex + RECORDS_PER_PAGE;
  const currentData = filteredReports.slice(startIndex, endIndex);

  return (
    <>
      <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
        <div className="flex items-end justify-between">

          {/* Filtro por fecha */}
          <PurchasesFilters
            search={search}
            setSearch={setSearch}
            fechaInicial={fechaInicial}
            setFechaInicial={setFechaInicial}
            fechaFinal={fechaFinal}
            setFechaFinal={setFechaFinal}
            setCurrentPage={setCurrentPage}
          />

          {/* Botones: Exportar Excel + Crear Reporte */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleDownloadExcel}
             className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-green-600 rounded-lg text-green-600 bg-white hover:bg-green-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
          aria-label="Exportar a Excel"
            >
              <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold border border-[#004D77] rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Crear Reporte</span>
              <span className="sm:hidden">Nuevo</span>
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {!loading && !error && (
          <NonConformingProductsTable
            currentData={currentData}
            filteredReports={filteredReports}
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

        {showModal && (
          <FormNonConformingProduct
            onClose={() => { setShowModal(false); fetchReports(); }}
          />
        )}

        {selectedReport && (
          <ViewDetailsPN
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </div>
    </>
  );
};

export default NonConformingProducts;