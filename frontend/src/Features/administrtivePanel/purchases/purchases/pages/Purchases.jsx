// features/administrtivePanel/purchases/purchases/pages/Purchases.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PurchasesFilters } from "../../../../shared/DateFilter";
import PurchasesTable from "../Components/TablePurchases";
import { useAlert } from "../../../../shared/alerts/useAlert";
import DetailPurchases from "../pages/DetailPurchases";
import Anulatepurchase from "../pages/Anulatepurchase";
import { Plus, FileSpreadsheet } from "lucide-react";
import { getAllPurchases, annulPurchase, getPurchaseById } from "../data/PurchasesService";
import Spinner from "../../../../shared/spinner"; // ← IMPORTAR SPINNER
import * as XLSX from "xlsx";
import PaginationAdmin from "../../../../shared/PaginationAdmin";
import { exportPurchasesExcel } from "../helpers/purchasesExcel";
import FullScreenSpinner from "../../../../shared/spinner/FullScreenSpinner";
import Permission from "../../../configuration/roles/components/Permission";

export const Purchases = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [cancelPurchase, setCancelPurchase] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [annulLoading, setAnnulLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const { showSuccess, showError, showInfo } = useAlert();
  const navigate = useNavigate();

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllPurchases({
        page: currentPage,
        limit: 13,
        search,
        startDate: fechaInicial,
        endDate: fechaFinal,
      });
      
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      showError("Error", err.message || "No se pudieron cargar las compras.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, fechaInicial, fechaFinal, showError]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleReturn = (compra) => {
    navigate("/admin/purchases/returns-p", {
      state: { openReturnForm: true, purchase: compra },
    });
  };

  const handleCancel = (purchase) => {
    if (purchase.estado === "Anulada") {
      showInfo("Compra ya Anulada", "Esta compra ya se encuentra Anulada.");
      return;
    }
    setCancelPurchase(purchase);
  };

  const confirmCancelPurchase = async (motivo) => {
    try {
      setAnnulLoading(true);
      await annulPurchase(cancelPurchase.id, motivo);
      await fetchPurchases();
      showSuccess("Compra Anulada", "La compra fue anulada correctamente.");
    } catch (err) {
      showError("Error", err.message || "No se pudo anular la compra.");
    } finally {
      setAnnulLoading(false);
      setCancelPurchase(null);
    }
  };

  const handleViewDetail = async (purchase) => {
    try {
      setLoadingDetail(true);
      const detail = await getPurchaseById(purchase.id);
      setSelectedPurchaseDetail(detail);
      setSelectedPurchase(purchase);
    } catch (err) {
      showError("Error", err.message || "No se pudo cargar el detalle de la compra.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedPurchase(null);
    setSelectedPurchaseDetail(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setFechaInicial("");
    setFechaFinal("");
    setCurrentPage(1);
    showSuccess("Filtros limpiados", "Todos los filtros han sido eliminados");
  };

  const handleDownloadExcelLegacy = () => {
    if (products.length === 0) {
      showInfo("Sin datos", "No hay compras para exportar.");
      return;
    }

    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
      const formattedDateTime = currentDate.toLocaleString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

      const titleRow = [["COMPRAS"]];
      const dateRow = [[`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`]];
      const emptyRow = [[""]];

      const summaryHeaders = ["No. Facturación", "Fecha Compra", "Proveedor", "Cantidad Productos", "Precio Total", "Estado"];
      const summaryData = products.map((c) => [
        c.numeroFacturacion || "",
        c.fechaCompra || "",
        c.proveedor || "",
        c.cantidadProductos || 0,
        c.precioTotal || 0,
        c.estado || "",
      ]);

      const summarySheetData = [...titleRow, ...dateRow, ...emptyRow, [["RESUMEN DE COMPRAS"]], ...emptyRow, summaryHeaders, ...summaryData];
      const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
      if (!summaryWs["!merges"]) summaryWs["!merges"] = [];
      summaryWs["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: summaryHeaders.length - 1 } });
      summaryWs["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: summaryHeaders.length - 1 } });
      summaryWs["!merges"].push({ s: { r: 3, c: 0 }, e: { r: 3, c: summaryHeaders.length - 1 } });
      summaryWs["A1"] = { v: "COMPRAS", t: "s" };
      summaryWs["A2"] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: "s" };
      summaryWs["A4"] = { v: "RESUMEN DE COMPRAS", t: "s" };
      summaryWs["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 14 }];

      const productHeaders = ["No. Facturación", "Fecha Compra", "Proveedor", "Producto", "Cantidad", "Precio Unitario", "Total Producto", "Estado"];
      const productData = [];
      products.forEach((c) => {
        productData.push([c.numeroFacturacion || "", c.fechaCompra || "", c.proveedor || "", "Ver detalle para productos", c.cantidadProductos || 0, "", "", c.estado || ""]);
      });

      const productSheetData = [...titleRow, ...dateRow, ...emptyRow, [["DETALLE DE PRODUCTOS"]], ...emptyRow, productHeaders, ...productData];
      const productWs = XLSX.utils.aoa_to_sheet(productSheetData);
      if (!productWs["!merges"]) productWs["!merges"] = [];
      productWs["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: productHeaders.length - 1 } });
      productWs["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: productHeaders.length - 1 } });
      productWs["!merges"].push({ s: { r: 3, c: 0 }, e: { r: 3, c: productHeaders.length - 1 } });
      productWs["A1"] = { v: "COMPRAS", t: "s" };
      productWs["A2"] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: "s" };
      productWs["A4"] = { v: "DETALLE DE PRODUCTOS", t: "s" };
      productWs["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 35 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 14 }];

      const totalCompras = products.length;
      const totalValor = products.reduce((s, c) => s + (Number(c.precioTotal) || 0), 0);
      const totalProductos = products.reduce((s, c) => s + (Number(c.cantidadProductos) || 0), 0);
      const completadas = products.filter((c) => c.estado === "Completada").length;
      const anuladas = products.filter((c) => c.estado === "Anulada").length;
      const enProceso = products.filter((c) => c.estado !== "Completada" && c.estado !== "Anulada").length;

      const statsHeaders = ["Métrica", "Valor"];
      const statsData = [
        ["Total Compras", totalCompras],
        ["Total Valor Compras", totalValor],
        ["Total Productos Comprados", totalProductos],
        ["Promedio por Compra", totalCompras > 0 ? (totalValor / totalCompras).toFixed(2) : 0],
        [""],
        ["Compras Completadas", completadas],
        ["Compras Anuladas", anuladas],
        ["Compras en Proceso", enProceso],
        [""],
        ["Fecha de Exportación", formattedDateTime],
      ];

      const statsSheetData = [...titleRow, ...dateRow, ...emptyRow, [["ESTADÍSTICAS"]], ...emptyRow, statsHeaders, ...statsData];
      const statsWs = XLSX.utils.aoa_to_sheet(statsSheetData);
      if (!statsWs["!merges"]) statsWs["!merges"] = [];
      statsWs["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
      statsWs["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } });
      statsWs["!merges"].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 1 } });
      statsWs["A1"] = { v: "COMPRAS", t: "s" };
      statsWs["A2"] = { v: `Fecha de exportación: ${formattedDate} - ${formattedDateTime}`, t: "s" };
      statsWs["A4"] = { v: "ESTADÍSTICAS", t: "s" };
      statsWs["!cols"] = [{ wch: 28 }, { wch: 20 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen Compras");
      XLSX.utils.book_append_sheet(wb, productWs, "Detalle Productos");
      XLSX.utils.book_append_sheet(wb, statsWs, "Estadísticas");
      XLSX.writeFile(wb, `compras_${new Date().toISOString().split("T")[0]}.xlsx`);

      showSuccess("Exportación exitosa", "El archivo Excel se generó correctamente");
    } catch {
      showError("Error", "No se pudo exportar el archivo");
    }
  };

  const handleDownloadExcel = async () => {
    if (products.length === 0) {
      showInfo("Sin datos", "No hay compras para exportar.");
      return;
    }

    try {
      await exportPurchasesExcel(products);
      showSuccess(
        "Exportación exitosa",
        "El archivo Excel se generó correctamente."
      );
    } catch {
      showError("Error", "No se pudo exportar el archivo.");
    }
  };

  const currentData = products;
  const totalRecords = pagination.total || 0;
  const isSearching = Boolean(search || fechaInicial || fechaFinal);

  if (loading && products.length === 0) {
    return <Spinner message="Cargando compras..." />;
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
          />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Permission permission="compras.exportar">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-green-600 rounded-lg text-green-600 bg-white hover:bg-green-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Exportar Excel</span>
              </button>
            </Permission>
            <Permission permission="compras.crear">
              <Link
                to="/admin/purchases/create"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold border border-[#004D77] rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Nueva</span>
                <Plus className="w-4 h-4" strokeWidth={2} />
              </Link>
            </Permission>
          </div>
        </div>

        <div className="w-full min-w-0 overflow-hidden rounded-xl bg-white shadow-md">
          <PurchasesTable
            currentData={currentData}
            handleCancel={handleCancel}
            handleViewDetail={handleViewDetail}
            handleReturn={handleReturn}
            search={search}
            isSearching={isSearching}
          />
        </div>

        {totalRecords > 0 && (
          <PaginationAdmin
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalRecords={totalRecords}
            recordsPerPage={13}
          />
        )}
      </div>

      {loadingDetail && (
        <FullScreenSpinner message="Cargando detalle de la compra..." />
      )}
      {annulLoading && (
        <FullScreenSpinner message="Anulando compra..." />
      )}

      {selectedPurchaseDetail && (
        <DetailPurchases 
          purchase={selectedPurchaseDetail} 
          onClose={handleCloseDetail}
          loading={loadingDetail}
        />
      )}
      {cancelPurchase && (
        <Anulatepurchase
          purchase={cancelPurchase}
          onClose={() => setCancelPurchase(null)}
          onConfirm={confirmCancelPurchase}
        />
      )}
    </>
  );
};

export default Purchases;


