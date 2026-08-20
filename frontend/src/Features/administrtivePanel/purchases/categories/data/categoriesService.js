// features/categories/data/categoriesApi.js
import apiClient from '../../../../../setting/apiClient.js';

const ACTIVE_STATUS_VALUES = new Set(['active', 'activo', 'enabled', '1']);
const INACTIVE_STATUS_VALUES = new Set(['inactive', 'inactivo', 'disabled', '2']);

export const normalizeCategoryStatus = (entityOrStatus) => {
  const entity =
    entityOrStatus && typeof entityOrStatus === 'object'
      ? entityOrStatus
      : { status: entityOrStatus };

  if (entity.active === true || entity.isActive === true) return 'Activo';
  if (entity.active === false || entity.isActive === false) return 'Inactivo';

  const statusId = entity.idStatus ?? entity.statusId ?? entity.status?.id;
  if (Number(statusId) === 1) return 'Activo';
  if (Number(statusId) === 2) return 'Inactivo';

  const rawStatus =
    entity.status?.name ??
    entity.statusName ??
    entity.status ??
    entity.estado ??
    '';
  const normalizedStatus = String(rawStatus).trim().toLowerCase();

  if (ACTIVE_STATUS_VALUES.has(normalizedStatus)) return 'Activo';
  if (INACTIVE_STATUS_VALUES.has(normalizedStatus)) return 'Inactivo';
  return 'Inactivo';
};

// ==========================================
// ENDPOINTS
// ==========================================

const api = {
  // Categorías
  getCategories: () => apiClient.get('/categories'),
  getCategoryById: (id) => apiClient.get(`/categories/${id}`),
  createCategory: (data) => apiClient.post('/categories', data),
  updateCategory: (id, data) => apiClient.patch(`/categories/${id}`, data),
  toggleCategoryStatus: (id) => apiClient.patch(`/categories/${id}/toggle-status`),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),

  // Subcategorías
  createSubcategory: (data) => apiClient.post('/categories/subcategories', data),
  updateSubcategory: (id, data) => apiClient.patch(`/categories/subcategories/${id}`, data),
  deleteSubcategory: (id) => apiClient.delete(`/categories/subcategories/${id}`),
};

// ==========================================
// CATEGORÍAS
// ==========================================

export const getCategories = async () => {
  const response = await api.getCategories();
  return response.data.data;
};

export const getCategoryById = async (id) => {
  const response = await api.getCategoryById(id);
  return response.data.data;
};

export const createCategory = async (newCategory) => {
  const response = await api.createCategory({
    categoryName: newCategory.nombre,
    idStatus: newCategory.activo ? 1 : 2,
    subcategories: (newCategory.subcategoriasIniciales || []).map(sub => ({
      name: sub.nombre,
      description: sub.descripcion || "",
      idStatus: sub.activo ? 1 : 2,
    })),
  });
  return response.data.data;
};

export const updateCategory = async (categoryId, data) => {
  const updateData = {};
  if (data.nombre !== undefined) updateData.categoryName = data.nombre;
  if (data.estado !== undefined) updateData.idStatus = data.estado === "Activo" ? 1 : 2;
  if (Object.keys(updateData).length === 0) return;

  const response = await api.updateCategory(categoryId, updateData);
  return response.data.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await api.deleteCategory(categoryId);
  return response.data;
};

export const toggleCategoryStatus = async (categoryId) => {
  const response = await api.toggleCategoryStatus(categoryId);
  return response.data.data;
};

// ==========================================
// SUBCATEGORÍAS
// ==========================================

export const getSubcategories = async (categoryId = null) => {
  if (categoryId) {
    const category = await getCategoryById(categoryId);
    return (category.subcategories || []).map(sub => ({
      ...sub,
      id: sub.id,
      nombre: sub.name,
      descripcion: sub.description,
      estado: normalizeCategoryStatus(sub),
      categoriaId: categoryId,
    }));
  }

  // Si no se especifica categoría, traer todas
  const categories = await getCategories();
  const allSubs = await Promise.all(
    categories.map(async (cat) => {
      const detail = await getCategoryById(cat.id);
      return (detail.subcategories || []).map(sub => ({
        ...sub,
        id: sub.id,
        nombre: sub.name,
        descripcion: sub.description,
        estado: normalizeCategoryStatus(sub),
        categoriaId: cat.id,
      }));
    })
  );
  return allSubs.flat();
};

export const createSubcategory = async (data) => {
  const response = await api.createSubcategory({
    name: data.nombre,
    description: data.descripcion || "",
    idCategory: Number(data.categoriaId),
    idStatus: data.activo ? 1 : 2,
  });
  return response.data.data;
};

export const updateSubcategory = async (id, data) => {
  const updateData = {};
  if (data.nombre !== undefined) updateData.name = data.nombre;
  if (data.descripcion !== undefined) updateData.description = data.descripcion;
  if (data.estado !== undefined) updateData.idStatus = data.estado === "Activo" ? 1 : 2;
  if (Object.keys(updateData).length === 0) return;

  const response = await api.updateSubcategory(id, updateData);
  return response.data.data;
};

export const deleteSubcategory = async (id) => {
  const response = await api.deleteSubcategory(id);
  return response.data;
};
