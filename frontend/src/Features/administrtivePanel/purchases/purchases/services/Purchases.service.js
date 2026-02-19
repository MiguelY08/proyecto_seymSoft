export const PurchaseproductsServices = {
  listProducts() {
    return JSON.parse(localStorage.getItem("products")) || [];
  },

  createProducts(data) {
    const productos = JSON.parse(localStorage.getItem("products")) || [];

    const newProducto = {
      ...data,
      id: Date.now(),
      estado: data.estado || "Pendiente", // 🔥 aseguramos estado por defecto
    };

    productos.push(newProducto);
    localStorage.setItem("products", JSON.stringify(productos));

    return newProducto;
  },

  // ✅ NUEVA FUNCIÓN PARA CANCELAR
  cancelProduct(id) {
    const productos = JSON.parse(localStorage.getItem("products")) || [];

    const updated = productos.map((compra) =>
      compra.id === id
        ? { ...compra, estado: "Cancelada" }
        : compra
    );

    localStorage.setItem("products", JSON.stringify(updated));

    return updated;
  }
};
export default PurchaseproductsServices;