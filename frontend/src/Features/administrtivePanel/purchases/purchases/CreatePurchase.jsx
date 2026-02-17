import React, { useState } from "react";
import { PurchaseproductsServices } from "./Purchases.service";

export const CreatePurchase = () => {
  const [productsData, setProductsData] = useState({
    numeroFacturacion: "",
    fechaCompra: "",
    proveedor: "",
    cantidadProductos: "",
    precioTotal: "",
    estado: "Pendiente",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProductsData({
      ...productsData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    PurchaseproductsServices.createProducts(productsData);

    setProductsData({
      numeroFacturacion: "",
      fechaCompra: "",
      proveedor: "",
      cantidadProductos: "",
      precioTotal: "",
      estado: "Pendiente",
    });

    alert("Compra registrada correctamente");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-6">
        Registrar Compra
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <input
          type="text"
          name="numeroFacturacion"
          placeholder="No. Facturación"
          value={productsData.numeroFacturacion}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2"
          required
        />

        <input
          type="date"
          name="fechaCompra"
          value={productsData.fechaCompra}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2"
          required
        />

        <input
          type="text"
          name="proveedor"
          placeholder="Proveedor"
          value={productsData.proveedor}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2"
          required
        />

        <input
          type="number"
          name="cantidadProductos"
          placeholder="Cantidad Productos"
          value={productsData.cantidadProductos}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2"
          required
        />

        <input
          type="number"
          name="precioTotal"
          placeholder="Precio Total"
          value={productsData.precioTotal}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2"
          required
        />

        <select
          name="estado"
          value={productsData.estado}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Completada">Completada</option>
          <option value="Cancelada">Cancelada</option>
        </select>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-[#0f4c6e] text-white px-6 py-2 rounded-lg hover:bg-[#0c3d59]"
          >
            Registrar Compra
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchase;