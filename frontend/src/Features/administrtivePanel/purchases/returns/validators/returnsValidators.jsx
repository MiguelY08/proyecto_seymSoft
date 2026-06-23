import {
  getEstadosByTipo,
  getReturnMethodIdByLabel,
  getReturnReasonIdByLabel,
  getReturnStatusIdByLabel,
  isValidReturnStatusTransition,
  isEstadoTerminal,
  RETURN_STATUS_IDS,
} from "../helpers/returnsHelpers";

const isPositiveInteger = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
};

const getPurchaseId = (purchase) =>
  purchase?.idPurchase ?? purchase?.purchaseId ?? purchase?.id;

const getPurchaseDetailId = (product, line) =>
  line?.idPurchaseDetail ??
  line?.purchaseDetailId ??
  product?.idPurchaseDetail ??
  product?.purchaseDetailId ??
  product?.id;

const getPurchaseReturnDetailId = (line) =>
  line?.idPurchaseReturnDetail ?? line?.purchaseReturnDetailId;

const getOriginalReturnStatusId = (line) =>
  line?.originalReturnStatusId ??
  getReturnStatusIdByLabel(line?.estadoOriginal);

const getCurrentReturnStatusId = (line) =>
  getReturnStatusIdByLabel(line?.estado) ??
  line?.idReturnStatus ??
  line?.returnStatusId;

const getReturnMethodId = (line) =>
  line?.idReturnMethod ??
  line?.returnMethodId ??
  getReturnMethodIdByLabel(line?.tipoDevolucion);

const isExistingReturnLine = (line) =>
  getPurchaseReturnDetailId(line) !== undefined ||
  line?.lineaId?.startsWith("existing-");

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
  } else if (!getReturnReasonIdByLabel(producto.motivo)) {
    errores.motivo = "Selecciona un motivo válido.";
  }

  // ── Tipo de devolución ──────────────────────────────────────────────────────
  if (!producto.tipoDevolucion?.trim()) {
    errores.tipoDevolucion = "El tipo de devolución es obligatorio.";
  } else if (!getReturnMethodIdByLabel(producto.tipoDevolucion)) {
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
  if (motivo.trim().length > 250) {
    return "El motivo no puede superar los 250 caracteres.";
  }
  return null;
};

// ─── Validación de línea individual (modelo multi-línea) ─────────────────────

/**
 * Valida una línea de devolución dentro de un producto.
 * Las lineas en estado Listo son inmutables y no se validan.
 *
 * @param {Object} linea           - Datos de la línea
 * @param {number} cantidadMaxima  - Máximo permitido para esta línea (cantidadComprada - otras líneas)
 * @returns {Object} errores por campo — objeto vacío si no hay errores
 */
export const validateLinea = (linea, cantidadMaxima) => {
  // Las líneas terminales son inmutables — no se revalidan
  if (isEstadoTerminal(linea.estado)) return {};

  const errores = {};
  const cantidad = Number(linea.cantidadDevolver);

  if (linea.cantidadDevolver === undefined || linea.cantidadDevolver === null || linea.cantidadDevolver === '') {
    errores.cantidadDevolver = "La cantidad es obligatoria.";
  } else if (isNaN(cantidad) || !Number.isInteger(cantidad)) {
    errores.cantidadDevolver = "Debe ser un número entero.";
  } else if (cantidad < 1) {
    errores.cantidadDevolver = "La cantidad mínima es 1.";
  } else if (cantidad > cantidadMaxima) {
    errores.cantidadDevolver = `Máximo ${cantidadMaxima} unidades disponibles.`;
  }

  if (!linea.motivo?.trim()) {
    errores.motivo = "El motivo es obligatorio.";
  } else if (!getReturnReasonIdByLabel(linea.motivo)) {
    errores.motivo = "Selecciona un motivo válido.";
  }

  if (!linea.tipoDevolucion?.trim()) {
    errores.tipoDevolucion = "El tipo es obligatorio.";
  } else if (!getReturnMethodIdByLabel(linea.tipoDevolucion)) {
    errores.tipoDevolucion = "Tipo inválido.";
  }

  if (!linea.estado?.trim()) {
    errores.estado = "El estado es obligatorio.";
  } else if (linea.tipoDevolucion) {
    const estadosValidos = getEstadosByTipo(linea.tipoDevolucion);
    if (!estadosValidos.includes(linea.estado)) {
      errores.estado = `Estado inválido para "${linea.tipoDevolucion}".`;
    }
  }

  return errores;
};

// ─── Validación del formulario multi-línea ────────────────────────────────────

/**
 * Valida el formulario completo en el modelo multi-línea.
 *
 * @param {Array} productosSeleccionados
 *   Array de { codigoBarras, nombre, cantidadComprada, lineas: [...] }
 * @returns {{ valid: boolean, erroresGenerales: string[], erroresProducto: Object }}
 *
 * erroresProducto = { [codigoBarras]: { lineas: [{ campo: mensaje }, ...] } }
 */
export const validateReturnFormConLineas = (productosSeleccionados, purchase = null) => {
  const erroresGenerales = [];
  const erroresProducto  = {};

  if (purchase && !isPositiveInteger(getPurchaseId(purchase))) {
    erroresGenerales.push("No se pudo identificar la compra para registrar la devolucion.");
  }

  if (!productosSeleccionados || productosSeleccionados.length === 0) {
    erroresGenerales.push("Debes seleccionar al menos un producto para devolver.");
    return { valid: false, erroresGenerales, erroresProducto };
  }

  for (const producto of productosSeleccionados) {
    const lineas = producto.lineas ?? [];

    if (lineas.length === 0) {
      erroresGenerales.push(`"${producto.nombre}" debe tener al menos una línea de devolución.`);
      erroresProducto[producto.codigoBarras] = { lineas: [] };
      continue;
    }

    if (!isPositiveInteger(getPurchaseDetailId(producto))) {
      erroresGenerales.push(`"${producto.nombre}" no tiene un detalle de compra valido.`);
    }

    // Verificar que la suma total no supere cantidadComprada
    const totalCantidad = lineas.reduce((sum, l) => sum + (Number(l.cantidadDevolver) || 0), 0);
    if (totalCantidad > producto.cantidadComprada) {
      erroresGenerales.push(
        `"${producto.nombre}": la suma de cantidades (${totalCantidad}) supera el máximo (${producto.cantidadComprada}).`
      );
    }

    // Validar cada línea individualmente
    const erroresLineas = lineas.map((linea, idx) => {
      const usadoOtras = lineas
        .filter((_, i) => i !== idx)
        .reduce((sum, l) => sum + (Number(l.cantidadDevolver) || 0), 0);
      const maxParaEstaLinea = producto.cantidadComprada - usadoOtras;
      const erroresLinea = validateLinea(linea, maxParaEstaLinea);

      if (!isPositiveInteger(getPurchaseDetailId(producto, linea))) {
        erroresLinea.purchaseDetailId = "No se pudo identificar el detalle de compra.";
      }

      return erroresLinea;
    });

    const hayErroresLinea = erroresLineas.some(e => Object.keys(e).length > 0);
    if (hayErroresLinea || totalCantidad > producto.cantidadComprada) {
      erroresProducto[producto.codigoBarras] = { lineas: erroresLineas };
    }
  }

  const valid = erroresGenerales.length === 0 && Object.keys(erroresProducto).length === 0;
  return { valid, erroresGenerales, erroresProducto };
};

export const validateReturnUpdateForm = (productosSeleccionados) => {
  const erroresGenerales = [];
  const erroresProducto = {};
  let detailsToUpdateCount = 0;
  let detailsToAddCount = 0;

  if (!productosSeleccionados?.length) {
    return {
      valid: false,
      hasChanges: false,
      detailsToUpdateCount,
      detailsToAddCount,
      erroresGenerales: ["La devolución no contiene productos para actualizar."],
      erroresProducto,
    };
  }

  productosSeleccionados.forEach((producto, productIndex) => {
    const lineas = producto?.lineas ?? [];
    const productKey = producto?.codigoBarras ?? `producto-${productIndex}`;

    if (lineas.length === 0) {
      erroresGenerales.push(`"${producto?.nombre ?? "Producto"}" debe tener al menos una línea.`);
      erroresProducto[productKey] = { lineas: [] };
      return;
    }

    const existingQuantity = lineas
      .filter(isExistingReturnLine)
      .reduce((sum, line) => sum + (Number(line?.cantidadDevolver) || 0), 0);
    const newLines = lineas.filter((line) => !isExistingReturnLine(line));
    const newQuantity = newLines.reduce(
      (sum, line) => sum + (Number(line?.cantidadDevolver) || 0),
      0
    );
    const purchasedQuantity = Number(producto?.cantidadComprada) || 0;
    const availableForNewLines = Math.max(purchasedQuantity - existingQuantity, 0);

    if (newQuantity > availableForNewLines) {
      erroresGenerales.push(
        `"${producto?.nombre ?? "Producto"}": las nuevas cantidades (${newQuantity}) superan las ${availableForNewLines} unidades disponibles.`
      );
    }

    const erroresLineas = lineas.map((linea) => {
      const erroresLinea = {};

      if (isExistingReturnLine(linea)) {
        const originalStatusId = Number(getOriginalReturnStatusId(linea));
        const currentStatusId = Number(getCurrentReturnStatusId(linea));
        const returnMethodId = Number(getReturnMethodId(linea));

        if (!isPositiveInteger(getPurchaseReturnDetailId(linea))) {
          erroresLinea.idPurchaseReturnDetail = "No se pudo identificar el detalle de devolución.";
        }
        if (!isPositiveInteger(originalStatusId)) {
          erroresLinea.originalReturnStatusId = "No se pudo identificar el estado original.";
        }
        if (!isPositiveInteger(currentStatusId)) {
          erroresLinea.estado = "Selecciona un estado válido.";
        }

        if (
          isPositiveInteger(originalStatusId) &&
          isPositiveInteger(currentStatusId) &&
          currentStatusId !== originalStatusId
        ) {
          if (!isPositiveInteger(returnMethodId)) {
            erroresLinea.tipoDevolucion = "No se pudo identificar el método de devolución.";
          } else if (
            !isValidReturnStatusTransition(
              returnMethodId,
              originalStatusId,
              currentStatusId
            )
          ) {
            erroresLinea.estado = "La transición de estado seleccionada no está permitida.";
          } else {
            detailsToUpdateCount += 1;
          }
        }

        return erroresLinea;
      }

      detailsToAddCount += 1;
      const otherNewQuantity = newLines
        .filter((otherLine) => otherLine !== linea)
        .reduce((sum, otherLine) => sum + (Number(otherLine?.cantidadDevolver) || 0), 0);
      const maxForLine = Math.max(availableForNewLines - otherNewQuantity, 0);
      Object.assign(erroresLinea, validateLinea(linea, maxForLine));

      if (!isPositiveInteger(getPurchaseDetailId(producto, linea))) {
        erroresLinea.purchaseDetailId = "No se pudo identificar el detalle de compra.";
      }

      const currentStatusId = Number(getCurrentReturnStatusId(linea));
      if (currentStatusId !== RETURN_STATUS_IDS.PENDING_SHIPMENT) {
        erroresLinea.estado = "Los detalles nuevos deben iniciar en Pend. envío.";
      }

      return erroresLinea;
    });

    const hasLineErrors = erroresLineas.some(
      (lineErrors) => Object.keys(lineErrors).length > 0
    );

    if (hasLineErrors || newQuantity > availableForNewLines) {
      erroresProducto[productKey] = { lineas: erroresLineas };
    }
  });

  const hasChanges = detailsToUpdateCount > 0 || detailsToAddCount > 0;
  if (!hasChanges && Object.keys(erroresProducto).length === 0) {
    erroresGenerales.push("No hay cambios para guardar.");
  }

  return {
    valid:
      erroresGenerales.length === 0 &&
      Object.keys(erroresProducto).length === 0 &&
      hasChanges,
    hasChanges,
    detailsToUpdateCount,
    detailsToAddCount,
    erroresGenerales,
    erroresProducto,
  };
};

// ─── Helper: ¿tiene errores un producto (modelo multi-línea)? ────────────────

/**
 * Indica si alguna línea de un producto tiene errores de validación.
 * @param {string} codigoBarras
 * @param {Object} erroresProducto - resultado de validateReturnFormConLineas
 * @returns {boolean}
 */
export const productoTieneErrorConLineas = (codigoBarras, erroresProducto) => {
  const err = erroresProducto?.[codigoBarras];
  if (!err) return false;
  return (err.lineas ?? []).some(l => l && Object.keys(l).length > 0);
};
// ─── Helper legacy (modelo plano) ────────────────────────────────────────────

/**
 * Indica si un producto tiene errores de validación pendientes (modelo plano).
 * @param {string} codigoBarras
 * @param {Object} erroresProducto - resultado de validateReturnForm
 */
export const productoTieneError = (codigoBarras, erroresProducto) =>
  !!erroresProducto?.[codigoBarras] &&
  Object.keys(erroresProducto[codigoBarras]).length > 0;
