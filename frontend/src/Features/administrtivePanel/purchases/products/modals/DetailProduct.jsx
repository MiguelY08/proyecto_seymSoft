import { X } from 'lucide-react';

function DetailProduct({ producto, isOpen, onClose, onEdit }) {
  if (!isOpen || !producto) return null;

  const handleEdit = () => {
    onClose();
    onEdit(producto);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">Detalles del producto</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda - Imagen */}
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

            {/* Columna derecha - Información */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{producto.nombre}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {producto.descripcion || 'Sin descripción disponible'}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Categorías:</span>
                  <span className="text-gray-600">
                    {producto.categorias && producto.categorias.length > 0 
                      ? producto.categorias.join(', ') 
                      : 'No especificado'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Stock:</span>
                  <span className="text-gray-600">{producto.stock} unidades</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Código de barras:</span>
                  <span className="text-gray-600">{producto.codBarras}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Referencia:</span>
                  <span className="text-gray-600">{producto.referencia}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de precios */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de precios</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Precio detal</p>
                <p className="text-lg font-bold text-blue-700">
                  ${producto.precio?.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Precio mayorista</p>
                <p className="text-lg font-bold text-green-700">
                  ${producto.precioMayorista?.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">Precio colegas</p>
                <p className="text-lg font-bold text-purple-700">
                  ${producto.precioColegas?.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Precio x pacas</p>
                <p className="text-lg font-bold text-orange-700">
                  ${producto.precioPacas?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            
            <button 
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