// features/administrtivePanel/purchases/purchases/pages/Purchases.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PurchasesFilters } from "../../../../shared/DateFilter";
import PurchasesTable from "../Components/TablePurchases";
import { useAlert } from "../../../../shared/alerts/useAlert";
import DetailPurchases from "../pages/DetailPurchases";
import Anulatepurchase from "../pages/Anulatepurchase";
import { Plus, FileSpreadsheet, ArrowUpDown, Calendar, Clock } from "lucide-react";
import { getAllPurchases, annulPurchase, getPurchaseById } from "../data/PurchasesService";
import Spinner from "../../../../shared/spinner";
import PaginationAdmin from "../../../../shared/PaginationAdmin";
import { exportPurchasesExcel } from "../helpers/purchasesExcel";
import FullScreenSpinner from "../../../../shared/spinner/FullScreenSpinner";
import Permission from "../../../configuration/roles/components/Permission";

// ========== TIPOS DE ORDENAMIENTO ==========
const SORT_OPTIONS = {
  CREATION_DESC: { label: "Creación (nuevo → viejo)", field: "id", order: "desc", icon: Clock },
  CREATION_ASC: { label: "Creación (viejo → nuevo)", field: "id", order: "asc", icon: Clock },
  DATE_DESC: { label: "Fecha compra (nueva → vieja)", field: "purchaseDate", order: "desc", icon: Calendar },
  DATE_ASC: { label: "Fecha compra (vieja → nueva)", field: "purchaseDate", order: "asc", icon: Calendar },
};

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
  // ========== NUEVO: Estado para ordenamiento ==========
  const [sortBy, setSortBy] = useState("CREATION_DESC");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = React.useRef(null);
  
  const { showSuccess, showError, showInfo } = useAlert();
  const navigate = useNavigate();

  // ========== Cerrar dropdown al hacer clic fuera ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllPurchases({
        page: currentPage,
        limit: 13,
        search,
        startDate: fechaInicial,
        endDate: fechaFinal,
        sortBy: sortBy, // ← Enviar orden al backend
      });
      
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      showError("Error", err.message || "No se pudieron cargar las compras.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, fechaInicial, fechaFinal, sortBy, showError]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // ========== Cambiar ordenamiento ==========
  const handleSortChange = (sortKey) => {
    setSortBy(sortKey);
    setShowSortDropdown(false);
    setCurrentPage(1);
  };

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

  // ========== Obtener información del orden actual ==========
  const currentSortOption = SORT_OPTIONS[sortBy] || SORT_OPTIONS.CREATION_DESC;
  const SortIcon = currentSortOption.icon;

  const currentData = products;
  const totalRecords = pagination.total || 0;
  const isSearching = Boolean(search || fechaInicial || fechaFinal);

  if (loading && products.length === 0) {
    return <Spinner message="Cargando compras..." />;
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
          />
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2">
            {/* ========== BOTÓN DE ORDENAMIENTO ========== */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold border rounded-lg transition-all duration-200 whitespace-nowrap ${
                  showSortDropdown
                    ? "border-[#004D77] bg-[#004D77] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#004D77] hover:text-[#004D77]"
                }`}
                title="Ordenar compras"
              >
                <ArrowUpDown className="w-4 h-4" strokeWidth={2} />
                <SortIcon className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="hidden sm:inline">{currentSortOption.label.split('(')[0].trim()}</span>
                <span className="text-[10px] opacity-70 hidden sm:inline">
                  {currentSortOption.label.includes('nuevo') ? '↓' : '↑'}
                </span>
              </button>

              {/* Dropdown de opciones de ordenamiento */}
              {showSortDropdown && (
                <div className="absolute right-0 z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-xl py-1 overflow-hidden">
                  {Object.entries(SORT_OPTIONS).map(([key, option]) => {
                    const Icon = option.icon;
                    const isActive = sortBy === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSortChange(key)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                          isActive
                            ? "bg-[#004D77]/10 text-[#004D77] font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#004D77]" : "text-gray-400"}`} strokeWidth={1.8} />
                        <span className="flex-1 text-left">{option.label}</span>
                        {isActive && (
                          <span className="text-[#004D77] text-xs font-bold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

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

        <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden rounded-xl bg-white shadow-md">
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
          <div className="shrink-0">
            <PaginationAdmin
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalRecords={totalRecords}
              recordsPerPage={13}
            />
          </div>
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