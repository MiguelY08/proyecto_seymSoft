// ─── Motivos de devolución ────────────────────────────────────────────────────
/**
 * Lista de motivos posibles para una devolución.
 * @constant {string[]}
 */
export const RETURN_REASON_OPTIONS = [
  { id: 8, label: "Prod. en mal estado", code: "MAL_ESTADO" },
  { id: 5, label: "Insatisfecho", code: "DEFECTUOSO" },
  { id: 11, label: "Prod. incorrecto", code: "PROD._INCORRECTO" },
  { id: 10, label: "Otro motivo", code: "OTRO" },
];

export const MOTIVOS_DEVOLUCION = RETURN_REASON_OPTIONS.map((reason) => reason.label);

export const getReturnReasonIdByLabel = (label) =>
  RETURN_REASON_OPTIONS.find((reason) => reason.label === label)?.id ?? null;

export const getReturnReasonLabelById = (id) =>
  RETURN_REASON_OPTIONS.find((reason) => reason.id === Number(id))?.label ?? "";

export const getReturnReasonLabelByCode = (code) =>
  RETURN_REASON_OPTIONS.find((reason) => reason.code === code)?.label ?? "";

// ─── Tipos de devolución ──────────────────────────────────────────────────────
/**
 * Lista de tipos posibles de devolución.
 * @constant {string[]}
 */
export const RETURN_METHOD_OPTIONS = [
  { id: 1, label: "Reemplazo" },
  { id: 2, label: "Reembolso" },
  { id: 3, label: "Saldo a favor" },
];

export const TIPOS_DEVOLUCION = RETURN_METHOD_OPTIONS.map((method) => method.label);

export const RETURN_METHOD_IDS = {
  REPLACEMENT: 1,
  REFUND: 2,
  CREDIT_BALANCE: 3,
};

export const LEGACY_RETURN_METHOD_LABELS = {
  "Sin reemplazo": "Reembolso",
};

export const normalizeReturnMethod = (label) =>
  LEGACY_RETURN_METHOD_LABELS[label] ?? label;

export const getReturnMethodIdByLabel = (label) =>
  RETURN_METHOD_OPTIONS.find((method) => method.label === normalizeReturnMethod(label))?.id ?? null;

export const getReturnMethodLabelById = (id) =>
  RETURN_METHOD_OPTIONS.find((method) => method.id === Number(id))?.label ?? "";

// ─── Estados por tipo de devolución ──────────────────────────────────────────

export const RETURN_STATUS_IDS = {
  PENDING_SHIPMENT: 1,
  PENDING_REPLACEMENT: 2,
  PENDING_REFUND: 3,
  READY: 4,
  ANNULLED: 5,
};

export const RETURN_STATUS_OPTIONS = [
  { id: RETURN_STATUS_IDS.PENDING_SHIPMENT, label: "Pend. envío", terminal: false },
  { id: RETURN_STATUS_IDS.PENDING_REPLACEMENT, label: "Pend. reemplazo", terminal: false },
  { id: RETURN_STATUS_IDS.PENDING_REFUND, label: "Pend. reembolso", terminal: false },
  { id: RETURN_STATUS_IDS.READY, label: "Listo", terminal: true },
  { id: RETURN_STATUS_IDS.ANNULLED, label: "Anulada", terminal: true },
];

export const getReturnStatusIdByLabel = (label) =>
  RETURN_STATUS_OPTIONS.find((status) => status.label === label)?.id ?? null;

export const getReturnStatusLabelById = (id) =>
  RETURN_STATUS_OPTIONS.find((status) => status.id === Number(id))?.label ?? "";

const getReturnMethodId = (method) => {
  if (typeof method === "object" && method !== null) {
    return Number(method.id ?? method.returnMethodId ?? method.idReturnMethod) || null;
  }

  const numericId = Number(method);
  return Number.isInteger(numericId) && numericId > 0
    ? numericId
    : getReturnMethodIdByLabel(method);
};

const getReturnStatusId = (status) => {
  if (typeof status === "object" && status !== null) {
    return Number(status.id ?? status.returnStatusId ?? status.idReturnStatus) || null;
  }

  const numericId = Number(status);
  return Number.isInteger(numericId) && numericId > 0
    ? numericId
    : getReturnStatusIdByLabel(status);
};

const RETURN_STATUS_FLOW_BY_METHOD = {
  [RETURN_METHOD_IDS.REPLACEMENT]: {
    [RETURN_STATUS_IDS.PENDING_SHIPMENT]: [RETURN_STATUS_IDS.PENDING_REPLACEMENT],
    [RETURN_STATUS_IDS.PENDING_REPLACEMENT]: [RETURN_STATUS_IDS.READY],
  },
  [RETURN_METHOD_IDS.REFUND]: {
    [RETURN_STATUS_IDS.PENDING_SHIPMENT]: [RETURN_STATUS_IDS.PENDING_REFUND],
    [RETURN_STATUS_IDS.PENDING_REFUND]: [RETURN_STATUS_IDS.READY],
  },
  [RETURN_METHOD_IDS.CREDIT_BALANCE]: {
    [RETURN_STATUS_IDS.PENDING_SHIPMENT]: [RETURN_STATUS_IDS.PENDING_REFUND],
    [RETURN_STATUS_IDS.PENDING_REFUND]: [RETURN_STATUS_IDS.READY],
  },
};

export const getAllowedNextReturnStatusIds = (method, currentStatus) => {
  const methodId = getReturnMethodId(method);
  const currentStatusId = getReturnStatusId(currentStatus);

  return RETURN_STATUS_FLOW_BY_METHOD[methodId]?.[currentStatusId] ?? [];
};

export const getAllowedNextReturnStatuses = (method, currentStatus) => {
  const allowedIds = getAllowedNextReturnStatusIds(method, currentStatus);
  return RETURN_STATUS_OPTIONS.filter((status) => allowedIds.includes(status.id));
};

export const isValidReturnStatusTransition = (method, currentStatus, nextStatus) => {
  const nextStatusId = getReturnStatusId(nextStatus);
  return getAllowedNextReturnStatusIds(method, currentStatus).includes(nextStatusId);
};

/**
 * Estados para devoluciones de tipo "Reemplazo".
 * @constant {string[]}
 */
export const ESTADOS_REEMPLAZO = [
  getReturnStatusLabelById(RETURN_STATUS_IDS.PENDING_SHIPMENT),
  getReturnStatusLabelById(RETURN_STATUS_IDS.PENDING_REPLACEMENT),
  getReturnStatusLabelById(RETURN_STATUS_IDS.READY),
];

/**
 * Estados para devoluciones de tipo "Reembolso".
 * @constant {string[]}
 */
export const ESTADOS_REEMBOLSO = [
  getReturnStatusLabelById(RETURN_STATUS_IDS.PENDING_SHIPMENT),
  getReturnStatusLabelById(RETURN_STATUS_IDS.PENDING_REFUND),
  getReturnStatusLabelById(RETURN_STATUS_IDS.READY),
];

export const ESTADOS_SALDO_A_FAVOR = [
  getReturnStatusLabelById(RETURN_STATUS_IDS.PENDING_SHIPMENT),
  getReturnStatusLabelById(RETURN_STATUS_IDS.PENDING_REFUND),
  getReturnStatusLabelById(RETURN_STATUS_IDS.READY),
];

/**
 * Devuelve la lista de estados disponibles según el tipo de devolución.
 * @param {"Reemplazo"|"Reembolso"|"Saldo a favor"} tipo - Tipo de devolución.
 * @returns {string[]} Lista de estados para el tipo dado.
 */
export const getEstadosByTipo = (tipo) => {
  const method = normalizeReturnMethod(tipo);

  if (method === "Reemplazo") return ESTADOS_REEMPLAZO;
  if (method === "Reembolso") return ESTADOS_REEMBOLSO;
  if (method === "Saldo a favor") return ESTADOS_SALDO_A_FAVOR;

  return [];
};

/**
 * Devuelve el estado inicial de un producto recién agregado a una devolución.
 * Siempre es "Pend. envío" independientemente del tipo.
 * @returns {string} Estado inicial.
 */
export const getEstadoInicial = () =>
  getReturnStatusLabelById(RETURN_STATUS_IDS.PENDING_SHIPMENT);

/**
 * Devuelve el estado terminal de un producto según su tipo de devolución.
 * @param {"Reemplazo"|"Reembolso"|"Saldo a favor"} tipo - Tipo de devolución.
 * @returns {string} Estado terminal.
 */
export const getEstadoTerminal = () =>
  getReturnStatusLabelById(RETURN_STATUS_IDS.READY);

/**
 * Indica si un producto ha completado su proceso de devolución.
 * @param {{ tipoDevolucion: string, estado: string }} producto - Objeto del producto.
 * @returns {boolean} True si el producto está terminado.
 */
export const isProductoTerminado = (producto) =>
  producto.estado === getEstadoTerminal(producto.tipoDevolucion);

/**
 * Indica si un estado es terminal (proceso de devolución completado).
 * Los estados terminales son inmutables en el formulario de edición.
 * @param {string} estado
 * @returns {boolean}
 */
export const isEstadoTerminal = (estado) =>
  getReturnStatusId(estado) === RETURN_STATUS_IDS.READY;

// ─── Estilos de badge de estado (devolución general) ─────────────────────────

/**
 * Devuelve los estilos de color para el badge de estado de una devolución.
 * Cubre "Aprobada x/y", "Procesada x/x" y "Anulada".
 * @param {string} estado - Estado de la devolución.
 * @returns {object} Objeto con estilos background y color.
 */
export const getBadgeEstadoDevolucion = (estado = "") => {
  if (estado === "Anulada") {
    return { background: "#fee2e2", color: "#b91c1c" };
  }
  if (estado.startsWith("Procesada")) {
    return { background: "#dcfce7", color: "#15803d" };
  }
  if (estado.startsWith("Aprobada")) {
    return { background: "#fef9c3", color: "#a16207" };
  }
  return { background: "#f3f4f6", color: "#374151" };
};

// ─── Estilos de badge de estado (producto individual) ────────────────────────

/**
 * Devuelve los estilos de color para el badge de estado de un producto.
 * @param {string} estado - Estado del producto.
 * @returns {object} Objeto con estilos background y color.
 */
export const getBadgeEstadoProducto = (estado = "") => {
  switch (estado) {
    case "Listo":
      return { background: "#dcfce7", color: "#15803d" };    // verde — terminal
    case "Pend. reemplazo":
    case "Pend. reembolso":
      return { background: "#fef9c3", color: "#a16207" };    // amarillo — en curso
    case "Pend. envío":
      return { background: "#fce7f3", color: "#9d174d" };    // rosa — inicial
    default:
      return { background: "#f3f4f6", color: "#374151" };
  }
};

// ─── Estilos de badge de estado de la compra ─────────────────────────────────

/**
 * Devuelve los estilos del badge de estado para la compra original.
 * Extiende los estados base con los nuevos: "Proc. devolución" y "Completada*".
 * @param {string} estado - Estado de la compra.
 * @returns {object} Objeto con estilos background y color.
 */
export const getBadgeEstadoCompra = (estado = "") => {
  switch (estado) {
    case "Completada":
      return { background: "#dcfce7", color: "#15803d" };
    case "Completada*":
      return { background: "#d1fae5", color: "#065f46" };
    case "Proc. devolución":
      return { background: "#fef9c3", color: "#a16207" };
    case "Devuelta":
      return { background: "#dbeafe", color: "#1d4ed8" };
    case "Anulada":
      return { background: "#fee2e2", color: "#b91c1c" };
    default:
      return { background: "#f3f4f6", color: "#374151" };
  }
};

// ─── Formateadores ────────────────────────────────────────────────────────────

/**
 * Formatea un número como moneda colombiana.
 * @param {number} value - Valor a formatear.
 * @returns {string} Valor formateado o "-" si no es número.
 */
export const formatCurrency = (value) =>
  typeof value === "number"
    ? `$${value.toLocaleString("es-CO")}`
    : "-";

/**
 * Calcula el subtotal, IVA y total de un producto.
 * @param {{ valorUnit: number, iva: number, cantidadDevolver: number }} producto - Objeto del producto.
 * @returns {{ subtotal: number, ivaValor: number, total: number }} Objeto con cálculos.
 */
export const calcularTotalesProducto = (producto) => {
  const subtotal = producto.valorUnit * producto.cantidadDevolver;
  const ivaValor = Math.round(subtotal * (producto.iva / 100));
  const total    = subtotal + ivaValor;
  return { subtotal, ivaValor, total };
};
