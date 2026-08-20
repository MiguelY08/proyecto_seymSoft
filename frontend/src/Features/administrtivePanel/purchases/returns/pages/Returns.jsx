import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAlert } from "../../../../shared/alerts/useAlert";
import PaginationAdmin from "../../../../shared/PaginationAdmin";
import Spinner from "../../../../shared/spinner";
import FullScreenSpinner from "../../../../shared/spinner/FullScreenSpinner";
import PurchaseReturnsMetricsCards from "../components/PurchaseReturnsMetricsCards";
import TopBar from "../components/TopBar";
import ReturnsTable from "../components/ReturnsTable";
import AnnulReturn from "../modals/AnnulReturn";
import ReturnForm from "../modals/ReturnForm";
import ReturnInfo from "../modals/ReturnInfo";
import { PurchaseReturnsService } from "../services/returnsServices";
import { getPurchaseById } from "../../purchases/data/PurchasesService";
import { usePermissions } from "../../../configuration/roles/hooks/usePermissions";

const RECORDS_PER_PAGE = 11;
const RETURNS_FETCH_LIMIT = 100;

const DEFAULT_METRICS = {
  total: 0,
  byStatus: [],
};

const getAvailableReturnQuantity = (product) =>
  Number(
    product?.cantidadDisponibleDevolucion ??
    product?.returnAvailability?.eligibleQuantity ??
    product?.returnAvailability?.availableQuantity ??
    0
  );

const hasReturnableProducts = (purchase) =>
  (purchase?.productos ?? []).some(
    (product) => getAvailableReturnQuantity(product) > 0
  );

function Returns() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning } = useAlert();
  const { hasPermission } = usePermissions();
  const canCreateReturn = hasPermission("devoluciones_en_compras.crear");

  const [returns, setReturns] = useState([]);
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [annulLoading, setAnnulLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnToAnnul, setReturnToAnnul] = useState(null);
  const [returnFormPurchase, setReturnFormPurchase] = useState(null);
  const [returnFormReturn, setReturnFormReturn] = useState(null);
  const [search, setSearch] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const result = await PurchaseReturnsService.getMetrics();
      setMetrics(result ?? DEFAULT_METRICS);
    } catch (error) {
      showError("Error", error.message || "No se pudieron cargar las métricas.");
    } finally {
      setMetricsLoading(false);
    }
  }, [showError]);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const firstPage = await PurchaseReturnsService.getAll({
        page: 1,
        limit: RETURNS_FETCH_LIMIT,
      });
      const allReturns = [...(firstPage.data ?? [])];
      const totalPages = firstPage.pagination?.totalPages ?? 1;

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await PurchaseReturnsService.getAll({
          page,
          limit: RETURNS_FETCH_LIMIT,
        });
        allReturns.push(...(response.data ?? []));
      }

      setReturns(allReturns);
    } catch (error) {
      showError("Error", error.message || "No se pudieron cargar las devoluciones.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  useEffect(() => {
    if (
      location.state?.openReturnForm &&
      location.state?.purchase
    ) {
      if (!canCreateReturn) {
        showError("Sin permiso", "No tienes permiso para crear devoluciones de compras.");
        navigate(location.pathname, { replace: true, state: null });
        return;
      }

      const purchase = location.state.purchase;
      const hasProducts = Array.isArray(purchase?.productos) && purchase.productos.length > 0;

      setReturnFormReturn(null);
      if (hasProducts) {
        if (hasReturnableProducts(purchase)) {
          setReturnFormPurchase(purchase);
        } else {
          showWarning(
            "Sin productos disponibles",
            "Todos los productos de esta compra ya están incluidos en procesos de devolución o no tienen unidades disponibles."
          );
        }
      } else {
        setFormLoading(true);
        getPurchaseById(purchase.id)
          .then((detail) => {
            if (hasReturnableProducts(detail)) {
              setReturnFormPurchase(detail);
              return;
            }

            showWarning(
              "Sin productos disponibles",
              "Todos los productos de esta compra ya están incluidos en procesos de devolución o no tienen unidades disponibles."
            );
          })
          .catch((error) => {
            showError("Error", error.message || "No se pudo cargar la compra para devolver.");
          })
          .finally(() => {
            setFormLoading(false);
          });
      }

      navigate(location.pathname, { replace: true, state: null });
    }
  }, [canCreateReturn, location.pathname, location.state, navigate, showError, showWarning]);

  const handleViewDetail = async (devolucion) => {
    try {
      setDetailLoading(true);
      const detail = await PurchaseReturnsService.getById(devolucion.id);
      setSelectedReturn(detail);
    } catch (error) {
      showError("Error", error.message || "No se pudo cargar el detalle de la devolución.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedReturn(null);
  };

  const handleEdit = async (devolucion) => {
    if (!devolucion?.id || formLoading) return;

    try {
      setFormLoading(true);

      let detail;
      let purchase;
      const purchaseId = devolucion.purchaseId ?? devolucion.purchase?.id;

      if (purchaseId) {
        [detail, purchase] = await Promise.all([
          PurchaseReturnsService.getById(devolucion.id),
          getPurchaseById(purchaseId),
        ]);
      } else {
        detail = await PurchaseReturnsService.getById(devolucion.id);
        const detailPurchaseId = detail?.purchaseId ?? detail?.purchase?.id;

        if (!detailPurchaseId) {
          throw new Error("No se pudo identificar la compra asociada a la devolución.");
        }

        purchase = await getPurchaseById(detailPurchaseId);
      }

      setSelectedReturn(null);
      setReturnFormReturn(detail);
      setReturnFormPurchase(purchase);
    } catch (error) {
      showError(
        "Error",
        error.message || "No se pudo cargar la devolución para editar."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleAnnul = (devolucion) => {
    setReturnToAnnul(devolucion);
  };

  const handleCloseAnnul = () => {
    if (annulLoading) return;
    setReturnToAnnul(null);
  };

  const handleConfirmAnnul = async (motivo) => {
    try {
      setAnnulLoading(true);
      await PurchaseReturnsService.annul(returnToAnnul.id, motivo);
      showSuccess(
        "Devolución anulada",
        "La devolución de compra fue anulada correctamente."
      );
      setReturnToAnnul(null);
      setSelectedReturn(null);
      await Promise.all([fetchReturns(), fetchMetrics()]);
    } catch (error) {
      showError("Error", error.message || "No se pudo anular la devolución.");
    } finally {
      setAnnulLoading(false);
    }
  };

  const handleCloseReturnForm = () => {
    setReturnFormPurchase(null);
    setReturnFormReturn(null);
  };

  const handleReturnFormSaved = async (savedReturn) => {
    if (savedReturn?.id) {
      setReturns((currentReturns) =>
        currentReturns.map((item) =>
          String(item.id) === String(savedReturn.id)
            ? { ...item, ...savedReturn }
            : item
        )
      );
    }

    setSelectedReturn(null);
    setReturnFormPurchase(null);
    setReturnFormReturn(null);
    await Promise.all([fetchReturns(), fetchMetrics()]);
  };

  const filteredReturns = useMemo(() => {
    const normalize = (value) =>
      String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const term = normalize(search);

    return returns.filter((devolucion) => {
      const matchesSearch = !term || [
        devolucion.id,
        devolucion.idCompra,
        devolucion.invoiceNumber,
        devolucion.proveedor,
        devolucion.provider?.name,
        devolucion.fechaDevolucion,
        devolucion.estado,
        devolucion.status,
        devolucion.progress?.label,
        devolucion.totalDetails,
        devolucion.completedDetails,
      ].some((field) => normalize(field).includes(term));

      if (!matchesSearch) return false;
      if (estadoFilter && normalize(devolucion.estado) !== normalize(estadoFilter)) return false;

      const returnDate = String(devolucion.fechaDevolucion ?? "").split("T")[0];
      if (fechaInicial && (!returnDate || returnDate < fechaInicial)) return false;
      if (fechaFinal && (!returnDate || returnDate > fechaFinal)) return false;

      return true;
    });
  }, [returns, search, fechaInicial, fechaFinal, estadoFilter]);

  const totalRecords = filteredReturns.length;
  const visibleReturns = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    return filteredReturns.slice(startIndex, startIndex + RECORDS_PER_PAGE);
  }, [filteredReturns, currentPage]);

  useEffect(() => {
    const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE) || 1;
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalRecords]);

  const handlePageChange = (page) => {
    const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE) || 1;
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const isSearching = Boolean(search || fechaInicial || fechaFinal || estadoFilter);

  if (loading && returns.length === 0) {
    return <Spinner message="Cargando devoluciones..." />;
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-x-hidden overflow-y-auto p-3 sm:p-4">
      <TopBar
        search={search}
        setSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        fechaInicial={fechaInicial}
        setFechaInicial={setFechaInicial}
        fechaFinal={fechaFinal}
        setFechaFinal={setFechaFinal}
        estadoFilter={estadoFilter}
        setEstadoFilter={setEstadoFilter}
        setCurrentPage={setCurrentPage}
        returns={filteredReturns}
      />

      <div className="hidden md:block">
        <PurchaseReturnsMetricsCards metrics={metricsLoading ? DEFAULT_METRICS : metrics} />
      </div>

      <div className="w-full min-w-0 shrink-0 overflow-hidden rounded-xl bg-white shadow-md">
        <ReturnsTable
          currentData={visibleReturns}
          search={search}
          isSearching={isSearching}
          offset={(currentPage - 1) * RECORDS_PER_PAGE}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onAnnul={handleAnnul}
        />
      </div>

      <div className="min-h-0 flex-1" />

      {totalRecords > 0 && (
        <div className="shrink-0">
          <PaginationAdmin
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalRecords={totalRecords}
            recordsPerPage={RECORDS_PER_PAGE}
          />
        </div>
      )}

      {detailLoading && (
        <FullScreenSpinner message="Cargando detalle de la devolución..." />
      )}
      {formLoading && (
        <FullScreenSpinner message="Cargando formulario de devolución..." />
      )}
      {annulLoading && (
        <FullScreenSpinner message="Anulando devolución..." />
      )}

      {selectedReturn && (
        <ReturnInfo
          devolucion={selectedReturn}
          onClose={handleCloseDetail}
          onEdit={handleEdit}
        />
      )}

      {returnToAnnul && (
        <AnnulReturn
          devolucion={returnToAnnul}
          onClose={handleCloseAnnul}
          onConfirm={handleConfirmAnnul}
          loading={annulLoading}
        />
      )}

      {returnFormPurchase && (
        <ReturnForm
          mode={returnFormReturn ? "edit" : "create"}
          purchase={returnFormPurchase}
          devolucion={returnFormReturn}
          onClose={handleCloseReturnForm}
          onSaved={handleReturnFormSaved}
        />
      )}
    </div>
  );
}

export default Returns;
