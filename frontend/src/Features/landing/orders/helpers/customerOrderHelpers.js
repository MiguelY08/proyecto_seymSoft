export const getAuthenticatedClientId = (user) => {
  const candidate =
    user?.client?.id ??
    user?.client?.idClient ??
    user?.customer?.id ??
    user?.customer?.idClient ??
    user?.clientId ??
    user?.client_id ??
    user?.idClient ??
    null;

  if (candidate === null || candidate === undefined || candidate === '') return null;

  const clientId = Number(candidate);
  return Number.isFinite(clientId) ? clientId : null;
};

export const getProductBarcode = (product = {}) =>
  product.codBarras ??
  product.barcode ??
  product.barcodes?.find((item) => item.isPrimary)?.barcode ??
  product.barcodes?.[0]?.barcode ??
  '';

export const formatOrderDate = (value, options = {}) => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(date);
};

export const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const getOrderStatusClasses = (status) => {
  if (status === 'entregado') return 'bg-green-100 text-green-700';
  if (status === 'cancelado') return 'bg-red-100 text-red-700';
  if (status === 'listo') return 'bg-blue-100 text-blue-700';
  return 'bg-yellow-100 text-yellow-700';
};

