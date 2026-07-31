// features/administrtivePanel/purchases/purchases/pages/CreatePurchase.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CreateSidebar from "../Components/CreatePurchaseSideBar";
import CreatePagination from "../Components/CreatePagination";
import CreateTable from "../Components/TableCreate";
import CreateProduct from "../../products/modals/CreateProduct";
import { useAlert } from "../../../../shared/alerts/useAlert";
import FormProvider from "../../providers/components/FormProvider";
import { createPurchase, getProducts, getProviders } from "../data/PurchasesService";
import { providersService } from "../../providers/data/providersService";
import { findProductByBarcode, productMatchesBarcodeSearch } from "../../../../shared/scanner";
import Spinner from "../../../../shared/spinner";
import FullScreenSpinner from "../../../../shared/spinner/FullScreenSpinner";
import {
  CalendarDays,
  CircleDollarSign,
  PackageOpen,
  PanelLeftOpen,
  ReceiptText,
  Save,
  ShoppingBag,
  X,
} from "lucide-react";

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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  
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

  const handleAddProduct = async (resolvedBarcode, purchasePrice) => {
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
    const unitPrice = Number(purchasePrice) || foundProduct.supplierPrice || foundProduct.valorUnit;

    const existingItem = purchaseItems.find(
      (item) => item.codigoBarras === foundProduct.codigoBarras
    );

    if (existingItem) {
      const updatedItems = purchaseItems.map((item) => {
        if (item.codigoBarras === foundProduct.codigoBarras) {
          const nuevaCantidad = item.cantidad + quantity;
          const subtotal = item.valorUnit * nuevaCantidad;
          const ivaValor = (subtotal * foundProduct.iva) / 100;
          const total = subtotal + ivaValor;
          return { ...item, cantidad: nuevaCantidad, subtotal, ivaValor, total, codigosExtra };
        }
        return item;
      });
      setPurchaseItems(updatedItems);
      showSuccess("Cantidad actualizada", "Se sumó la cantidad al producto existente");
    } else {
      const subtotal = unitPrice * quantity;
      const ivaValor = (subtotal * foundProduct.iva) / 100;
      const total = subtotal + ivaValor;

      const newItem = {
        id: Date.now(),
        idProduct: foundProduct.id,
        producto: foundProduct.nombre,
        codigoBarras: foundProduct.codigoBarras,
        proveedor: foundProduct.proveedor,
        cantidad: quantity,
        valorUnit: unitPrice,
        supplierPrice: unitPrice,
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
          supplierPrice: item.supplierPrice,
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
    return <Spinner message="Cargando datos de la compra..." />;
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      {loading && <FullScreenSpinner message="Guardando compra..." />}

      <div className="max-w-1400px mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={isSidebarVisible ? "lg:col-span-4" : "hidden"}>
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
            onCollapse={() => setIsSidebarVisible(false)}
          />
        </div>

        <div className={isSidebarVisible ? "lg:col-span-8" : "lg:col-span-12"}>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3.5">
              {!isSidebarVisible && (
                <button
                  type="button"
                  onClick={() => setIsSidebarVisible(true)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#004D77] hover:text-[#004D77]"
                  title="Mostrar panel"
                  aria-label="Mostrar panel de información"
                >
                  <PanelLeftOpen className="h-4 w-4" strokeWidth={1.8} />
                </button>
              )}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#004D77]">
                <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Productos de la compra</p>
                <p className="text-xs text-gray-400">Revisa los productos y valores antes de guardar</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004D77]/10">
                    <CircleDollarSign className="h-4 w-4 text-[#004D77]" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Total compra</p>
                    <p className="truncate text-base font-bold text-gray-800">${totalCompra.toLocaleString("es-CO")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                    <ReceiptText className="h-4 w-4 text-emerald-600" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">IVA incluido</p>
                    <p className="truncate text-base font-bold text-gray-800">${totalIVA.toLocaleString("es-CO")}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 sm:col-span-2 xl:col-span-1 ${
                  fechaLimiteDevolucion ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"
                }`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    fechaLimiteDevolucion ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    <CalendarDays className={`h-4 w-4 ${
                      fechaLimiteDevolucion ? "text-blue-600" : "text-gray-400"
                    }`} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Límite de devolución</p>
                    <p className={`truncate text-sm font-semibold ${
                      fechaLimiteDevolucion ? "text-blue-700" : "text-gray-400"
                    }`}>
                      {fechaLimiteDevolucion || "Selecciona proveedor y fecha"}
                    </p>
                  </div>
                </div>
              </div>

              {purchaseItems.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 px-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#004D77]/10">
                    <PackageOpen className="h-7 w-7 text-[#004D77]/40" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">No hay productos agregados</p>
                    <p className="mt-1 text-xs text-gray-400">Busca un producto desde el panel izquierdo para comenzar</p>
                  </div>
                </div>
              ) : (
                <CreateTable currentData={currentData} handleDeleteItem={handleDeleteItem} />
              )}

              {purchaseItems.length > 0 && (
                <CreatePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  purchaseItems={purchaseItems}
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={handleCancelPurchase}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                <X className="h-4 w-4" strokeWidth={2} />
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePurchase}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#004D77] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003a5c] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                <Save className="h-4 w-4" strokeWidth={2} />
                {loading ? "Guardando..." : "Guardar compra"}
              </button>
            </div>
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




