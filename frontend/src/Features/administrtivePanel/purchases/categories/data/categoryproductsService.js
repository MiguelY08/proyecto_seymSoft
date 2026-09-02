// features/categories/data/categoryproductsService.js
import { ProductsService } from '../../products/services/productsServices.js';
import {
  getCategories,
  getSubcategories,
  normalizeCategoryStatus,
} from './categoriesService.js';

const isActiveProduct = (product) =>
  product?.isActive === true ||
  String(product?.status ?? '').trim().toLowerCase() === 'activo';

const includesId = (entities, id) =>
  Array.isArray(entities) && entities.some((entity) => Number(entity?.id) === Number(id));

const getActiveRelationIds = async () => {
  const categories = await getCategories();
  const subcategoryGroups = await Promise.all(
    categories.map((category) => getSubcategories(category.id))
  );

  return {
    categoryIds: new Set(
      categories
        .filter((category) => normalizeCategoryStatus(category) === 'Activo')
        .map((category) => Number(category.id))
    ),
    subcategoryIds: new Set(
      subcategoryGroups
        .flat()
        .filter((subcategory) => normalizeCategoryStatus(subcategory) === 'Activo')
        .map((subcategory) => Number(subcategory.id))
    ),
  };
};

const hasActiveRelation = (product, activeRelationIds) =>
  product.categories?.some((category) => activeRelationIds.categoryIds.has(Number(category.id))) ||
  product.subcategories?.some((subcategory) => activeRelationIds.subcategoryIds.has(Number(subcategory.id)));

const synchronizeMatchingProducts = async (matches, activate) => {
  const products = await ProductsService.list();
  const matchingProducts = products.filter(matches);
  const activeRelationIds = activate ? null : await getActiveRelationIds();
  const productsToToggle = matchingProducts.filter((product) => {
    const shouldBeActive = activate || hasActiveRelation(product, activeRelationIds);
    return isActiveProduct(product) !== shouldBeActive;
  });

  await Promise.all(productsToToggle.map((product) => ProductsService.toggleStatus(product.id)));
  return productsToToggle.length;
};

/** Sincroniza los productos de una categoría sin ignorar sus otras relaciones activas. */
export const synchronizeProductsByCategory = async (categoryId, activate) => {
  const subcategories = await getSubcategories(categoryId);
  const subcategoryIds = new Set(subcategories.map((subcategory) => Number(subcategory.id)));

  return synchronizeMatchingProducts(
    (product) =>
      includesId(product.categories, categoryId) ||
      product.subcategories?.some((subcategory) => subcategoryIds.has(Number(subcategory.id))),
    activate
  );
};

/** Sincroniza los productos de una subcategoría sin ignorar sus otras relaciones activas. */
export const synchronizeProductsBySubcategory = (subcategoryId, activate) =>
  synchronizeMatchingProducts(
    (product) => includesId(product.subcategories, subcategoryId),
    activate
  );

// ==========================================
// PRODUCTOS POR SUBCATEGORÍA
// ==========================================

/**
 * Verifica si una subcategoría tiene productos asociados
 * @param {number} subcategoryId - ID de la subcategoría
 * @returns {Promise<boolean>} - True si tiene productos, False si no
 */
export const subcategoryHasProducts = async (subcategoryId) => {
  const products = await ProductsService.list();
  return products.some((product) => includesId(product.subcategories, subcategoryId));
};

/**
 * Obtiene los productos de una subcategoría
 * @param {number} subcategoryId - ID de la subcategoría
 * @returns {Promise<Array>} - Lista de productos
 */
export const getProductsBySubcategory = async (subcategoryId) => {
  const products = await ProductsService.list();
  return products.filter((product) => includesId(product.subcategories, subcategoryId));
};
