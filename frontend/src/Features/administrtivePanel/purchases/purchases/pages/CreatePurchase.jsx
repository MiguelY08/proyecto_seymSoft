import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CreateSidebar from "../Components/CreatePurchaseSideBar";
import CreatePagination from "../Components/CreatePagination";
import CreateTable from "../Components/TableCreate";

import { useAlert } from "../../../../shared/alerts/useAlert";

const CreatePurchase = () => {
  const navigate = useNavigate();
  const { showError, showWarning, showSuccess, showConfirm } = useAlert();

  const [selectedProvider, setSelectedProvider] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [purchaseItems, setPurchaseItems] = useState([]);

  const handleCancelPurchase = async () => {
    if (purchaseItems.length > 0) {
      const result = await showConfirm(
        "warning",
        "Cancelar compra",
        "Si sales ahora se eliminarán los productos agregados. ¿Deseas continuar?",
        {
          confirmButtonText: "Sí, salir",
          cancelButtonText: "Seguir editando",
        }
      );

      if (!result?.isConfirmed) return;
    }

    navigate("/compras");
  };

  const productsDB = [
    { id: 100, producto: "Cuaderno Norma", codigoBarras: "444555666", proveedor: "Papelería El Punto Escolar", valorUnit: 8000, iva: 19 },
    { id: 101, producto: "Borrador Nata", codigoBarras: "123123123", proveedor: "Papelería El Punto Escolar", valorUnit: 1200, iva: 19 },
    { id: 102, producto: "Tijeras Escolares", codigoBarras: "741852963", proveedor: "Papelería El Punto Escolar", valorUnit: 6000, iva: 19 },
    { id: 103, producto: "Lapicero Azul", codigoBarras: "111222333", proveedor: "OfiExpress Ltda.", valorUnit: 1500, iva: 19 },
    { id: 104, producto: "Resaltador Amarillo", codigoBarras: "777888999", proveedor: "OfiExpress Ltda.", valorUnit: 2500, iva: 19 },
    { id: 105, producto: "Marcador Permanente", codigoBarras: "654654654", proveedor: "OfiExpress Ltda.", valorUnit: 4500, iva: 19 },
    { id: 106, producto: "Pegante Líquido", codigoBarras: "852369741", proveedor: "OfiExpress Ltda.", valorUnit: 2800, iva: 19 },
    { id: 107, producto: "Set de Pinturas Acrílicas", codigoBarras: "888777666", proveedor: "ArteColor Supplies", valorUnit: 18000, iva: 19 },
    { id: 108, producto: "Lienzo 30x40", codigoBarras: "555444333", proveedor: "ArteColor Supplies", valorUnit: 12000, iva: 19 },
    { id: 109, producto: "Pincel Profesional", codigoBarras: "222333444", proveedor: "ArteColor Supplies", valorUnit: 7000, iva: 19 },
    { id: 110, producto: "Regla 30cm", codigoBarras: "321321321", proveedor: "Útiles Escolares SAS", valorUnit: 3000, iva: 19 },
    { id: 111, producto: "Carpeta Plástica", codigoBarras: "987987987", proveedor: "Útiles Escolares SAS", valorUnit: 3500, iva: 19 },
    { id: 112, producto: "Corrector Líquido", codigoBarras: "963258741", proveedor: "Útiles Escolares SAS", valorUnit: 3200, iva: 19 },
    { id: 113, producto: "Corrector Seco", codigoBarras: "973258741", proveedor: "Útiles Escolares SAS", valorUnit: 3200, iva: 19 },
  ];

  const RECORDS_PER_PAGE = 6;
  const totalPages = Math.ceil(purchaseItems.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentData = purchaseItems.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  const totalCompra = purchaseItems.reduce((sum, item) => sum + item.total, 0);
  const totalIVA = purchaseItems.reduce((sum, item) => sum + item.ivaValor, 0);

  const handleQuantityChange = (value) => {
    setQuantity((prev) => Math.max(1, prev + value));
  };

  const handleDeleteItem = async (id) => {
    const result = await showConfirm(
      "warning",
      "Eliminar producto",
      "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!result?.isConfirmed) return;

    setPurchaseItems(purchaseItems.filter((item) => item.id !== id));
    showSuccess("Producto eliminado", "El producto fue eliminado correctamente");
  };

  // 🔥 AQUÍ ESTÁ LA MODIFICACIÓN IMPORTANTE
  const handleAddProduct = async () => {
    if (!searchProduct) {
      showWarning("Producto requerido", "Debes escribir un producto o código");
      return;
    }

    const foundProduct = productsDB.find(
      (p) =>
        p.producto.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.codigoBarras.includes(searchProduct)
    );

    if (!foundProduct) {
      showError("Producto no encontrado", "Verifica el nombre o código");
      return;
    }

    const existingItem = purchaseItems.find(
      (item) => item.codigoBarras === foundProduct.codigoBarras
    );

    // ✅ SI YA EXISTE → SUMAR CANTIDAD
    if (existingItem) {
      const updatedItems = purchaseItems.map((item) => {
        if (item.codigoBarras === foundProduct.codigoBarras) {
          const nuevaCantidad = item.cantidad + quantity;
          const subtotal = foundProduct.valorUnit * nuevaCantidad;
          const ivaValor = (subtotal * foundProduct.iva) / 100;
          const total = subtotal + ivaValor;

          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal,
            ivaValor,
            total,
          };
        }
        return item;
      });

      setPurchaseItems(updatedItems);
      showSuccess("Cantidad actualizada", "Se sumó la cantidad al producto existente");
    } else {
      // ✅ SI NO EXISTE → AGREGAR NORMAL
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
      showSuccess("Producto agregado", "Añadido correctamente");
    }

    setSearchProduct("");
    setQuantity(1);
  };

  const handleSavePurchase = async () => {
    if (!selectedProvider) {
      showWarning("Proveedor requerido", "Debes seleccionar un proveedor");
      return;
    }

    if (!invoiceNumber.trim()) {
      showWarning("Factura requerida", "Debes ingresar el número de factura");
      return;
    }

    if (!purchaseDate) {
      showWarning("Fecha requerida", "Debes seleccionar la fecha de compra");
      return;
    }

    if (purchaseItems.length === 0) {
      showWarning("Compra vacía", "Agrega al menos un producto");
      return;
    }

    const result = await showConfirm(
      "info",
      "Confirmar compra",
      "¿Deseas guardar esta compra?",
      {
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
      }
    );

    if (!result?.isConfirmed) return;

    showSuccess("Compra guardada", "Se registró correctamente");

    setPurchaseItems([]);
    setSelectedProvider("");
    setInvoiceNumber("");
    setPurchaseDate("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-3">
          <CreateSidebar
            productsDB={productsDB}
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
        </div>

        <div className="lg:col-span-9 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Detalle productos</h2>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="px-5 py-3 border-2 border-gray-300 rounded-full text-sm font-semibold">
              Total De La Compra: {totalCompra.toLocaleString()}
            </div>

            <div className="px-5 py-3 border-2 border-gray-300 rounded-full text-sm font-semibold">
              Impuestos totales (IVA): {totalIVA.toLocaleString()}
            </div>
          </div>

          {purchaseItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay productos agregados
            </div>
          ) : (
            <CreateTable
              currentData={currentData}
              handleDeleteItem={handleDeleteItem}
            />
          )}

          <CreatePagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            purchaseItems={purchaseItems}
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancelPurchase}
              className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all shadow-lg"
            >
              Cancelar
            </button>

            <button
              onClick={handleSavePurchase}
              className="px-8 py-3 bg-[#004D77] text-white font-semibold rounded-lg hover:bg-[#003a5c] transition-all shadow-lg"
            >
              Guardar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchase;