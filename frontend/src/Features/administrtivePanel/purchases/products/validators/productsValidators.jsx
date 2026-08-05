// ─── Validación de campos del formulario ──────────────────────────────────────
// isCreating : true → exige imagen | false → la imagen es opcional (ya existe)
export const validate = (data, { isCreating = true } = {}) => {
  const errors = {};

  if (isCreating && !data.imagen) {
    errors.imagen = 'Debes subir una imagen del producto.';
  }

  if (!data.nombre?.trim()) {
    errors.nombre = 'El nombre del producto es obligatorio.';
  } else if (data.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
  }

  if (!data.codBarras?.trim()) {
    errors.codBarras = 'El código de barras es obligatorio.';
  }

  if (!data.referencia?.trim()) {
    errors.referencia = 'La referencia es obligatoria.';
  }

  if (data.stock === '' || data.stock === undefined) {
    errors.stock = 'El stock es obligatorio.';
  } else if (!Number.isInteger(Number(data.stock)) || Number(data.stock) < 0) {
    errors.stock = 'El stock debe ser un número entero mayor o igual a 0.';
  }

  if (!data.categorias?.length) {
    errors.categorias = 'Debes seleccionar al menos una categoría.';
  }

  return errors;
};


// ─── Validación cruzada de precios ────────────────────────────────────────────
// Cada precio de paca debe ser menor al precio base correspondiente.
// El precio mayorista debe ser menor al detal, colegas ≤ mayorista.
export const validatePrices = (data) => {
  const errors = {};

  const det = Number(data.precioDetalle);
  const may = Number(data.precioMayorista);
  const col = Number(data.precioColegas);
  const pac = Number(data.precioPacas);
  const dp  = Number(data.precioDetallePaca);
  const mp  = Number(data.precioMayoristaPaca);
  const cp  = Number(data.precioColegasPaca);
  const pp  = Number(data.precioPacasPaca);

  if (data.precioMayorista     && det && may >= det) errors.precioMayorista     = 'Debe ser menor al precio detal.';
  if (data.precioColegas       && may && col >  may) errors.precioColegas       = 'Debe ser menor o igual al precio mayorista.';
  if (data.precioDetallePaca   && det && dp  >= det) errors.precioDetallePaca   = 'Debe ser menor al precio detal.';
  if (data.precioMayoristaPaca && may && mp  >= may) errors.precioMayoristaPaca = 'Debe ser menor al precio mayorista.';
  if (data.precioColegasPaca   && col && cp  >= col) errors.precioColegasPaca   = 'Debe ser menor al precio colegas.';
  if (data.precioPacasPaca     && pac && pp  >= pac) errors.precioPacasPaca     = 'Debe ser menor al precio x pacas.';

  return errors;
};
