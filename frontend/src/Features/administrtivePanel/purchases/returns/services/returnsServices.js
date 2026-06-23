import apiClient from "../../../../../setting/apiClient";
import {
  getReturnMethodIdByLabel,
  getReturnReasonIdByLabel,
  getReturnReasonLabelByCode,
  getReturnReasonLabelById,
  getReturnStatusIdByLabel,
} from "../helpers/returnsHelpers";

const formatErrorDetail = (detail) => {
  if (!detail) return "";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.message ?? item?.msg ?? item)
      .filter(Boolean)
      .join(" ");
  }
  if (typeof detail === "object") {
    return Object.values(detail)
      .flat()
      .map((item) => item?.message ?? item?.msg ?? item)
      .filter(Boolean)
      .join(" ");
  }
  return "";
};

const getErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data;
  const detail =
    formatErrorDetail(responseData?.errors) ||
    formatErrorDetail(responseData?.details) ||
    formatErrorDetail(responseData?.data);

  return [responseData?.message, detail].filter(Boolean).join(" ") || error?.message || fallback;
};

const formatDateOnly = (date) => {
  if (!date) return "";
  return String(date).split("T")[0];
};

const getLabel = (value, fallback = "") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name ?? value.description ?? fallback;
};

const getReasonLabel = (reason, fallback = "") => {
  if (!reason) return fallback;

  const reasonId = reason?.id ?? reason?.returnReasonId ?? reason?.idReturnReason;
  const labelById = getReturnReasonLabelById(reasonId);
  if (labelById) return labelById;

  const reasonCode = typeof reason === "string" ? reason : reason?.code ?? reason?.description;
  const labelByCode = getReturnReasonLabelByCode(reasonCode);
  if (labelByCode) return labelByCode;

  return getLabel(reason, fallback);
};

const getProductFromDetail = (detail) =>
  detail?.product ?? detail?.purchaseDetail?.barcode?.product ?? null;

const getBarcodeFromDetail = (detail) =>
  detail?.purchaseDetail?.barcode ?? null;

const getCancellationReason = (purchaseReturn) =>
  purchaseReturn?.cancellationReason ??
  purchaseReturn?.annulmentReason ??
  purchaseReturn?.motivoAnulacion ??
  null;

const getCancellationDate = (purchaseReturn) =>
  purchaseReturn?.cancelledAt ??
  purchaseReturn?.annulledAt ??
  purchaseReturn?.cancellationDate ??
  purchaseReturn?.fechaAnulacion ??
  null;

const toPositiveIntegerOrNull = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

const toOptionalDate = (value) => {
  if (!value) return null;
  const date = String(value).split("T")[0];
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
};

const mapReturnLineToNewDetail = (product, line) => {
  const detail = {
    idPurchaseDetail: toPositiveIntegerOrNull(
      line?.idPurchaseDetail ??
      line?.purchaseDetailId ??
      product?.idPurchaseDetail ??
      product?.purchaseDetailId ??
      product?.id
    ),
    quantity: toPositiveIntegerOrNull(line?.cantidadDevolver),
    idReturnReason: toPositiveIntegerOrNull(
      line?.idReturnReason ??
      line?.returnReasonId ??
      getReturnReasonIdByLabel(line?.motivo)
    ),
    idReturnMethod: toPositiveIntegerOrNull(
      line?.idReturnMethod ??
      line?.returnMethodId ??
      getReturnMethodIdByLabel(line?.tipoDevolucion)
    ),
  };

  const supplierDate = toOptionalDate(line?.supplierDate);
  return supplierDate ? { ...detail, supplierDate } : detail;
};

export const mapReturnFormToCreatePayload = (purchase, selectedProducts = []) => {
  const idPurchase = toPositiveIntegerOrNull(
    purchase?.idPurchase ?? purchase?.purchaseId ?? purchase?.id
  );

  const details = (selectedProducts ?? []).flatMap((product) =>
    (product?.lineas ?? []).map((line) => mapReturnLineToNewDetail(product, line))
  );

  return { idPurchase, details };
};

export const mapReturnFormToUpdatePayload = (selectedProducts = []) => {
  const detailsToUpdate = [];
  const detailsToAdd = [];

  (selectedProducts ?? []).forEach((product) => {
    (product?.lineas ?? []).forEach((line) => {
      const idPurchaseReturnDetail = toPositiveIntegerOrNull(
        line?.idPurchaseReturnDetail ?? line?.purchaseReturnDetailId
      );

      if (!idPurchaseReturnDetail) {
        detailsToAdd.push(mapReturnLineToNewDetail(product, line));
        return;
      }

      const originalStatusId = toPositiveIntegerOrNull(
        line?.originalReturnStatusId ??
        getReturnStatusIdByLabel(line?.estadoOriginal)
      );
      const currentStatusId = toPositiveIntegerOrNull(
        getReturnStatusIdByLabel(line?.estado) ??
        line?.idReturnStatus ??
        line?.returnStatusId
      );

      if (currentStatusId && currentStatusId !== originalStatusId) {
        detailsToUpdate.push({
          idPurchaseReturnDetail,
          idReturnStatus: currentStatusId,
        });
      }
    });
  });

  return {
    detailsToUpdate,
    detailsToAdd,
  };
};

export const mapPurchaseReturnToList = (purchaseReturn) => {
  if (!purchaseReturn) return null;

  return {
    id: purchaseReturn.id,
    purchaseId: purchaseReturn.purchaseId,
    idCompra: purchaseReturn.invoiceNumber,
    invoiceNumber: purchaseReturn.invoiceNumber,
    fechaDevolucion: formatDateOnly(purchaseReturn.creationDate),
    creationDate: purchaseReturn.creationDate,
    statusId: purchaseReturn.statusId,
    estado: purchaseReturn.status,
    status: purchaseReturn.status,
    progress: purchaseReturn.progress ?? {
      completed: purchaseReturn.completedDetails ?? 0,
      total: purchaseReturn.totalDetails ?? 0,
      label: `${purchaseReturn.completedDetails ?? 0}/${purchaseReturn.totalDetails ?? 0}`,
    },
    provider: purchaseReturn.provider ?? null,
    proveedor: purchaseReturn.provider?.name ?? "-",
    totalDetails: purchaseReturn.totalDetails ?? purchaseReturn.progress?.total ?? 0,
    completedDetails: purchaseReturn.completedDetails ?? purchaseReturn.progress?.completed ?? 0,
    productos: [],
  };
};

const getDetailUnitPrice = (detail) =>
  Number(
    detail?.purchaseDetail?.netUnitPrice ??
    detail?.purchaseDetail?.grossUnitPrice ??
    detail?.netUnitPrice ??
    detail?.grossUnitPrice ??
    detail?.unitPrice ??
    0
  );

const getDetailTaxPercentage = (detail) =>
  Number(detail?.purchaseDetail?.taxPercentage ?? detail?.taxPercentage ?? 0);

export const mapPurchaseReturnToDetail = (purchaseReturn) => {
  if (!purchaseReturn) return null;

  const details = purchaseReturn.details ?? [];
  const progress = purchaseReturn.progress ?? {
    completed: 0,
    total: details.length,
    label: `0/${details.length}`,
  };
  const invoiceNumber =
    purchaseReturn.purchase?.invoiceNumber ??
    purchaseReturn.invoiceNumber ??
    purchaseReturn.purchaseId;
  const statusName = getLabel(purchaseReturn.status);
  const provider = purchaseReturn.purchase?.provider ?? purchaseReturn.provider ?? null;
  const cancellationReason = getCancellationReason(purchaseReturn);
  const cancellationDate = getCancellationDate(purchaseReturn);

  return {
    id: purchaseReturn.id,
    purchaseId: purchaseReturn.purchaseId,
    idCompra: invoiceNumber,
    invoiceNumber,
    fechaDevolucion: formatDateOnly(purchaseReturn.creationDate),
    creationDate: purchaseReturn.creationDate,
    returnStatusId: purchaseReturn.returnStatusId,
    statusId: purchaseReturn.returnStatusId,
    estado: statusName,
    status: statusName,
    statusData: purchaseReturn.status ?? null,
    cancellationReason,
    annulmentReason: cancellationReason,
    motivoAnulacion: cancellationReason,
    cancelledAt: cancellationDate,
    annulledAt: cancellationDate,
    fechaAnulacion: formatDateOnly(cancellationDate),
    progress,
    totalDetails: progress.total,
    completedDetails: progress.completed,
    purchase: purchaseReturn.purchase ?? null,
    purchaseDate: purchaseReturn.purchase?.purchaseDate ?? null,
    maxReturnDate: purchaseReturn.purchase?.maxReturnDate ?? null,
    canRegisterReturns: purchaseReturn.purchase?.canRegisterReturns ?? false,
    returnPeriodStatus: purchaseReturn.purchase?.returnPeriodStatus ?? null,
    purchaseStatus: purchaseReturn.purchase?.status ?? null,
    totalAmount: purchaseReturn.purchase?.totalAmount ?? 0,
    provider,
    providerId: provider?.id ?? purchaseReturn.purchase?.providerId ?? null,
    proveedor: provider?.name ?? "-",
    details,
    statusHistory: purchaseReturn.statusHistory ?? [],
    productos: details.map((detail) => {
      const product = getProductFromDetail(detail);
      const barcode = getBarcodeFromDetail(detail);
      const reason = getReasonLabel(detail.reason);
      const method = getLabel(detail.method);
      const detailStatus = getLabel(detail.status);

      return {
        id: detail.id,
        idPurchaseReturnDetail: detail.id,
        purchaseReturnId: detail.purchaseReturnId,
        idPurchaseDetail: detail.purchaseDetailId,
        purchaseDetailId: detail.purchaseDetailId,
        nombre: product?.name ?? "Producto",
        idProduct: product?.id ?? detail.productId ?? null,
        productId: product?.id ?? detail.productId ?? null,
        referencia: product?.reference ?? "",
        codigoBarras: detail.barcode ?? barcode?.code ?? "",
        idBarcode: detail.barcodeId ?? detail.purchaseDetail?.barcodeId ?? barcode?.id ?? null,
        barcodeId: detail.barcodeId ?? detail.purchaseDetail?.barcodeId ?? barcode?.id ?? null,
        valorUnit: getDetailUnitPrice(detail),
        iva: getDetailTaxPercentage(detail),
        cantidadComprada: Number(detail.purchaseDetail?.quantity ?? detail.quantity ?? 0),
        cantidadDevolver: Number(detail.quantity ?? 0),
        supplierDate: detail.supplierDate ?? null,
        motivo: reason,
        reason,
        reasonData: detail.reason ?? null,
        idReturnReason: detail.returnReasonId ?? detail.reason?.id ?? null,
        returnReasonId: detail.returnReasonId ?? detail.reason?.id ?? null,
        tipoDevolucion: method,
        method,
        methodData: detail.method ?? null,
        idReturnMethod: detail.returnMethodId ?? detail.method?.id ?? null,
        returnMethodId: detail.returnMethodId ?? detail.method?.id ?? null,
        estado: detailStatus,
        status: detailStatus,
        statusData: detail.status ?? null,
        idReturnStatus: detail.returnStatusId ?? detail.status?.id ?? null,
        returnStatusId: detail.returnStatusId ?? detail.status?.id ?? null,
        stock: detail.stock ?? barcode?.stock ?? null,
        statusHistory: detail.statusHistory ?? [],
        raw: detail,
      };
    }),
  };
};

export const PurchaseReturnsService = {
  async getMetrics() {
    try {
      const response = await apiClient.get("/purchase-returns/metrics");
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "No se pudieron obtener las metricas de devoluciones de compras."));
    }
  },

  async getAll(params = {}) {
    try {
      const response = await apiClient.get("/purchase-returns", { params });
      const { data = [], pagination = {} } = response.data ?? {};

      return {
        data: data.map(mapPurchaseReturnToList).filter(Boolean),
        pagination: {
          page: pagination.page ?? 1,
          limit: pagination.limit ?? params.limit ?? 10,
          total: pagination.total ?? 0,
          totalPages: pagination.totalPages ?? 1,
          hasNextPage: pagination.hasNextPage ?? false,
          hasPrevPage: pagination.hasPrevPage ?? false,
        },
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "No se pudieron obtener las devoluciones de compras."));
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(`/purchase-returns/${id}`);
      return mapPurchaseReturnToDetail(response.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "No se pudo obtener el detalle de la devolucion de compra."));
    }
  },

  async create(payload) {
    try {
      const response = await apiClient.post("/purchase-returns", payload);
      return mapPurchaseReturnToDetail(response.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "No se pudo registrar la devolucion de compra."));
    }
  },

  async update(id, payload) {
    try {
      const response = await apiClient.put(`/purchase-returns/${id}`, payload);
      return mapPurchaseReturnToDetail(response.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "No se pudo actualizar la devolucion de compra."));
    }
  },

  async annul(id, cancellationReason) {
    try {
      const response = await apiClient.patch(`/purchase-returns/${id}/annul`, {
        cancellationReason,
      });

      return mapPurchaseReturnToDetail(response.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "No se pudo anular la devolucion de compra."));
    }
  },
};
