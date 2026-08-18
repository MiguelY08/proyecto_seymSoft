// src/features/orders/components/RightSectionForm.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Trash2, Search, X, ChevronDown, CheckCircle, ShoppingBag, Users, Phone, Mail, IdCard, Plus } from 'lucide-react';
import { ScannerStatus, findProductByBarcode, normalizeBarcode, productMatchesBarcodeSearch, useBarcodeScanner } from '../../../../shared/scanner';

const isProductActive = (product) => product?.isActive === true;

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
  formData,
  clientes = [],
  isEditMode = false,
  readOnly = false,
  onClienteChange,
  onCreateClient,
}) {
  const isDisabled = disabled || loading;
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState(null);
  const wrapperRef = useRef(null);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [isClienteDropdownOpen, setIsClienteDropdownOpen] = useState(false);
  const clienteWrapperRef = useRef(null);
  const isClienteDisabled = loading || readOnly || isEditMode;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clienteWrapperRef.current && !clienteWrapperRef.current.contains(event.target)) {
        setIsClienteDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clientesFiltrados = useMemo(() => {
    if (!clienteSearchTerm.trim()) return clientes;
    const term = clienteSearchTerm.toLowerCase().trim();
    return clientes.filter((cliente) => [
      cliente.name,
      cliente.fullName,
      cliente.phone,
      cliente.email,
      cliente.document,
      cliente.address || cliente.direccion,
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [clientes, clienteSearchTerm]);

  const clienteSeleccionado = useMemo(() => (
    clientes.find((item) => Number(item.id) === Number(formData?.clienteId)) ?? null
  ), [clientes, formData?.clienteId]);
  const nombreClienteSeleccionado = clienteSeleccionado?.name || clienteSeleccionado?.fullName || '';
  const clienteInputValue = isClienteDropdownOpen || !clienteSeleccionado
    ? clienteSearchTerm
    : nombreClienteSeleccionado;

  const showClienteError = Boolean(errors.clienteId) && (
    formData?.clienteId === undefined || formData?.clienteId === null || formData?.clienteId === ''
  );

  const handleClienteSelect = (clienteId) => {
    const cliente = clientes.find((item) => Number(item.id) === Number(clienteId));
    if (cliente) {
      setClienteSearchTerm(cliente.name || cliente.fullName || '');
      onClienteChange?.({ target: { value: clienteId } });
    }
    setIsClienteDropdownOpen(false);
  };

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
    const productosActivos = productosCatalogo.filter(isProductActive);
    if (!searchTerm.trim()) {
      return productosActivos;
    }
    const term = searchTerm.toLowerCase().trim();
    return productosActivos.filter(prod => {
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
      const product = findProductByBarcode(productosCatalogo.filter(isProductActive), normalizedCode);

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
          <p className="text-sm font-semibold text-gray-800">Cliente y Productos</p>
          <p className="text-xs text-gray-400">Seleccione un cliente y agregue productos al pedido</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        {/* Cliente */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Cliente <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1" ref={clienteWrapperRef}>
              <Users className="pointer-events-none absolute left-3 top-1/2 z-10 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Buscar cliente por nombre, teléfono, email..."
                value={clienteInputValue}
                onChange={(event) => {
                  setClienteSearchTerm(event.target.value);
                  setIsClienteDropdownOpen(true);
                }}
                onFocus={() => {
                  if (isClienteDisabled) return;
                  setClienteSearchTerm(nombreClienteSeleccionado);
                  setIsClienteDropdownOpen(true);
                }}
                disabled={isClienteDisabled}
                className={`w-full rounded-lg border py-2.5 pl-10 pr-8 text-sm outline-none transition-colors ${showClienteError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'} ${isClienteDisabled ? 'cursor-not-allowed bg-gray-100 text-gray-600' : 'bg-white text-gray-700'}`}
              />
              <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1">
                {clienteSearchTerm && !isClienteDisabled && <button type="button" onClick={() => { setClienteSearchTerm(''); onClienteChange?.({ target: { value: '' } }); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" strokeWidth={1.8} /></button>}
                {!isClienteDisabled && <ChevronDown className="pointer-events-none w-4 text-gray-400" strokeWidth={2} />}
              </div>
              {isClienteDropdownOpen && !isClienteDisabled && (
                <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg overscroll-contain">
                  {clientesFiltrados.length > 0 ? <ul className="py-1">{clientesFiltrados.map((cliente) => (
                    <li key={cliente.id}><button type="button" onClick={() => handleClienteSelect(cliente.id)} className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[#004D77]/10">
                      <div className="font-medium text-gray-800">{cliente.name || cliente.fullName}{cliente.id === 0 && <span className="ml-2 text-xs text-blue-600">(Cliente de Caja)</span>}</div>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        {cliente.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" strokeWidth={1.5} />{cliente.phone}</span>}
                        {cliente.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" strokeWidth={1.5} />{cliente.email}</span>}
                        {cliente.document && <span className="inline-flex items-center gap-1"><IdCard className="w-3 h-3" strokeWidth={1.5} />{cliente.document}</span>}
                      </div>
                    </button></li>
                  ))}</ul> : <div className="px-4 py-3 text-center text-sm text-gray-500">No se encontraron clientes</div>}
                </div>
              )}
            </div>
            {onCreateClient && !readOnly && !isEditMode && <button type="button" onClick={onCreateClient} disabled={loading} title="Crear cliente" className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#004D77] bg-white text-[#004D77] transition-colors hover:bg-[#004D77] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-10 sm:shrink-0"><Plus className="w-4 h-4" strokeWidth={2} /></button>}
          </div>
          {showClienteError && <p className="mt-0.5 text-xs text-red-500">{errors.clienteId}</p>}
        </div>

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
          <div className="overflow-x-auto rounded-lg border border-gray-200 [-webkit-overflow-scrolling:touch] lg:overflow-x-visible">
            <table className="min-w-[720px] w-full table-fixed divide-y divide-gray-200 lg:min-w-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[27%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase sm:px-3">Producto</th>
                  <th className="w-[9%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase sm:px-3">Stock</th>
                  <th className="w-[17%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase sm:px-3">Cantidad</th>
                  <th className="w-[18%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase sm:px-3">Precio Unit.</th>
                  <th className="w-[18%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase sm:px-3">Total</th>
                  <th className="w-[11%] whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase sm:px-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-2 py-2 text-sm text-gray-800 sm:px-3" title={prod.nombre}>
                      <span className="block truncate">{prod.nombre}</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700 sm:px-3">{prod.stock ?? 0}</td>
                    <td className="px-2 py-2 sm:px-3">
                      <input
                        type="number"
                        min="1"
                        max={prod.stock ?? undefined}
                        value={prod.cantidad}
                        onChange={(e) => onUpdateCantidad(prod.id, parseInt(e.target.value) || 1)}
                        className="w-full max-w-16 px-1.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 transition-colors duration-200 focus:ring-2 focus:ring-[#004D77]/20 focus:border-[#004D77] disabled:bg-gray-100 disabled:cursor-not-allowed sm:max-w-20 sm:px-2"
                        disabled={isDisabled}
                      />
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-700 sm:px-3">
                      {formatCurrency(prod.precioUnitario)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900 sm:px-3">
                      {formatCurrency(prod.subtotal)}
                    </td>
                    <td className="px-2 py-2 text-right sm:px-3">
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
