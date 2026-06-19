// shopPricingHelper.js - Helper para mostrar precios según clientType

import { getProductPrice, getPriceWithDiscount } from './productNormalizer';

/**
 * Obtiene el precio y descuento a mostrar según el tipo de cliente
 * @param {Object} product - Producto normalizado
 * @param {string} clientType - Tipo de cliente: 'DETAL' | 'MAYORISTA' | 'COLEGA' | 'PACAS'
 * @returns {Object} { price, originalPrice, discountPct, label, clientType }
 */
export const getDisplayPricing = (product, clientType = 'DETAL') => {
  if (!product) {
    return {
      price: 0,
      originalPrice: 0,
      discountPct: 0,
      label: 'Precio no disponible',
      clientType: 'DETAL'
    };
  }

  const clientTypeMap = {
    'DETAL': {
      basePrice: product.retailPrice,
      discountPct: product.retailDiscountPct || 0,
      label: 'Precio Detal'
    },
    'MAYORISTA': {
      basePrice: product.wholesalePrice,
      discountPct: product.wholesaleDiscountPct || 0,
      label: 'Precio Mayorista'
    },
    'COLEGA': {
      basePrice: product.partnerPrice || product.retailPrice,
      discountPct: product.partnerDiscountPct || 0,
      label: 'Precio Colega'
    },
    'PACAS': {
      basePrice: product.bulkPrice || product.retailPrice,
      discountPct: product.bulkDiscountPct || 0,
      label: 'Precio Pacas'
    }
  };

  const pricing = clientTypeMap[clientType] || clientTypeMap['DETAL'];

  const finalPrice = pricing.basePrice - (pricing.basePrice * (pricing.discountPct / 100));

  return {
    price: Math.round(finalPrice),
    originalPrice: Math.round(pricing.basePrice),
    discountPct: pricing.discountPct,
    label: pricing.label,
    clientType,
    hasDiscount: pricing.discountPct > 0
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