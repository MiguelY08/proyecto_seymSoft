// features/administrtivePanel/purchases/purchases/components/CreatePurchaseSideBar.jsx
import { useEffect, useState } from "react";
import { Search, Plus, Minus, AlertCircle, Barcode, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from "../../../../shared/alerts/useAlert";
import {
  findProductByBarcode,
  getProductBarcodeValues,
  normalizeBarcode,
  productMatchesBarcodeSearch,
  ScannerStatus,
  useBarcodeScanner,
} from "../../../../shared/scanner";

const CreateSidebar = ({
  productsDB,
  providersList = [],
  selectedProvider,
  setSelectedProvider,
  selectedProviderId,
  setSelectedProviderId,
  invoiceNumber,
  setInvoiceNumber,
  purchaseDate,
  setPurchaseDate,
  searchProduct,
  setSearchProduct,
  quantity,
  setQuantity,
  handleQuantityChange,
  handleAddProduct: handleAddProductProp,
  purchaseItems,
  invoiceTouched,
  setInvoiceTouched,
  dateTouched,
  setDateTouched,
  providerTouched,
  setProviderTouched,
  openCreateProduct,
  openCreateProvider,  // ← NUEVO PROP
  extraBarcodes = {},
  onExtraBarcodesChange,
}) => {
  const navigate = useNavigate();
  const { showConfirm, showError } = useAlert();

  const [isOpen, setIsOpen] = useState(false);
  const [searchProvider, setSearchProvider] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showBarcodeForm, setShowBarcodeForm] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeSaved, setBarcodeSaved] = useState(false);
  const [barcodeError, setBarcodeError] = useState("");
  const [activeBarcodeIndex, setActiveBarcodeIndex] = useState(0);
  const [scannerMessage, setScannerMessage] = useState(null);

  const getProductWithLocalBarcodes = (product) => ({
    ...product,
    codigosExtra: [
      ...(Array.isArray(product.codigosExtra) ? product.codigosExtra : []),
      ...(extraBarcodes[product.codigoBarras] || []),
    ],
  });

  const filteredProviders = providersList.filter((p) =>
    p.nombre?.toLowerCase().includes(searchProvider.toLowerCase())
  );

  const filteredProducts = productsDB.filter(
    (p) => {
      const product = getProductWithLocalBarcodes(p);
      return (
        p.nombre.toLowerCase().includes(searchProduct.toLowerCase()) ||
        productMatchesBarcodeSearch(product, searchProduct)
      );
    }
  );

  const allUsedBarcodes = [
    ...productsDB.flatMap((p) => getProductBarcodeValues(getProductWithLocalBarcodes(p))),
    ...Object.values(extraBarcodes).flat(),
  ].map((code) => normalizeBarcode(code));

  const availableBarcodes = selectedProduct
    ? [...new Set(getProductBarcodeValues(getProductWithLocalBarcodes(selectedProduct)))]
    : [];

  const resolvedBarcode =
    selectedProduct && availableBarcodes[activeBarcodeIndex]
      ? availableBarcodes[activeBarcodeIndex]
      : selectedProduct?.codigoBarras;

  const providerError = (() => {
    if (!providerTouched) return null;
    if (!selectedProvider) return "El proveedor es obligatorio";
    if (selectedProvider.length < 3) return "El nombre del proveedor es demasiado corto";
    return null;
  })();

  const invoiceError = (() => {
    if (!invoiceTouched) return null;
    if (!invoiceNumber.trim()) return "El número de factura es obligatorio";
    if (!/^[a-zA-Z0-9\-]{3,20}$/.test(invoiceNumber.trim()))
      return "Solo letras, números y guiones (3–20 caracteres)";
    return null;
  })();

  const dateError = (() => {
    if (!dateTouched) return null;
    if (!purchaseDate) return "La fecha de compra es obligatoria";
    const selected = new Date(purchaseDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selected > today) return "La fecha no puede ser futura";
    if (selected < new Date("2000-01-01")) return "Fecha demasiado antigua";
    return null;
  })();

  const inputClass = (error) =>
    `w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-gray-600 outline-none transition-all ${
      error
        ? "border-red-400 focus:ring-2 focus:ring-red-300"
        : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"
    }`;

  const handleBackToPurchases = async (e) => {
    e.preventDefault();
    if (purchaseItems.length > 0) {
      const result = await showConfirm(
        "warning",
        "Volver a compras",
        "Si sales ahora se eliminarán los productos agregados. ¿Deseas continuar?",
        { confirmButtonText: "Sí, salir", cancelButtonText: "Seguir editando" }
      );
      if (!result?.isConfirmed) return;
    }
    navigate("/admin/purchases");
  };

  const handleSelectProduct = (product, activeBarcode = "") => {
    const normalizedActiveBarcode = normalizeBarcode(activeBarcode);
    const productBarcodes = getProductBarcodeValues(getProductWithLocalBarcodes(product));
    const nextActiveBarcodeIndex = normalizedActiveBarcode
      ? Math.max(0, productBarcodes.findIndex((code) => code === normalizedActiveBarcode))
      : 0;

    setSearchProduct(product.nombre);
    setSelectedProduct(product);
    setShowSuggestions(false);
    setShowBarcodeForm(false);
    setBarcodeValue("");
    setBarcodeError("");
    setBarcodeSaved(false);
    setActiveBarcodeIndex(nextActiveBarcodeIndex);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchProduct(val);
    setShowSuggestions(true);
    if (selectedProduct && val !== selectedProduct.nombre) {
      setSelectedProduct(null);
      setShowBarcodeForm(false);
      setBarcodeValue("");
      setBarcodeError("");
      setBarcodeSaved(false);
      setActiveBarcodeIndex(0);
    }
  };

  const handleScannedProduct = (code) => {
    const normalizedCode = normalizeBarcode(code, { numericOnly: true });

    const product = findProductByBarcode(
      productsDB.map(getProductWithLocalBarcodes),
      normalizedCode
    );

    if (!product) {
      setSearchProduct(normalizedCode);
      setSelectedProduct(null);
      setShowSuggestions(true);
      setShowBarcodeForm(false);
      setBarcodeValue("");
      setBarcodeError("");
      setBarcodeSaved(false);
      setActiveBarcodeIndex(0);
      setScannerMessage({ type: 'error', message: `No encontrado: ${normalizedCode}` });
      showError(
        "Codigo no registrado",
        `No se encontro ningun producto con el codigo de barras ${normalizedCode}.`
      );
      return;
    }

    handleSelectProduct(product, normalizedCode);
    setScannerMessage({ type: 'success', message: `Seleccionado: ${product.nombre}` });
  };

  useBarcodeScanner({
    enabled: true,
    numericOnly: true,
    minLength: 6,
    maxLength: 20,
    scannerFields: ["purchase-product-search"],
    duplicateDelayMs: 800,
    preventTerminatorDefault: true,
    onScan: ({ code, scannerField }) => {
      if (scannerField !== "purchase-product-search") return;
      handleScannedProduct(code);
    },
  });

  useEffect(() => {
    if (!scannerMessage) return undefined;

    const timeout = window.setTimeout(() => {
      setScannerMessage(null);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [scannerMessage]);

  const handleToggleBarcodeForm = () => {
    if (!selectedProduct) return;
    if (showBarcodeForm) {
      setShowBarcodeForm(false);
      setBarcodeValue("");
      setBarcodeError("");
      setBarcodeSaved(false);
    } else {
      setShowBarcodeForm(true);
    }
  };

  const handleSaveBarcode = () => {
    const trimmed = barcodeValue.trim();

    if (!trimmed) {
      setBarcodeError("El código de barras es obligatorio");
      return;
    }
    if (!/^[0-9]{8,13}$/.test(trimmed)) {
      setBarcodeError("El código debe tener entre 8 y 13 dígitos numéricos");
      return;
    }
    if (allUsedBarcodes.includes(trimmed)) {
      setBarcodeError("Este código de barras ya está registrado");
      return;
    }

    const key = selectedProduct.codigoBarras;
    onExtraBarcodesChange((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), trimmed],
    }));

    setBarcodeError("");
    setBarcodeSaved(true);
    setTimeout(() => {
      setBarcodeSaved(false);
      setShowBarcodeForm(false);
      setBarcodeValue("");
    }, 1800);
  };

  const handleAddProduct = () => {
    handleAddProductProp(resolvedBarcode);
  };

  const barcodeLinkDisabled = !selectedProduct;

  return (
    <div className="col-span-3">
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">

        {/* ================= PROVEEDOR ================= */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Proveedores
          </label>

          <div
            onClick={() => { setIsOpen(!isOpen); setProviderTouched(true); }}
            className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-gray-600 cursor-pointer flex justify-between items-center transition-all ${
              providerError ? "border-red-400" : "border-gray-300 hover:border-[#004D77]"
            }`}
          >
            <span>{selectedProvider || "Seleccione el proveedor"}</span>
            <div className="flex items-center gap-2">
              {providerTouched && providerError && (
                <AlertCircle size={16} className="text-red-400" />
              )}
              <span className="text-gray-500">▾</span>
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border-4 border-[#004D77] px-2.5">
              <h3 className="text-center font-semibold text-gray-800 mb-3">
                Seleccione un Proveedor
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full w-full">
                  <Search size={16} className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Buscar"
                    value={searchProvider}
                    onChange={(e) => setSearchProvider(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full"
                  />
                </div>
                {/* ← BOTÓN CREAR PROVEEDOR CORREGIDO */}
                <button
                  onClick={openCreateProvider}  // ← Cambiado de openCreateProduct a openCreateProvider
                  className="flex items-center gap-1 px-3 py-1 border border-sky-700 text-[#004D77] bg-white hover:bg-sky-50 rounded-lg text-xs font-semibold transition-all"
                >
                  Crear <Plus size={14} />
                </button>
              </div>
              <div className="w-full h-[2px] bg-[#004D77] mb-3"></div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filteredProviders.map((provider, index) => (
                  <label
                    key={provider.id || index}
                    className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProvider === provider.nombre}
                      onChange={() => {
                        setSelectedProvider(provider.nombre);
                        setSelectedProviderId(provider.id);
                        setProviderTouched(true);
                        setIsOpen(false);
                      }}
                      className="accent-[#004D77]"
                    />
                    {provider.nombre}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div
            className={`overflow-hidden transition-all duration-300 ${
              providerError ? "max-h-10 mt-1.5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> {providerError}
            </p>
          </div>
        </div>

        {/* ================= FACTURA ================= */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            No. factura
          </label>
          <div className="relative">
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => { setInvoiceNumber(e.target.value); setInvoiceTouched(true); }}
              onBlur={() => setInvoiceTouched(true)}
              placeholder="Ingrese el No de la factura"
              className={inputClass(invoiceError)}
            />
            {invoiceTouched && invoiceError && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <AlertCircle size={16} className="text-red-400" />
              </div>
            )}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              invoiceError ? "max-h-10 mt-1.5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> {invoiceError}
            </p>
          </div>
          {invoiceTouched && !invoiceError && (
            <p className="text-xs text-gray-400 mt-1 text-right">
              {invoiceNumber.trim().length}/20 caracteres
            </p>
          )}
        </div>

        {/* ================= FECHA ================= */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Fecha compra
          </label>
          <div className="relative">
            <input
              type="date"
              value={purchaseDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => { setPurchaseDate(e.target.value); setDateTouched(true); }}
              onBlur={() => setDateTouched(true)}
              className={inputClass(dateError)}
            />
            {dateTouched && dateError && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <AlertCircle size={16} className="text-red-400" />
              </div>
            )}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              dateError ? "max-h-10 mt-1.5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> {dateError}
            </p>
          </div>
        </div>

        {/* ================= BUSCAR PRODUCTO ================= */}
        <div className="mb-1 relative">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Busque el Producto
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchProduct}
                onChange={handleSearchChange}
                data-scanner-field="purchase-product-search"
                placeholder="Buscar producto o código"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-[#004D77] outline-none transition-all ${
                  searchProduct && !selectedProduct && filteredProducts.length === 0
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              />
            </div>
            <button
              onClick={openCreateProduct}
              className="flex items-center justify-center px-3 py-2 border border-[#004D77] text-[#004D77] bg-white hover:bg-[#004D77] hover:text-white rounded-lg transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              searchProduct && !selectedProduct && filteredProducts.length === 0
                ? "max-h-10 mt-1.5 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />
              Producto no encontrado en el catálogo
            </p>
          </div>

          {showSuggestions && searchProduct && filteredProducts.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {filteredProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-[#004D77] hover:text-white cursor-pointer transition-all"
                >
                  <div className="font-semibold">{product.nombre}</div>
                  <div className="text-xs opacity-70">
                    Código: {product.codigoBarras}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedProduct && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-[#004D77] font-medium">
                <Check size={11} className="text-green-500" />
                {selectedProduct.nombre}
              </span>
              {availableBarcodes.length > 1 && (
                <span className="text-xs text-gray-400">
                  Código activo:
                  <span className="ml-1 font-mono font-semibold text-[#004D77]">
                    {resolvedBarcode}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ================= SELECTOR DE CÓDIGO DE BARRAS ACTIVO ================= */}
        {selectedProduct && availableBarcodes.length > 1 && (
          <div className="mb-2 mt-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Selecciona el código a usar al agregar
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableBarcodes.map((code, i) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setActiveBarcodeIndex(i)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                    activeBarcodeIndex === i
                      ? "bg-[#004D77] text-white border-[#004D77] shadow-sm"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#004D77]"
                  }`}
                >
                  {i === 0 ? "Original" : `Nuevo ${i}`}: {code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= LINK AGREGAR CÓDIGO DE BARRAS ================= */}
        <div className="mb-4 mt-3">
          <button
            type="button"
            onClick={handleToggleBarcodeForm}
            title={barcodeLinkDisabled ? "Primero selecciona un producto del buscador" : ""}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors group ${
              barcodeLinkDisabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#004D77] hover:text-[#003a5c] cursor-pointer"
            }`}
          >
            <Barcode size={13} className="opacity-70" />
            <span className={barcodeLinkDisabled ? "" : "underline underline-offset-2 decoration-dotted"}>
              Agregar código de barras
            </span>
            {!barcodeLinkDisabled && (
              showBarcodeForm
                ? <ChevronUp size={13} className="opacity-60" />
                : <ChevronDown size={13} className="opacity-60" />
            )}
          </button>

          {barcodeLinkDisabled && (
            <p className="text-xs text-gray-400 mt-0.5 ml-[18px]">
              Selecciona un producto primero
            </p>
          )}

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showBarcodeForm && selectedProduct
                ? "max-h-80 opacity-100 mt-3"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Producto seleccionado
                </label>
                <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 font-medium select-none">
                  {selectedProduct?.nombre}
                  <span className="ml-2 text-xs text-gray-400 font-normal font-mono">
                    ({selectedProduct?.codigoBarras})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nuevo código de barras
                </label>
                <input
                  type="text"
                  value={barcodeValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 13);
                    setBarcodeValue(val);
                    setBarcodeError("");
                  }}
                  placeholder="Ej: 7701234000099"
                  maxLength={13}
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-700 outline-none transition-all font-mono tracking-wider ${
                    barcodeError
                      ? "border-red-400 focus:ring-2 focus:ring-red-300"
                      : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"
                  }`}
                />
                <p className="text-right text-xs text-gray-400 mt-1">
                  {barcodeValue.length}/13 dígitos
                </p>
              </div>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  barcodeError ? "max-h-8 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {barcodeError}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveBarcode}
                className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  barcodeSaved
                    ? "bg-green-500 text-white"
                    : "bg-[#004D77] text-white hover:bg-[#003a5c]"
                }`}
              >
                {barcodeSaved ? (
                  <><Check size={15} /> ¡Guardado!</>
                ) : (
                  "Guardar código"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= CANTIDAD ================= */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Cantidad
          </label>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-12 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg"
            >
              <Minus size={18} />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-24 sm:w-32 py-2 bg-white border border-gray-300 rounded-lg text-center font-semibold"
            />
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-12 h-10 flex items-center justify-center bg-[#004D77] border-2 border-[#004D77] rounded-lg text-white"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* ================= BOTONES ================= */}
        <button
          onClick={handleAddProduct}
          className="w-full py-3 bg-[#004D77] text-white font-semibold rounded-lg hover:bg-[#003a5c] transition-all shadow-lg"
        >
          Agregar ({purchaseItems.length})
        </button>

        <div className="mt-2 flex justify-center">
          <ScannerStatus status={scannerMessage} />
        </div>

        <Link
          to="/admin/purchases"
          onClick={handleBackToPurchases}
          className="w-full mt-3 block text-center py-3 border-2 border-[#004D77] text-[#004D77] font-semibold rounded-lg hover:bg-[#004D77] hover:text-white transition-all"
        >
          Volver a Compras
        </Link>

      </div>
    </div>
  );
};

export default CreateSidebar;
