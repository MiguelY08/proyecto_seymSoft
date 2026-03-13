// utils/returnsHelpers.js
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('$', '').trim();
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const getEstadoColor = (estado) => {
  const colors = {
    'Pendiente': '#dc2626',
    'Aprobada': '#16a34a',
    'Rechazada': '#6b7280',
    'Anulada': '#6b7280'
  };
  return colors[estado] || '#dc2626';
};

export const getStatusStyle = (status) => {
  const styles = {
    'Pendiente': 'text-red-600 bg-red-100',
    'Aprobada': 'text-green-600 bg-green-100',
    'Rechazada': 'text-gray-600 bg-gray-100',
    'Anulada': 'text-gray-400 bg-gray-100'
  };
  return styles[status] || styles['Pendiente'];
};

export const getStatusText = (status) => {
  return status;
};

export const calculateTotals = (products) => {
  return products.reduce((acc, product) => {
    return acc + (product.cantidad * product.precioUnit);
  }, 0);
};

export const generateReturnNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DEV-${year}-${random}`;
};

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