import { X } from 'lucide-react';

function DetailProduct({ producto, isOpen, onClose, onEdit }) {
  if (!isOpen || !producto) return null;

  const handleEdit = () => {
    onClose();
    onEdit(producto);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">Detalles del producto</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Imagen/Imágenes */}
<div className="flex items-center justify-center">
  {producto.images && producto.images.length > 0 ? (
    <div className="w-full">
      {/* Imagen principal */}
      <img
        src={producto.images[0].url}
        alt={producto.name}
        className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200"
      />
      
      {/* Miniaturas de otras imágenes */}
      {producto.images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {producto.images.map((img, idx) => (
            <img
              key={img.id}
              src={img.url}
              alt={`${producto.name} ${idx + 1}`}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500"
            />
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
      <span className="text-6xl">📦</span>
    </div>
  )}
</div>

            {/* Información */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{producto.name}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {producto.description || 'Sin descripción disponible'}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700 block mb-1.5">Categorías:</span>
                  {producto.category?.name ? (
                    <div className="inline-flex bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs">
                      <span className="font-semibold text-blue-800">{producto.category.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No especificado</span>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-gray-700 block mb-1.5">Códigos de barras:</span>
                  <div className="space-y-1.5">
                    {producto.barcodes && producto.barcodes.length > 0 ? (
                      producto.barcodes.map((barcode, i) => (
                        <div key={barcode.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                              {i === 0 ? 'Principal' : `#${i + 1}`}
                            </span>
                            <span className="text-xs text-gray-700 font-mono">{barcode.barcode}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                            {barcode.stock} und.
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Sin códigos de barras</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Stock general:</span>
                  <span className="font-bold text-gray-900">{producto.totalStock ?? 0} unidades</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Referencia:</span>
                  <span className="text-gray-600">{producto.reference}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de precios</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Precio detalle</p>
                <p className="text-lg font-bold text-blue-700">${producto.retailPrice?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Precio mayorista</p>
                <p className="text-lg font-bold text-green-700">${producto.wholesalePrice?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">Precio colegas</p>
                <p className="text-lg font-bold text-purple-700">${producto.partnerPrice?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Precio x pacas</p>
                <p className="text-lg font-bold text-orange-700">${producto.bulkPrice?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button 
              //onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Reportar producto no conforme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailProduct;