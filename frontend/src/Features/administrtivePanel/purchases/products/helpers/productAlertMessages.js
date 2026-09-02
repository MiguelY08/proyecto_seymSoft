const ACTION_FALLBACKS = {
  load: ['No se pudieron cargar los productos', 'No fue posible consultar el catálogo. Recarga la página para intentarlo nuevamente.'],
  loadForm: ['No se pudo preparar el formulario', 'No fue posible consultar la información necesaria del producto. Regresa al listado e inténtalo nuevamente.'],
  create: ['No se pudo crear el producto', 'El producto no fue guardado. Revisa la información ingresada e inténtalo nuevamente.'],
  update: ['No se pudo actualizar el producto', 'Los cambios no fueron guardados. Revisa la información ingresada e inténtalo nuevamente.'],
  toggle: ['No se pudo cambiar el estado', 'El producto conserva su estado anterior. Revisa sus datos e inténtalo nuevamente.'],
  delete: ['No se pudo eliminar el producto', 'El producto no fue eliminado. Verifica que esté inactivo y que no tenga movimientos asociados.'],
};

const serverMessage = (error) => error?.response?.data?.message
  || error?.response?.data?.error?.message
  || error?.userMessage
  || error?.message
  || '';

export const getProductAlertError = (error, action = 'load') => {
  const [fallbackTitle, fallbackText] = ACTION_FALLBACKS[action] || ACTION_FALLBACKS.load;
  const status = error?.response?.status;
  const message = serverMessage(error);
  const normalized = message.toLowerCase();

  if (error?.isNetworkError || error?.code === 'ERR_NETWORK' || normalized === 'network error' || (error?.request && !error?.response)) {
    return { title: 'Sin conexión con el servidor', text: 'No fue posible comunicarse con el servidor. Comprueba que el backend esté encendido y vuelve a intentarlo.' };
  }
  if (status === 401) return { title: 'Sesión no válida', text: 'Tu sesión venció o no pudo verificarse. Inicia sesión nuevamente antes de continuar con productos.' };
  if (status === 403) return { title: 'Acción no autorizada', text: 'Tu usuario no tiene permiso para realizar esta acción en el módulo de productos.' };
  if (status === 404) return { title: 'Producto no encontrado', text: 'El producto ya no existe o fue eliminado. Regresa al listado para actualizar la información.' };

  if (action === 'toggle' && (normalized.includes('precio') || normalized.includes('landing') || normalized.includes('completa'))) {
    return {
      title: 'Producto sin precios para publicar',
      text: `${message || 'El producto no tiene configurados todos los precios de venta.'} No se puede activar porque un producto sin precios no debe mostrarse en la landing. Completa los precios y vuelve a intentarlo.`,
    };
  }
  if (normalized.includes('referencia') || normalized.includes('código de barras') || normalized.includes('codigo de barras') || normalized.includes('barcode')) {
    return { title: 'Referencia o código ya registrado', text: `${message || 'La referencia o el código de barras pertenece a otro producto.'} Usa un valor diferente para poder guardar.` };
  }
  if (normalized.includes('precio')) return { title: 'Precios del producto no válidos', text: `${message} Revisa la relación entre el precio de compra y los precios de venta.` };
  if (normalized.includes('iva') || normalized.includes('descuento') || normalized.includes('porcentaje')) {
    return { title: 'Porcentaje no válido', text: `${message} Los porcentajes deben estar entre 0 y 100.` };
  }
  if (normalized.includes('imagen') || normalized.includes('archivo') || normalized.includes('formato')) {
    return { title: 'No se pudo guardar la imagen', text: `${message} Verifica el formato y el tamaño de las imágenes seleccionadas.` };
  }
  if (action === 'delete' && (status === 409 || normalized.includes('asociad') || normalized.includes('movimiento'))) {
    return { title: 'Producto con movimientos asociados', text: `${message || 'El producto tiene movimientos asociados.'} Consérvalo inactivo en lugar de eliminarlo.` };
  }

  return { title: fallbackTitle, text: message && message !== 'Network Error' ? message : fallbackText };
};
