import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PurchasesFilters } from "../../../../shared/DateFilter";
import PurchasesTable from "../Components/TablePurchases";
import { useAlert } from "../../../../shared/alerts/useAlert";
import DetailPurchases from "./DetailPurchases";
import Anulatepurchase from "./Anulatepurchase";
import { Plus } from "lucide-react";

export const Purchases = () => {

  // 🔹 Estados principales
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelPurchase, setCancelPurchase] = useState(null);
  // 🔹 Estado del modal
const [selectedPurchase, setSelectedPurchase] = useState(null);
  // 🔔 Sistema de alertas
  const { showConfirm, showSuccess, showError, showInfo } = useAlert();

  // 🔹 Control para evitar alertas repetidas
  const alertShownRef = useRef(false);

  // 🔹 Mock temporal
  const mockPurchases = [
    {
      id: 1,
      numeroFacturacion: "FAC-001",
      fechaCompra: "2026-01-02",
      proveedor: "Papelería Central",
      cantidadProductos: 12,
      precioTotal: 450000,
      estado: "Completada",
    },
    {
      id: 2,
      numeroFacturacion: "FAC-002",
      fechaCompra: "2026-01-05",
      proveedor: "Distribuidora Tech",
      cantidadProductos: 5,
      precioTotal: 1200000,
      estado: "Devuelta",
    },
    {
      id: 3,
      numeroFacturacion: "FAC-003",
      fechaCompra: "2026-01-08",
      proveedor: "Office Supplies SAS",
      cantidadProductos: 20,
      precioTotal: 780000,
      estado: "Completada",
    },
    {
      id: 4,
      numeroFacturacion: "FAC-004",
      fechaCompra: "2026-01-10",
      proveedor: "Importadora Global",
      cantidadProductos: 8,
      precioTotal: 350000,
      estado: "Anulada",
    },
    {
      id: 5,
      numeroFacturacion: "FAC-005",
      fechaCompra: "2026-01-12",
      proveedor: "Papelería Central",
      cantidadProductos: 15,
      precioTotal: 620000,
      estado: "Devuelta",
    },
    {
      id: 6,
      numeroFacturacion: "FAC-006",
      fechaCompra: "2026-01-15",
      proveedor: "Distribuidora Andina",
      cantidadProductos: 7,
      precioTotal: 410000,
      estado: "Completada",
    },
    {
      id: 7,
      numeroFacturacion: "FAC-007",
      fechaCompra: "2026-01-18",
      proveedor: "Insumos Colombia",
      cantidadProductos: 30,
      precioTotal: 1500000,
      estado: "Devuelta",
    },
    {
      id: 8,
      numeroFacturacion: "FAC-008",
      fechaCompra: "2026-01-20",
      proveedor: "Proveedores del Norte",
      cantidadProductos: 9,
      precioTotal: 290000,
      estado: "Completada",
    },
    {
      id: 9,
      numeroFacturacion: "FAC-009",
      fechaCompra: "2026-01-22",
      proveedor: "Papelería Central",
      cantidadProductos: 4,
      precioTotal: 180000,
      estado: "Anulada",
    },
    {
      id: 10,
      numeroFacturacion: "FAC-010",
      fechaCompra: "2026-01-25",
      proveedor: "Distribuidora Tech",
      cantidadProductos: 11,
      precioTotal: 890000,
      estado: "Completada",
    },
    {
      id: 11,
      numeroFacturacion: "FAC-011",
      fechaCompra: "2026-01-27",
      proveedor: "Office Supplies SAS",
      cantidadProductos: 6,
      precioTotal: 260000,
      estado: "Devuelta",
    },
    {
      id: 12,
      numeroFacturacion: "FAC-012",
      fechaCompra: "2026-01-29",
      proveedor: "Importadora Global",
      cantidadProductos: 18,
      precioTotal: 980000,
      estado: "Completada",
    },
    {
      id: 13,
      numeroFacturacion: "FAC-013",
      fechaCompra: "2026-02-01",
      proveedor: "Insumos Colombia",
      cantidadProductos: 14,
      precioTotal: 520000,
      estado: "Devuelta",
    },
    {
      id: 14,
      numeroFacturacion: "FAC-014",
      fechaCompra: "2026-02-03",
      proveedor: "Distribuidora Andina",
      cantidadProductos: 3,
      precioTotal: 150000,
      estado: "Completada",
    },
    {
      id: 15,
      numeroFacturacion: "FAC-015",
      fechaCompra: "2026-02-05",
      proveedor: "Papelería Central",
      cantidadProductos: 22,
      precioTotal: 1350000,
      estado: "Anulada",
    },
    {
      id: 16,
      numeroFacturacion: "FAC-016",
      fechaCompra: "2026-02-07",
      proveedor: "Proveedores del Norte",
      cantidadProductos: 10,
      precioTotal: 430000,
      estado: "Completada",
    },
    {
      id: 17,
      numeroFacturacion: "FAC-017",
      fechaCompra: "2026-02-09",
      proveedor: "Distribuidora Tech",
      cantidadProductos: 13,
      precioTotal: 670000,
      estado: "Devuelta",
    },
    {
      id: 18,
      numeroFacturacion: "FAC-018",
      fechaCompra: "2026-02-11",
      proveedor: "Office Supplies SAS",
      cantidadProductos: 17,
      precioTotal: 910000,
      estado: "Completada",
    },
    {
      id: 19,
      numeroFacturacion: "FAC-019",
      fechaCompra: "2026-02-13",
      proveedor: "Insumos Colombia",
      cantidadProductos: 2,
      precioTotal: 95000,
      estado: "Devuelta",
    },
    {
      id: 20,
      numeroFacturacion: "FAC-020",
      fechaCompra: "2026-02-15",
      proveedor: "Importadora Global",
      cantidadProductos: 19,
      precioTotal: 1100000,
      estado: "Completada",
    },
    {
      id: 21,
      numeroFacturacion: "FAC-021",
      fechaCompra: "2026-02-16",
      proveedor: "Papelería Central",
      cantidadProductos: 16,
      precioTotal: 740000,
      estado: "Anulada",
    },
    {
      id: 22,
      numeroFacturacion: "FAC-022",
      fechaCompra: "2026-02-17",
      proveedor: "Distribuidora Andina",
      cantidadProductos: 12,
      precioTotal: 480000,
      estado: "Completada",
    },
    {
      id: 23,
      numeroFacturacion: "FAC-023",
      fechaCompra: "2026-02-18",
      proveedor: "Proveedores del Norte",
      cantidadProductos: 6,
      precioTotal: 310000,
      estado: "Devuelta",
    },
    {
      id: 24,
      numeroFacturacion: "FAC-024",
      fechaCompra: "2026-02-19",
      proveedor: "Office Supplies SAS",
      cantidadProductos: 21,
      precioTotal: 1420000,
      estado: "Completada",
    },
    {
      id: 25,
      numeroFacturacion: "FAC-025",
      fechaCompra: "2026-02-20",
      proveedor: "Insumos Colombia",
      cantidadProductos: 9,
      precioTotal: 370000,
      estado: "Devuelta",
    },
    {
      id: 26,
      numeroFacturacion: "FAC-026",
      fechaCompra: "2026-02-21",
      proveedor: "Distribuidora Tech",
      cantidadProductos: 25,
      precioTotal: 1680000,
      estado: "Completada",
    },
  ];

  // 🔹 Simulación GET
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setProducts(mockPurchases);

    } catch (err) {
      setError("Error al cargar las compras");
      showError("Error", "No se pudieron cargar las compras.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

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
const confirmCancelPurchase = async (motivo) => {

  try {

    setLoading(true);

    const updated = products.map((compra) =>
      compra.id === cancelPurchase.id
        ? {
            ...compra,
            estado: "Anulada",
            motivoAnulacion: motivo,
            fechaAnulacion: new Date().toISOString().split("T")[0],
          }
        : compra
    );

    setProducts(updated);

    showSuccess(
      "Compra Anulada",
      "La compra fue anulada correctamente."
    );

  } catch (err) {

    showError("Error", "No se pudo anular la compra.");

  } finally {

    setLoading(false);
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
      !loading &&
      !error &&
      filteredProducts.length === 0 &&
      hayFiltrosActivos &&
      !alertShownRef.current
    ) {
      showInfo(
        "Sin resultados",
        "No se encontraron compras con los filtros aplicados."
      );

      alertShownRef.current = true;
    }

    if (filteredProducts.length > 0) {
      alertShownRef.current = false;
    }

  }, [filteredProducts, search, fechaInicial, fechaFinal, loading, error]);

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

      {loading && <p className="text-gray-500">Cargando compras...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && filteredProducts.length === 0 && (
        <p className="text-gray-500">
          No hay compras registradas aún.
        </p>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
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