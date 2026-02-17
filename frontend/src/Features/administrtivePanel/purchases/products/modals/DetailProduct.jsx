import { X } from 'lucide-react';

function DetailProduct({ producto, isOpen, onClose }) {
  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl relative">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#004D77' }}>
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
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                <span className="text-6xl">📦</span>
              </div>
            </div>

            {/* Columna derecha - Información */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{producto.nombre}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Resma de alta calidad, ideal para impresiones y fotocopias, blancura superior que garantiza un excelente contraste de impresión. Apto para todo tipo de impresoras.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">📦 Categoría:</span>
                  <span className="text-gray-600">{producto.categoria}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">📊 Stock:</span>
                  <span className="text-gray-600">{producto.stock} unidades</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">🏷️ Lotes:</span>
                  <span className="text-gray-600">{producto.codBarras}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">💰 Precio detal:</span>
                  <span className="text-gray-600">{producto.precio.toLocaleString()} COP</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">💵 Precio mayorista:</span>
                  <span className="text-gray-600">44,000 COP</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">📦 Unidad:</span>
                  <span className="text-gray-600">Resma</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button 
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#004D77' }}
            >
              <span>✏️</span>
              Editar
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <span>⚠️</span>
              Reportar producto no conforme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailProduct;