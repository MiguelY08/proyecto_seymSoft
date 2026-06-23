const roundMoney = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

export const normalizeClientTypeForPricing = (clientType) => {
  const normalizedType = String(clientType ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (normalizedType.includes('mayor')) return 'wholesale';
  if (normalizedType.includes('colega') || normalizedType.includes('partner')) return 'partner';
  if (normalizedType.includes('paca') || normalizedType.includes('bulk')) return 'bulk';

  return 'retail';
};

export const getProductPriceForClient = (product = {}, client = null) => {
  const pricingType = normalizeClientTypeForPricing(client?.clientType);

  if (pricingType === 'wholesale') {
    return roundMoney(
      product.wholesalePrice ??
      product.precioMayorista ??
      product.retailPrice ??
      product.precioDetalle ??
      product.price ??
      0
    );
  }

  if (pricingType === 'partner') {
    return roundMoney(
      product.partnerPrice ??
      product.precioColegas ??
      product.retailPrice ??
      product.precioDetalle ??
      product.price ??
      0
    );
  }

  if (pricingType === 'bulk') {
    return roundMoney(
      product.bulkPrice ??
      product.precioPacas ??
      product.retailPrice ??
      product.precioDetalle ??
      product.price ??
      0
    );
  }

  return roundMoney(
    product.retailPrice ??
    product.precioDetalle ??
    product.price ??
    0
  );
};
