export const PurchaseproductsServices = {
  listProducts() {
    return JSON.parse(localStorage.getItem("products")) || [];
  },

  createProducts(data) {
    const productos = JSON.parse(localStorage.getItem("products")) || [];
    const newProducto = { ...data, id: Date.now() };
    productos.push(newProducto);
    localStorage.setItem("products", JSON.stringify(productos));
    return newProducto;
  } 
}; 