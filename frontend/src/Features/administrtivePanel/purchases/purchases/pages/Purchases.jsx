import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PurchasesFilters } from "../../../../shared/DateFilter";
import PurchasesTable from "../Components/TablePurchases";
import { useAlert } from "../../../../shared/alerts/useAlert";
import DetailPurchases from "./DetailPurchases";
import Anulatepurchase from "./Anulatepurchase";
import { Plus, FileSpreadsheet } from "lucide-react";
import { PurchasesDB } from "../services/Purchases.service";
import * as XLSX from "xlsx";

export const Purchases = () => {

  const [products, setProducts] = useState(() => PurchasesDB.list());
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [cancelPurchase, setCancelPurchase] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const { showSuccess, showError, showInfo } = useAlert();
  const alertShownRef = useRef(false);
  const navigate = useNavigate();

  const handleReturn = (compra) => {
    navigate("/admin/purchases/returns-p", {
      state: { openReturnForm: true, purchase: compra },
    });
  };

  const handleCancel = (id) => {
    const compra = products.find((c) => c.id === id);
    if (!compra) return;
    if (compra.estado === "Anulada") {
      showInfo("Compra ya Anulada", "Esta compra ya se encuentra Anulada.");
      return;
    }
    setCancelPurchase(compra);
  };

  const confirmCancelPurchase = (motivo) => {
    try {
      const updated = PurchasesDB.annul(cancelPurchase.id, motivo);
      setProducts(updated);
      showSuccess("Compra Anulada", "La compra fue anulada correctamente.");
    } catch {
      showError("Error", "No se pudo anular la compra.");
    } finally {
      setCancelPurchase(null);
    }
  };

  const handleViewDetail = (purchase) => setSelectedPurchase(purchase);

  const handleClearFilters = () => {
    setSearch("");
    setFechaInicial("");
    setFechaFinal("");
    setCurrentPage(1);
    showSuccess("Filtros limpiados", "Todos los filtros han sido eliminados");
  };

  // 🔥 Exportar Excel — misma estructura que devoluciones
  const handleDownloadExcel = () => {
    if (filteredProducts.length === 0) {
      showInfo("Sin datos", "No hay compras para exportar.");
      return;
    }

    try {
      const currentDate     = new Date();
      const formattedDate   = currentDate.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
      const formattedDateTime = currentDate.toLocaleString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

      const titleRow = [["COMPRAS"]];
      const dateRow  = [[`Fecha de exportación: ${formattedDate} - ${formattedDateTime}`]];
      const emptyRow = [[""]];

      // ── Hoja 1: Resumen ──
      const summaryHeaders = ["No. Facturación", "Fecha Compra", "Proveedor", "Cantidad Productos", "Precio Total", "Estado"];
      const summaryData    = filteredProducts.map((c) => [
        c.numeroFacturacion || "",
        c.fechaCompra       || "",
        c.proveedor         || "",
        c.cantidadProductos || 0,
        c.precioTotal       || 0,
        c.estado            || "",
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

      // ── Hoja 2: Detalle de productos ──
      const productHeaders = ["No. Facturación", "Fecha Compra", "Proveedor", "Producto", "Cantidad", "Precio Unitario", "Total Producto", "Estado"];
      const productData    = [];
      filteredProducts.forEach((c) => {
        const productos = c.productos || [];
        if (productos.length === 0) {
          productData.push([c.numeroFacturacion || "", c.fechaCompra || "", c.proveedor || "", "Sin productos registrados", "", "", "", c.estado || ""]);
        } else {
          productos.forEach((p) => {
            const cantidad   = p.cantidad   || 1;
            const precioUnit = p.precioUnit || 0;
            productData.push([c.numeroFacturacion || "", c.fechaCompra || "", c.proveedor || "", p.nombre || "Producto sin nombre", cantidad, precioUnit, cantidad * precioUnit, c.estado || ""]);
          });
        }
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

      // ── Hoja 3: Estadísticas ──
      const totalCompras   = filteredProducts.length;
      const totalValor     = filteredProducts.reduce((s, c) => s + (Number(c.precioTotal) || 0), 0);
      const totalProductos = filteredProducts.reduce((s, c) => s + (Number(c.cantidadProductos) || 0), 0);
      const completadas    = filteredProducts.filter((c) => c.estado === "Completada").length;
      const anuladas       = filteredProducts.filter((c) => c.estado === "Anulada").length;
      const enProceso      = filteredProducts.filter((c) => c.estado !== "Completada" && c.estado !== "Anulada").length;

      const statsHeaders = ["Métrica", "Valor"];
      const statsData    = [
        ["Total Compras",             totalCompras],
        ["Total Valor Compras",       totalValor],
        ["Total Productos Comprados", totalProductos],
        ["Promedio por Compra",       totalCompras > 0 ? (totalValor / totalCompras).toFixed(2) : 0],
        [""],
        ["Compras Completadas",       completadas],
        ["Compras Anuladas",          anuladas],
        ["Compras en Proceso",        enProceso],
        [""],
        ["Fecha de Exportación",      formattedDateTime],
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
      XLSX.utils.book_append_sheet(wb, statsWs,   "Estadísticas");
      XLSX.writeFile(wb, `compras_${new Date().toISOString().split("T")[0]}.xlsx`);

      showSuccess("Exportación exitosa", "El archivo Excel se generó correctamente");
    } catch {
      showError("Error", "No se pudo exportar el archivo");
    }
  };

  const RECORDS_PER_PAGE = 13;

  const filteredProducts = products.filter((compra) => {
    const textoBusqueda = search.toLowerCase();
    const coincideBusqueda =
      compra.numeroFacturacion?.toLowerCase().includes(textoBusqueda) ||
      compra.proveedor?.toLowerCase().includes(textoBusqueda) ||
      compra.estado?.toLowerCase().includes(textoBusqueda) ||
      compra.cantidadProductos?.toString().includes(textoBusqueda) ||
      compra.precioTotal?.toString().includes(textoBusqueda);
    const fechaCompra       = new Date(compra.fechaCompra);
    const fechaInicioValida = fechaInicial ? fechaCompra >= new Date(fechaInicial) : true;
    const fechaFinValida    = fechaFinal   ? fechaCompra <= new Date(fechaFinal)   : true;
    return coincideBusqueda && fechaInicioValida && fechaFinValida;
  });

  useEffect(() => {
    const hayFiltros = search !== "" || fechaInicial !== "" || fechaFinal !== "";
    if (filteredProducts.length === 0 && hayFiltros && !alertShownRef.current) {
      showInfo("Sin resultados", "No se encontraron compras con los filtros aplicados.");
      alertShownRef.current = true;
    }
    if (filteredProducts.length > 0) alertShownRef.current = false;
  }, [filteredProducts, search, fechaInicial, fechaFinal]);

  useEffect(() => { setCurrentPage(1); }, [search, fechaInicial, fechaFinal]);

  const totalPages  = Math.ceil(filteredProducts.length / RECORDS_PER_PAGE);
  const startIndex  = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex    = startIndex + RECORDS_PER_PAGE;
  const currentData = filteredProducts.slice(startIndex, endIndex);

  return (
    <>
      <div className="h-full flex flex-col gap-0.5 p-3 sm:p-3">

        <div className="flex flex-wrap items-end gap-3 mb-3">
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
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-green-600 rounded-lg text-green-600 bg-white hover:bg-green-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
              aria-label="Exportar a Excel"
            >
              <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <Link
              to="/admin/purchases/create"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold border border-[#004D77] rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Crear Compra</span>
              <Plus className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-gray-500">No hay compras registradas aún.</p>
        )}

        {filteredProducts.length > 0 && (
          <div className="flex-1 overflow-auto min-h-0">
            <PurchasesTable
              currentData={currentData}
              filteredProducts={filteredProducts}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              handleCancel={handleCancel}
              handleViewDetail={handleViewDetail}
              handleReturn={handleReturn}
              search={search}
            />
          </div>
        )}
      </div>

      {selectedPurchase && (
        <DetailPurchases purchase={selectedPurchase} onClose={() => setSelectedPurchase(null)} />
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