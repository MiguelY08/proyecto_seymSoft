// Features/administrtivePanel/purchases/purchases/pages/CreatePurchase.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CreateSidebar from "../components/CreatePurchaseSideBar";
import CreatePagination from "../components/CreatePagination";
import CreateTable from "../components/TableCreate";
import CreateProduct from "../../products/modals/CreateProduct";
import { useAlert } from "../../../../shared/alerts/useAlert";
import FormProvider from "../../providers/components/FormProvider";
import { createPurchase, getProducts, getProviders } from "../data/purchasesService";
import { providersService } from "../../providers/data/providersService";
import { findProductByBarcode, productMatchesBarcodeSearch } from "../../../../shared/scanner";

const CreatePurchase = () => {
  const navigate = useNavigate();
  const { showError, showWarning, showSuccess, showConfirm } = useAlert();

  // Estados del formulario
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [invoiceTouched, setInvoiceTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [providerTouched, setProviderTouched] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProviderData, setSelectedProviderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extraBarcodes, setExtraBarcodes] = useState({});
  const [fechaLimiteDevolucion, setFechaLimiteDevolucion] = useState("");
  
  // Datos reales desde API
  const [productsDB, setProductsDB] = useState([]);
  const [providersList, setProvidersList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Cargar productos reales
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const products = await getProducts();
        setProductsDB(products);
      } catch (error) {
        console.error("Error cargando productos:", error);
        showError("Error", "No se pudieron cargar los productos");
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, [showError]);

  // Cargar proveedores reales
  useEffect(() => {
    const loadProviders = async () => {
      setLoadingProviders(true);
      try {
        const providers = await getProviders();
        setProvidersList(providers);
      } catch (error) {
        console.error("Error cargando proveedores:", error);
        showError("Error", "No se pudieron cargar los proveedores");
      } finally {
        setLoadingProviders(false);
      }
    };
    loadProviders();
  }, [showError]);

  // Calcular fecha límite de devolución
  useEffect(() => {
    if (selectedProviderId && purchaseDate) {
      const provider = providersList.find(p => p.id === selectedProviderId);
      if (provider && provider.maxReturnPeriod) {
        const fechaCompra = new Date(purchaseDate);
        const fechaLimite = new Date(fechaCompra);
        fechaLimite.setDate(fechaLimite.getDate() + provider.maxReturnPeriod);
        setFechaLimiteDevolucion(fechaLimite.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }));
      } else {
        setFechaLimiteDevolucion('');
      }
    } else {
      setFechaLimiteDevolucion('');
    }
  }, [selectedProviderId, purchaseDate, providersList]);

  const handleCancelPurchase = async () => {
    if (purchaseItems.length > 0) {
      const result = await showConfirm(
        "warning",
        "Cancelar compra",
        "Si sales ahora se eliminarán los productos agregados. ¿Deseas continuar?",
        { confirmButtonText: "Sí, salir", cancelButtonText: "Seguir editando" }
      );
      if (!result?.isConfirmed) return;
    }
    navigate("/admin/purchases");
  };

  const handleSaveProvider = async (dataToSave) => {
    // Convertir las claves en inglés que envía FormProvider al formato
    // que espera providersService.create (claves en español)
    const providerPayload = {
      tipoPersona: dataToSave.personType,
      tipo: dataToSave.documentType,
      numero: dataToSave.documentNumber,
      nombres: dataToSave.nameProvider,
      apellidos: dataToSave.lastname,
      correo: dataToSave.email,
      telefono: dataToSave.phone,
      direccion: dataToSave.address,
      nombreContacto: dataToSave.contactPersonName,
      numeroContacto: dataToSave.contactPersonNumber,
      rut: dataToSave.rut ? "si" : "no",
      codigoCIU: dataToSave.ciuCode,
      plazoDevoluciones: dataToSave.maxReturnPeriod,
      categoryIds: dataToSave.categoryIds,
    };

    try {
      const newProvider = await providersService.create(providerPayload);
      showSuccess("Proveedor creado", "El proveedor se creó correctamente");

      // Seleccionar automáticamente el proveedor recién creado
      setSelectedProvider(newProvider.nombre);
      setSelectedProviderId(newProvider.id);

      setIsFormModalOpen(false);

      // Recargar lista de proveedores
      const updatedProviders = await getProviders();
      setProvidersList(updatedProviders);
    } catch (error) {
      showError("Error", error.message || "No se pudo crear el proveedor");
      throw error; // Para que FormProvider no cierre el modal
    }
  };

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
    const result = await showConfirm("warning", "Eliminar producto", "¿Estás seguro de que deseas eliminar este producto?");
    if (!result?.isConfirmed) return;
    setPurchaseItems(purchaseItems.filter((item) => item.id !== id));
    showSuccess("Producto eliminado", "El producto fue eliminado correctamente");
  };

  const handleCreateProduct = (newProduct) => {
    console.log("Producto creado:", newProduct);
    setShowCreateProduct(false);
    // Recargar productos
    getProducts().then(setProductsDB);
  };

  const getProductWithLocalBarcodes = (product) => ({
    ...product,
    codigosExtra: [
      ...(Array.isArray(product.codigosExtra) ? product.codigosExtra : []),
      ...(extraBarcodes[product.codigoBarras] || []),
    ],
  });

  const handleAddProduct = async (resolvedBarcode) => {
    const searchTerm = searchProduct.trim();

    if (!searchTerm && !resolvedBarcode) {
      showWarning("Producto requerido", "Debes escribir un producto o código");
      return;
    }

    const productsWithLocalBarcodes = productsDB.map(getProductWithLocalBarcodes);
    const productByResolvedBarcode = resolvedBarcode
      ? findProductByBarcode(productsWithLocalBarcodes, resolvedBarcode)
      : null;
    const foundProduct = productByResolvedBarcode ?? productsWithLocalBarcodes.find(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productMatchesBarcodeSearch(p, searchTerm)
    );

    if (!foundProduct) {
      showError("Producto no encontrado", "Verifica el nombre o código");
      return;
    }

    const codigosExtra = extraBarcodes[foundProduct.codigoBarras] ?? [];

    const existingItem = purchaseItems.find(
      (item) => item.codigoBarras === foundProduct.codigoBarras
    );

    if (existingItem) {
      const updatedItems = purchaseItems.map((item) => {
        if (item.codigoBarras === foundProduct.codigoBarras) {
          const nuevaCantidad = item.cantidad + quantity;
          const subtotal = foundProduct.valorUnit * nuevaCantidad;
          const ivaValor = (subtotal * foundProduct.iva) / 100;
          const total = subtotal + ivaValor;
          return { ...item, cantidad: nuevaCantidad, subtotal, ivaValor, total, codigosExtra };
        }
        return item;
      });
      setPurchaseItems(updatedItems);
      showSuccess("Cantidad actualizada", "Se sumó la cantidad al producto existente");
    } else {
      const subtotal = foundProduct.valorUnit * quantity;
      const ivaValor = (subtotal * foundProduct.iva) / 100;
      const total = subtotal + ivaValor;

      const newItem = {
        id: Date.now(),
        idProduct: foundProduct.id,
        producto: foundProduct.nombre,
        codigoBarras: foundProduct.codigoBarras,
        proveedor: foundProduct.proveedor,
        cantidad: quantity,
        valorUnit: foundProduct.valorUnit,
        subtotal,
        iva: foundProduct.iva,
        ivaValor,
        total,
        codigosExtra,
      };

      setPurchaseItems([...purchaseItems, newItem]);
      showSuccess("Producto agregado", "Añadido correctamente");
    }

    setSearchProduct("");
    setQuantity(1);
  };

  const handleSavePurchase = async () => {
    setInvoiceTouched(true);
    setDateTouched(true);
    setProviderTouched(true);

    if (!selectedProvider || !selectedProviderId || !invoiceNumber.trim() || !purchaseDate) {
      showWarning("Campos incompletos", "Llena todos los campos");
      return;
    }
    if (purchaseItems.length === 0) {
      showWarning("Compra vacía", "Agrega al menos un producto");
      return;
    }

    const result = await showConfirm("info", "Confirmar compra", "¿Deseas guardar esta compra?", {
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });

    if (!result?.isConfirmed) return;

    setLoading(true);

    try {
      await createPurchase({
        numeroFacturacion: invoiceNumber.trim(),
        fechaCompra: purchaseDate,
        idProvider: selectedProviderId,
        productos: purchaseItems.map(item => ({
          idProduct: item.idProduct,
          cantidad: item.cantidad,
          codigosExtra: item.codigosExtra || [],
        })),
      });

      showSuccess("Compra guardada", "Se registró correctamente");
      navigate("/admin/purchases");
    } catch (err) {
      showError("Error", err.message || "No se pudo guardar la compra.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProducts || loadingProviders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D77] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 px-4 py-6">
      <div className="max-w-1400px mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <CreateSidebar
            productsDB={productsDB}
            providersList={providersList}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            selectedProviderId={selectedProviderId}
            setSelectedProviderId={setSelectedProviderId}
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
            invoiceTouched={invoiceTouched}
            setInvoiceTouched={setInvoiceTouched}
            dateTouched={dateTouched}
            setDateTouched={setDateTouched}
            providerTouched={providerTouched}
            setProviderTouched={setProviderTouched}
            openCreateProduct={() => setShowCreateProduct(true)}
            openCreateProvider={() => setIsFormModalOpen(true)}
            extraBarcodes={extraBarcodes}
            onExtraBarcodesChange={setExtraBarcodes}
          />
        </div>

        <div className="lg:col-span-9 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Detalle productos</h2>
          </div>

          {/* Totales con fecha límite de devolución */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="px-5 py-3 border-2 border-gray-300 rounded-full text-sm font-semibold">
              Total De La Compra: ${totalCompra.toLocaleString()}
            </div>
            <div className="px-5 py-3 border-2 border-gray-300 rounded-full text-sm font-semibold">
              Impuestos totales (IVA): ${totalIVA.toLocaleString()}
            </div>
            <div className={`px-5 py-3 border-2 rounded-full text-sm font-semibold ${
              fechaLimiteDevolucion 
                ? 'border-blue-300 bg-blue-50 text-blue-700' 
                : 'border-gray-300 bg-gray-50 text-gray-400'
            }`}>
              📅 Fecha límite devolución: {fechaLimiteDevolucion || 'Selecciona proveedor y fecha'}
            </div>
          </div>

          {purchaseItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No hay productos agregados</div>
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
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePurchase}
              className="px-8 py-3 bg-[#004D77] text-white font-semibold rounded-lg hover:bg-[#003a5c] transition-all shadow-lg"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Compra"}
            </button>
          </div>
        </div>
      </div>

      <CreateProduct isOpen={showCreateProduct} onClose={() => setShowCreateProduct(false)} onCreate={handleCreateProduct} />
      <FormProvider
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        provider={selectedProviderData}
        onSave={handleSaveProvider}
      />
    </div>
  );
};

export default CreatePurchase;
