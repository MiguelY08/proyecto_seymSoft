import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Package, Trash2, ShoppingBag, Plus, Minus, Barcode } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ProductsService from '../../../purchases/products/services/productsServices';

// ─── Formateador de precios ───────────────────────────────────────────────────
const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(value);

// ─── Hook: long-press para +/- ───────────────────────────────────────────────
function useLongPress(callback, { delay = 500, interval = 80 } = {}) {
  const callbackRef = useRef(callback);
  const timeoutRef  = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => { callbackRef.current = callback; }, [callback]);

  const start = useCallback(() => {
    callbackRef.current();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => callbackRef.current(), interval);
    }, delay);
  }, [delay, interval]);

  const stop = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
  }, []);

  return {
    onMouseDown:  start,
    onMouseUp:    stop,
    onMouseLeave: stop,
    onTouchStart: (e) => { e.preventDefault(); start(); },
    onTouchEnd:   stop,
  };
}

// ─── Card de producto ─────────────────────────────────────────────────────────
function ProductCard({ item, onQuantityChange, onDescriptionChange, onRemove, isEditing }) {
  const { product, cantidad, descripcion = '' } = item;
  // precioDetalle es el campo canónico del nuevo esquema
  const total = product.precioDetalle * cantidad;

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) onQuantityChange(product.id, val);
  };

  const decrement = () => onQuantityChange(product.id, cantidad - 1);
  const increment = () => onQuantityChange(product.id, cantidad + 1);

  const longPressMin = useLongPress(decrement);
  const longPressMax = useLongPress(increment);

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">

      {/* Fila principal */}
      <div className="flex items-center gap-2.5 px-3 py-2">

        <div className="w-8 h-8 rounded-md bg-[#004D77]/8 border border-[#004D77]/15 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-[#004D77]/50" strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{product.nombre}</p>
          {/* codBarras es el campo canónico del nuevo esquema */}
          {product.codBarras && (
            <p className="text-[9px] text-gray-400 font-mono flex items-center gap-0.5 leading-tight">
              <Barcode className="w-2.5 h-2.5" strokeWidth={1.5} />
              {product.codBarras}
            </p>
          )}
        </div>

        {/* Controles de cantidad */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          {isEditing ? (
            <span className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
              {cantidad}
            </span>
          ) : (
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button type="button" {...longPressMin}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer select-none">
                <Minus className="w-2.5 h-2.5" strokeWidth={2.5} />
              </button>
              <input
                type="number" value={cantidad} onChange={handleInputChange}
                min={1} max={product.stock}
                className="w-10 text-center text-xs font-semibold text-gray-700 border-x border-gray-200 outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button type="button" {...longPressMax}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer select-none">
                <Plus className="w-2.5 h-2.5" strokeWidth={2.5} />
              </button>
            </div>
          )}
          <span className="text-[9px] text-gray-400 leading-tight">Máx: {product.stock}</span>
        </div>

        {/* Precio › Total */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-medium text-gray-500">{formatPrice(product.precioDetalle)}</span>
          <span className="text-gray-300 text-xs">›</span>
          <span className="text-xs font-bold text-[#004D77]">{formatPrice(total)}</span>
        </div>

        {/* Total solo mobile */}
        <span className="flex sm:hidden text-xs font-bold text-[#004D77] shrink-0">{formatPrice(total)}</span>

        {/* Eliminar */}
        {!isEditing && (
          <button type="button" onClick={() => onRemove(product.id)}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-red-300 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            title="Quitar producto">
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* Descripción */}
      <div className="px-3 pb-2">
        <input
          type="text" value={descripcion}
          onChange={(e) => onDescriptionChange(product.id, e.target.value)}
          placeholder="Descripción / observaciones del producto (opcional)"
          maxLength={200}
          className="w-full px-2.5 py-1.5 text-[11px] border border-gray-200 rounded-md outline-none placeholder-gray-300 text-gray-600 focus:border-[#004D77] focus:ring-1 focus:ring-[#004D77]/20 transition-colors duration-200"
        />
      </div>
    </div>
  );
}

// ─── OrderForm ────────────────────────────────────────────────────────────────
function OrderForm({ items, onItemsChange, isEditing }) {
  const { showWarning } = useAlert();
  const [query,        setQuery]        = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Catálogo desde ProductsService — solo productos activos
  const [allProducts, setAllProducts] = useState(() =>
    ProductsService.list().filter((p) => p.activo !== false)
  );

  // Refrescar catálogo al enfocar la ventana
  useEffect(() => {
    const sync = () => setAllProducts(
      ProductsService.list().filter((p) => p.activo !== false)
    );
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  // Cerrar dropdown al click afuera
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtro — busca por nombre, proveedor, categoría, precio, stock y codBarras
  const filteredProducts = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return allProducts;
    return allProducts.filter((p) =>
      p.nombre.toLowerCase().includes(term)                             ||
      p.proveedor?.toLowerCase().includes(term)                        ||
      (p.categorias || []).some((c) => c.toLowerCase().includes(term)) ||
      String(p.precioDetalle).includes(term)                           ||
      String(p.stock).includes(term)                                   ||
      (p.codBarras && p.codBarras.includes(term))
    );
  }, [query, allProducts]);

  const addedIds = useMemo(() => new Set(items.map((i) => i.product.id)), [items]);

  // Agregar producto
  const handleSelect = (product) => {
    if (addedIds.has(product.id)) { setDropdownOpen(false); setQuery(''); return; }
    if (product.stock < 1) {
      showWarning('Sin stock', `"${product.nombre}" no tiene unidades disponibles.`);
      setDropdownOpen(false); setQuery('');
      return;
    }
    onItemsChange([...items, { product, cantidad: 1 }]);
    setDropdownOpen(false);
    setQuery('');
  };

  // Cambiar cantidad
  const handleQuantityChange = (productId, newQty) => {
    const item = items.find((i) => i.product.id === productId);
    if (!item) return;
    if (newQty < 1) {
      showWarning('Cantidad mínima', 'La cantidad mínima por producto es 1.');
      return;
    }
    if (newQty > item.product.stock) {
      showWarning('Stock insuficiente',
        `Solo hay ${item.product.stock} unidades disponibles de "${item.product.nombre}".`);
      return;
    }
    onItemsChange(items.map((i) =>
      i.product.id === productId ? { ...i, cantidad: newQty } : i
    ));
  };

  // Quitar producto
  const handleRemove = (productId) => {
    onItemsChange(items.filter((i) => i.product.id !== productId));
  };

  // Actualizar descripción
  const handleDescriptionChange = (productId, value) => {
    onItemsChange(items.map((i) =>
      i.product.id === productId ? { ...i, descripcion: value } : i
    ));
  };

  const isBarcodeSearch = /^\d{8,13}$/.test(query.trim());

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">2. Datos del pedido</p>
          <p className="text-xs text-gray-400">
            {isEditing
              ? 'Solo puedes modificar la descripción de cada producto'
              : 'Busque por nombre, categoría o código de barras'}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col gap-4 max-h-480px overflow-y-auto">

        {/* Buscador — solo en creación */}
        {!isEditing && (
          <div ref={searchRef} className="relative">
            <div className="relative">
              <input
                type="text" value={query}
                onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Buscar producto, proveedor, categoría o código de barras..."
                className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 text-gray-700 placeholder-gray-400"
              />
              {isBarcodeSearch
                ? <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004D77]" strokeWidth={2} />
                : <Search  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"   strokeWidth={2} />
              }
            </div>

            {dropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <ul className="max-h-56 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const alreadyAdded = addedIds.has(product.id);
                      const sinStock     = product.stock < 1;
                      const disabled     = alreadyAdded || sinStock;
                      return (
                        <li key={product.id}
                          onClick={() => !disabled && handleSelect(product)}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 ${
                            disabled
                              ? 'opacity-40 cursor-not-allowed bg-gray-50'
                              : 'cursor-pointer hover:bg-[#004D77]/5'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-md bg-[#004D77]/8 border border-[#004D77]/15 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-[#004D77]/50" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{product.nombre}</p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {product.codBarras} · Stock: {product.stock} · {formatPrice(product.precioDetalle)}
                            </p>
                          </div>
                          {alreadyAdded && <span className="text-[10px] text-gray-400 shrink-0">Agregado</span>}
                          {sinStock && !alreadyAdded && <span className="text-[10px] text-red-400 shrink-0">Sin stock</span>}
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 py-4 text-sm text-gray-400 text-center">
                      {isBarcodeSearch
                        ? `No se encontró ningún producto con el código "${query.trim()}"`
                        : 'No se encontraron productos'}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Lista de productos agregados */}
        {items.length > 0 ? (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ProductCard
                key={item.product.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onDescriptionChange={handleDescriptionChange}
                onRemove={handleRemove}
                isEditing={isEditing}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2 border-2 border-dashed border-gray-200 rounded-lg">
            <Package className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
            <p className="text-sm text-gray-400">Busca y agrega productos al pedido</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderForm;