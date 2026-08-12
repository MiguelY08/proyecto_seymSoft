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
  DollarSign,
  ChevronRight,
  Package,
  Ruler,
  Scale,
  Droplet,
  Pencil,
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
import { updateProductPrices } from "../data/PurchasesService";

const PURCHASE_TYPES = {
  UNIT: { value: "unit", label: "Unidad", icon: Package, allowDecimals: false, quantityLabel: "Cantidad (unidades)" },
  PACK: { value: "pack", label: "X Paca", icon: Ruler, allowDecimals: false, quantityLabel: "Cantidad de pacas" },
  LITER: { value: "liter", label: "Litros", icon: Droplet, allowDecimals: true, quantityLabel: "Cantidad (litros)" },
  KILO: { value: "kilo", label: "Kilos", icon: Scale, allowDecimals: true, quantityLabel: "Cantidad (kilos)" },
};

const CreateSidebar = ({
  productsDB = [],
  providersList = [],
  selectedProvider,
  setSelectedProvider,
  selectedProviderId,
  setSelectedProviderId,
  invoiceNumber,
  setInvoiceNumber,
  invoiceTouched,
  setInvoiceTouched,
  invoiceError = "",
  invoiceValid = false,
  isCheckingInvoice = false,
  purchaseDate,
  setPurchaseDate,
  searchProduct,
  setSearchProduct,
  quantity,
  setQuantity,
  handleQuantityChange,
  handleAddProduct: handleAddProductProp,
  purchaseItems,
  dateTouched,
  setDateTouched,
  providerTouched,
  setProviderTouched,
  openCreateProduct,
  openCreateProvider,
  extraBarcodes = {},
  onExtraBarcodesChange,
  onCollapse,
  isEditing = false,
  onCancelEdit = null,
  editingProductData = null,
}) => {
  const navigate = useNavigate();
  const { showConfirm, showError, showWarning } = useAlert();

  const [isOpen, setIsOpen] = useState(false);
  const [searchProvider, setSearchProvider] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseType, setPurchaseType] = useState(PURCHASE_TYPES.UNIT);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [productQuantityPerPack, setProductQuantityPerPack] = useState(0);
  const typeDropdownRef = useRef(null);
  
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [editingPrices, setEditingPrices] = useState({
    retailPrice: "",
    wholesalePrice: "",
    partnerPrice: "",
    bulkPrice: "",
  });
  const [priceErrors, setPriceErrors] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  const [showBarcodeForm, setShowBarcodeForm] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeSaved, setBarcodeSaved] = useState(false);
  const [barcodeError, setBarcodeError] = useState("");
  const [activeBarcodeIndex, setActiveBarcodeIndex] = useState(0);
  const [scannerMessage, setScannerMessage] = useState(null);
  const providerWrapperRef = useRef(null);
  const productWrapperRef = useRef(null);
  const purchasePriceInputRef = useRef(null);
  const sidebarRef = useRef(null);

  // ========== EFECTO PARA CARGAR DATOS DE EDICIÓN ==========
  useEffect(() => {
    if (isEditing && editingProductData) {
      const product = editingProductData;
      const fullProduct = productsDB.find(p => p.id === product.id);
      if (fullProduct) {
        setSelectedProduct(fullProduct);
        setSearchProduct(fullProduct.nombre);
        
        setEditingPrices({
          retailPrice: product.editingRetailPrice?.toString() || fullProduct.retailPrice?.toString() || "",
          wholesalePrice: product.editingWholesalePrice?.toString() || fullProduct.wholesalePrice?.toString() || "",
          partnerPrice: product.editingPartnerPrice?.toString() || fullProduct.partnerPrice?.toString() || "",
          bulkPrice: product.editingBulkPrice?.toString() || fullProduct.bulkPrice?.toString() || "",
        });
        
        setPurchasePrice(product.editingPurchasePrice?.toString() || fullProduct.supplierPrice?.toString() || "");
        setQuantity(product.editingQuantity || 1);
        
        const typeMap = {
          "Unidad": "unit",
          "X Paca": "pack",
          "Litros": "liter",
          "Kilos": "kilo"
        };
        const typeValue = typeMap[product.editingPurchaseType] || "unit";
        const foundType = Object.values(PURCHASE_TYPES).find(t => t.value === typeValue);
        if (foundType) {
          setPurchaseType(foundType);
        }
        
        if (product.editingBarcode) {
          const barcodes = getProductBarcodeValues(fullProduct);
          const barcodeIndex = barcodes.findIndex(code => code === product.editingBarcode);
          if (barcodeIndex !== -1) {
            setActiveBarcodeIndex(barcodeIndex);
          }
        }
        
        const purchaseNum = parseFloat(product.editingPurchasePrice || fullProduct.supplierPrice) || 0;
        const retailNum = parseFloat(product.editingRetailPrice || fullProduct.retailPrice) || 0;
        const wholesaleNum = parseFloat(product.editingWholesalePrice || fullProduct.wholesalePrice) || 0;
        if (purchaseNum > 0 && (retailNum <= purchaseNum || wholesaleNum <= purchaseNum)) {
          setShowPriceEditor(true);
        }
      }
    }
  }, [isEditing, editingProductData, productsDB]);

  // ========== SCROLL AUTOMATICO AL CREAR PRODUCTO ==========
  useEffect(() => {
    if (openCreateProduct) {
      setTimeout(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        if (modal) {
          modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const anyModal = document.querySelector('[role="dialog"]');
          if (anyModal) {
            anyModal.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 400);
    }
  }, [openCreateProduct]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (providerWrapperRef.current && !providerWrapperRef.current.contains(event.target)) setIsOpen(false);
      if (productWrapperRef.current && !productWrapperRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedProduct && !isEditing) {
      setEditingPrices({
        retailPrice: selectedProduct.retailPrice?.toString() || "",
        wholesalePrice: selectedProduct.wholesalePrice?.toString() || "",
        partnerPrice: selectedProduct.partnerPrice?.toString() || "",
        bulkPrice: selectedProduct.bulkPrice?.toString() || "",
      });
      setPurchasePrice((selectedProduct.supplierPrice ?? selectedProduct.wholesalePrice ?? "").toString());
      setPurchaseType(PURCHASE_TYPES.UNIT);
      setProductQuantityPerPack(selectedProduct.quantityPerPack || 0);
      setPriceErrors({});
    }
  }, [selectedProduct, isEditing]);

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

  const filteredProducts = productsDB.filter((p) => {
    const product = getProductWithLocalBarcodes(p);
    return (
      p.nombre.toLowerCase().includes(searchProduct.toLowerCase()) ||
      productMatchesBarcodeSearch(product, searchProduct)
    );
  });

  const allUsedBarcodes = [
    ...productsDB.flatMap((p) => getProductBarcodeValues(getProductWithLocalBarcodes(p))),
    ...Object.values(extraBarcodes).flat(),
  ].map((code) => normalizeBarcode(code));

  const availableBarcodes = selectedProduct
    ? [...new Set(getProductBarcodeValues(getProductWithLocalBarcodes(selectedProduct)))]
    : [];

  const resolvedBarcode = selectedProduct && availableBarcodes[activeBarcodeIndex]
    ? availableBarcodes[activeBarcodeIndex]
    : selectedProduct?.codigoBarras;

  const providerError = (() => {
    if (!providerTouched) return null;
    if (!selectedProvider) return "El proveedor es obligatorio";
    if (selectedProvider.length < 3) return "El nombre del proveedor es demasiado corto";
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
      error ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
    }`;

  const priceInputClass = (error) =>
    `w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-700 outline-none transition-colors duration-200 ${
      error ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
    }`;

  const handleBackToPurchases = async (e) => {
    e.preventDefault();
    if (purchaseItems.length > 0) {
      const result = await showConfirm("warning", "Volver a compras", "Si sales ahora se eliminaran los productos agregados. Deseas continuar?", {
        confirmButtonText: "Si, salir",
        cancelButtonText: "Seguir editando",
      });
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
    setShowPriceEditor(false);
    setBarcodeValue("");
    setBarcodeError("");
    setBarcodeSaved(false);
    setActiveBarcodeIndex(nextActiveBarcodeIndex);
    setPurchasePrice((product.supplierPrice ?? product.wholesalePrice ?? "").toString());
    setPurchaseType(PURCHASE_TYPES.UNIT);
    setProductQuantityPerPack(product.quantityPerPack || 0);
    setEditingPrices({
      retailPrice: product.retailPrice?.toString() || "",
      wholesalePrice: product.wholesalePrice?.toString() || "",
      partnerPrice: product.partnerPrice?.toString() || "",
      bulkPrice: product.bulkPrice?.toString() || "",
    });
    setPriceErrors({});
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchProduct(val);
    setShowSuggestions(true);
    if (selectedProduct && val !== selectedProduct.nombre) {
      setSelectedProduct(null);
      setShowBarcodeForm(false);
      setShowPriceEditor(false);
      setBarcodeValue("");
      setBarcodeError("");
      setBarcodeSaved(false);
      setActiveBarcodeIndex(0);
      setPurchasePrice("");
      setPurchaseType(PURCHASE_TYPES.UNIT);
      setProductQuantityPerPack(0);
      setPriceErrors({});
    }
  };

  const handleScannedProduct = (code) => {
    const normalizedCode = normalizeBarcode(code, { numericOnly: true });
    const product = findProductByBarcode(productsDB.map(getProductWithLocalBarcodes), normalizedCode);

    if (!product) {
      setSearchProduct(normalizedCode);
      setSelectedProduct(null);
      setShowSuggestions(true);
      setShowBarcodeForm(false);
      setShowPriceEditor(false);
      setBarcodeValue("");
      setBarcodeError("");
      setBarcodeSaved(false);
      setActiveBarcodeIndex(0);
      setScannerMessage({ type: 'error', message: `No encontrado: ${normalizedCode}` });
      showError("Codigo no registrado", `No se encontro ningun producto con el codigo de barras ${normalizedCode}.`);
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
    const timeout = window.setTimeout(() => setScannerMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [scannerMessage]);

  const handleToggleBarcodeForm = () => {
    if (!selectedProduct) return;
    if (showPriceEditor) setShowPriceEditor(false);
    setShowBarcodeForm(!showBarcodeForm);
    if (!showBarcodeForm) {
      setBarcodeValue("");
      setBarcodeError("");
      setBarcodeSaved(false);
    }
  };

  const handleTogglePriceEditor = () => {
    if (!selectedProduct) return;
    if (showBarcodeForm) setShowBarcodeForm(false);
    setShowPriceEditor(!showPriceEditor);
    if (!showPriceEditor) setPriceErrors({});
  };

  const handleSaveBarcode = () => {
    const trimmed = barcodeValue.trim();
    if (!trimmed) {
      setBarcodeError("El codigo de barras es obligatorio");
      return;
    }
    if (!/^[0-9]{8,13}$/.test(trimmed)) {
      setBarcodeError("El codigo debe tener entre 8 y 13 digitos numericos");
      return;
    }
    if (allUsedBarcodes.includes(trimmed)) {
      setBarcodeError("Este codigo de barras ya esta registrado");
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

  // ========== PRECIO DE COMPRA - SIEMPRE EDITABLE ==========
  const handlePurchasePriceChange = (e) => {
    const value = e.target.value.replace(',', '.');
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPurchasePrice(value);
      setPriceErrors({});
    }
  };

  // ========== VALIDACION DE PRECIOS DE VENTA CONTRA PRECIO DE COMPRA ==========
  const validateSalePricesAgainstPurchase = (prices = editingPrices, purchase = purchasePrice) => {
    const errors = {};
    const purchaseNum = parseFloat(purchase) || 0;
    const retail = parseFloat(prices.retailPrice) || 0;
    const wholesale = parseFloat(prices.wholesalePrice) || 0;
    const partner = parseFloat(prices.partnerPrice) || 0;
    const bulk = parseFloat(prices.bulkPrice) || 0;

    if (purchaseNum > 0 && selectedProduct) {
      if (retail > 0 && retail <= purchaseNum) {
        errors.retailPrice = `Debe ser mayor a ${purchaseNum}`;
      }
      if (wholesale > 0 && wholesale <= purchaseNum) {
        errors.wholesalePrice = `Debe ser mayor a ${purchaseNum}`;
      }
      if (partner > 0 && partner <= purchaseNum) {
        errors.partnerPrice = `Debe ser mayor a ${purchaseNum}`;
      }
      if (bulk > 0 && bulk <= purchaseNum) {
        errors.bulkPrice = `Debe ser mayor a ${purchaseNum}`;
      }
    }

    return errors;
  };

  // ========== VERIFICAR SI TODOS LOS PRECIOS DE VENTA SON VALIDOS ==========
  const areAllSalePricesValid = () => {
    const purchaseNum = parseFloat(purchasePrice) || 0;
    if (purchaseNum <= 0 || !selectedProduct) return true;
    
    const retail = parseFloat(editingPrices.retailPrice) || 0;
    const wholesale = parseFloat(editingPrices.wholesalePrice) || 0;
    const partner = parseFloat(editingPrices.partnerPrice) || 0;
    const bulk = parseFloat(editingPrices.bulkPrice) || 0;

    let hasInvalidPrice = false;
    let hasAnyDefinedPrice = false;

    if (retail > 0 && retail > purchaseNum) {
      hasAnyDefinedPrice = true;
    } else if (retail > 0 && retail <= purchaseNum) {
      hasInvalidPrice = true;
    } else if (retail === 0) {
      hasInvalidPrice = true;
    }

    if (wholesale > 0 && wholesale > purchaseNum) {
      hasAnyDefinedPrice = true;
    } else if (wholesale > 0 && wholesale <= purchaseNum) {
      hasInvalidPrice = true;
    } else if (wholesale === 0) {
      hasInvalidPrice = true;
    }

    if (partner > 0 && partner <= purchaseNum) {
      hasInvalidPrice = true;
    }

    if (bulk > 0 && bulk <= purchaseNum) {
      hasInvalidPrice = true;
    }

    if (hasInvalidPrice) return false;
    if (!hasAnyDefinedPrice) return 'empty';
    return true;
  };

  const handlePriceInputChange = (field, value) => {
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      const newPrices = { ...editingPrices, [field]: value };
      setEditingPrices(newPrices);
      
      const errors = validateSalePricesAgainstPurchase(newPrices);
      setPriceErrors(prev => ({
        ...prev,
        [field]: errors[field] || undefined
      }));
    }
  };

  const validatePrices = () => {
    const errors = {};
    const retail = parseFloat(editingPrices.retailPrice);
    const wholesale = parseFloat(editingPrices.wholesalePrice);
    const partner = parseFloat(editingPrices.partnerPrice);
    const bulk = parseFloat(editingPrices.bulkPrice);

    if (retail && wholesale && wholesale >= retail) {
      errors.wholesalePrice = "Debe ser menor al precio detal";
    }
    if (wholesale && partner && partner > wholesale) {
      errors.partnerPrice = "Debe ser menor o igual al precio mayorista";
    }
    if (retail && bulk && bulk >= retail) {
      errors.bulkPrice = "Debe ser menor al precio detal";
    }
    return errors;
  };

  // ========== GUARDAR PRECIOS DE VENTA Y ACTUALIZAR EN BD ==========
  const handleSavePrices = async () => {
    const saleErrors = validateSalePricesAgainstPurchase();
    const errors = { ...validatePrices(), ...saleErrors };
    
    if (Object.keys(errors).length > 0) {
      setPriceErrors(errors);
      showError("Error de validacion", "Corrige los errores en los precios");
      return;
    }

    const purchaseNum = parseFloat(purchasePrice) || 0;
    const retail = parseFloat(editingPrices.retailPrice) || 0;
    const wholesale = parseFloat(editingPrices.wholesalePrice) || 0;

    if (purchaseNum > 0) {
      if (retail <= purchaseNum) {
        setPriceErrors(prev => ({ ...prev, retailPrice: `Debe ser mayor a ${purchaseNum}` }));
        showError("Error de validacion", "El precio detal debe ser mayor al precio de compra");
        return;
      }
      if (wholesale <= purchaseNum) {
        setPriceErrors(prev => ({ ...prev, wholesalePrice: `Debe ser mayor a ${purchaseNum}` }));
        showError("Error de validacion", "El precio mayorista debe ser mayor al precio de compra");
        return;
      }
    }

    try {
      setLoadingPrices(true);
      
      const pricesToUpdate = {
        retailPrice: parseFloat(editingPrices.retailPrice) || 0,
        wholesalePrice: parseFloat(editingPrices.wholesalePrice) || 0,
        partnerPrice: parseFloat(editingPrices.partnerPrice) || 0,
        bulkPrice: parseFloat(editingPrices.bulkPrice) || 0,
      };

      if (purchasePrice && parseFloat(purchasePrice) > 0) {
        pricesToUpdate.supplierPrice = parseFloat(purchasePrice);
      }

      console.log("🔄 Actualizando producto en BD:", selectedProduct.id, pricesToUpdate);
      
      const updated = await updateProductPrices(selectedProduct.id, pricesToUpdate);
      
      if (updated) {
        showConfirm("info", "Precios actualizados", "Los precios de venta se han actualizado correctamente en la base de datos.");
        setShowPriceEditor(false);
        setPriceErrors({});
        
        const updatedProduct = {
          ...selectedProduct,
          retailPrice: pricesToUpdate.retailPrice,
          wholesalePrice: pricesToUpdate.wholesalePrice,
          partnerPrice: pricesToUpdate.partnerPrice,
          bulkPrice: pricesToUpdate.bulkPrice,
          supplierPrice: pricesToUpdate.supplierPrice || selectedProduct.supplierPrice,
        };
        setSelectedProduct(updatedProduct);
        
        setEditingPrices({
          retailPrice: pricesToUpdate.retailPrice.toString(),
          wholesalePrice: pricesToUpdate.wholesalePrice.toString(),
          partnerPrice: pricesToUpdate.partnerPrice.toString(),
          bulkPrice: pricesToUpdate.bulkPrice.toString(),
        });
      }
    } catch (error) {
      console.error("❌ Error actualizando precios:", error);
      showError("Error", error.message || "No se pudieron actualizar los precios.");
    } finally {
      setLoadingPrices(false);
    }
  };

  const handlePurchaseTypeChange = (typeValue) => {
    const newType = Object.values(PURCHASE_TYPES).find(t => t.value === typeValue);
    if (newType) {
      setPurchaseType(newType);
      if (!newType.allowDecimals && !Number.isInteger(Number(quantity))) setQuantity(1);
      setShowTypeDropdown(false);
    }
  };

  const handleQuantityChangeWithType = (delta) => {
    const newValue = Number(quantity) + delta;
    if (purchaseType.allowDecimals) {
      const rounded = Math.round(newValue * 100) / 100;
      if (rounded >= 0.01) setQuantity(rounded);
    } else {
      const intValue = Math.round(newValue);
      if (intValue >= 1) setQuantity(intValue);
    }
  };

  const handleQuantityInputChange = (e) => {
    const value = e.target.value;
    if (purchaseType.allowDecimals) {
      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
        const num = parseFloat(value);
        if (num >= 0.01 || value === '' || value === '0.') setQuantity(value);
      }
    } else {
      const intValue = parseInt(value);
      if (value === '' || (Number.isInteger(intValue) && intValue >= 1)) setQuantity(value);
    }
  };

  // ========== HANDLE ADD PRODUCT ==========
  const handleAddProduct = () => {
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      showWarning("Precio de compra requerido", "Debes definir el precio de compra del producto.");
      return;
    }

    const saleErrors = validateSalePricesAgainstPurchase();
    if (Object.keys(saleErrors).length > 0) {
      const errorMessages = Object.values(saleErrors).join('\n');
      showError(
        "Precios de venta invalidos", 
        `Los siguientes precios deben ser mayores al precio de compra (${purchasePrice}):\n${errorMessages}`
      );
      setShowPriceEditor(true);
      return;
    }

    const finalQuantity = purchaseType.allowDecimals ? parseFloat(quantity) || 0 : parseInt(quantity) || 1;
    if (finalQuantity <= 0) {
      showWarning("Cantidad invalida", "La cantidad debe ser mayor a 0.");
      return;
    }

    if (!selectedProduct) {
      showWarning("Producto requerido", "Debes seleccionar un producto.");
      return;
    }

    handleAddProductProp(
      resolvedBarcode,
      purchasePrice,
      {
        retailPrice: editingPrices.retailPrice,
        wholesalePrice: editingPrices.wholesalePrice,
        partnerPrice: editingPrices.partnerPrice,
        bulkPrice: editingPrices.bulkPrice,
      },
      {
        type: purchaseType.value,
        label: purchaseType.label,
        quantity: finalQuantity,
        quantityPerPack: productQuantityPerPack,
      }
    );
  };

  const currentType = purchaseType;
  const TypeIcon = currentType.icon;

  const hasPriceErrors = Object.keys(priceErrors).length > 0;
  
  const validationStatus = areAllSalePricesValid();
  const hasInvalidSalePrices = validationStatus === false && parseFloat(purchasePrice) > 0;
  const hasEmptySalePrices = validationStatus === 'empty' && parseFloat(purchasePrice) > 0;

  return (
    <div ref={sidebarRef} className="col-span-3">
      <div className="sticky top-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#004D77]">
            <FileText className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800">Informacion de la compra</p>
            <p className="text-xs text-gray-400">Proveedor, factura y productos</p>
          </div>
          <button type="button" onClick={onCollapse} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-[#004D77]">
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-5">

          {/* ========== INDICADOR DE EDICION ========== */}
          {isEditing && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Pencil size={15} strokeWidth={1.7} />
                <span> Editando producto</span>
                <span className="font-semibold">
                  {selectedProduct?.nombre || "..."}
                </span>
              </div>
              {onCancelEdit && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}

          {/* PROVEEDOR */}
          <div ref={providerWrapperRef} className="relative flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">Proveedor <span className="text-red-500">*</span></label>
            <div onClick={() => { setIsOpen(!isOpen); setProviderTouched(true); }} className={`relative flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 transition-colors ${providerError ? "border-red-500" : "border-gray-300 hover:border-[#004D77]"}`}>
              <Truck className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" strokeWidth={1.8} />
              <span className="truncate">{selectedProvider || "Seleccione el proveedor"}</span>
              <div className="flex items-center gap-2">
                {providerTouched && providerError && <AlertCircle size={16} className="text-red-400" />}
                <span className="text-gray-500">▾</span>
              </div>
            </div>
            {isOpen && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
                <h3 className="text-center font-semibold text-gray-800 mb-3">Seleccione un Proveedor</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex w-full items-center rounded-lg border border-gray-300 bg-white px-3 py-2">
                    <Search size={16} className="text-gray-500 mr-2" />
                    <input type="text" placeholder="Buscar" value={searchProvider} onChange={(e) => setSearchProvider(e.target.value)} className="bg-transparent outline-none text-sm w-full" />
                  </div>
                  <button onClick={openCreateProvider} title="Crear proveedor" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#004D77] bg-white text-[#004D77] transition-colors hover:bg-[#004D77] hover:text-white">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {filteredProviders.map((provider, index) => (
                    <label key={provider.id || index} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm text-gray-700 transition-colors hover:bg-[#004D77]/10">
                      <input type="checkbox" checked={selectedProvider === provider.nombre} onChange={() => { setSelectedProvider(provider.nombre); setSelectedProviderId(provider.id); setProviderTouched(true); setIsOpen(false); }} className="accent-[#004D77]" />
                      {provider.nombre}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className={`overflow-hidden transition-all duration-300 ${providerError ? "max-h-10 mt-1.5 opacity-100" : "max-h-0 opacity-0"}`}>
              <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {providerError}</p>
            </div>
          </div>

          {/* ========== FACTURA CON VALIDACIÓN EN TIEMPO REAL ========== */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">
              No. factura <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => { 
                  setInvoiceNumber(e.target.value); 
                  setInvoiceTouched(true); 
                }}
                onBlur={() => setInvoiceTouched(true)}
                placeholder="Ingrese el No de la factura"
                className={`w-full pl-10 pr-9 py-2.5 bg-white border rounded-lg text-sm text-gray-700 outline-none transition-colors duration-200 ${
                  invoiceTouched && invoiceError
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : invoiceTouched && invoiceValid
                    ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    : "border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20"
                }`}
              />
              {invoiceTouched && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingInvoice ? (
                    <div className="w-4 h-4 border-2 border-[#004D77] border-t-transparent rounded-full animate-spin" />
                  ) : invoiceError ? (
                    <AlertCircle size={16} className="text-red-400" />
                  ) : invoiceValid ? (
                    <Check size={16} className="text-green-500" />
                  ) : null}
                </div>
              )}
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${
              invoiceTouched && (invoiceError || invoiceValid) ? "max-h-10 mt-1.5 opacity-100" : "max-h-0 opacity-0"
            }`}>
              <p className={`text-xs flex items-center gap-1 ${
                invoiceError ? "text-red-500" : "text-green-500"
              }`}>
                {invoiceError ? <AlertCircle size={12} /> : <Check size={12} />}
                {invoiceError || (invoiceValid && "✓ Número de factura disponible")}
              </p>
            </div>
            {invoiceTouched && !invoiceError && !invoiceValid && !isCheckingInvoice && invoiceNumber.trim().length > 0 && (
              <p className="text-xs text-gray-400 mt-1 text-right">
                {invoiceNumber.trim().length}/20 caracteres
              </p>
            )}
          </div>

          {/* FECHA */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">Fecha de compra <span className="text-red-500">*</span></label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
              <input type="date" value={purchaseDate} max={new Date().toISOString().split("T")[0]} onChange={(e) => { setPurchaseDate(e.target.value); setDateTouched(true); }} onBlur={() => setDateTouched(true)} className={inputClass(dateError)} />
              {dateTouched && dateError && <div className="absolute right-8 top-1/2 -translate-y-1/2"><AlertCircle size={16} className="text-red-400" /></div>}
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${dateError ? "max-h-10 mt-1.5 opacity-100" : "max-h-0 opacity-0"}`}>
              <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {dateError}</p>
            </div>
          </div>

          {/* BUSCAR PRODUCTO */}
          <div ref={productWrapperRef} className="relative border-t border-gray-100 pt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Producto</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
                <input type="text" value={searchProduct} onChange={handleSearchChange} data-scanner-field="purchase-product-search" placeholder="Buscar producto o codigo" className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 ${searchProduct && !selectedProduct && filteredProducts.length === 0 ? "border-red-400" : "border-gray-300"}`} />
              </div>
              <button type="button" onClick={handleToggleBarcodeForm} disabled={!selectedProduct} title={!selectedProduct ? "Primero selecciona un producto" : "Agregar codigo de barras adicional"} className={`flex h-[42px] w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${!selectedProduct ? "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed" : showBarcodeForm ? "border-blue-600 bg-blue-600 text-white" : "border-blue-500 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-600"}`}>
                <Barcode size={16} />
              </button>
              <button type="button" onClick={openCreateProduct} title="Crear producto" className="flex h-[42px] w-10 shrink-0 items-center justify-center rounded-lg border border-[#004D77] bg-white text-[#004D77] transition-colors hover:bg-[#004D77] hover:text-white">
                <Plus size={16} />
              </button>
            </div>

            {/* Desplegable codigo de barras */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showBarcodeForm && selectedProduct ? "max-h-80 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700">Agregar codigo de barras</span>
                  <span className="text-[10px] text-gray-500">{selectedProduct?.nombre}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nuevo codigo de barras</label>
                  <input type="text" value={barcodeValue} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 13); setBarcodeValue(val); setBarcodeError(""); }} placeholder="Ej: 7701234000099" maxLength={13} className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-700 outline-none transition-all font-mono tracking-wider ${barcodeError ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"}`} />
                  <p className="text-right text-xs text-gray-400 mt-1">{barcodeValue.length}/13 digitos</p>
                </div>
                {barcodeError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {barcodeError}</p>}
                <button type="button" onClick={handleSaveBarcode} className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${barcodeSaved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                  {barcodeSaved ? <><Check size={15} /> Guardado!</> : "Guardar codigo"}
                </button>
              </div>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${searchProduct && !selectedProduct && filteredProducts.length === 0 ? "max-h-10 mt-1.5 opacity-100" : "max-h-0 opacity-0"}`}>
              <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> Producto no encontrado en el catalogo</p>
            </div>

            {showSuggestions && searchProduct && filteredProducts.length > 0 && (
              <div className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                {filteredProducts.slice(0, 6).map((product) => (
                  <div key={product.id} onClick={() => handleSelectProduct(product)} className="cursor-pointer px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-[#004D77]/10">
                    <div className="font-semibold">{product.nombre}</div>
                    <div className="text-xs opacity-70">Codigo: {product.codigoBarras}</div>
                  </div>
                ))}
              </div>
            )}

            {selectedProduct && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-[#004D77] font-medium">
                  <Check size={11} className="text-green-500" /> {selectedProduct.nombre}
                </span>
                {availableBarcodes.length > 1 && (
                  <span className="text-xs text-gray-400">Codigo activo: <span className="ml-1 font-mono font-semibold text-[#004D77]">{resolvedBarcode}</span></span>
                )}
              </div>
            )}
          </div>

          {/* TIPO DE COMPRA */}
          <div className="border-t border-gray-100 pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de compra</label>
            <div className="relative" ref={typeDropdownRef}>
              <button onClick={() => setShowTypeDropdown(!showTypeDropdown)} disabled={!selectedProduct} className={`flex w-full items-center justify-between rounded-lg border bg-white py-2.5 px-3 text-sm text-gray-700 transition-colors ${!selectedProduct ? "bg-gray-100 cursor-not-allowed text-gray-400 border-gray-200" : showTypeDropdown ? "border-[#004D77] ring-2 ring-[#004D77]/20" : "border-gray-300 hover:border-[#004D77]"}`}>
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-[#004D77]" strokeWidth={1.8} />
                  <span>{selectedProduct ? currentType.label : "Selecciona un producto primero"}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTypeDropdown ? "rotate-180" : ""}`} />
              </button>
              {showTypeDropdown && selectedProduct && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl py-1 overflow-hidden">
                  {Object.values(PURCHASE_TYPES).map((type) => {
                    const Icon = type.icon;
                    const isActive = purchaseType.value === type.value;
                    return (
                      <button key={type.value} onClick={() => handlePurchaseTypeChange(type.value)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${isActive ? "bg-[#004D77]/10 text-[#004D77] font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#004D77]" : "text-gray-400"}`} strokeWidth={1.8} />
                        <span className="flex-1 text-left">{type.label}</span>
                        {isActive && <span className="text-[#004D77] text-xs font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedProduct && (
              <p className="text-[10px] text-gray-400 mt-1">{currentType.allowDecimals ? "Permite cantidades decimales (ej: 1.5)" : "Solo cantidades enteras"}</p>
            )}

            {/* INFORMACION DE PACA */}
            {selectedProduct && purchaseType.value === "pack" && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Informacion de paca</span>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Cantidad por paca:</span>
                    <span className="ml-1 font-semibold text-blue-700">{productQuantityPerPack} unidades</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Pacas a comprar:</span>
                    <span className="ml-1 font-semibold text-blue-700">{quantity || 0}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-blue-200">
                    <span className="text-gray-500">Stock a sumar:</span>
                    <span className="ml-1 font-bold text-blue-700">
                      {Number(quantity || 0) * productQuantityPerPack} unidades
                    </span>
                    {quantity > 0 && productQuantityPerPack > 0 && (
                      <span className="block text-[10px] text-gray-400">({quantity} x {productQuantityPerPack})</span>
                    )}
                  </div>
                </div>
                {productQuantityPerPack === 0 && (
                  <p className="mt-1 text-xs text-amber-600">Este producto no tiene cantidad por paca definida. El stock se sumara como {quantity} unidades.</p>
                )}
              </div>
            )}
          </div>

          {/* PRECIO DE COMPRA */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">Precio de compra del producto</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
                <input
                  ref={purchasePriceInputRef}
                  type="text"
                  value={purchasePrice}
                  onChange={handlePurchasePriceChange}
                  placeholder="Precio de compra"
                  disabled={!selectedProduct}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 ${
                    !selectedProduct ? "bg-gray-100 cursor-not-allowed text-gray-400" : "border-gray-300"
                  }`}
                />
              </div>

              {/* BOTON DOLAR - Editar precios de venta */}
              <button
                type="button"
                onClick={handleTogglePriceEditor}
                disabled={!selectedProduct}
                title={!selectedProduct ? "Selecciona un producto primero" : "Editar precios de venta (Detal, Mayorista, Colegas, X Pacas)"}
                className={`flex h-[42px] w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  !selectedProduct
                    ? "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
                    : showPriceEditor
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-green-600 bg-white text-green-600 hover:bg-green-600 hover:text-white"
                }`}
              >
                <DollarSign size={16} />
              </button>
            </div>
            {selectedProduct && (
              <p className="text-[10px] text-gray-400">
                Puedes editar el precio de compra directamente en el campo
              </p>
            )}

            {/* Desplegable precios de venta */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showPriceEditor && selectedProduct ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700">Editar precios de venta</p>
                  <span className="text-[10px] text-gray-400">{selectedProduct?.nombre}</span>
                </div>

                {purchasePrice && parseFloat(purchasePrice) > 0 && (
                  <div className={`rounded-lg p-2 text-center ${
                    validationStatus === false ? 'bg-red-50 border border-red-200' : 
                    validationStatus === 'empty' ? 'bg-yellow-50 border border-yellow-200' : 
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <span className="text-[10px] text-gray-600">Precio de compra de referencia: </span>
                    <span className="text-xs font-bold text-blue-700">${parseFloat(purchasePrice).toLocaleString()}</span>
                    {validationStatus === false && (
                      <span className="text-[10px] text-red-500 block mt-1">Hay precios de venta invalidos</span>
                    )}
                    {validationStatus === 'empty' && (
                      <span className="text-[10px] text-yellow-600 block mt-1">Debes definir precios de venta mayores a ${parseFloat(purchasePrice).toLocaleString()}</span>
                    )}
                    {validationStatus === true && (
                      <span className="text-[10px] text-green-500 block mt-1">Todos los precios de venta son validos</span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                      Precio Detal <span className="text-red-500">*</span>
                      {purchasePrice && parseFloat(purchasePrice) > 0 && editingPrices.retailPrice && (
                        <span className={`ml-1 text-[9px] ${parseFloat(editingPrices.retailPrice) > parseFloat(purchasePrice) ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(editingPrices.retailPrice) > parseFloat(purchasePrice) ? 'OK' : 'Debe ser mayor a compra'}
                        </span>
                      )}
                      {(!editingPrices.retailPrice || parseFloat(editingPrices.retailPrice) === 0) && purchasePrice && parseFloat(purchasePrice) > 0 && (
                        <span className="ml-1 text-[9px] text-red-500">Obligatorio</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editingPrices.retailPrice}
                      onChange={(e) => handlePriceInputChange('retailPrice', e.target.value)}
                      placeholder="0"
                      className={priceInputClass(priceErrors.retailPrice)}
                    />
                    {priceErrors.retailPrice && (
                      <p className="text-[10px] text-red-500 mt-0.5">{priceErrors.retailPrice}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                      Precio Mayorista <span className="text-red-500">*</span>
                      {purchasePrice && parseFloat(purchasePrice) > 0 && editingPrices.wholesalePrice && (
                        <span className={`ml-1 text-[9px] ${parseFloat(editingPrices.wholesalePrice) > parseFloat(purchasePrice) ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(editingPrices.wholesalePrice) > parseFloat(purchasePrice) ? 'OK' : 'Debe ser mayor a compra'}
                        </span>
                      )}
                      {(!editingPrices.wholesalePrice || parseFloat(editingPrices.wholesalePrice) === 0) && purchasePrice && parseFloat(purchasePrice) > 0 && (
                        <span className="ml-1 text-[9px] text-red-500">Obligatorio</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editingPrices.wholesalePrice}
                      onChange={(e) => handlePriceInputChange('wholesalePrice', e.target.value)}
                      placeholder="0"
                      className={priceInputClass(priceErrors.wholesalePrice)}
                    />
                    {priceErrors.wholesalePrice && (
                      <p className="text-[10px] text-red-500 mt-0.5">{priceErrors.wholesalePrice}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                      Precio Colegas
                      {purchasePrice && parseFloat(purchasePrice) > 0 && editingPrices.partnerPrice && parseFloat(editingPrices.partnerPrice) > 0 && (
                        <span className={`ml-1 text-[9px] ${parseFloat(editingPrices.partnerPrice) > parseFloat(purchasePrice) ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(editingPrices.partnerPrice) > parseFloat(purchasePrice) ? 'OK' : 'Debe ser mayor a compra'}
                        </span>
                      )}
                      {purchasePrice && parseFloat(purchasePrice) > 0 && (!editingPrices.partnerPrice || parseFloat(editingPrices.partnerPrice) === 0) && (
                        <span className="ml-1 text-[9px] text-gray-400">(opcional)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editingPrices.partnerPrice}
                      onChange={(e) => handlePriceInputChange('partnerPrice', e.target.value)}
                      placeholder="0"
                      className={priceInputClass(priceErrors.partnerPrice)}
                    />
                    {priceErrors.partnerPrice && (
                      <p className="text-[10px] text-red-500 mt-0.5">{priceErrors.partnerPrice}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                      Precio X Pacas
                      {purchasePrice && parseFloat(purchasePrice) > 0 && editingPrices.bulkPrice && parseFloat(editingPrices.bulkPrice) > 0 && (
                        <span className={`ml-1 text-[9px] ${parseFloat(editingPrices.bulkPrice) > parseFloat(purchasePrice) ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(editingPrices.bulkPrice) > parseFloat(purchasePrice) ? 'OK' : 'Debe ser mayor a compra'}
                        </span>
                      )}
                      {purchasePrice && parseFloat(purchasePrice) > 0 && (!editingPrices.bulkPrice || parseFloat(editingPrices.bulkPrice) === 0) && (
                        <span className="ml-1 text-[9px] text-gray-400">(opcional)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editingPrices.bulkPrice}
                      onChange={(e) => handlePriceInputChange('bulkPrice', e.target.value)}
                      placeholder="0"
                      className={priceInputClass(priceErrors.bulkPrice)}
                    />
                    {priceErrors.bulkPrice && (
                      <p className="text-[10px] text-red-500 mt-0.5">{priceErrors.bulkPrice}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSavePrices}
                  disabled={loadingPrices || validationStatus === false || validationStatus === 'empty'}
                  className={`w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                    loadingPrices || validationStatus === false || validationStatus === 'empty'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#004D77] hover:bg-[#003a5c]'
                  }`}
                >
                  {loadingPrices ? 'Guardando...' : 'Guardar precios de venta'}
                </button>
              </div>
            </div>
          </div>

          {/* SELECTOR CODIGO ACTIVO */}
          {selectedProduct && availableBarcodes.length > 1 && (
            <div className="mb-2 mt-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Selecciona el codigo a usar al agregar</label>
              <div className="flex flex-wrap gap-1.5">
                {availableBarcodes.map((code, i) => (
                  <button key={code} type="button" onClick={() => setActiveBarcodeIndex(i)} className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${activeBarcodeIndex === i ? "bg-[#004D77] text-white border-[#004D77] shadow-sm" : "bg-white text-gray-600 border-gray-300 hover:border-[#004D77]"}`}>
                    {i === 0 ? "Original" : `Nuevo ${i}`}: {code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CANTIDAD */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">{currentType.quantityLabel}</label>
            <div className="grid grid-cols-[42px_1fr_42px] items-center gap-2">
              <button type="button" onClick={() => handleQuantityChangeWithType(-1)} className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:border-[#004D77] hover:text-[#004D77]">
                <Minus size={18} />
              </button>
              <input type={currentType.allowDecimals ? "text" : "number"} value={quantity} onChange={handleQuantityInputChange} step={currentType.allowDecimals ? "0.01" : "1"} min={currentType.allowDecimals ? "0.01" : "1"} className="h-10 w-full rounded-lg border border-gray-300 bg-white text-center text-sm font-semibold text-gray-700 outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20" />
              <button type="button" onClick={() => handleQuantityChangeWithType(1)} className="flex h-10 items-center justify-center rounded-lg border border-[#004D77] bg-[#004D77] text-white transition-colors hover:bg-[#003a5c]">
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* BOTONES */}
          <button 
            type="button" 
            onClick={handleAddProduct} 
            className={`flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${
              (hasInvalidSalePrices || hasEmptySalePrices) && parseFloat(purchasePrice) > 0
                ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed opacity-70' 
                : 'bg-[#004D77] hover:bg-[#003a5c]'
            }`}
            disabled={(hasInvalidSalePrices || hasEmptySalePrices) && parseFloat(purchasePrice) > 0}
          >
            <Plus className="h-4 w-4" strokeWidth={2} /> 
            {isEditing ? 'Actualizar producto' : `Agregar producto (${purchaseItems.length})`}
            {(hasInvalidSalePrices || hasEmptySalePrices) && parseFloat(purchasePrice) > 0 && (
              <span className="text-[10px] ml-1">Precios invalidos</span>
            )}
          </button>

          {(hasInvalidSalePrices || hasEmptySalePrices) && parseFloat(purchasePrice) > 0 && (
            <div className="text-center text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-2">
              Corrige los precios de venta (deben ser mayores al precio de compra de ${parseFloat(purchasePrice).toLocaleString()})
            </div>
          )}

          <div className="mt-2 flex justify-center"><ScannerStatus status={scannerMessage} /></div>

          <Link to="/admin/purchases" onClick={handleBackToPurchases} className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Volver a Compras
          </Link>

        </div>
      </div>
    </div>
  );
};

export default CreateSidebar;