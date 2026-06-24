// features/administrtivePanel/purchases/purchases/components/CreatePurchaseSideBar.jsx
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Barcode,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Minus,
  PanelLeftClose,
  Plus,
  Search,
  Truck,
} from "lucide-react";
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
  onCollapse,
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
  const providerWrapperRef = useRef(null);
  const productWrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        providerWrapperRef.current &&
        !providerWrapperRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }

      if (
        productWrapperRef.current &&
        !productWrapperRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    `w-full pl-10 pr-9 py-2.5 bg-white border rounded-lg text-sm text-gray-700 outline-none transition-colors duration-200 ${
      error
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
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
      <div className="sticky top-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#004D77]">
            <FileText className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800">Información de la compra</p>
            <p className="text-xs text-gray-400">Proveedor, factura y productos</p>
          </div>
          <button
            type="button"
            onClick={onCollapse}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-[#004D77]"
            title="Ocultar panel"
            aria-label="Ocultar panel de información"
          >
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-5">

        {/* ================= PROVEEDOR ================= */}
        <div ref={providerWrapperRef} className="relative flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Proveedor <span className="text-red-500">*</span>
          </label>

          <div
            onClick={() => { setIsOpen(!isOpen); setProviderTouched(true); }}
            className={`relative flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 transition-colors ${
              providerError ? "border-red-500" : "border-gray-300 hover:border-[#004D77]"
            }`}
          >
            <Truck className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" strokeWidth={1.8} />
            <span className="truncate">{selectedProvider || "Seleccione el proveedor"}</span>
            <div className="flex items-center gap-2">
              {providerTouched && providerError && (
                <AlertCircle size={16} className="text-red-400" />
              )}
              <span className="text-gray-500">▾</span>
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
              <h3 className="text-center font-semibold text-gray-800 mb-3">
                Seleccione un Proveedor
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex w-full items-center rounded-lg border border-gray-300 bg-white px-3 py-2">
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
                  title="Crear proveedor"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#004D77] bg-white text-[#004D77] transition-colors hover:bg-[#004D77] hover:text-white"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto">
                {filteredProviders.map((provider, index) => (
                  <label
                    key={provider.id || index}
                    className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm text-gray-700 transition-colors hover:bg-[#004D77]/10"
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
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            No. factura <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
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
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Fecha de compra <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
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
        <div
          ref={productWrapperRef}
          className="relative border-t border-gray-100 pt-4"
        >
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Producto
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
              <input
                type="text"
                value={searchProduct}
                onChange={handleSearchChange}
                data-scanner-field="purchase-product-search"
                placeholder="Buscar producto o código"
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 ${
                  searchProduct && !selectedProduct && filteredProducts.length === 0
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              />
            </div>
            <button
              type="button"
              onClick={openCreateProduct}
              title="Crear producto"
              className="flex h-[42px] w-10 shrink-0 items-center justify-center rounded-lg border border-[#004D77] bg-white text-[#004D77] transition-colors hover:bg-[#004D77] hover:text-white"
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
            <div className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
              {filteredProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="cursor-pointer px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-[#004D77]/10"
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
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Cantidad
          </label>
          <div className="grid grid-cols-[42px_1fr_42px] items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:border-[#004D77] hover:text-[#004D77]"
            >
              <Minus size={18} />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="h-10 w-full rounded-lg border border-gray-300 bg-white text-center text-sm font-semibold text-gray-700 outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="flex h-10 items-center justify-center rounded-lg border border-[#004D77] bg-[#004D77] text-white transition-colors hover:bg-[#003a5c]"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* ================= BOTONES ================= */}
        <button
          type="button"
          onClick={handleAddProduct}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003a5c]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Agregar producto ({purchaseItems.length})
        </button>

        <div className="mt-2 flex justify-center">
          <ScannerStatus status={scannerMessage} />
        </div>

        <Link
          to="/admin/purchases"
          onClick={handleBackToPurchases}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Volver a Compras
        </Link>

        </div>
      </div>
    </div>
  );
};

export default CreateSidebar;
