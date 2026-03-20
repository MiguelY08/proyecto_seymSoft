const CATEGORYPRODUCTS_KEY = "pm_categoryproducts";

const defaultcategoryProducts = [
  { id: 1, nombre: "Cartuchera Estampada", subcategoriaId: 1 },
  { id: 2, nombre: "Bolso Escolar", subcategoriaId: 2 },
  { id: 3, nombre: "Sacapuntas Metálico", subcategoriaId: 3 },
  { id: 4, nombre: "Pincel Pelo Suave #8", subcategoriaId: 4 },
  { id: 5, nombre: "Libro Matemáticas", subcategoriaId: 5 },
];

export const getcategoryProducts = () => {
  const stored = localStorage.getItem(CATEGORYPRODUCTS_KEY);
  if (!stored) {
    localStorage.setItem(CATEGORYPRODUCTS_KEY, JSON.stringify(defaultcategoryProducts));
    return defaultcategoryProducts;
  }
  return JSON.parse(stored);
};

// ¿Esta subcategoría tiene productos?
export const subcategoryHasProducts = (subcategoriaId) => {
  return getcategoryProducts().some((p) => p.subcategoriaId === Number(subcategoriaId));
};

// ¿Alguna subcategoría de esta lista tiene productos?
export const categoryHasProducts = (subcategoriaIds = []) => {
  const products = getcategoryProducts();
  return subcategoriaIds.some((subId) =>
    products.some((p) => p.subcategoriaId === Number(subId))
  );
};