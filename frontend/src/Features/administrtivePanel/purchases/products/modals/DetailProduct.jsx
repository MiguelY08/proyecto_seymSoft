import { X } from 'lucide-react';
import { groupCategories } from '../helpers/productsHelpers';

// ─── Badge visual para cada categoría padre + sus subcategorías ───────────────
function CategoryBadge({ nombre, subcategorias }) {
  return (
    <div className="inline-flex flex-col items-start bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs">
      <span className="font-semibold text-blue-800">{nombre}</span>
      {subcategorias.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {subcategorias.map((sub) => (
            <span
              key={sub}
              className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-medium"
            >
              {sub}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DetailProduct ────────────────────────────────────────────────────────────
function DetailProduct({ producto, isOpen, onClose, onEdit }) {
  if (!isOpen || !producto) return null;

  const handleEdit = () => {
    onClose();
    onEdit(producto);
  };

  const categoryTree  = groupCategories(producto.categorias);
  const hasCategories = Object.keys(categoryTree).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-4 border-b"
          style={{ backgroundColor: '#004D77' }}
        >
          <h3 className="text-lg font-bold text-white">Detalles del producto</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Imagen */}
            <div className="flex items-center justify-center">
              {producto.imagen ? (
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                  <span className="text-6xl">📦</span>
                </div>
              )}
            </div>

            {/* Información */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{producto.nombre}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {producto.descripcion || 'Sin descripción disponible'}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700 block mb-1.5">Categorías:</span>
                  {hasCategories ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(categoryTree).map(([cat, subs]) => (
                        <CategoryBadge key={cat} nombre={cat} subcategorias={subs} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No especificado</span>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-gray-700 block mb-1.5">
                    Código{(producto.codsBarrasExtra?.filter(e => e?.cod)?.length > 0) ? 's' : ''} de barras:
                  </span>
                  <div className="space-y-1.5">
                    {/* Principal */}
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Principal</span>
                        <span className="text-xs text-gray-700 font-mono">{producto.codBarras}</span>
                      </div>
                      {(producto.stockPrincipal !== undefined && producto.stockPrincipal !== '') && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                          {producto.stockPrincipal} und.
                        </span>
                      )}
                    </div>
                    {/* Adicionales */}
                    {(producto.codsBarrasExtra || []).filter(e => e?.cod).map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">#{i + 2}</span>
                          <span className="text-xs text-gray-700 font-mono">{item.cod}</span>
                        </div>
                        {(item.stock !== undefined && item.stock !== '') && (
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                            {item.stock} und.
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Stock general:</span>
                  <span className="font-bold text-gray-900">
                    {producto.stock ?? (
                      (Number(producto.stockPrincipal) || 0) +
                      (producto.codsBarrasExtra || []).reduce((acc, e) => acc + (Number(e?.stock) || 0), 0)
                    )} unidades
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Referencia:</span>
                  <span className="text-gray-600">{producto.referencia}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de precios</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Precio detal</p>
                <p className="text-lg font-bold text-blue-700">${producto.precioDetalle?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Precio mayorista</p>
                <p className="text-lg font-bold text-green-700">${producto.precioMayorista?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">Precio colegas</p>
                <p className="text-lg font-bold text-purple-700">${producto.precioColegas?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Precio x pacas</p>
                <p className="text-lg font-bold text-orange-700">${producto.precioPacas?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
              Reportar producto no conforme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailProduct;