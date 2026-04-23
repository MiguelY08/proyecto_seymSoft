// src/features/orders/components/RightSectionForm.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Trash2, Search, X, ChevronDown, CheckCircle, ShoppingBag } from 'lucide-react';

function RightSectionForm({
  productos,
  productosCatalogo,
  errors,
  loading,
  disabled = false,
  subtotal,
  iva,
  total,
  onAddProduct,
  onUpdateCantidad,
  onRemoveProduct,
}) {
  const isDisabled = disabled || loading;
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Productos a mostrar: todos si no hay búsqueda, filtrados si hay término
  const productosMostrados = useMemo(() => {
    if (!searchTerm.trim()) {
      return productosCatalogo;
    }
    const term = searchTerm.toLowerCase().trim();
    return productosCatalogo.filter(prod => {
      if (prod.nombre.toLowerCase().includes(term)) return true;
      if (prod.proveedor && prod.proveedor.toLowerCase().includes(term)) return true;
      if (prod.codBarras && prod.codBarras.toLowerCase().includes(term)) return true;
      if (prod.categorias && Array.isArray(prod.categorias)) {
        if (prod.categorias.some(cat => cat.toLowerCase().includes(term))) return true;
      }
      return false;
    });
  }, [productosCatalogo, searchTerm]);

  const handleSelectProduct = (productoId) => {
    if (productoId) {
      onAddProduct(productoId);
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  // Verificar si un producto ya está en la lista de seleccionados
  const isProductSelected = (productoId) => {
    return productos.some(p => p.id === productoId);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header de sección estilo ventas */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Productos</p>
          <p className="text-xs text-gray-400">Agregue productos al pedido</p>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Buscador con dropdown */}
        <div className="relative" ref={wrapperRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Buscar o seleccionar producto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={handleInputFocus}
              disabled={isDisabled}
              className="w-full pl-9 pr-8 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 placeholder-gray-400 transition-colors duration-200 focus:ring-2 focus:ring-[#004D77]/20 focus:border-[#004D77] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm && !isDisabled && (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  <X className="w-4 h-4" strokeWidth={1.8} />
                </button>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            </div>
          </div>

          {/* Dropdown de productos */}
          {isDropdownOpen && !isDisabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {productosMostrados.length > 0 ? (
                <ul className="py-1">
                  {productosMostrados.map(prod => {
                    const selected = isProductSelected(prod.id);
                    return (
                      <li key={prod.id}>
                        <button
                          type="button"
                          onClick={() => !selected && handleSelectProduct(prod.id)}
                          disabled={selected}
                          className={`
                            w-full px-4 py-2 text-left text-sm transition-colors duration-150
                            flex items-center justify-between gap-2
                            ${selected 
                              ? 'opacity-60 bg-gray-100 cursor-not-allowed' 
                              : 'hover:bg-[#004D77]/10'
                            }
                          `}
                        >
                          <div className="flex-1">
                            <div className={`font-medium ${selected ? 'text-gray-500' : 'text-gray-800'}`}>
                              {prod.nombre}
                            </div>
                            <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                              <span>Stock: {prod.stock}</span>
                              <span>${(prod.precioDetalle || 0).toLocaleString()}</span>
                              {prod.codBarras && <span>Cód: {prod.codBarras}</span>}
                            </div>
                          </div>
                          {selected && (
                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" strokeWidth={1.8} />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No se encontraron productos
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error de validación de productos */}
        {errors.productos && <p className="text-xs text-red-500">{errors.productos}</p>}

        {/* Tabla de productos agregados */}
        {productos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-3 py-2 text-sm text-gray-800">{prod.nombre}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="1"
                        value={prod.cantidad}
                        onChange={(e) => onUpdateCantidad(prod.id, parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 transition-colors duration-200 focus:ring-2 focus:ring-[#004D77]/20 focus:border-[#004D77] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isDisabled}
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      ${prod.precioUnitario?.toLocaleString() ?? '0'}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      ${prod.subtotal?.toLocaleString() ?? '0'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => onRemoveProduct(prod.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 disabled:text-gray-300 disabled:hover:text-gray-300 disabled:cursor-not-allowed"
                        title="Eliminar"
                        disabled={isDisabled}
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2 border-2 border-dashed border-gray-200 rounded-lg">
            <ShoppingBag className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
            <p className="text-sm text-gray-400">Busca y agrega productos al pedido</p>
          </div>
        )}

        {/* Totales */}
        <div className="border-t border-gray-200 pt-4 mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-800">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">IVA (19%):</span>
            <span className="font-medium text-gray-800">${iva.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightSectionForm;