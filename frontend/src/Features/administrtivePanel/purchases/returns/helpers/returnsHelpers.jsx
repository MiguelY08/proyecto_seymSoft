// ─── Motivos de devolución ────────────────────────────────────────────────────
/**
 * Lista de motivos posibles para una devolución.
 * @constant {string[]}
 */
export const MOTIVOS_DEVOLUCION = [
  "Prod. en mal estado",
  "Insatisfecho",
  "Prod. incorrecto",
  "Otro motivo",
];

// ─── Tipos de devolución ──────────────────────────────────────────────────────
/**
 * Lista de tipos posibles de devolución.
 * @constant {string[]}
 */
export const TIPOS_DEVOLUCION = [
  "Reemplazo",
  "Sin reemplazo",
];

// ─── Estados por tipo de devolución ──────────────────────────────────────────

/**
 * Estados para devoluciones de tipo "Reemplazo".
 * @constant {string[]}
 */
export const ESTADOS_REEMPLAZO = [
  "Pend. envío",
  "Pend. reemplazo",
  "Recibido",
];

/**
 * Estados para devoluciones de tipo "Sin reemplazo".
 * @constant {string[]}
 */
export const ESTADOS_SIN_REEMPLAZO = [
  "Pend. envío",
  "Pend. reembolso",
  "Enviado",
];

/**
 * Devuelve la lista de estados disponibles según el tipo de devolución.
 * @param {"Reemplazo"|"Sin reemplazo"} tipo - Tipo de devolución.
 * @returns {string[]} Lista de estados para el tipo dado.
 */
export const getEstadosByTipo = (tipo) =>
  tipo === "Reemplazo" ? ESTADOS_REEMPLAZO : ESTADOS_SIN_REEMPLAZO;

/**
 * Devuelve el estado inicial de un producto recién agregado a una devolución.
 * Siempre es "Pend. envío" independientemente del tipo.
 * @returns {string} Estado inicial.
 */
export const getEstadoInicial = () => "Pend. envío";

/**
 * Devuelve el estado terminal de un producto según su tipo de devolución.
 * @param {"Reemplazo"|"Sin reemplazo"} tipo - Tipo de devolución.
 * @returns {string} Estado terminal.
 */
export const getEstadoTerminal = (tipo) =>
  tipo === "Reemplazo" ? "Recibido" : "Enviado";

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
  estado === "Recibido" || estado === "Enviado";

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
    case "Recibido":
    case "Enviado":
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