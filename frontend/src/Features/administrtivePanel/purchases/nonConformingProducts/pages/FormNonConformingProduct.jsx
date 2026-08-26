// features/administrtivePanel/purchases/nonConformingProducts/pages/FormNonConformingProduct.jsx
import { AlertCircle, Search, Check, PackageX, ClipboardPlus } from "lucide-react";
import { useState } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { createNonConforming, getProductByBarcode } from "../data/nonConformingService";
import { normalizeBarcode, useBarcodeScanner } from "../../../../shared/scanner";
import { useOutsideCloseWarning } from "../../../../shared/hooks/useOutsideCloseWarning";
import PurchaseModalHeader from "../../../../shared/PurchaseModalHeader";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";

const NON_CONFORMING_FORM_SCANNER_FIELD = "non-conforming-product-form-search";

function FormNonConformingProduct({ onClose, onSuccess }) {
  const { handleOutsideClick } = useOutsideCloseWarning(onClose);
  const { showWarning, showSuccess, showError } = useAlert();

  const [form, setForm] = useState({
    codigo: "",
    cantidad: "",
    motivo: "",
  });

  const [productInfo, setProductInfo] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [codigoTouched, setCodigoTouched] = useState(false);
  const [cantidadTouched, setCantidadTouched] = useState(false);
  const [motivoTouched, setMotivoTouched] = useState(false);

  // Validación del código de barras
  const codigoError = (() => {
    if (!codigoTouched) return null;
    if (!form.codigo.trim()) return "El código de barras es obligatorio.";
    if (!/^[0-9]{6,20}$/.test(form.codigo.trim()))
      return "Debe contener solo números (6-20 dígitos).";
    return null;
  })();

  // ✅ Validación de la cantidad (incluye stock disponible en tiempo real)
  const cantidadError = (() => {
    if (!cantidadTouched) return null;
    if (!form.cantidad) return "La cantidad es obligatoria.";
    if (!/^\d+$/.test(String(form.cantidad)) || !Number.isInteger(Number(form.cantidad))) {
      return "La cantidad debe ser un número entero.";
    }
    if (Number(form.cantidad) <= 0) return "La cantidad debe ser mayor a 0.";
    if (Number(form.cantidad) > 10000) return "Cantidad demasiado grande.";
    
    // ✅ Validación de stock agotado o insuficiente
    if (productInfo) {
      if (productInfo.stock <= 0) {
        return "Producto agotado. No hay stock disponible para reportar.";
      }
      if (Number(form.cantidad) > productInfo.stock) {
        return `Stock disponible: ${productInfo.stock}. No puedes reportar más de lo que hay en inventario.`;
      }
    }
    return null;
  })();

  // Validación del motivo
  const motivoError = (() => {
    if (!motivoTouched) return null;
    if (!form.motivo.trim()) return "El motivo del reporte es obligatorio.";
    if (form.motivo.trim().length < 5) return "Debe tener al menos 5 caracteres.";
    return null;
  })();

  const hasErrors = codigoError || cantidadError || motivoError;
  const isStockEmpty = productInfo && productInfo.stock <= 0;

  // Buscar producto por código de barras
  const handleSearchProduct = async (barcode = form.codigo) => {
    const normalizedCode = normalizeBarcode(barcode, { numericOnly: true });

    if (!normalizedCode) {
      showWarning("Campo vacío", "Ingresa un código de barras para buscar.");
      return;
    }

    setCodigoTouched(true);
    setForm((prev) => ({ ...prev, codigo: normalizedCode }));
    setLoadingProduct(true);
    try {
      const product = await getProductByBarcode(normalizedCode);
      if (product) {
        setProductInfo(product);
        setCantidadTouched(true);
        
        // ✅ Mostrar advertencia si el stock está agotado
        if (product.stock <= 0) {
          showWarning("Producto agotado", `"${product.nombre}" no tiene stock disponible para reportar.`);
        } else {
          showSuccess("Producto encontrado", `"${product.nombre}" - Stock: ${product.stock}`);
        }
      } else {
        setProductInfo(null);
        showError("No encontrado", "No se encontró un producto con ese código de barras.");
      }
    } catch (error) {
      setProductInfo(null);
      showError(
        "Producto no encontrado",
        getApiErrorMessage(error, {
          notFoundMessage: "No se encontró un producto con ese código de barras.",
          fallback: "No se pudo buscar el producto. Intenta nuevamente.",
        })
      );
    } finally {
      setLoadingProduct(false);
    }
  };

  useBarcodeScanner({
    enabled: !submitting && !loadingProduct,
    numericOnly: true,
    minLength: 6,
    maxLength: 20,
    scannerFields: [NON_CONFORMING_FORM_SCANNER_FIELD],
    duplicateDelayMs: 800,
    preventDefault: false,
    onScan: ({ code, scannerField }) => {
      if (scannerField !== NON_CONFORMING_FORM_SCANNER_FIELD) return;
      setProductInfo(null);
      handleSearchProduct(code);
    },
  });

  const handleSubmit = async () => {
    if (submitting) return;

    setCodigoTouched(true);
    setCantidadTouched(true);
    setMotivoTouched(true);

    if (!form.codigo.trim() || !form.cantidad || !form.motivo.trim() || hasErrors) {
      showWarning("Campos incompletos", "Debes completar todos los campos correctamente.");
      return;
    }

    if (!productInfo) {
      showWarning("Producto no verificado", "Primero busca y verifica el producto.");
      return;
    }

    // ✅ Verificar stock disponible (doble chequeo justo antes de enviar)
    if (productInfo.stock <= 0) {
      showWarning("Stock agotado", `"${productInfo.nombre}" no tiene stock disponible para reportar.`);
      return;
    }

    if (productInfo.stock < Number(form.cantidad)) {
      showWarning("Stock insuficiente", `Stock disponible: ${productInfo.stock}, Cantidad solicitada: ${form.cantidad}`);
      return;
    }

    setSubmitting(true);
    try {
      await createNonConforming({
        id_barcode: productInfo.id_barcode,
        affected_quantity: Number(form.cantidad),
        report_reason: form.motivo.trim(),
        detection_date: new Date().toISOString(),
      });

      showSuccess("Reporte guardado", "El producto no conforme fue registrado correctamente.");
      onSuccess?.();
      onClose();
    } catch (error) {
      showError(
        "No se pudo guardar",
        getApiErrorMessage(error, {
          notFoundMessage:
            "El producto o código de barras seleccionado ya no se encuentra disponible.",
          fallback: "No se pudo guardar el reporte. Intenta nuevamente.",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    onClose();
  };

  const inputClass = (error) =>
    `w-full px-4 py-2.5 text-sm border rounded-xl outline-none bg-gray-100 text-gray-700 transition
    ${error
      ? "border-red-400 focus:ring-2 focus:ring-red-300"
      : "border-gray-300 focus:ring-2 focus:ring-[#0E5679]/20"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <PurchaseModalHeader
          icon={ClipboardPlus}
          eyebrow="Control de calidad"
          title="Reporte de producto no conforme"
          onClose={handleCancel}
          closeLabel="Cerrar reporte de producto no conforme"
        />

        {/* BODY */}
        <div className="px-6 py-6 flex flex-col gap-5">
          {/* CÓDIGO DE BARRAS */}
          <div>
            <label className="text-sm font-medium text-gray-700">Código de Barras</label>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={form.codigo}
                  data-scanner-field={NON_CONFORMING_FORM_SCANNER_FIELD}
                  onChange={(e) => {
                    setForm({ ...form, codigo: e.target.value });
                    setProductInfo(null);
                    setCodigoTouched(true);
                  }}
                  onBlur={() => setCodigoTouched(true)}
                  placeholder="Código de barras del producto"
                  className={inputClass(codigoError)}
                  disabled={submitting}
                />
                {codigoTouched && codigoError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleSearchProduct()}
                disabled={loadingProduct || submitting}
                className="px-4 py-2 bg-[#0E5679] text-white rounded-xl hover:bg-[#0a435c] transition disabled:opacity-50"
              >
                <Search size={18} />
              </button>
            </div>

            {codigoError && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {codigoError}
              </p>
            )}

            {/* Información del producto encontrado */}
            {productInfo && !codigoError && (
              <div className={`mt-2 p-3 rounded-lg border ${
                isStockEmpty 
                  ? "bg-red-50 border-red-200" 
                  : "bg-green-50 border-green-200"
              }`}>
                <div className="flex items-center gap-2">
                  {isStockEmpty ? (
                    <PackageX size={16} className="text-red-600" />
                  ) : (
                    <Check size={16} className="text-green-600" />
                  )}
                  <span className={`text-sm font-semibold ${
                    isStockEmpty ? "text-red-800" : "text-green-800"
                  }`}>
                    {isStockEmpty ? "Producto agotado" : "Producto verificado"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>{productInfo.nombre}</strong>
                  <br />
                  <span className="text-xs text-gray-500">Categoría: {productInfo.categoria}</span>
                  <br />
                  <span className={`text-xs font-semibold ${
                    isStockEmpty ? "text-red-600" : "text-green-600"
                  }`}>
                    Stock disponible: {productInfo.stock}
                    {isStockEmpty && " (Agotado)"}
                  </span>
                </p>
                {isStockEmpty && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    No se puede reportar este producto porque no tiene stock disponible.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* CANTIDAD */}
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">Cantidad Afectada</label>
            <div className="relative mt-1">
              <input
                type="number"
                min="1"
                step="1"
                max={productInfo?.stock ?? undefined}
                value={form.cantidad}
                onChange={(e) => {
                  setForm({ ...form, cantidad: e.target.value });
                  setCantidadTouched(true);
                }}
                onBlur={() => setCantidadTouched(true)}
                placeholder="Cantidad"
                className={inputClass(cantidadError)}
                disabled={submitting || isStockEmpty}
              />
              {cantidadTouched && cantidadError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>
            {cantidadError && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {cantidadError}
              </p>
            )}
            {isStockEmpty && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                Producto agotado - No se puede reportar
              </p>
            )}
          </div>

          {/* MOTIVO */}
          <div>
            <label className="text-sm font-medium text-gray-700">Motivo Reporte</label>
            <textarea
              rows="4"
              value={form.motivo}
              onChange={(e) => {
                setForm({ ...form, motivo: e.target.value });
                setMotivoTouched(true);
              }}
              onBlur={() => setMotivoTouched(true)}
              placeholder="Ingrese el motivo del reporte"
              className={inputClass(motivoError)}
              disabled={submitting || isStockEmpty}
            />
            {motivoError && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {motivoError}
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 pb-6 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={hasErrors || !productInfo || submitting || isStockEmpty}
            className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl transition ${
              hasErrors || !productInfo || submitting || isStockEmpty
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0E5679] hover:bg-[#0a435c]"
            }`}
          >
            {submitting ? "Guardando..." : isStockEmpty ? "Stock agotado" : "Guardar"}
          </button>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-xl transition disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormNonConformingProduct;
