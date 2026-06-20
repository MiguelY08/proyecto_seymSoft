// shopPricingHelper.js - Helper para mostrar precios según clientType

const CLIENT_TYPES = {
  DETAL: 'DETAL',
  MAYORISTA: 'MAYORISTA',
  COLEGA: 'COLEGA',
  PACAS: 'PACAS',
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeClientType = (clientType) => {
  const normalized = String(clientType ?? '').trim().toUpperCase();

  if (normalized.includes('MAYOR')) return CLIENT_TYPES.MAYORISTA;
  if (normalized.includes('COLEGA') || normalized.includes('PARTNER')) {
    return CLIENT_TYPES.COLEGA;
  }
  if (normalized.includes('PACA') || normalized.includes('BULK')) {
    return CLIENT_TYPES.PACAS;
  }

  return CLIENT_TYPES.DETAL;
};

/**
 * Obtiene el precio y descuento a mostrar según el tipo de cliente
 * @param {Object} product - Producto normalizado
 * @param {string} clientType - Tipo de cliente: 'DETAL' | 'MAYORISTA' | 'COLEGA' | 'PACAS'
 * @returns {Object} { price, originalPrice, discountPct, label, clientType }
 */
export const getDisplayPricing = (product, clientType = 'DETAL') => {
  const normalizedClientType = normalizeClientType(clientType);

  if (!product) {
    return {
      price: 0,
      originalPrice: 0,
      discountPct: 0,
      label: 'Precio no disponible',
      clientType: normalizedClientType,
      hasDiscount: false
    };
  }

  const retailPrice = toNumber(
    product.retailPrice ?? product.detailPrice ?? product.price
  );

  const clientTypeMap = {
    'DETAL': {
      basePrice: retailPrice,
      discountPct: toNumber(product.retailDiscountPct),
      label: 'Precio Detal'
    },
    'MAYORISTA': {
      basePrice: toNumber(product.wholesalePrice, retailPrice) || retailPrice,
      discountPct: toNumber(product.wholesaleDiscountPct),
      label: 'Precio Mayorista'
    },
    'COLEGA': {
      basePrice: toNumber(product.partnerPrice, retailPrice) || retailPrice,
      discountPct: toNumber(product.partnerDiscountPct),
      label: 'Precio Colega'
    },
    'PACAS': {
      basePrice: toNumber(product.bulkPrice, retailPrice) || retailPrice,
      discountPct: toNumber(product.bulkDiscountPct),
      label: 'Precio Pacas'
    }
  };

  const pricing = clientTypeMap[normalizedClientType] || clientTypeMap.DETAL;
  const safeDiscountPct = Math.min(Math.max(pricing.discountPct, 0), 100);
  const finalPrice = pricing.basePrice * (1 - safeDiscountPct / 100);

  return {
    price: Math.round(finalPrice),
    originalPrice: Math.round(pricing.basePrice),
    discountPct: safeDiscountPct,
    label: pricing.label,
    clientType: normalizedClientType,
    hasDiscount: safeDiscountPct > 0
  };
};

/**
 * Formatea el precio para mostrar en la interfaz
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado: "$12.000"
 */
export const formatPrice = (price) => {
  return `$${Math.round(price).toLocaleString('es-CO')}`;
};

/**
 * Obtiene clase CSS para mostrar el descuento
 * @param {number} discountPct - Porcentaje de descuento
 * @returns {string} Clase CSS apropiada
 */
export const getDiscountBadgeClass = (discountPct) => {
  if (discountPct >= 20) return 'discount-badge-high';
  if (discountPct >= 10) return 'discount-badge-medium';
  return 'discount-badge-low';
};

/**
 * Obtiene el badge de descuento a mostrar
 * @param {number} discountPct - Porcentaje de descuento
 * @returns {Object} { show: boolean, text: string, class: string }
 */
export const getDiscountBadge = (discountPct) => {
  if (!discountPct || discountPct <= 0) {
    return { show: false, text: '', class: '' };
  }

  return {
    show: true,
    text: `-${Math.round(discountPct)}%`,
    class: getDiscountBadgeClass(discountPct)
  };
};

export default {
  getDisplayPricing,
  formatPrice,
  getDiscountBadge,
  getDiscountBadgeClass
};
