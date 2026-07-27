import React, { useCallback, useEffect, useState } from "react";
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

const RECORDS_PER_PAGE = 13;

const DEFAULT_METRICS = {
  total: 0,
  byStatus: [],
};

function Returns() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: RECORDS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const result = await PurchaseReturnsService.getMetrics();
      setMetrics(result ?? DEFAULT_METRICS);
    } catch (error) {
      showError("Error", error.message || "No se pudieron cargar las metricas.");
    } finally {
      setMetricsLoading(false);
    }
  }, [showError]);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const result = await PurchaseReturnsService.getAll({
        page: currentPage,
        limit: RECORDS_PER_PAGE,
        ...(search.trim() && { search: search.trim() }),
        ...(fechaInicial && { startDate: fechaInicial }),
        ...(fechaFinal && { endDate: fechaFinal }),
      });

      setReturns(result.data ?? []);
      setPagination(result.pagination ?? {
        page: currentPage,
        limit: RECORDS_PER_PAGE,
        total: 0,
        totalPages: 1,
      });
    } catch (error) {
      showError("Error", error.message || "No se pudieron cargar las devoluciones.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, fechaFinal, fechaInicial, search, showError]);

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
        setReturnFormPurchase(purchase);
      } else {
        setFormLoading(true);
        getPurchaseById(purchase.id)
          .then((detail) => {
            setReturnFormPurchase(detail);
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
  }, [canCreateReturn, location.pathname, location.state, navigate, showError]);

  const handleViewDetail = async (devolucion) => {
    try {
      setDetailLoading(true);
      const detail = await PurchaseReturnsService.getById(devolucion.id);
      setSelectedReturn(detail);
    } catch (error) {
      showError("Error", error.message || "No se pudo cargar el detalle de la devolucion.");
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
          throw new Error("No se pudo identificar la compra asociada a la devolucion.");
        }

        purchase = await getPurchaseById(detailPurchaseId);
      }

      setSelectedReturn(null);
      setReturnFormReturn(detail);
      setReturnFormPurchase(purchase);
    } catch (error) {
      showError(
        "Error",
        error.message || "No se pudo cargar la devolucion para editar."
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
        "Devolucion anulada",
        "La devolucion de compra fue anulada correctamente."
      );
      setReturnToAnnul(null);
      setSelectedReturn(null);
      await Promise.all([fetchReturns(), fetchMetrics()]);
    } catch (error) {
      showError("Error", error.message || "No se pudo anular la devolucion.");
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

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination.totalPages || 1)) return;
    setCurrentPage(page);
  };

  const isSearching = pagination.total > 0 && !!(search || fechaInicial || fechaFinal);

  if (loading && returns.length === 0) {
    return <Spinner message="Cargando devoluciones..." />;
  }

  return (
    <div className="h-full min-w-0 flex flex-col gap-4 p-3 sm:p-4">
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
        setCurrentPage={setCurrentPage}
        returns={returns}
      />

      <div className="hidden md:block">
        <PurchaseReturnsMetricsCards metrics={metricsLoading ? DEFAULT_METRICS : metrics} />
      </div>

      <div className="w-full min-w-0 overflow-hidden rounded-xl bg-white shadow-md">
        <ReturnsTable
          currentData={returns}
          search={search}
          isSearching={isSearching}
          offset={(currentPage - 1) * RECORDS_PER_PAGE}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onAnnul={handleAnnul}
        />
      </div>

      {pagination.total > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalRecords={pagination.total}
          recordsPerPage={RECORDS_PER_PAGE}
        />
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
