const CATEGORY_KEY = "pm_categories";
const SUBCATEGORY_KEY = "pm_subcategories";

const mockCategories = [
  { id: 1, nombre: "Oficina", estado: "Activo", subcategorias: 0 },
  { id: 2, nombre: "Útiles Escolares", estado: "Activo", subcategorias: 0 },
  { id: 3, nombre: "Escritura y Corrección", estado: "Inactivo", subcategorias: 0 },
  { id: 4, nombre: "Arte y Manualidades", estado: "Activo", subcategorias: 0 },
  { id: 5, nombre: "Tecnología", estado: "Inactivo", subcategorias: 0 }
];


// ==========================================
// CATEGORÍAS
// ==========================================

// 🔵 Obtener categorías
export const getCategories = () => {

  const stored = localStorage.getItem(CATEGORY_KEY);

  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem(
    CATEGORY_KEY,
    JSON.stringify(mockCategories)
  );

  return mockCategories;

};


// 🔵 Guardar categorías
export const saveCategories = (categories) => {

  localStorage.setItem(
    CATEGORY_KEY,
    JSON.stringify(categories)
  );

};


// 🔵 Crear categoría
export const createCategory = (newCategory) => {

  const categories = getCategories();

  const newId =
    categories.length > 0
      ? Math.max(...categories.map((c) => c.id)) + 1
      : 1;

  const category = {
    id: newId,
    nombre: newCategory.nombre,
    estado: newCategory.activo ? "Activo" : "Inactivo",
    subcategorias: 0
  };

  const updated = [...categories, category];

  saveCategories(updated);

  return category;

};


// 🔵 Actualizar categoría
export const updateCategory = (categoryId, data) => {

  const categories = getCategories();

  const updated = categories.map((c) =>
    c.id === categoryId
      ? {
          ...c,
          nombre: data.nombre,
          estado: data.activo ? "Activo" : "Inactivo",
        }
      : c
  );

  saveCategories(updated);

  return updated;

};


// ==========================================
// SUBCATEGORÍAS
// ==========================================

// 🔵 Obtener subcategorías
export const getSubcategories = () => {

  const stored = localStorage.getItem(SUBCATEGORY_KEY);

  return stored ? JSON.parse(stored) : [];

};


// 🔵 Guardar subcategorías
export const saveSubcategories = (subcategories) => {

  localStorage.setItem(
    SUBCATEGORY_KEY,
    JSON.stringify(subcategories)
  );

};


// 🔵 Crear subcategoría
export const createSubcategory = (data) => {

  const subcategories = getSubcategories();
  const categories = getCategories();

  const newId =
    subcategories.length > 0
      ? Math.max(...subcategories.map((s) => s.id)) + 1
      : 1;

  const subcategory = {
    id: newId,
    nombre: data.nombre,
    descripcion: data.descripcion,
    categoriaId: Number(data.categoriaId),
    estado: data.activo ? "Activo" : "Inactivo"
  };

  const updatedSub = [...subcategories, subcategory];

  saveSubcategories(updatedSub);

  // 🔵 SUMAR subcategoría a categoría
  const updatedCategories = categories.map((cat) => {

    if (cat.id === Number(data.categoriaId)) {
      return {
        ...cat,
        subcategorias: (cat.subcategorias || 0) + 1
      };
    }

    return cat;

  });

  saveCategories(updatedCategories);

  return subcategory;

};


// 🔵 Eliminar subcategoría
export const deleteSubcategory = (id) => {

  const subcategories = getSubcategories();
  const categories = getCategories();

  const subcategory = subcategories.find((s) => s.id === id);

  const updatedSub = subcategories.filter((s) => s.id !== id);

  saveSubcategories(updatedSub);

  if (subcategory) {

    const updatedCategories = categories.map((cat) => {

      if (cat.id === subcategory.categoriaId) {
        return {
          ...cat,
          subcategorias: Math.max((cat.subcategorias || 1) - 1, 0)
        };
      }

      return cat;

    });

    saveCategories(updatedCategories);

  }

  return updatedSub;

};