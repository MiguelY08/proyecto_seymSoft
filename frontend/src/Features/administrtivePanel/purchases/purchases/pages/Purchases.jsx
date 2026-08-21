// features/administrtivePanel/purchases/purchases/pages/Purchases.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
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
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";

// ========== TIPOS DE ORDENAMIENTO ==========
const SORT_OPTIONS = {
  CREATION_DESC: { label: "Creación (nuevo → viejo)", field: "id", order: "desc", icon: Clock },
  CREATION_ASC: { label: "Creación (viejo → nuevo)", field: "id", order: "asc", icon: Clock },
  DATE_DESC: { label: "Fecha compra (nueva → vieja)", field: "purchaseDate", order: "desc", icon: Calendar },
  DATE_ASC: { label: "Fecha compra (vieja → nueva)", field: "purchaseDate", order: "asc", icon: Calendar },
};

const RECORDS_PER_PAGE = 11;
const SEARCH_FETCH_LIMIT = 100;

const normalizeSearchValue = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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
  // ========== NUEVO: Estado para ordenamiento ==========
  const [sortBy, setSortBy] = useState("CREATION_DESC");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortDropdownStyle, setSortDropdownStyle] = useState(null);
  const sortDropdownRef = React.useRef(null);
  const sortDropdownMenuRef = React.useRef(null);
  
  const { showSuccess, showError, showInfo, showConfirm } = useAlert();
  const navigate = useNavigate();

  // ========== Cerrar dropdown al hacer clic fuera ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedTrigger = sortDropdownRef.current?.contains(event.target);
      const clickedMenu = sortDropdownMenuRef.current?.contains(event.target);
      if (!clickedTrigger && !clickedMenu) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateSortDropdownPosition = useCallback(() => {
    const trigger = sortDropdownRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const padding = 8;
    const gap = 8;
    const desiredWidth = 224;
    const maxHeight = 240;
    const width = Math.min(desiredWidth, Math.max(0, viewportWidth - padding * 2));
    const spaceBelow = viewportTop + viewportHeight - rect.bottom - gap;
    const spaceAbove = rect.top - viewportTop - gap;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const height = Math.min(maxHeight, Math.max(0, openUp ? spaceAbove : spaceBelow));
    const minLeft = viewportLeft + padding;
    const maxLeft = viewportLeft + viewportWidth - padding - width;
    const left = Math.min(Math.max(rect.right - width, minLeft), Math.max(minLeft, maxLeft));
    const top = openUp
      ? Math.max(viewportTop + padding, rect.top - height - gap)
      : Math.min(rect.bottom + gap, viewportTop + viewportHeight - padding - height);

    setSortDropdownStyle({ position: "fixed", top, left, width, maxHeight: height, zIndex: 9999 });
  }, []);

  useEffect(() => {
    if (!showSortDropdown) return undefined;

    updateSortDropdownPosition();
    window.addEventListener("resize", updateSortDropdownPosition);
    window.addEventListener("scroll", updateSortDropdownPosition, true);
    window.visualViewport?.addEventListener("resize", updateSortDropdownPosition);
    window.visualViewport?.addEventListener("scroll", updateSortDropdownPosition);

    return () => {
      window.removeEventListener("resize", updateSortDropdownPosition);
      window.removeEventListener("scroll", updateSortDropdownPosition, true);
      window.visualViewport?.removeEventListener("resize", updateSortDropdownPosition);
      window.visualViewport?.removeEventListener("scroll", updateSortDropdownPosition);
    };
  }, [showSortDropdown, updateSortDropdownPosition]);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const firstPage = await getAllPurchases({
        page: 1,
        limit: SEARCH_FETCH_LIMIT,
        startDate: fechaInicial,
        endDate: fechaFinal,
        sortBy,
      });

      const allPurchases = [...firstPage.data];
      for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
        const nextPage = await getAllPurchases({
          page,
          limit: SEARCH_FETCH_LIMIT,
          startDate: fechaInicial,
          endDate: fechaFinal,
          sortBy,
        });
        allPurchases.push(...nextPage.data);
      }

      setProducts(allPurchases);
    } catch (err) {
      showError("Error", err.message || "No se pudieron cargar las compras.");
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal, sortBy, showError]);

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
      showError(
        "No se puede anular",
        getApiErrorMessage(err, {
          conflictMessage:
            "Esta compra tiene devoluciones, productos no conformes u otros movimientos asociados y no puede anularse.",
          fallback: "No se pudo anular la compra.",
        })
      );
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
      const confirmed = await showConfirm(
        "question",
        "Desea descargar las compras?",
        `Se exportaran ${products.length} compra${products.length !== 1 ? "s" : ""} en formato Excel.`,
        { confirmButtonText: "Descargar", cancelButtonText: "Cancelar" }
      );

      if (!confirmed?.isConfirmed) return;

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

  const filteredPurchases = useMemo(() => {
    const query = normalizeSearchValue(search);
    if (!query) return products;

    return products.filter((purchase) => [
      purchase.id,
      purchase.numeroFacturacion,
      purchase.fechaCompra,
      purchase.proveedor,
      purchase.cantidadProductos,
      purchase.precioTotal,
      purchase.maxReturnDate,
      purchase.estado,
    ].some((value) => normalizeSearchValue(value).includes(query)));
  }, [products, search]);

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentData = filteredPurchases.slice(startIndex, startIndex + RECORDS_PER_PAGE);
  const totalRecords = filteredPurchases.length;
  const isSearching = Boolean(search || fechaInicial || fechaFinal);

  if (loading && products.length === 0) {
    return <Spinner message="Cargando compras..." />;
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-x-hidden overflow-y-auto touch-pan-y p-3 sm:p-4">
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
          
          <div className="flex w-full items-center gap-2 sm:w-auto">
            {/* ========== BOTÓN DE ORDENAMIENTO ========== */}
            <div className="relative flex-1 sm:flex-none" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className={`flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-semibold border rounded-lg transition-all duration-200 whitespace-nowrap sm:w-auto ${
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
              {showSortDropdown && sortDropdownStyle && createPortal(
                <div ref={sortDropdownMenuRef} style={sortDropdownStyle} className="overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
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
                </div>,
                document.body
              )}
            </div>

            <Permission permission="compras.exportar">
              <button
                onClick={handleDownloadExcel}
                className="flex flex-1 items-center justify-center gap-2 px-2 py-2 text-sm font-semibold border border-green-600 rounded-lg text-green-600 bg-white hover:bg-green-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap sm:flex-none sm:px-4"
              >
                <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Exportar Excel</span>
              </button>
            </Permission>
            <Permission permission="compras.crear">
              <Link
                to="/admin/purchases/create"
                className="flex flex-1 items-center justify-center gap-2 px-3 py-2 text-sm font-semibold border border-[#004D77] rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap sm:flex-none sm:px-4"
              >
                <span className="hidden sm:inline">Nueva</span>
                <Plus className="w-4 h-4" strokeWidth={2} />
              </Link>
            </Permission>
          </div>
        </div>

        <div className="w-full min-w-0 shrink-0 overflow-hidden rounded-xl bg-white shadow-md">
          <PurchasesTable
            currentData={currentData}
            handleCancel={handleCancel}
            handleViewDetail={handleViewDetail}
            handleReturn={handleReturn}
            search={search}
            isSearching={isSearching}
          />
        </div>

        <div className="min-h-0 flex-1" />

        {totalRecords > 0 && (
          <div className="shrink-0">
            <PaginationAdmin
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalRecords={totalRecords}
              recordsPerPage={RECORDS_PER_PAGE}
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
