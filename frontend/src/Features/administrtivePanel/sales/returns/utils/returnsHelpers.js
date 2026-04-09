// utils/returnsHelpers.js

// ======================= FUNCIONALIDAD: FORMATEO =======================

/**
 * Formatea un número como moneda COP (Peso Colombiano) sin decimales.
 * Usa la configuración regional de Colombia para separadores.
 * 
 * @param {number} value - Valor numérico a formatear
 * @returns {string} Valor formateado como moneda (ej: "1.500.000")
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('$', '').trim();
};

/**
 * Formatea una fecha en formato DD/MM/YYYY según configuración regional de Colombia.
 * 
 * @param {string|Date} date - Fecha a formatear ISO string o objeto Date
 * @returns {string} Fecha formateada en formato local (DD/MM/YYYY)
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Retorna el color hexadecimal asociado a un estado de devolución.
 * Utilizado para mostrar indicadores visuales en la UI.
 * 
 * @param {string} estado - Estado de la devolución ('En Proceso', 'Procesada', 'Anulado')
 * @returns {string} Código hexadecimal del color correspondiente
 */
export const getEstadoColor = (estado) => {
  const colors = {
    'En Proceso': '#eab308',
    'Procesada': '#16a34a',
    'Anulado': '#dc2626'
  };
  return colors[estado] || '#eab308';
};

/**
 * Retorna las clases Tailwind CSS para mostrar el estado como badge.
 * Combina color de texto y fondo según el estado.
 * 
 * @param {string} status - Estado de la devolución
 * @returns {string} Clases Tailwind para el badge
 */
export const getStatusStyle = (status) => {
  const styles = {
    'En Proceso': 'text-yellow-700 bg-yellow-100',
    'Procesada': 'text-green-700 bg-green-100',
    'Anulado': 'text-red-600 bg-red-100'
  };
  return styles[status] || styles['En Proceso'];
};

/**
 * Retorna el texto del estado como string.
 * Función auxiliar para normalizar representación de estados.
 * 
 * @param {string} status - Estado a procesar
 * @returns {string} Estado normalizado
 */
export const getStatusText = (status) => {
  return status;
};

/**
 * Obtiene los estados válidos de un producto según el método de devolución.
 * Los estados disponibles varían según si es Reemplazo, Reembolso o Saldo a favor.
 * 
 * @param {string} metodo - Método de devolución (Reemplazo, Reembolso, Saldo a favor)
 * @returns {Array<string>} Array de estados válidos para el método
 */
export const getProductStatesForMethod = (metodo) => {
  const statesMap = {
    'Reemplazo': [
      'Pend. Envío',
      'Pend. Reemplazo',
      'Entregado'
    ],
    'Reembolso': [
      'Pend. Envío',
      'Pend. Reembolso',
      'Entregado'
    ],
    'Saldo a favor': [
      'Pend. Envío',
      'Entregado'
    ]
  };
  return statesMap[metodo] || [];
};

/**
 * Valida si un estado es válido para un método específico.
 * 
 * @param {string} estado - Estado a validar
 * @param {string} metodo - Método de devolución
 * @returns {boolean} true si el estado es válido para el método
 */
export const isValidStateForMethod = (estado, metodo) => {
  const validStates = getProductStatesForMethod(metodo);
  return validStates.includes(estado);
};

/**
 * Calcula automáticamente el estado general de una devolución basado en los estados
 * de los productos individuales.
 * 
 * Reglas:
 * - Si está anulada: devuelve 'Anulado'
 * - Si todos los productos están en 'Entregado': devuelve 'Procesada'
 * - Si al menos un producto NO está en 'Entregado': devuelve 'En Proceso'
 * 
 * @param {Array<Object>} productosDevueltos - Array de productos devueltos con su estado
 * @param {boolean} isAnulada - Si la devolución está anulada
 * @returns {string} Estado general calculado
 */
export const calculateGeneralStatus = (productosDevueltos = [], isAnulada = false) => {
  if (isAnulada) return 'Anulado';
  
  if (!productosDevueltos || productosDevueltos.length === 0) {
    return 'En Proceso';
  }
  
  // Obtener todos los estados de los productos
  const allStates = productosDevueltos.every(prod => 
    prod.estado === 'Entregado'
  );
  
  return allStates ? 'Procesada' : 'En Proceso';
};

/**
 * Obtiene el estado inicial para un producto según el método seleccionado.
 * Siempre devuelve el primer estado disponible del método.
 * 
 * @param {string} metodo - Método de devolución
 * @returns {string} Primer estado válido para el método
 */
export const getInitialStateForMethod = (metodo) => {
  const states = getProductStatesForMethod(metodo);
  return states[0] || 'Pend. Envío';
};

/**
 * Calcula el valor total de un array de productos.
 * Multiplica cantidad por precio unitario de cada producto y suma todos.
 * 
 * @param {Array} products - Array de productos con campos 'cantidad' y 'precioUnit'
 * @returns {number} Valor total acumulado
 */
export const calculateTotals = (products) => {
  return products.reduce((acc, product) => {
    return acc + (product.cantidad * product.precioUnit);
  }, 0);
};

/**
 * Genera un número único para nuevas devoluciones.
 * Formato: DEV-YYYY-XXXX (ej: DEV-2024-5732)
 * 
 * @returns {string} Número de devolución generado
 */
export const generateReturnNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DEV-${year}-${random}`;
};

// ======================= FUNCIONALIDAD: FILTRADO =======================

/**
 * Filtra un array de devoluciones por término de búsqueda.
 * Busca en múltiples campos: número, factura, cliente, motivo y estado.
 * La búsqueda es case-insensitive.
 * 
 * @param {Array} returns - Array de devoluciones a filtrar
 * @param {string} searchTerm - Término de búsqueda (puede estar vacío)
 * @returns {Array} Array filtrado de devoluciones que coinciden
 */
export const filterReturns = (returns, searchTerm) => {
  if (!searchTerm) return returns;
  
  const term = searchTerm.toLowerCase().trim();
  return returns.filter(r => 
    r.numeroDevolucion?.toLowerCase().includes(term) ||
    r.numeroFactura?.toLowerCase().includes(term) ||
    r.cliente?.toLowerCase().includes(term) ||
    r.motivo?.toLowerCase().includes(term) ||
    r.estado?.toLowerCase().includes(term)
  );
};

/**
 * Filtra las devoluciones por término de búsqueda y rango de fechas
 * 
 * @param {Array} returns - Array de devoluciones
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} startDate - Fecha inicial (YYYY-MM-DD)
 * @param {string} endDate - Fecha final (YYYY-MM-DD)
 * @returns {Array} Devoluciones filtradas
 */
export const filterReturnsByDateAndSearch = (returns, searchTerm, startDate, endDate) => {
  if (!returns || returns.length === 0) return [];
  
  let filtered = [...returns];
  
  // Filtrar por rango de fechas
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    filtered = filtered.filter(r => {
      const returnDate = new Date(r.fechaCreacion);
      return returnDate >= start && returnDate <= end;
    });
  } else if (startDate) {
    const start = new Date(startDate);
    filtered = filtered.filter(r => new Date(r.fechaCreacion) >= start);
  } else if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(r => new Date(r.fechaCreacion) <= end);
  }
  
  // Filtrar por término de búsqueda
  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(r => 
      r.numeroDevolucion?.toLowerCase().includes(term) ||
      r.numeroFactura?.toLowerCase().includes(term) ||
      r.cliente?.toLowerCase().includes(term) ||
      r.motivo?.toLowerCase().includes(term) ||
      r.estado?.toLowerCase().includes(term)
    );
  }
  
  return filtered;
};

// ======================= FUNCIONALIDAD: PAGINACIÓN =======================

/**
 * Divide un array de datos en páginas para visualización en tabla.
 * Calcula el índice de inicio, los datos de la página actual y el total de páginas.
 * 
 * @param {Array} data - Array completo de datos a paginar
 * @param {number} currentPage - Número de página actual (1-indexed)
 * @param {number} recordsPerPage - Cantidad de registros por página
 * @returns {Object} Objeto con currentData, totalPages, startIndex y safeCurrentPage
 * @returns {Array} return.currentData - Datos de la página actual
 * @returns {number} return.totalPages - Total de páginas disponibles
 * @returns {number} return.startIndex - Índice de inicio en el array original
 * @returns {number} return.safeCurrentPage - Página segura (ajustada si es necesario)
 */
export const paginateData = (data, currentPage, recordsPerPage) => {
  const totalPages = Math.max(1, Math.ceil(data.length / recordsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * recordsPerPage;
  const currentData = data.slice(startIndex, startIndex + recordsPerPage);

  return {
    currentData,
    totalPages,
    startIndex,
    safeCurrentPage
  };
};

// ======================= FUNCIONALIDAD: EXPORTACIÓN =======================

/**
 * Prepara datos de devoluciones para exportación a Excel.
 * Formatea valores monetarios y fechas según configuración regional.
 * 
 * @param {Array} returns - Array de devoluciones a exportar
 * @returns {Object} Objeto con estructura para librería XLSX
 * @returns {Array} return.headers - Encabezados de columnas
 * @returns {Array} return.data - Datos formateados para Excel
 */
export const exportToExcel = (returns) => {
  const headers = [
    'Número Devolución',
    'Factura',
    'Cliente',
    'Motivo',
    'Fecha',
    'Valor',
    'Estado'
  ];
  
  const data = returns.map(r => [
    r.numeroDevolucion,
    r.numeroFactura,
    r.cliente,
    r.motivo,
    formatDate(r.fechaCreacion),
    `$${formatCurrency(r.totalValor)}`,
    r.estado
  ]);
  
  return { headers, data };
};