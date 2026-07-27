const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export function formatDeliveryAddress(order = {}) {
  const deliveryAddress = String(
    order.direccionEntrega ?? order.deliveryAddress ?? order.address ?? ''
  ).trim();
  const deliveryLocation = [
    order.ciudadEntregaNombre,
    order.departamentoEntregaNombre,
  ].filter(Boolean).join(', ');

  if (!deliveryLocation) return deliveryAddress;
  if (!deliveryAddress) return deliveryLocation;

  const normalizedAddress = normalizeText(deliveryAddress);
  const hasCity = order.ciudadEntregaNombre
    ? normalizedAddress.includes(normalizeText(order.ciudadEntregaNombre))
    : false;
  const hasDepartment = order.departamentoEntregaNombre
    ? normalizedAddress.includes(normalizeText(order.departamentoEntregaNombre))
    : false;

  return hasCity || hasDepartment
    ? deliveryAddress
    : `${deliveryLocation} - ${deliveryAddress}`;
}
