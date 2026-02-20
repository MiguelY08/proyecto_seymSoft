import { useState } from "react";
import { Search, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";


const CreateSidebar = ({
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

  const [isOpen, setIsOpen] = useState(false);
  const [searchProvider, setSearchProvider] = useState("");

  const providers = [
    "Papelería El Punto Escolar",
    "OfiExpress Ltda.",
    "ArteColor Supplies",
    "PlastiPack Ltda",
  ];

  const filteredProviders = providers.filter((provider) =>
    provider.toLowerCase().includes(searchProvider.toLowerCase())
  );

  return (
    <div className="col-span-3">
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">

        {/* ================= PROVEEDOR ================= */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Proveedores
          </label>

          {/* Input visual */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer flex justify-between items-center hover:border-[#004D77] transition-all"
          >
            <span>
              {selectedProvider || "Seleccione el proveedor"}
            </span>
            <span className="text-gray-500">▾</span>
          </div>

          {/* Dropdown personalizado */}
          {isOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border-4 border-[#004D77] px-2.5">

              <h3 className="text-center font-semibold text-gray-800 mb-3  ">
                Seleccione un Proveedor
              </h3>

              {/* Buscador */}
              <div className="flex items-center gap-2 mb-3 " >
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

                <button className="flex items-center gap-1 px-3 py-1 border border-sky-700 text-[#004D77]  bg-white hover:bg-sky-50 rounded-lg text-xs font-semibold transition-all  ">
                  Crear Proveedor
                  <Plus size={14} />
                </button>
              </div>
              <div className="w-full h-[2px] bg-[#004D77] mb-3"></div>
              {/* Lista proveedores */}
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
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Ingrese el No de la factura"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-[#004D77] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* ================= FECHA ================= */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Fecha compra
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-[#004D77] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* ================= BUSCAR PRODUCTO ================= */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Busque el Producto
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              placeholder="Buscar Producto O codigo de barras"
              className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-[#004D77] focus:border-transparent outline-none transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#004D77] transition-colors">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* ================= CANTIDAD ================= */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Cantidad
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#004D77] transition-all"
            >
              <Minus size={18} />
            </button>

            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="flex-1 py-2 bg-white border border-gray-300 rounded-lg text-center text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#004D77] focus:border-transparent outline-none transition-all"
            />

            <button
              onClick={() => handleQuantityChange(1)}
              className="w-10 h-10 flex items-center justify-center bg-[#004D77] border-2 border-[#004D77] rounded-lg text-white hover:bg-[#003a5c] transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* ================= BOTÓN AGREGAR ================= */}
        <button
          onClick={handleAddProduct}
          className="w-full py-3 bg-[#004D77] text-white font-semibold rounded-lg hover:bg-[#003a5c] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
        >
          Agregar ({purchaseItems.length})
        </button>
              <Link
          to="/admin/purchases"
          className="w-full mt-3 block text-center py-3 border-2 border-[#004D77] text-[#004D77] font-semibold rounded-lg hover:bg-[#004D77] hover:text-white transition-all"
        >
          Volver a Compras
        </Link>

      </div>
    </div>
  );
};

export default CreateSidebar;
