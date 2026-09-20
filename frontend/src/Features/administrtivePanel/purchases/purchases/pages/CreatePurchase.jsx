// features/administrtivePanel/purchases/purchases/pages/CreatePurchase.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import CreateSidebar from "../Components/CreatePurchaseSideBar";
import CreateTable from "../Components/TableCreate";
import CreateProduct from "../../products/modals/CreateProduct";
import { useAlert } from "../../../../shared/alerts/useAlert";
import FormProvider from "../../providers/components/FormProvider";
import { 
  createPurchase, 
  getProducts, 
  getProviders, 
  updateProductPrices,
  checkInvoiceExists 
} from "../data/PurchasesService";
import { providersService } from "../../providers/data/providersService";
import { findProductByBarcode, productMatchesBarcodeSearch } from "../../../../shared/scanner";
import Spinner from "../../../../shared/spinner";
import FullScreenSpinner from "../../../../shared/spinner/FullScreenSpinner";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  PackageOpen,
  PanelLeftOpen,
  Save,
  ShoppingBag,
  X,
  Pencil,
} from "lucide-react";

const CreatePurchase = () => {
  const navigate = useNavigate();
  const { showError, showWarning, showSuccess, showConfirm, showInfo } = useAlert();

  // Estados del formulario
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
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

  const [productsDB, setProductsDB] = useState([]);
  const [providersList, setProvidersList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // ========== ESTADOS PARA EDICIÓN ==========
  const [editingItemId, setEditingItemId] = useState(null);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editingProductData, setEditingProductData] = useState(null);

  // ========== ESTADOS PARA VALIDACIÓN DE FACTURA ==========
  const [invoiceError, setInvoiceError] = useState("");
  const [isCheckingInvoice, setIsCheckingInvoice] = useState(false);
  const [invoiceValid, setInvoiceValid] = useState(false);

  // ========== REF PARA EL MODAL DE CREAR PRODUCTO ==========
  const modalContainerRef = useRef(null);

  // ========== FUNCIÓN PARA VERIFICAR FACTURA EN TIEMPO REAL ==========
  const validateInvoice = useCallback(async (value) => {
    if (!value || value.trim().length < 3) {
      setInvoiceError("El número de factura debe tener al menos 3 caracteres");
      setInvoiceValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9\-]{3,20}$/.test(value.trim())) {
      setInvoiceError("Solo letras, números y guiones (3-20 caracteres)");
      setInvoiceValid(false);
      return;
    }

    setIsCheckingInvoice(true);
    try {
      const exists = await checkInvoiceExists(value.trim());
      if (exists) {
        setInvoiceError("Este número de factura ya existe en el sistema");
        setInvoiceValid(false);
      } else {
        setInvoiceError("");
        setInvoiceValid(true);
      }
    } catch (error) {
      console.error("Error verificando factura:", error);
      setInvoiceError("Error al verificar la factura");
      setInvoiceValid(false);
    } finally {
      setIsCheckingInvoice(false);
    }
  }, []);

  // ========== DEBOUNCE PARA VALIDACIÓN EN TIEMPO REAL ==========
  useEffect(() => {
    if (!invoiceTouched) return;
    
    const timer = setTimeout(() => {
      if (invoiceNumber.trim().length >= 3) {
        validateInvoice(invoiceNumber);
      } else if (invoiceNumber.trim().length === 0) {
        setInvoiceError("El número de factura es obligatorio");
        setInvoiceValid(false);
      } else {
        setInvoiceError("El número de factura debe tener al menos 3 caracteres");
        setInvoiceValid(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [invoiceNumber, invoiceTouched, validateInvoice]);

  // ========== SCROLL AUTOMATICO AL ABRIR EL MODAL ==========
  useEffect(() => {
    if (showCreateProduct) {
      setTimeout(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        if (modal) {
          modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (modalContainerRef.current) {
          modalContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }
  }, [showCreateProduct]);

  // ========== FUNCIÓN PARA ABRIR EL MODAL ==========
  const handleOpenCreateProduct = () => {
    setShowCreateProduct(true);
  };

  // ========== FUNCIÓN PARA CERRAR EL MODAL ==========
  const handleCloseCreateProduct = () => {
    setShowCreateProduct(false);
  };

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
      setSelectedProvider(newProvider.nombre);
      setSelectedProviderId(newProvider.id);
      setIsFormModalOpen(false);
      const updatedProviders = await getProviders();
      setProvidersList(updatedProviders);
    } catch (error) {
      showError("Error", error.message || "No se pudo crear el proveedor");
      throw error;
    }
  };

  const totalCompra = purchaseItems.reduce((sum, item) => sum + item.total, 0);
  const totalIVA = purchaseItems.reduce((sum, item) => sum + item.ivaValor, 0);
  const subtotalCompra = totalCompra - totalIVA;
  const formattedPurchaseDate = purchaseDate
    ? new Date(`${purchaseDate}T00:00:00`).toLocaleDateString("es-CO")
    : "Selecciona una fecha";

  const handleQuantityChange = (value) => {
    setQuantity((prev) => Math.max(1, prev + value));
  };

  const handleDeleteItem = async (id) => {
    const result = await showConfirm("warning", "Eliminar producto", "¿Estás seguro de que deseas eliminar este producto?");
    if (!result?.isConfirmed) return;
    setPurchaseItems(purchaseItems.filter((item) => item.id !== id));
    showSuccess("Producto eliminado", "El producto fue eliminado correctamente");
  };

  // ========== FUNCIÓN PARA EDITAR PRODUCTO ==========
  const handleEditItem = (item) => {
    const product = productsDB.find(p => p.id === item.idProduct);
    
    if (!product) {
      showError("Error", "No se encontró el producto en la base de datos");
      return;
    }

    const productData = {
      ...product,
      editingQuantity: item.cantidad,
      editingPurchasePrice: item.supplierPrice || item.valorUnit || "",
      editingPurchaseType: item.purchaseType || "Unidad",
      editingPurchaseTypeValue: item.purchaseTypeValue || null,
      editingRetailPrice: item.retailPrice || product.retailPrice || 0,
      editingWholesalePrice: item.wholesalePrice || product.wholesalePrice || 0,
      editingPartnerPrice: item.partnerPrice || product.partnerPrice || 0,
      editingBulkPrice: item.bulkPrice || product.bulkPrice || 0,
      editingBarcode: item.codigoBarras || "",
      editingStockTotal: item.stockTotal || 0,
    };

    setEditingProductData(productData);
    setEditingItemId(item.id);
    setIsEditingItem(true);
    
    showInfo("Editando producto", `Editando: ${item.producto}`);
    
    setTimeout(() => {
      const sidebar = document.querySelector('.col-span-3');
      if (sidebar) {
        sidebar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  // ========== FUNCIÓN PARA GUARDAR CAMBIOS DEL PRODUCTO EDITADO ==========
  const handleUpdateEditedProduct = (resolvedBarcode, purchasePrice, salePrices = {}, purchaseTypeInfo = null) => {
    const itemIndex = purchaseItems.findIndex(item => item.id === editingItemId);
    if (itemIndex === -1) {
      showError("Error", "No se encontró el producto a editar");
      return;
    }

    const foundProduct = productsDB.find(p => p.id === purchaseItems[itemIndex].idProduct);
    if (!foundProduct) {
      showError("Error", "No se encontró el producto en la base de datos");
      return;
    }

    const unitPrice = Number(purchasePrice) || foundProduct.supplierPrice || foundProduct.wholesalePrice || foundProduct.valorUnit;
    const currentItem = purchaseItems[itemIndex];
    const currentBarcode = foundProduct.barcodes?.find(
      (barcode) => String(barcode.barcode) === String(resolvedBarcode || currentItem.codigoBarras)
    );
    const stockActual = Number(currentItem.stockActual ?? currentBarcode?.stock ?? foundProduct.stock ?? 0);
    const selectedPurchaseType = purchaseTypeInfo?.type || currentItem.purchaseTypeValue || "unit";
    const selectedPurchaseTypeLabel = purchaseTypeInfo?.label || currentItem.purchaseType || "Unidad";
    const finalQuantity = purchaseTypeInfo?.quantity || currentItem.cantidad || quantity;
    const stockToAdd = selectedPurchaseType === "pack"
      ? finalQuantity * (foundProduct.quantityPerPack || 0) 
      : finalQuantity;

    const subtotal = unitPrice * stockToAdd;
    const ivaValor = (subtotal * foundProduct.iva) / 100;
    const total = subtotal + ivaValor;
    const currentExtraBarcodes = extraBarcodes[foundProduct.codigoBarras] || [];
    const variantName = getBarcodeVariantName(
      getProductWithLocalBarcodes(foundProduct),
      resolvedBarcode || currentItem.codigoBarras
    );

    const updatedItems = [...purchaseItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      variantName: variantName || currentItem.variantName || "",
      cantidad: finalQuantity,
      stockActual,
      stockTotal: stockToAdd,
      valorUnit: unitPrice,
      supplierPrice: unitPrice,
      purchaseType: selectedPurchaseTypeLabel,
      purchaseTypeValue: selectedPurchaseType,
      quantityPerPack: selectedPurchaseType === "pack" ? (foundProduct.quantityPerPack || 0) : 0,
      codigosExtra: [
        ...new Set([
          ...(updatedItems[itemIndex].codigosExtra || []),
          ...currentExtraBarcodes,
        ]),
      ],
      retailPrice: salePrices.retailPrice ? Number(salePrices.retailPrice) : foundProduct.retailPrice,
      wholesalePrice: salePrices.wholesalePrice ? Number(salePrices.wholesalePrice) : foundProduct.wholesalePrice,
      partnerPrice: salePrices.partnerPrice ? Number(salePrices.partnerPrice) : foundProduct.partnerPrice,
      bulkPrice: salePrices.bulkPrice ? Number(salePrices.bulkPrice) : foundProduct.bulkPrice,
      subtotal,
      ivaValor,
      total,
    };

    setPurchaseItems(updatedItems);
    setEditingItemId(null);
    setIsEditingItem(false);
    setEditingProductData(null);
    setSearchProduct("");
    setQuantity(1);
    
    showSuccess("Producto actualizado", "Los cambios se guardaron correctamente.");
  };

  // ========== CANCELAR EDICIÓN ==========
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setIsEditingItem(false);
    setEditingProductData(null);
    setSearchProduct("");
    setQuantity(1);
  };

  const handleCreateProduct = (newProduct) => {
    console.log("Producto creado:", newProduct);
    setShowCreateProduct(false);
    getProducts().then(setProductsDB);
  };

  const getProductWithLocalBarcodes = (product) => ({
    ...product,
    codigosExtra: [
      ...(Array.isArray(product.codigosExtra) ? product.codigosExtra : []),
      ...(extraBarcodes[product.codigoBarras] || []),
    ],
  });

  const getBarcodeVariantName = (product, barcode) => {
    if (!barcode) return "";

    const barcodeEntries = [
      ...(Array.isArray(product?.barcodes) ? product.barcodes : []),
      ...(Array.isArray(product?.codigosExtra) ? product.codigosExtra : []),
    ];
    const selectedEntry = barcodeEntries.find((entry) => {
      const value = typeof entry === "object" ? entry.barcode || entry.cod : entry;
      return String(value) === String(barcode);
    });

    return typeof selectedEntry === "object"
      ? selectedEntry.variantName || selectedEntry.variant_name || ""
      : "";
  };

  // ========== HANDLE ADD PRODUCT ==========
  const handleAddProduct = async (resolvedBarcode, purchasePrice, salePrices = {}, purchaseTypeInfo = null) => {
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

    const selectedBarcodeValue = String(resolvedBarcode || "").trim();
    const selectedBarcode = foundProduct.barcodes?.find(
      (barcode) => String(barcode.barcode) === String(resolvedBarcode)
    );
    const stockActual = Number(selectedBarcode?.stock ?? foundProduct.stock ?? 0);
    const selectedBarcodeId = purchaseTypeInfo?.idBarcode ?? selectedBarcode?.id;
    const codigosExtra = (extraBarcodes[foundProduct.codigoBarras] ?? []).filter((extraCode) => {
      const extraBarcode = typeof extraCode === "string" ? extraCode : extraCode?.barcode;
      // Un código nuevo aún no tiene ID: debe conservarse para que el backend
      // lo cree antes de resolverlo como código principal.
      if (!selectedBarcodeId) return true;
      return String(extraBarcode || "").trim() !== selectedBarcodeValue;
    });
    const variantName = getBarcodeVariantName(foundProduct, resolvedBarcode);
    const unitPrice = Number(purchasePrice) || foundProduct.supplierPrice || foundProduct.wholesalePrice || foundProduct.valorUnit;

    const salePricesToSave = {
      retailPrice: salePrices.retailPrice ? Number(salePrices.retailPrice) : foundProduct.retailPrice,
      wholesalePrice: salePrices.wholesalePrice ? Number(salePrices.wholesalePrice) : foundProduct.wholesalePrice,
      partnerPrice: salePrices.partnerPrice ? Number(salePrices.partnerPrice) : foundProduct.partnerPrice,
      bulkPrice: salePrices.bulkPrice ? Number(salePrices.bulkPrice) : foundProduct.bulkPrice,
    };

    let finalQuantity = quantity;
    let purchaseTypeLabel = "Unidad";
    let purchaseTypeValue = "unit";
    let quantityPerPack = 0;
    let stockToAdd = 0;

    if (purchaseTypeInfo) {
      finalQuantity = purchaseTypeInfo.quantity;
      purchaseTypeLabel = purchaseTypeInfo.label || "Unidad";
      purchaseTypeValue = purchaseTypeInfo.type || "unit";
      
      if (purchaseTypeValue === "pack") {
        quantityPerPack = foundProduct.quantityPerPack || 0;
        stockToAdd = finalQuantity * quantityPerPack;
      } else {
        stockToAdd = finalQuantity;
      }
    }

    finalQuantity = Number(finalQuantity) || 1;
    stockToAdd = Number(stockToAdd) || finalQuantity;

    const existingItem = purchaseItems.find(
      (item) =>
        (item.idBarcode && selectedBarcodeId
          ? Number(item.idBarcode) === Number(selectedBarcodeId)
          : item.codigoBarras === resolvedBarcode) &&
        (item.purchaseTypeValue || "unit") === purchaseTypeValue
    );

    if (existingItem) {
      const updatedItems = purchaseItems.map((item) => {
        if (
          (item.idBarcode && selectedBarcodeId
            ? Number(item.idBarcode) === Number(selectedBarcodeId)
            : item.codigoBarras === resolvedBarcode) &&
          (item.purchaseTypeValue || "unit") === purchaseTypeValue
        ) {
          const nuevaCantidad = item.cantidad + finalQuantity;
          const nuevoStockTotal = item.stockTotal + stockToAdd;
          const subtotal = unitPrice * nuevoStockTotal;
          const ivaValor = (subtotal * foundProduct.iva) / 100;
          const total = subtotal + ivaValor;
          return {
            ...item,
            idBarcode: selectedBarcodeId,
            codigoBarras: resolvedBarcode,
            variantName,
            producto: foundProduct.nombre,
            cantidad: nuevaCantidad,
            stockActual: item.stockActual ?? stockActual,
            stockTotal: nuevoStockTotal,
            subtotal,
            ivaValor,
            total,
            codigosExtra,
            valorUnit: unitPrice,
            supplierPrice: unitPrice,
            purchaseType: purchaseTypeLabel,
            purchaseTypeValue: purchaseTypeValue,
            quantityPerPack: quantityPerPack,
            retailPrice: salePricesToSave.retailPrice,
            wholesalePrice: salePricesToSave.wholesalePrice,
            partnerPrice: salePricesToSave.partnerPrice,
            bulkPrice: salePricesToSave.bulkPrice,
          };
        }
        return item;
      });
      setPurchaseItems(updatedItems);
      showSuccess("Cantidad actualizada", `Se sumó la cantidad al producto existente (${purchaseTypeLabel})`);
    } else {
      const subtotal = unitPrice * stockToAdd;
      const ivaValor = (subtotal * foundProduct.iva) / 100;
      const total = subtotal + ivaValor;

      const newItem = {
        id: Date.now(),
        idProduct: foundProduct.id,
        producto: foundProduct.nombre,
        variantName,
        codigoBarras: resolvedBarcode,
        idBarcode: selectedBarcodeId,
        proveedor: foundProduct.proveedor,
        cantidad: finalQuantity,
        stockActual,
        stockTotal: stockToAdd,
        valorUnit: unitPrice,
        supplierPrice: unitPrice,
        purchaseType: purchaseTypeLabel,
        purchaseTypeValue: purchaseTypeValue,
        quantityPerPack: quantityPerPack,
        retailPrice: salePricesToSave.retailPrice,
        wholesalePrice: salePricesToSave.wholesalePrice,
        partnerPrice: salePricesToSave.partnerPrice,
        bulkPrice: salePricesToSave.bulkPrice,
        subtotal,
        iva: foundProduct.iva,
        ivaValor,
        total,
        codigosExtra,
      };

      setPurchaseItems([...purchaseItems, newItem]);
      showSuccess("Producto agregado", `Añadido correctamente (${purchaseTypeLabel})`);
    }

    setSearchProduct("");
    setQuantity(1);
  };

  // ========== GUARDAR COMPRA ==========
  const handleSavePurchase = async () => {
    setInvoiceTouched(true);
    setDateTouched(true);
    setProviderTouched(true);

    // Validar factura en el momento de guardar
    if (!invoiceValid || invoiceError) {
      showWarning("Factura inválida", "El número de factura no es válido o ya existe.");
      return;
    }

    if (!selectedProvider || !selectedProviderId || !invoiceNumber.trim() || !purchaseDate) {
      showWarning("Campos incompletos", "Llena todos los campos");
      return;
    }
    if (purchaseItems.length === 0) {
      showWarning("Compra vacía", "Agrega al menos un producto");
      return;
    }

    const result = await showConfirm("info", "Confirmar compra", "¿Deseas guardar esta compra y actualizar los precios de los productos?", {
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
          idBarcode: item.idBarcode,
          barcode: item.codigoBarras,
          cantidad: item.cantidad,
          supplierPrice: item.supplierPrice,
          purchaseType: item.purchaseType || "Unidad",
          quantityPerPack: item.quantityPerPack || 0,
          codigosExtra: item.codigosExtra || [],
        })),
      });

      const updatePromises = purchaseItems.map(async (item) => {
        const pricesToUpdate = {};
        if (item.supplierPrice !== undefined && item.supplierPrice !== null) {
          pricesToUpdate.supplierPrice = Number(item.supplierPrice);
        }
        if (item.retailPrice !== undefined && item.retailPrice !== null) {
          pricesToUpdate.retailPrice = Number(item.retailPrice);
        }
        if (item.wholesalePrice !== undefined && item.wholesalePrice !== null) {
          pricesToUpdate.wholesalePrice = Number(item.wholesalePrice);
        }
        if (item.partnerPrice !== undefined && item.partnerPrice !== null) {
          pricesToUpdate.partnerPrice = Number(item.partnerPrice);
        }
        if (item.bulkPrice !== undefined && item.bulkPrice !== null) {
          pricesToUpdate.bulkPrice = Number(item.bulkPrice);
        }
        if (item.quantityPerPack !== undefined && item.quantityPerPack !== null && item.quantityPerPack > 0) {
          pricesToUpdate.quantityPerPack = Number(item.quantityPerPack);
        }

        if (Object.keys(pricesToUpdate).length > 0) {
          try {
            await updateProductPrices(item.idProduct, pricesToUpdate);
          } catch (err) {
            console.error(`❌ Error actualizando producto ${item.idProduct}:`, err);
          }
        }
        return null;
      });

      await Promise.all(updatePromises);

      showSuccess("Compra guardada", "Se registró correctamente y los precios fueron actualizados");
      navigate("/admin/purchases");
    } catch (err) {
      showError(
        "No se puede registrar",
        getApiErrorMessage(err, {
          conflictMessage:
            "Ya existe una compra con ese número de factura o los datos ingresados entran en conflicto con un registro existente.",
          fallback: "No se pudo guardar la compra.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProducts || loadingProviders) {
    return <Spinner message="Cargando datos de la compra..." />;
  }

  return (
    <div className="w-full px-3 py-4 sm:px-6 lg:px-8">
      {loading && <FullScreenSpinner message="Guardando compra..." />}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleCancelPurchase}
            className="shrink-0 rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
            title="Volver a compras"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" strokeWidth={1.8} />
          </button>
          <h1 className="min-w-0 truncate text-xl font-bold text-gray-900 sm:text-2xl">
            Nueva compra
          </h1>
        </div>
        <div className="sticky top-0 z-30 -mx-3 grid grid-cols-1 gap-2 bg-white px-3 py-3 shadow-sm sm:-mx-6 sm:px-6 sm:py-3 lg:static lg:mx-0 lg:flex lg:bg-transparent lg:p-0 lg:shadow-none lg:gap-3">
          <button
            type="button"
            onClick={handleCancelPurchase}
            disabled={loading}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <X className="h-4 w-4" strokeWidth={2} />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSavePurchase}
            disabled={loading}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save className="h-4 w-4" strokeWidth={2} />
            {loading ? "Guardando..." : "Guardar compra"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className={isSidebarVisible ? "" : "hidden"}>
          <CreateSidebar
            productsDB={productsDB}
            providersList={providersList}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            selectedProviderId={selectedProviderId}
            setSelectedProviderId={setSelectedProviderId}
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            invoiceTouched={invoiceTouched}
            setInvoiceTouched={setInvoiceTouched}
            invoiceError={invoiceError}
            invoiceValid={invoiceValid}
            isCheckingInvoice={isCheckingInvoice}
            purchaseDate={purchaseDate}
            setPurchaseDate={setPurchaseDate}
            searchProduct={searchProduct}
            setSearchProduct={setSearchProduct}
            quantity={quantity}
            setQuantity={setQuantity}
            handleQuantityChange={handleQuantityChange}
            handleAddProduct={isEditingItem ? handleUpdateEditedProduct : handleAddProduct}
            purchaseItems={purchaseItems}
            dateTouched={dateTouched}
            setDateTouched={setDateTouched}
            providerTouched={providerTouched}
            setProviderTouched={setProviderTouched}
            openCreateProduct={handleOpenCreateProduct}
            openCreateProvider={() => setIsFormModalOpen(true)}
            extraBarcodes={extraBarcodes}
            onExtraBarcodesChange={setExtraBarcodes}
            onCollapse={() => setIsSidebarVisible(false)}
            isEditing={isEditingItem}
            onCancelEdit={handleCancelEdit}
            editingProductData={editingProductData}
          />
        </div>

        <div className={isSidebarVisible ? "" : "lg:col-span-2"}>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3.5 sm:px-5">
              {!isSidebarVisible && (
                <button
                  type="button"
                  onClick={() => setIsSidebarVisible(true)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#004D77] hover:text-[#004D77]"
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

            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004D77]/10">
                    <FileText className="h-4 w-4 text-[#004D77]" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Número de factura</p>
                    <p className="truncate text-base font-bold text-gray-800">{invoiceNumber || "Sin registrar"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004D77]/10">
                    <CalendarDays className="h-4 w-4 text-[#004D77]" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Fecha de compra</p>
                    <p className="truncate text-base font-bold text-gray-800">{formattedPurchaseDate}</p>
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

              {/* ========== INDICADOR DE EDICIÓN ========== */}
              {isEditingItem && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Pencil size={15} strokeWidth={1.7} />
                    <span> Editando:</span>
                    <span className="font-semibold">
                      {purchaseItems.find(item => item.id === editingItemId)?.producto}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}

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
                <>
                  <CreateTable
                    currentData={purchaseItems}
                    handleDeleteItem={handleDeleteItem}
                    handleEditItem={handleEditItem}
                  />
                  <div className="border-t border-gray-200 pt-3">
                    <div className="ml-auto w-full max-w-sm space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                      <div className="flex justify-between gap-4 text-gray-600">
                        <span>Subtotal:</span>
                        <span className="font-medium text-gray-800">${subtotalCompra.toLocaleString("es-CO")}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-gray-600">
                        <span>IVA incluido:</span>
                        <span className="font-medium text-gray-800">${totalIVA.toLocaleString("es-CO")}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-gray-300 pt-2 text-base font-bold text-gray-900">
                        <span>Total compra:</span>
                        <span>${totalCompra.toLocaleString("es-CO")}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* ========== CONTENEDOR DEL MODAL ========== */}
      <div ref={modalContainerRef}>
        <CreateProduct 
          isOpen={showCreateProduct} 
          onClose={handleCloseCreateProduct} 
          onCreate={handleCreateProduct} 
        />
      </div>

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
