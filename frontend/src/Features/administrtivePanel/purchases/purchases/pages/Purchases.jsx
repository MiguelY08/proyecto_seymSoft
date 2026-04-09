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

  // 🔹 Estados principales
  const [products, setProducts] = useState(() => PurchasesDB.list());
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [cancelPurchase, setCancelPurchase] = useState(null);
  // 🔹 Estado del modal
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  // 🔔 Sistema de alertas
  const { showConfirm, showSuccess, showError, showInfo } = useAlert();

  // 🔹 Control para evitar alertas repetidas
  const alertShownRef = useRef(false);

  const navigate = useNavigate();

  // ============================================================
  // 🔥 NUEVA FUNCIÓN: validar si la compra tiene menos de 2 meses
  // ============================================================
  const isWithinReturnPeriod = (compra) => {
    if (!compra || !compra.fechaCompra) return false;
    const fechaCompra = new Date(compra.fechaCompra);
    const hoy = new Date();
    // Diferencia en milisegundos -> días
    const diffTime = hoy - fechaCompra;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    // Permitir devolución solo si han pasado 60 días o menos
    return diffDays <= 60;
  };

  // 🔥 Abrir formulario de devolución para una compra
  const handleReturn = (compra) => {
    // Validar período de 2 meses
    if (!isWithinReturnPeriod(compra)) {
      showError(
        "Período de devolución vencido",
        "Esta compra tiene más de 2 meses. No se puede generar una devolución."
      );
      return;
    }
    navigate("/admin/purchases/returns-p", {
      state: { openReturnForm: true, purchase: compra },
    });
  };

  // 🔥 Anular compra
  const handleCancel = (id) => {
    const compra = products.find((c) => c.id === id);
    if (!compra) return;
    if (compra.estado === "Anulada") {
      showInfo(
        "Compra ya Anulada",
        "Esta compra ya se encuentra Anulada."
      );
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

  const handleViewDetail = (purchase) => {
    setSelectedPurchase(purchase);
  };

  const handleCloseModal = () => {
    setSelectedPurchase(null);
  };

  // 🔥 Exportar Excel
  const handleDownloadExcel = () => {
    if (filteredProducts.length === 0) {
      showInfo("Sin datos", "No hay compras para exportar.");
      return;
    }

    const rows = filteredProducts.map((c) => ({
      "No. Facturación":    c.numeroFacturacion,
      "Fecha Compra":       c.fechaCompra,
      "Proveedor":          c.proveedor,
      "Cantidad Productos": c.cantidadProductos,
      "Precio Total":       c.precioTotal,
      "Estado":             c.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook  = XLSX.utils.book_new();

    worksheet["!cols"] = [
      { wch: 20 }, // No. Facturación
      { wch: 15 }, // Fecha
      { wch: 28 }, // Proveedor
      { wch: 20 }, // Cantidad
      { wch: 16 }, // Precio
      { wch: 14 }, // Estado
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Compras");

    const fecha = new Date()
      .toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })
      .replace(/\//g, "-");

    XLSX.writeFile(workbook, `compras_${fecha}.xlsx`);
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

    const fechaCompra = new Date(compra.fechaCompra);

    const fechaInicioValida = fechaInicial
      ? fechaCompra >= new Date(fechaInicial)
      : true;

    const fechaFinValida = fechaFinal
      ? fechaCompra <= new Date(fechaFinal)
      : true;

    return coincideBusqueda && fechaInicioValida && fechaFinValida;
  });

  // 🔥 Mostrar alerta si no hay resultados
  useEffect(() => {
    const hayFiltrosActivos =
      search !== "" || fechaInicial !== "" || fechaFinal !== "";

    if (
      filteredProducts.length === 0 &&
      hayFiltrosActivos &&
      !alertShownRef.current
    ) {
      showInfo("Sin resultados", "No se encontraron compras con los filtros aplicados.");
      alertShownRef.current = true;
    }

    if (filteredProducts.length > 0) {
      alertShownRef.current = false;
    }
  }, [filteredProducts, search, fechaInicial, fechaFinal]);

  // 🔥 Resetear a página 1 cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fechaInicial, fechaFinal]);

  const totalPages = Math.ceil(filteredProducts.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentData = filteredProducts.slice(startIndex, endIndex);

  return (
    <>
    <div className="h-full flex flex-col gap-0.5 p-3 sm:p-3">

      <div className="flex items-end justify-between">

        <PurchasesFilters
          search={search}
          setSearch={setSearch}
          fechaInicial={fechaInicial}
          setFechaInicial={setFechaInicial}
          fechaFinal={fechaFinal}
          setFechaFinal={setFechaFinal}
          setCurrentPage={setCurrentPage}
        />

        <div className="flex items-center gap-2 mb-3">
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
            <span className="hidden sm:inline">Crear Compra </span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-gray-500">
          No hay compras registradas aún.
        </p>
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
      <DetailPurchases
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
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