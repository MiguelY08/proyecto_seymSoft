import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Package, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

// ─── Productos de prueba ──────────────────────────────────────────────────────
const SAMPLE_PRODUCTS = [
  {
    id: 1,
    nombre: 'Libreta con Lapicero',
    proveedor: 'Papelera El Punto S.A.S',
    precioDetal: 5000,
    precioMayorista: 4200,
    stock: 200,
    categorias: ['Papelería', 'Útiles escolares'],
  },
  {
    id: 2,
    nombre: 'Silicona Líquida ET131 X',
    proveedor: 'Distribuciones Andina Ltda.',
    precioDetal: 2900,
    precioMayorista: 2400,
    stock: 500,
    categorias: ['Arte y manualidades'],
  },
  {
    id: 3,
    nombre: 'Resma Papel Bond A4 500 Hojas',
    proveedor: 'Industrias Bolívar S.A.',
    precioDetal: 18500,
    precioMayorista: 15800,
    stock: 350,
    categorias: ['Oficina', 'Papelería'],
  },
  {
    id: 4,
    nombre: 'Bolígrafo Kilométrico x12',
    proveedor: 'Comercializadora Sur Ltda.',
    precioDetal: 8400,
    precioMayorista: 6900,
    stock: 800,
    categorias: ['Útiles escolares', 'Oficina'],
  },
  {
    id: 5,
    nombre: 'Caja de Colores 24 Und',
    proveedor: 'Papelera El Punto S.A.S',
    precioDetal: 12000,
    precioMayorista: 10000,
    stock: 150,
    categorias: ['Arte y manualidades', 'Útiles escolares'],
  },
  {
    id: 6,
    nombre: 'Corrector Líquido Faster',
    proveedor: 'Distribuciones Andina Ltda.',
    precioDetal: 3500,
    precioMayorista: 2800,
    stock: 420,
    categorias: ['Oficina', 'Útiles escolares'],
  },
  {
    id: 7,
    nombre: 'Carpeta Argollada Oficio',
    proveedor: 'Comercializadora Central S.A.S',
    precioDetal: 9800,
    precioMayorista: 8200,
    stock: 180,
    categorias: ['Oficina'],
  },
  {
    id: 8,
    nombre: 'Tijeras Escolar Punta Roma',
    proveedor: 'Industrias Bolívar S.A.',
    precioDetal: 4200,
    precioMayorista: 3500,
    stock: 300,
    categorias: ['Útiles escolares', 'Arte y manualidades'],
  },
  {
    id: 9,
    nombre: 'Marcadores Borrables x6',
    proveedor: 'Papelera El Punto S.A.S',
    precioDetal: 11500,
    precioMayorista: 9600,
    stock: 240,
    categorias: ['Oficina', 'Arte y manualidades'],
  },
  {
    id: 10,
    nombre: 'Block Cuadriculado 50 Hojas',
    proveedor: 'Distribuciones Andina Ltda.',
    precioDetal: 3800,
    precioMayorista: 3100,
    stock: 600,
    categorias: ['Útiles escolares', 'Papelería'],
  },
];

// ─── Formateador de precios ───────────────────────────────────────────────────
const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
    .format(value);

// ─── Card de producto ─────────────────────────────────────────────────────────
function ProductCard({ item, onQuantityChange, onRemove, isEditing }) {
  const { product, cantidad } = item;
  const total = product.precioDetal * cantidad;

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) onQuantityChange(product.id, val);
  };

  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white">

      {/* Icono */}
      <div className="w-14 h-14 rounded-lg bg-[#004D77]/8 border border-[#004D77]/15 flex items-center justify-center shrink-0">
        <Package className="w-7 h-7 text-[#004D77]/50" strokeWidth={1.5} />
      </div>

      {/* Info + controles */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{product.nombre}</p>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-400 font-medium">Cantidad</span>

          {isEditing ? (
            /* ── Modo edición: solo lectura ── */
            <span className="text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1">
              {cantidad}
            </span>
          ) : (
            /* ── Modo creación: +/- con input directo ── */
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => onQuantityChange(product.id, cantidad - 1)}
                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3" strokeWidth={2.5} />
              </button>
              <input
                type="number"
                value={cantidad}
                onChange={handleInputChange}
                min={1}
                max={product.stock}
                className="w-14 text-center text-sm font-semibold text-gray-700 border-x border-gray-200 outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => onQuantityChange(product.id, cantidad + 1)}
                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">Stock: {product.stock}</p>
      </div>

      {/* Precio + Total */}
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Precio</p>
          <p className="text-sm font-bold text-gray-700">{formatPrice(product.precioDetal)}</p>
        </div>
        <span className="text-gray-300 text-lg">›</span>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Total</p>
          <p className="text-sm font-bold text-[#004D77]">{formatPrice(total)}</p>
        </div>
      </div>

      {/* Total mobile */}
      <div className="flex sm:hidden flex-col items-end shrink-0">
        <p className="text-[10px] text-gray-400">Total</p>
        <p className="text-sm font-bold text-[#004D77]">{formatPrice(total)}</p>
      </div>

      {/* Eliminar — solo creación */}
      {!isEditing && (
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          title="Quitar producto"
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

// ─── OrderForm ────────────────────────────────────────────────────────────────
function OrderForm({ items, onItemsChange, isEditing }) {
  const { showWarning } = useAlert();
  const [query,      setQuery]      = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // ─── Cerrar dropdown al click afuera ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Filtro del buscador ──────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return SAMPLE_PRODUCTS;
    return SAMPLE_PRODUCTS.filter((p) =>
      p.nombre.toLowerCase().includes(term)          ||
      p.proveedor.toLowerCase().includes(term)       ||
      p.categorias.some((c) => c.toLowerCase().includes(term)) ||
      String(p.precioDetal).includes(term)           ||
      String(p.stock).includes(term)
    );
  }, [query]);

  // ─── IDs ya agregados ─────────────────────────────────────────────────────
  const addedIds = useMemo(() => new Set(items.map((i) => i.product.id)), [items]);

  // ─── Agregar producto ─────────────────────────────────────────────────────
  const handleSelect = (product) => {
    if (addedIds.has(product.id)) {
      setDropdownOpen(false);
      setQuery('');
      return;
    }
    onItemsChange([...items, { product, cantidad: 1 }]);
    setDropdownOpen(false);
    setQuery('');
  };

  // ─── Cambiar cantidad ─────────────────────────────────────────────────────
  const handleQuantityChange = (productId, newQty) => {
    const item = items.find((i) => i.product.id === productId);
    if (!item) return;

    if (newQty < 1) {
      showWarning('Cantidad mínima', 'La cantidad mínima por producto es 1.');
      return;
    }
    if (newQty > item.product.stock) {
      showWarning(
        'Stock insuficiente',
        `Solo hay ${item.product.stock} unidades disponibles de "${item.product.nombre}".`
      );
      return;
    }
    onItemsChange(items.map((i) =>
      i.product.id === productId ? { ...i, cantidad: newQty } : i
    ));
  };

  // ─── Quitar producto ──────────────────────────────────────────────────────
  const handleRemove = (productId) => {
    onItemsChange(items.filter((i) => i.product.id !== productId));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

      {/* ── Header sección ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">2. Datos del pedido</p>
          <p className="text-xs text-gray-400">
            {isEditing
              ? 'Puedes modificar las cantidades de los productos'
              : 'Busque y elija los productos y las cantidades del pedido'}
          </p>
        </div>
      </div>

      {/* ── Contenido con scroll ─────────────────────────────────────── */}
      <div className="p-5 flex flex-col gap-4 max-h-480px overflow-y-auto">

        {/* Buscador — solo creación */}
        {!isEditing && (
          <div ref={searchRef} className="relative">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Buscar productos, código de barras..."
                className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 text-gray-700 placeholder-gray-400"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            </div>

            {dropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <ul className="max-h-56 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const alreadyAdded = addedIds.has(product.id);
                      return (
                        <li
                          key={product.id}
                          onClick={() => !alreadyAdded && handleSelect(product)}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 ${
                            alreadyAdded
                              ? 'opacity-40 cursor-not-allowed bg-gray-50'
                              : 'cursor-pointer hover:bg-[#004D77]/5'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-md bg-[#004D77]/8 border border-[#004D77]/15 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-[#004D77]/50" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{product.nombre}</p>
                            <p className="text-[10px] text-gray-400">Stock: {product.stock} · {formatPrice(product.precioDetal)}</p>
                          </div>
                          {alreadyAdded && (
                            <span className="text-[10px] text-gray-400 shrink-0">Agregado</span>
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 py-4 text-sm text-gray-400 text-center">
                      No se encontraron productos
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Lista de productos */}
        {items.length > 0 ? (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ProductCard
                key={item.product.id}
                item={item}
                onQuantityChange={handleQuantityChange}
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