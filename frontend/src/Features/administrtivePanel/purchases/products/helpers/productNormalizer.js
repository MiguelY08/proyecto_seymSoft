// productNormalizer.js - Utilidades para normalizar datos de productos

/**
 * Normaliza un producto desde la BD para usarlo en el frontend
 * Convierte tipos, valida datos, estructura imágenes
 * @param {Object} rawProduct - Producto sin procesar de la BD
 * @returns {Object} Producto normalizado
 */
export const normalizeProduct = (rawProduct) => {
  if (!rawProduct) return null;

  return {
    // Datos básicos
    id: rawProduct.id,
    name: rawProduct.name || 'Sin nombre',
    reference: rawProduct.reference || '',
    
    // Precios (convertir de STRING a NUMBER)
    retailPrice: parseFloat(rawProduct.retailPrice) || 0,
    wholesalePrice: parseFloat(rawProduct.wholesalePrice) || 0,
    partnerPrice: rawProduct.partnerPrice ? parseFloat(rawProduct.partnerPrice) : null,
    bulkPrice: rawProduct.bulkPrice ? parseFloat(rawProduct.bulkPrice) : null,
    supplierPrice: rawProduct.supplierPrice !== undefined && rawProduct.supplierPrice !== null && rawProduct.supplierPrice !== ''
      ? parseFloat(rawProduct.supplierPrice)
      : null,
    
    // Descuentos
    retailDiscountPct: parseFloat(rawProduct.retailDiscountPct) || 0,
    wholesaleDiscountPct: parseFloat(rawProduct.wholesaleDiscountPct) || 0,
    partnerDiscountPct: rawProduct.partnerDiscountPct ? parseFloat(rawProduct.partnerDiscountPct) : null,
    bulkDiscountPct: rawProduct.bulkDiscountPct ? parseFloat(rawProduct.bulkDiscountPct) : null,
    
    // IVA
    ivaPercentage: parseFloat(rawProduct.ivaPercentage) || 0,
    
    // Descripción (validar que no sea string "null")
    description: rawProduct.description && rawProduct.description !== 'null' 
      ? rawProduct.description 
      : null,
    
    // Cantidad y stock
    quantityPerPack: parseInt(rawProduct.quantityPerPack) || 0,
    totalStock: parseInt(rawProduct.totalStock) || 0,
    
    // Unidad de medida
    unitMeasure: rawProduct.unitMeasure || { id: null, name: 'Unidad' },
    
    // Estado
    status: rawProduct.status || 'Inactivo',
    isActive: rawProduct.status === 'Activo',
    
    // Códigos de barras
    barcodes: Array.isArray(rawProduct.barcodes) 
      ? rawProduct.barcodes.map(b => ({
          id: b.id,
          barcode: b.barcode,
          barcodeType: b.barcodeType || 'EAN13',
          stock: parseInt(b.stock) || 0
        }))
      : [],
    
    // Imágenes (ordenadas: primary primero)
    images: normalizeProductImages(rawProduct.images),
    
    // Categorías
    categories: Array.isArray(rawProduct.categories)
      ? rawProduct.categories.map(cat => ({
          id: cat.id,
          name: cat.name
        }))
      : [],
    
    // Subcategorías
    subcategories: Array.isArray(rawProduct.subcategories)
      ? rawProduct.subcategories.map(sub => ({
          id: sub.id,
          name: sub.name
        }))
      : [],
    
    // Propiedades derivadas útiles
    mainCategory: rawProduct.categories?.[0] || null,
    mainImage: normalizeProductImages(rawProduct.images)?.[0] || null,
  };
};

/**
 * Normaliza imágenes de un producto
 * Ordena por isPrimary (primary primero)
 * @param {Array} rawImages - Array de imágenes sin procesar
 * @returns {Array} Array de imágenes normalizadas
 */
export const normalizeProductImages = (rawImages) => {
  if (!Array.isArray(rawImages) || rawImages.length === 0) {
    return [];
  }

  return rawImages
    .sort((a, b) => {
      // Primary (true) antes que no-primary (false)
      if (a.isPrimary === true && b.isPrimary !== true) return -1;
      if (a.isPrimary !== true && b.isPrimary === true) return 1;
      return 0;
    })
    .map((img, index) => ({
      id: img.id,
      url: img.url || img.image_url || '',
      alt: `Imagen ${index + 1}`,
      isPrimary: img.isPrimary === true
    }))
    .filter(img => img.url); // Filtrar imágenes sin URL
};

/**
 * Normaliza un array de productos
 * @param {Array} products - Array de productos sin procesar
 * @returns {Array} Array de productos normalizados
 */
export const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(p => normalizeProduct(p)).filter(p => p !== null);
};

/**
 * Obtiene el precio a mostrar según el tipo
 * @param {Object} product - Producto normalizado
 * @param {string} priceType - 'retail' | 'wholesale' | 'partner' | 'bulk'
 * @returns {number} Precio
 */
export const getProductPrice = (product, priceType = 'retail') => {
  const priceMap = {
    retail: product.retailPrice,
    wholesale: product.wholesalePrice,
    partner: product.partnerPrice,
    bulk: product.bulkPrice
  };
  
  return priceMap[priceType] || product.retailPrice || 0;
};

/**
 * Calcula precio con descuento
 * @param {Object} product - Producto normalizado
 * @param {string} priceType - 'retail' | 'wholesale' | 'partner' | 'bulk'
 * @returns {number} Precio con descuento aplicado
 */
export const getPriceWithDiscount = (product, priceType = 'retail') => {
  const basePrice = getProductPrice(product, priceType);
  const discountMap = {
    retail: product.retailDiscountPct,
    wholesale: product.wholesaleDiscountPct,
    partner: product.partnerDiscountPct,
    bulk: product.bulkDiscountPct
  };
  
  const discountPct = discountMap[priceType] || 0;
  const discountAmount = basePrice * (discountPct / 100);
  
  return basePrice - discountAmount;
};

/**
 * Valida si un producto puede ser mostrado (está activo y tiene imágenes)
 * @param {Object} product - Producto normalizado
 * @returns {boolean}
 */
export const isProductDisplayable = (product) => {
  return product && 
    product.isActive && 
    product.images && 
    product.images.length > 0;
};

export default {
  normalizeProduct,
  normalizeProductImages,
  normalizeProducts,
  getProductPrice,
  getPriceWithDiscount,
  isProductDisplayable
};