// src/components/ProductCard/helpers/productCard.helpers.js

/**
 * Imagen por defecto para productos sin imagen.
 * Puedes cambiar esta ruta según la ubicación real de tus assets.
 */
export const PRODUCT_IMAGE_FALLBACK = '/images/product-placeholder.png';

/**
 * Imágenes temporales de prueba.
 *
 * Se usan mientras la API de productos aún no retorna imágenes.
 * Cuando la API ya envíe imágenes reales, estas dejarán de usarse
 * automáticamente porque normalizeProductImages prioriza product.images,
 * product.image, product.img_url, etc.
 */
export const PRODUCT_TEST_IMAGES = [
  {
    url: PRODUCT_IMAGE_FALLBACK,
    alt: 'Imagen temporal de producto 1',
  },
  {
    url: PRODUCT_IMAGE_FALLBACK,
    alt: 'Imagen temporal de producto 2',
  },
  {
    url: PRODUCT_IMAGE_FALLBACK,
    alt: 'Imagen temporal de producto 3',
  },
];

/**
 * Normaliza un producto para que la card siempre trabaje
 * con una estructura segura y consistente.
 *
 * Soporta:
 * - Datos quemados actuales de Home.jsx
 * - Datos futuros provenientes de la API de productos
 */
export function normalizeProduct(product = {}) {
  const images = normalizeProductImages(product);

  const retailPrice = Number(
    product.retailPrice ??
      product.detailPrice ??
      product.price ??
      product.sale_price ??
      0
  );

  const originalPrice = Number(
    product.originalPrice ??
      product.original_price ??
      product.regular_price ??
      retailPrice ??
      0
  );

  const stock = Number(
    product.totalStock ??
      product.stock ??
      product.quantity ??
      0
  );

  const status = normalizeProductStatus(
    product.status ?? product.product_status ?? 'Activo'
  );

  return {
    ...product,

    id: product.id ?? product.id_product ?? product.product_id ?? null,

    name: product.name ?? product.product_name ?? 'Producto sin nombre',

    category: getSafeCategory(product),

    brand: getSafeBrand(product),

    price: Number(product.price ?? retailPrice),

    originalPrice,

    stock,

    totalStock: stock,

    status,

    isActive: status === 'active',

    slug: product.slug ?? null,

    description: product.description ?? '',

    images,

    mainImage: getMainImage(images),

    image: getMainImage(images),

    categories: Array.isArray(product.categories) ? product.categories : [],

    subcategories: Array.isArray(product.subcategories)
      ? product.subcategories
      : [],

    mainCategory:
      product.mainCategory ??
      (Array.isArray(product.categories) ? product.categories[0] : null) ??
      null,

    /**
     * Campos útiles para futuras implementaciones.
     * No necesariamente se muestran en la card.
     */
    reference: product.reference ?? null,
    retailPrice,
    wholesalePrice: Number(product.wholesalePrice ?? retailPrice),
    partnerPrice:
      product.partnerPrice == null ? null : Number(product.partnerPrice),
    bulkPrice: product.bulkPrice == null ? null : Number(product.bulkPrice),
    retailDiscountPct: Number(product.retailDiscountPct ?? 0),
    wholesaleDiscountPct: Number(product.wholesaleDiscountPct ?? 0),
    partnerDiscountPct: Number(product.partnerDiscountPct ?? 0),
    bulkDiscountPct: Number(product.bulkDiscountPct ?? 0),
    ivaPercentage: Number(product.ivaPercentage ?? product.iva_percentage ?? 0),
    unitMeasure: product.unitMeasure ?? product.unit_measure ?? null,
    barcodes: product.barcodes ?? [],

    /**
     * Guarda el producto original por si se necesita
     * acceder a datos no normalizados más adelante.
     */
    raw: product,
  };
}

/**
 * Normaliza las imágenes del producto.
 *
 * Soporta:
 * - product.images como array de strings
 * - product.images como array de objetos
 * - product.productImages como array
 * - product.product_images como array
 * - product.gallery como array
 * - product.image como string
 * - product.img_url como string
 */
export function normalizeProductImages(product = {}) {
  const rawImages =
    product.images ??
    product.productImages ??
    product.product_images ??
    product.gallery ??
    product.image ??
    product.img_url ??
    [];

  const imagesArray = Array.isArray(rawImages) ? rawImages : [rawImages];

  const normalizedImages = imagesArray
    .map((image, index) => {
      if (!image) return null;

      if (typeof image === 'string') {
        return {
          url: image,
          alt:
            product.name ??
            product.product_name ??
            `Imagen del producto ${index + 1}`,
        };
      }

      return {
        url:
          image.url ??
          image.image_url ??
          image.img_url ??
          image.src ??
          image.path ??
          PRODUCT_IMAGE_FALLBACK,

        alt:
          image.alt ??
          image.description ??
          image.name ??
          product.name ??
          product.product_name ??
          `Imagen del producto ${index + 1}`,
      };
    })
    .filter((image) => image && image.url);

  /**
   * Si el producto no trae imágenes, se usan imágenes temporales.
   * Esto permite probar el carrusel desde ahora.
   */
  if (normalizedImages.length === 0) {
    return PRODUCT_TEST_IMAGES.map((image) => ({
      ...image,
      alt: product.name ?? product.product_name ?? image.alt,
    }));
  }

  return normalizedImages;
}

/**
 * Normaliza el estado del producto.
 *
 * La API puede enviar estados en español como:
 * - "Activo"
 * - "Inactivo"
 *
 * Internamente los convertimos a:
 * - "active"
 * - "inactive"
 */
export function normalizeProductStatus(status = 'Activo') {
  const normalizedStatus = String(status).trim().toLowerCase();

  if (['activo', 'active', 'enabled', 'disponible'].includes(normalizedStatus)) {
    return 'active';
  }

  if (['inactivo', 'inactive', 'disabled', 'no disponible'].includes(normalizedStatus)) {
    return 'inactive';
  }

  return normalizedStatus;
}

/**
 * Retorna la primera imagen válida del producto.
 */
export function getMainImage(images = []) {
  return images?.[0]?.url ?? PRODUCT_IMAGE_FALLBACK;
}

/**
 * Formatea precios en pesos colombianos.
 */
export function formatPrice(price = 0) {
  const safePrice = Number(price) || 0;

  return safePrice.toLocaleString('es-CO', {
    maximumFractionDigits: 0,
  });
}

/**
 * Determina si el producto tiene descuento real.
 */
export function hasDiscount(product = {}) {
  const price = Number(product.price ?? product.retailPrice ?? 0);

  const originalPrice = Number(
    product.originalPrice ??
      product.original_price ??
      product.regular_price ??
      0
  );

  return originalPrice > price && price > 0;
}

/**
 * Calcula el porcentaje de descuento.
 */
export function getDiscountPercentage(product = {}) {
  if (!hasDiscount(product)) return 0;

  const price = Number(product.price ?? product.retailPrice ?? 0);

  const originalPrice = Number(
    product.originalPrice ??
      product.original_price ??
      product.regular_price ??
      0
  );

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Valida si el producto tiene stock disponible y está activo.
 */
export function isProductAvailable(product = {}) {
  const stock = Number(product.stock ?? product.totalStock ?? 0);
  const status = normalizeProductStatus(product.status ?? 'Activo');

  return status === 'active' && stock > 0;
}

/**
 * Retorna una categoría segura para mostrar en UI.
 */
export function getSafeCategory(product = {}) {
  return (
    product.mainCategory?.name ??
    product.categories?.[0]?.name ??
    product.category?.name ??
    product.category_name ??
    product.category ??
    'Sin categoría'
  );
}

/**
 * Retorna una marca segura para mostrar en UI.
 */
export function getSafeBrand(product = {}) {
  return (
    product.brand?.name ??
    product.brand_name ??
    product.brand ??
    null
  );
}

/**
 * Construye la ruta del detalle del producto.
 * Prioriza slug si existe, de lo contrario usa id.
 */
export function getProductDetailPath(product = {}) {
  const identifier = product.slug ?? product.id;

  return identifier ? `/shop/detail/${identifier}` : '/shop';
}
