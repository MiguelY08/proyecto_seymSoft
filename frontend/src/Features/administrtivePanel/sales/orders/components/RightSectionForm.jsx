// src/features/orders/components/RightSectionForm.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Trash2, Search, X, ChevronDown, CheckCircle, ShoppingBag } from 'lucide-react';
import { ScannerStatus, findProductByBarcode, normalizeBarcode, productMatchesBarcodeSearch, useBarcodeScanner } from '../../../../shared/scanner';

function RightSectionForm({
  productos,
  productosCatalogo,
  errors,
  loading,
  disabled = false,
  subtotal,
  iva,
  shippingAmount = 0,
  showShippingAmount = false,
  total,
  onAddProduct,
  onUpdateCantidad,
  onRemoveProduct,
  scannerField = 'order-product-search',
  onScannerProductNotFound,
}) {
  const isDisabled = disabled || loading;
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState(null);
  const wrapperRef = useRef(null);

  const formatCurrency = (value) => {
    const parsed = Number(value);
    return `$${(Number.isFinite(parsed) ? parsed : 0).toLocaleString('es-CO')}`;
  };

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
      if (String(prod.nombre || '').toLowerCase().includes(term)) return true;
      if (prod.proveedor && prod.proveedor.toLowerCase().includes(term)) return true;
      if (String(prod.reference || prod.referencia || '').toLowerCase().includes(term)) return true;
      if (productMatchesBarcodeSearch(prod, term)) return true;
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

  useBarcodeScanner({
    enabled: !isDisabled,
    numericOnly: true,
    minLength: 6,
    maxLength: 20,
    scannerFields: [scannerField],
    duplicateDelayMs: 800,
    preventDefault: false,
    onScan: ({ code, scannerField: activeScannerField }) => {
      if (activeScannerField !== scannerField) return;

      const normalizedCode = normalizeBarcode(code, { numericOnly: true });
      const product = findProductByBarcode(productosCatalogo, normalizedCode);

      if (!product) {
        setSearchTerm(normalizedCode);
        setIsDropdownOpen(true);
        setScannerMessage({ type: 'error', message: `No encontrado: ${normalizedCode}` });
        onScannerProductNotFound?.(normalizedCode);
        return;
      }

      if (isProductSelected(product.id)) {
        setSearchTerm('');
        setIsDropdownOpen(false);
        setScannerMessage({ type: 'error', message: `Ya agregado: ${product.nombre}` });
        return;
      }

      if (Number(product.stock ?? 0) <= 0) {
        setSearchTerm(product.nombre ?? normalizedCode);
        setIsDropdownOpen(true);
        setScannerMessage({ type: 'error', message: `Sin stock: ${product.nombre}` });
        return;
      }

      onAddProduct(product.id);
      setSearchTerm('');
      setIsDropdownOpen(false);
      setScannerMessage({ type: 'success', message: `Leido: ${product.nombre}` });
    },
  });

  useEffect(() => {
    if (!scannerMessage) return undefined;

    const timeout = window.setTimeout(() => {
      setScannerMessage(null);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [scannerMessage]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header de sección estilo ventas */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3.5 sm:px-5">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Productos</p>
          <p className="text-xs text-gray-400">Agregue productos al pedido</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
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
                setScannerMessage(null);
              }}
              onFocus={handleInputFocus}
              disabled={isDisabled}
              data-scanner-field={scannerField}
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
            <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg overscroll-contain">
              {productosMostrados.length > 0 ? (
                <ul className="py-1">
                  {productosMostrados.map(prod => {
                    const selected = isProductSelected(prod.id);
                    const hasStock = Number(prod.stock ?? 0) > 0;
                    return (
                      <li key={prod.id}>
                        <button
                          type="button"
                          onClick={() => !selected && hasStock && handleSelectProduct(prod.id)}
                          disabled={selected || !hasStock}
                          className={`
                            w-full px-4 py-2 text-left text-sm transition-colors duration-150
                            flex items-center justify-between gap-2
                            ${selected || !hasStock
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
                              <span>Stock: {Number(prod.stock || 0).toLocaleString('es-CO')}</span>
                              <span>{formatCurrency(prod.precioDetalle)}</span>
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
          <ScannerStatus status={scannerMessage} className="mt-1" />
        </div>

        {/* Error de validación de productos */}
        {errors.productos && <p className="text-xs text-red-500">{errors.productos}</p>}

        {/* Tabla de productos agregados */}
        {productos.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 [-webkit-overflow-scrolling:touch]">
            <table className="min-w-[720px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="min-w-[220px] px-3 py-2 text-sm text-gray-800">{prod.nombre}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{prod.stock ?? 0}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="1"
                        max={prod.stock ?? undefined}
                        value={prod.cantidad}
                        onChange={(e) => onUpdateCantidad(prod.id, parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 transition-colors duration-200 focus:ring-2 focus:ring-[#004D77]/20 focus:border-[#004D77] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isDisabled}
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {formatCurrency(prod.precioUnitario)}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {formatCurrency(prod.subtotal)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(prod.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-300"
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
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-10 text-center">
            <ShoppingBag className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
            <p className="text-sm text-gray-400">Busca y agrega productos al pedido</p>
          </div>
        )}

        {/* Totales */}
        <div className="mt-2 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">IVA incluido:</span>
            <span className="font-medium text-gray-800">{formatCurrency(iva)}</span>
          </div>
          {showShippingAmount && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Envío:</span>
              <span className="font-medium text-gray-800">{formatCurrency(shippingAmount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between gap-3 border-t border-gray-200 pt-2 text-lg font-bold">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightSectionForm;
