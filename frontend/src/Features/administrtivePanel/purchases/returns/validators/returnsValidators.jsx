import { MOTIVOS_DEVOLUCION, TIPOS_DEVOLUCION, getEstadosByTipo } from "../helpers/returnsHelpers";

// ─── Validación de producto individual (panel derecho del formulario) ─────────

/**
 * Valida los campos de un producto seleccionado en el formulario de devolución.
 * @param {Object} producto - datos del producto a validar
 * @param {number} producto.cantidadDevolver
 * @param {number} producto.cantidadComprada  - máximo permitido
 * @param {string} producto.motivo
 * @param {string} producto.tipoDevolucion
 * @param {string} producto.estado
 * @returns {Object} errores por campo — objeto vacío si no hay errores
 */
export const validateProducto = (producto) => {
  const errores = {};

  // ── Cantidad ────────────────────────────────────────────────────────────────
  const cantidad = Number(producto.cantidadDevolver);

  if (!producto.cantidadDevolver && producto.cantidadDevolver !== 0) {
    errores.cantidadDevolver = "La cantidad es obligatoria.";
  } else if (isNaN(cantidad) || !Number.isInteger(cantidad)) {
    errores.cantidadDevolver = "La cantidad debe ser un número entero.";
  } else if (cantidad < 1) {
    errores.cantidadDevolver = "La cantidad mínima es 1.";
  } else if (cantidad > producto.cantidadComprada) {
    errores.cantidadDevolver = `Máximo ${producto.cantidadComprada} unidades (cantidad comprada).`;
  }

  // ── Motivo ──────────────────────────────────────────────────────────────────
  if (!producto.motivo?.trim()) {
    errores.motivo = "El motivo es obligatorio.";
  } else if (!MOTIVOS_DEVOLUCION.includes(producto.motivo)) {
    errores.motivo = "Selecciona un motivo válido.";
  }

  // ── Tipo de devolución ──────────────────────────────────────────────────────
  if (!producto.tipoDevolucion?.trim()) {
    errores.tipoDevolucion = "El tipo de devolución es obligatorio.";
  } else if (!TIPOS_DEVOLUCION.includes(producto.tipoDevolucion)) {
    errores.tipoDevolucion = "Selecciona un tipo de devolución válido.";
  }

  // ── Estado ──────────────────────────────────────────────────────────────────
  if (!producto.estado?.trim()) {
    errores.estado = "El estado es obligatorio.";
  } else if (producto.tipoDevolucion) {
    const estadosValidos = getEstadosByTipo(producto.tipoDevolucion);
    if (!estadosValidos.includes(producto.estado)) {
      errores.estado = `Estado inválido para el tipo "${producto.tipoDevolucion}".`;
    }
  }

  return errores;
};

// ─── Validación del formulario completo ───────────────────────────────────────

/**
 * Valida el formulario completo de una nueva devolución.
 *
 * Reglas generales:
 *   1. Debe haber al menos un producto seleccionado.
 *   2. Cada producto seleccionado debe pasar validateProducto().
 *
 * @param {Array} productosSeleccionados - productos con checkbox activo
 * @returns {{ valid: boolean, erroresGenerales: string[], erroresProducto: Object }}
 *
 * erroresProducto = { [codigoBarras]: { campo: mensajeError } }
 */
export const validateReturnForm = (productosSeleccionados) => {
  const erroresGenerales = [];
  const erroresProducto  = {};

  // ── Al menos un producto ────────────────────────────────────────────────────
  if (!productosSeleccionados || productosSeleccionados.length === 0) {
    erroresGenerales.push("Debes seleccionar al menos un producto para devolver.");
  }

  // ── Validar cada producto ───────────────────────────────────────────────────
  (productosSeleccionados ?? []).forEach((producto) => {
    const errores = validateProducto(producto);
    if (Object.keys(errores).length > 0) {
      erroresProducto[producto.codigoBarras] = errores;
    }
  });

  const valid =
    erroresGenerales.length === 0 &&
    Object.keys(erroresProducto).length === 0;

  return { valid, erroresGenerales, erroresProducto };
};

// ─── Validación de anulación ──────────────────────────────────────────────────

/**
 * Valida el motivo de anulación de una devolución.
 * @param {string} motivo
 * @returns {string|null} mensaje de error o null si es válido
 */
export const validateMotivoCancelacion = (motivo) => {
  if (!motivo?.trim()) {
    return "El motivo de anulación es obligatorio.";
  }
  if (motivo.trim().length < 10) {
    return "El motivo debe tener al menos 10 caracteres.";
  }
  if (motivo.trim().length > 300) {
    return "El motivo no puede superar los 300 caracteres.";
  }
  return null;
};

// ─── Helper: ¿tiene errores un producto específico? ──────────────────────────

/**
 * Indica si un producto tiene errores de validación pendientes.
 * @param {string} codigoBarras
 * @param {Object} erroresProducto - resultado de validateReturnForm
 */
export const productoTieneError = (codigoBarras, erroresProducto) =>
  !!erroresProducto?.[codigoBarras] &&
  Object.keys(erroresProducto[codigoBarras]).length > 0;