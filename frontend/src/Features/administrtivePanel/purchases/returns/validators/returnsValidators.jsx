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

const toSafeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getReturnAvailableQuantity = (product) =>
  Math.max(0, toSafeNumber(
    product?.cantidadDisponibleDevolucion ??
    product?.returnAvailability?.availableQuantity ??
    product?.cantidadComprada,
    0
  ));

const getExistingReturnQuantity = (product) =>
  (product?.lineas ?? [])
    .filter(isExistingReturnLine)
    .reduce((sum, line) => sum + (Number(line?.cantidadDevolver) || 0), 0);

const getReturnQuantityLimit = (product) =>
  getReturnAvailableQuantity(product) + getExistingReturnQuantity(product);

export const validateProducto = (producto) => {
  const errores = {};
  const cantidad = Number(producto.cantidadDevolver);
  const availableQuantity = getReturnAvailableQuantity(producto);

  if (!producto.cantidadDevolver && producto.cantidadDevolver !== 0) {
    errores.cantidadDevolver = "La cantidad es obligatoria.";
  } else if (isNaN(cantidad) || !Number.isInteger(cantidad)) {
    errores.cantidadDevolver = "La cantidad debe ser un numero entero.";
  } else if (cantidad < 1) {
    errores.cantidadDevolver = "La cantidad minima es 1.";
  } else if (cantidad > availableQuantity) {
    errores.cantidadDevolver = `Maximo ${availableQuantity} unidades disponibles.`;
  }

  if (!producto.motivo?.trim()) {
    errores.motivo = "El motivo es obligatorio.";
  } else if (!getReturnReasonIdByLabel(producto.motivo)) {
    errores.motivo = "Selecciona un motivo valido.";
  }

  if (!producto.tipoDevolucion?.trim()) {
    errores.tipoDevolucion = "El tipo de devolucion es obligatorio.";
  } else if (!getReturnMethodIdByLabel(producto.tipoDevolucion)) {
    errores.tipoDevolucion = "Selecciona un tipo de devolucion valido.";
  }

  if (!producto.estado?.trim()) {
    errores.estado = "El estado es obligatorio.";
  } else if (producto.tipoDevolucion) {
    const estadosValidos = getEstadosByTipo(producto.tipoDevolucion);
    if (!estadosValidos.includes(producto.estado)) {
      errores.estado = `Estado invalido para el tipo "${producto.tipoDevolucion}".`;
    }
  }

  return errores;
};

export const validateReturnForm = (productosSeleccionados) => {
  const erroresGenerales = [];
  const erroresProducto = {};

  if (!productosSeleccionados || productosSeleccionados.length === 0) {
    erroresGenerales.push("Debes seleccionar al menos un producto para devolver.");
  }

  (productosSeleccionados ?? []).forEach((producto) => {
    const errores = validateProducto(producto);
    if (Object.keys(errores).length > 0) {
      erroresProducto[producto.codigoBarras] = errores;
    }
  });

  return {
    valid: erroresGenerales.length === 0 && Object.keys(erroresProducto).length === 0,
    erroresGenerales,
    erroresProducto,
  };
};

export const validateMotivoCancelacion = (motivo) => {
  if (!motivo?.trim()) {
    return "El motivo de anulacion es obligatorio.";
  }
  if (motivo.trim().length > 250) {
    return "El motivo no puede superar los 250 caracteres.";
  }
  return null;
};

export const validateLinea = (linea, cantidadMaxima) => {
  if (isEstadoTerminal(linea.estado)) return {};

  const errores = {};
  const cantidad = Number(linea.cantidadDevolver);

  if (linea.cantidadDevolver === undefined || linea.cantidadDevolver === null || linea.cantidadDevolver === "") {
    errores.cantidadDevolver = "La cantidad es obligatoria.";
  } else if (isNaN(cantidad) || !Number.isInteger(cantidad)) {
    errores.cantidadDevolver = "Debe ser un numero entero.";
  } else if (cantidad < 1) {
    errores.cantidadDevolver = "La cantidad minima es 1.";
  } else if (cantidad > cantidadMaxima) {
    errores.cantidadDevolver = `Maximo ${cantidadMaxima} unidades disponibles.`;
  }

  if (!linea.motivo?.trim()) {
    errores.motivo = "El motivo es obligatorio.";
  } else if (!getReturnReasonIdByLabel(linea.motivo)) {
    errores.motivo = "Selecciona un motivo valido.";
  }

  if (!linea.tipoDevolucion?.trim()) {
    errores.tipoDevolucion = "El tipo es obligatorio.";
  } else if (!getReturnMethodIdByLabel(linea.tipoDevolucion)) {
    errores.tipoDevolucion = "Tipo invalido.";
  }

  if (!linea.estado?.trim()) {
    errores.estado = "El estado es obligatorio.";
  } else if (linea.tipoDevolucion) {
    const estadosValidos = getEstadosByTipo(linea.tipoDevolucion);
    if (!estadosValidos.includes(linea.estado)) {
      errores.estado = `Estado invalido para "${linea.tipoDevolucion}".`;
    }
  }

  return errores;
};

export const validateReturnFormConLineas = (productosSeleccionados, purchase = null) => {
  const erroresGenerales = [];
  const erroresProducto = {};

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
      erroresGenerales.push(`"${producto.nombre}" debe tener al menos una linea de devolucion.`);
      erroresProducto[producto.codigoBarras] = { lineas: [] };
      continue;
    }

    if (!isPositiveInteger(getPurchaseDetailId(producto))) {
      erroresGenerales.push(`"${producto.nombre}" no tiene un detalle de compra valido.`);
    }

    const totalCantidad = lineas.reduce((sum, line) => sum + (Number(line.cantidadDevolver) || 0), 0);
    const cantidadLimite = getReturnQuantityLimit(producto);
    if (totalCantidad > cantidadLimite) {
      erroresGenerales.push(
        `"${producto.nombre}": la suma de cantidades (${totalCantidad}) supera las ${cantidadLimite} unidades disponibles.`
      );
    }

    const erroresLineas = lineas.map((linea, idx) => {
      const usadoOtras = lineas
        .filter((_, i) => i !== idx)
        .reduce((sum, line) => sum + (Number(line.cantidadDevolver) || 0), 0);
      const maxParaEstaLinea = Math.max(cantidadLimite - usadoOtras, 0);
      const erroresLinea = validateLinea(linea, maxParaEstaLinea);

      if (!isPositiveInteger(getPurchaseDetailId(producto, linea))) {
        erroresLinea.purchaseDetailId = "No se pudo identificar el detalle de compra.";
      }

      return erroresLinea;
    });

    const hayErroresLinea = erroresLineas.some((errors) => Object.keys(errors).length > 0);
    if (hayErroresLinea || totalCantidad > cantidadLimite) {
      erroresProducto[producto.codigoBarras] = { lineas: erroresLineas };
    }
  }

  return {
    valid: erroresGenerales.length === 0 && Object.keys(erroresProducto).length === 0,
    erroresGenerales,
    erroresProducto,
  };
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
      erroresGenerales: ["La devolucion no contiene productos para actualizar."],
      erroresProducto,
    };
  }

  productosSeleccionados.forEach((producto, productIndex) => {
    const lineas = producto?.lineas ?? [];
    const productKey = producto?.codigoBarras ?? `producto-${productIndex}`;

    if (lineas.length === 0) {
      erroresGenerales.push(`"${producto?.nombre ?? "Producto"}" debe tener al menos una linea.`);
      erroresProducto[productKey] = { lineas: [] };
      return;
    }

    const newLines = lineas.filter((line) => !isExistingReturnLine(line));
    const newQuantity = newLines.reduce(
      (sum, line) => sum + (Number(line?.cantidadDevolver) || 0),
      0
    );
    const availableForNewLines = getReturnAvailableQuantity(producto);

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
          erroresLinea.idPurchaseReturnDetail = "No se pudo identificar el detalle de devolucion.";
        }
        if (!isPositiveInteger(originalStatusId)) {
          erroresLinea.originalReturnStatusId = "No se pudo identificar el estado original.";
        }
        if (!isPositiveInteger(currentStatusId)) {
          erroresLinea.estado = "Selecciona un estado valido.";
        }

        if (
          isPositiveInteger(originalStatusId) &&
          isPositiveInteger(currentStatusId) &&
          currentStatusId !== originalStatusId
        ) {
          if (!isPositiveInteger(returnMethodId)) {
            erroresLinea.tipoDevolucion = "No se pudo identificar el metodo de devolucion.";
          } else if (
            !isValidReturnStatusTransition(
              returnMethodId,
              originalStatusId,
              currentStatusId
            )
          ) {
            erroresLinea.estado = "La transicion de estado seleccionada no esta permitida.";
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
        erroresLinea.estado = "Los detalles nuevos deben iniciar en Pend. envio.";
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

export const productoTieneErrorConLineas = (codigoBarras, erroresProducto) => {
  const err = erroresProducto?.[codigoBarras];
  if (!err) return false;
  return (err.lineas ?? []).some((lineErrors) => lineErrors && Object.keys(lineErrors).length > 0);
};

export const productoTieneError = (codigoBarras, erroresProducto) =>
  !!erroresProducto?.[codigoBarras] &&
  Object.keys(erroresProducto[codigoBarras]).length > 0;
