import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PurchasesFilters } from "../../../../shared/DateFilter";
import PurchasesTable from "../Components/TablePurchases";
import { useAlert } from "../../../../shared/alerts/useAlert";
import DetailPurchases from "./DetailPurchases";
import Anulatepurchase from "./Anulatepurchase";
import { Plus } from "lucide-react";
import { PurchasesDB } from "../services/Purchases.service";

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

  // 🔥 Abrir formulario de devolución para una compra
  const handleReturn = (compra) => {
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
    <div className="px-4 md:px-0 max-w-7xl mx-auto">

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

        <div className="flex justify-end mb-3">
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