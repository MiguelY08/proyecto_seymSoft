import { useState } from "react";
import { Search, Plus, Minus, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from "../../../../shared/alerts/useAlert";

const CreateSidebar = ({
  productsDB,
  selectedProvider,
  setSelectedProvider,
  invoiceNumber,
  setInvoiceNumber,
  purchaseDate,
  setPurchaseDate,
  searchProduct,
  setSearchProduct,
  quantity,
  setQuantity,
  handleQuantityChange,
  handleAddProduct,
  purchaseItems,
}) => {
  const navigate = useNavigate();
  const { showConfirm } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [searchProvider, setSearchProvider] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🔥 Estados de validación en tiempo real
  const [invoiceTouched, setInvoiceTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);

  const providers = [
    "Papelería El Punto Escolar",
    "OfiExpress Ltda.",
    "ArteColor Supplies",
    "Útiles Escolares SAS",
  ];

  const filteredProviders = providers.filter((provider) =>
    provider.toLowerCase().includes(searchProvider.toLowerCase())
  );

  const filteredProducts = productsDB.filter((product) =>
    product.producto.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.codigoBarras.includes(searchProduct)
  );

  // ─── Validaciones ───────────────────────────────────────────────
  const invoiceError = (() => {
    if (!invoiceTouched) return null;
    if (!invoiceNumber.trim()) return "El número de factura es obligatorio";
    if (!/^[a-zA-Z0-9\-]{3,20}$/.test(invoiceNumber.trim()))
      return "Solo letras, números y guiones (3–20 caracteres)";
    return null;
  })();

  const invoiceValid = invoiceTouched && !invoiceError && invoiceNumber.trim();

  const dateError = (() => {
    if (!dateTouched) return null;
    if (!purchaseDate) return "La fecha de compra es obligatoria";
    const selected = new Date(purchaseDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selected > today) return "La fecha no puede ser futura";
    const minDate = new Date("2000-01-01");
    if (selected < minDate) return "Fecha demasiado antigua";
    return null;
  })();

  const dateValid = dateTouched && !dateError && purchaseDate;

  // ─── Helpers de estilo ───────────────────────────────────────────
  const inputClass = (error) =>
  `w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-gray-600 outline-none transition-all
  ${
    error
      ? "border-red-400 focus:ring-2 focus:ring-red-300"
      : "border-gray-300 focus:ring-2 focus:ring-[#004D77]"
  }`;

  const handleBackToPurchases = async (e) => {
  e.preventDefault(); // evita navegación automática del Link

  if (purchaseItems.length > 0) {
    const result = await showConfirm(
      "warning",
      "Volver a compras",
      "Si sales ahora se eliminarán los productos agregados. ¿Deseas continuar?",
      {
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Seguir editando",
      }
    );

    if (!result?.isConfirmed) return;
  }

  navigate("/admin/purchases");
};

  return (
    <div className="col-span-3">
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">

        {/* ================= PROVEEDOR ================= */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Proveedores
          </label>

          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer flex justify-between items-center hover:border-[#004D77] transition-all"
          >
            <span>{selectedProvider || "Seleccione el proveedor"}</span>
            <span className="text-gray-500">▾</span>
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
                <button className="flex items-center gap-1 px-3 py-1 border border-sky-700 text-[#004D77] bg-white hover:bg-sky-50 rounded-lg text-xs font-semibold transition-all">
                  Crear
                  <Plus size={14} />
                </button>
              </div>

              <div className="w-full h-[2px] bg-[#004D77] mb-3"></div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filteredProviders.map((provider, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProvider === provider}
                      onChange={() => {
                        setSelectedProvider(provider);
                        setIsOpen(false);
                      }}
                      className="accent-[#004D77]"
                    />
                    {provider}
                  </label>
                ))}
              </div>
            </div>
          )}
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
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
                setInvoiceTouched(true); // valida desde el primer caracter
              }}
              onBlur={() => setInvoiceTouched(true)}
              placeholder="Ingrese el No de la factura"
              className={inputClass(invoiceError)}
            />

            {/* Ícono de estado */}
            {invoiceTouched && invoiceError && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <AlertCircle size={16} className="text-red-400" />
              </div>
            )}
          </div>

          {/* Mensaje de error con animación */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              invoiceError ? "max-h-10 mt-1.5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />
              {invoiceError}
            </p>
          </div>

          {/* Contador de caracteres */}
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
              max={new Date().toISOString().split("T")[0]} // bloquea fechas futuras en el picker
              onChange={(e) => {
                setPurchaseDate(e.target.value);
                setDateTouched(true);
              }}
              onBlur={() => setDateTouched(true)}
              className={inputClass(dateError)}
            />

            {/* Ícono de estado */}
            {dateTouched && dateError && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <AlertCircle size={16} className="text-red-400" />
            </div>
          )}
          </div>

          {/* Mensaje de error con animación */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              dateError ? "max-h-10 mt-1.5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />
              {dateError}
            </p>
          </div>
        </div>

        {/* ================= BUSCAR PRODUCTO ================= */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Busque el Producto
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => {
                  setSearchProduct(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Buscar producto o código"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-[#004D77] outline-none"
              />
            </div>

            <Link
              to="/productos/crear"
              className="flex items-center justify-center px-3 py-2 border border-[#004D77] text-[#004D77] bg-white hover:bg-[#004D77] hover:text-white rounded-lg transition-all"
            >
              <Plus size={16} />
            </Link>
          </div>

          {showSuggestions && searchProduct && filteredProducts.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {filteredProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSearchProduct(product.producto);
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-[#004D77] hover:text-white cursor-pointer transition-all"
                >
                  <div className="font-semibold">{product.producto}</div>
                  <div className="text-xs opacity-70">Código: {product.codigoBarras}</div>
                </div>
              ))}
            </div>
          )}
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

        {/* ================= AGREGAR ================= */}
        <button
          onClick={handleAddProduct}
          className="w-full py-3 bg-[#004D77] text-white font-semibold rounded-lg hover:bg-[#003a5c] transition-all shadow-lg"
        >
          Agregar ({purchaseItems.length})
        </button>

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