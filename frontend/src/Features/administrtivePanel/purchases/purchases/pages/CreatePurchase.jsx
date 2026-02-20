import React, { useState } from "react";
import { Link } from "react-router-dom";

import CreateSidebar from "../Components/CreatePurchaseSideBar";
import CreatePagination from "../Components/CreatePagination";
import CreateTable from "../Components/TableCreate";

const CreatePurchase = () => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const productsDB = [
    {
      id: 100,
      producto: "Lapicero Azul",
      codigoBarras: "111222333",
      proveedor: "OfiExpress Ltda.",
      valorUnit: 1500,
      iva: 19,
    },
    {
      id: 101,
      producto: "Cuaderno Norma",
      codigoBarras: "444555666",
      proveedor: "Papelería Central",
      valorUnit: 8000,
      iva: 19,
    },
  ];

  const [purchaseItems, setPurchaseItems] = useState([
    {
      id: 1,
      producto: "Cartuchera",
      codigoBarras: "192346543532",
      proveedor: "OfiExpress Ltda.",
      cantidad: 10,
      valorUnit: 5000,
      subtotal: 50000,
      iva: 10,
      ivaValor: 5000,
      total: 55000,
    },
  ]);

  const RECORDS_PER_PAGE = 6;
  const totalPages = Math.ceil(purchaseItems.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentData = purchaseItems.slice(startIndex, endIndex);

  const totalCompra = purchaseItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const totalIVA = purchaseItems.reduce(
    (sum, item) => sum + item.ivaValor,
    0
  );

  const handleDeleteItem = (id) => {
    setPurchaseItems(purchaseItems.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (value) => {
    setQuantity(Math.max(1, quantity + value));
  };

  const handleAddProduct = () => {
    if (!searchProduct) return;

    const foundProduct = productsDB.find(
      (p) =>
        p.producto.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.codigoBarras.includes(searchProduct)
    );

    if (!foundProduct) {
      alert("Producto no encontrado");
      return;
    }

    const subtotal = foundProduct.valorUnit * quantity;
    const ivaValor = (subtotal * foundProduct.iva) / 100;
    const total = subtotal + ivaValor;

    const newItem = {
      id: Date.now(),
      producto: foundProduct.producto,
      codigoBarras: foundProduct.codigoBarras,
      proveedor: foundProduct.proveedor,
      cantidad: quantity,
      valorUnit: foundProduct.valorUnit,
      subtotal,
      iva: foundProduct.iva,
      ivaValor,
      total,
    };

    setPurchaseItems([...purchaseItems, newItem]);
    setSearchProduct("");
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-12 gap-6">

          {/* SIDEBAR */}
          <CreateSidebar
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            purchaseDate={purchaseDate}
            setPurchaseDate={setPurchaseDate}
            searchProduct={searchProduct}
            setSearchProduct={setSearchProduct}
            quantity={quantity}
            setQuantity={setQuantity}
            handleQuantityChange={handleQuantityChange}
            handleAddProduct={handleAddProduct}
            purchaseItems={purchaseItems}
          />

          {/* PANEL DERECHO */}
          <div className="col-span-9">
            <div className="bg-white rounded-2xl shadow-lg p-6">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Detalle productos
                </h2>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="px-5 py-2.5 bg-white border-2 border-gray-300 rounded-full">
                  <span className="text-sm font-semibold text-gray-800">
                    Total De La Compra: {totalCompra.toLocaleString()}
                  </span>
                </div>

                <div className="px-5 py-2.5 bg-white border-2 border-gray-300 rounded-full">
                  <span className="text-sm font-semibold text-gray-800">
                    Impuestos totales(IVA): {totalIVA.toLocaleString()}
                  </span>
                </div>
              </div>

              <CreateTable
                currentData={currentData}
                handleDeleteItem={handleDeleteItem}
              />

              <CreatePagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                purchaseItems={purchaseItems}
              />

            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Link
                to="/compras"
                className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all shadow-lg"
              >
                Cancelar
              </Link>

              <button className="px-8 py-3 bg-[#004D77] text-white font-semibold rounded-lg hover:bg-[#003a5c] transition-all shadow-lg hover:shadow-xl">
                Guardar Compra
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchase;
