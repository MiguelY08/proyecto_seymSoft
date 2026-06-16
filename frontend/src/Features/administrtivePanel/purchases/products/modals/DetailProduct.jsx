import { useEffect, useState } from 'react';
import { ImageOff, X } from 'lucide-react';

function DetailProduct({ producto, isOpen, onClose }) {
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setImages(producto?.images || []);
    setSelectedImageIndex(0);
  }, [producto]);

  if (!isOpen || !producto) return null;

  const selectedImage = images[selectedImageIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl relative z-10 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">Detalles del producto</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-64px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-center">
              {images.length > 0 ? (
                <div className="w-full max-w-sm">
                  <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <img
                      src={selectedImage?.url}
                      alt={producto.name}
                      className="w-full aspect-square object-contain bg-white"
                    />
                    <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
                      {selectedImageIndex + 1} / {images.length}
                    </span>
                  </div>

                  {images.length > 1 && (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {images.map((img, idx) => (
                        <button
                          key={img.id || img.url || idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative overflow-hidden rounded-lg border-2 bg-white transition-all ${
                            selectedImageIndex === idx
                              ? 'border-[#004D77] ring-2 ring-[#004D77]/20'
                              : 'border-gray-200 hover:border-[#004D77]/60'
                          }`}
                          title={`Ver imagen ${idx + 1}`}
                        >
                          <img
                            src={img.url}
                            alt={`${producto.name} ${idx + 1}`}
                            className="h-16 w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-sm aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-300 text-center p-6">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                    <ImageOff className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Sin imagenes registradas</p>
                  <p className="text-xs text-gray-400 mt-1">Edita el producto para agregar imagenes al catalogo.</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{producto.name}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {producto.description || 'Sin descripcion disponible'}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700 block mb-1.5">Categorias:</span>
                  {producto.categories && producto.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {producto.categories.map((cat) => (
                        <div key={cat.id} className="inline-flex bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs">
                          <span className="font-semibold text-blue-800">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No especificado</span>
                  )}
                </div>

                {producto.subcategories && producto.subcategories.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-700 block mb-1.5">Subcategorias:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {producto.subcategories.map((sub) => (
                        <div key={sub.id} className="inline-flex bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs">
                          <span className="font-semibold text-purple-800">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-semibold text-gray-700 block mb-1.5">Codigos de barras:</span>
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
                      <span className="text-gray-400 text-xs">Sin codigos de barras</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Stock general:</span>
                  <span className="font-bold text-gray-900">{producto.totalStock ?? 0} unidades</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Unidad:</span>
                  <span className="text-gray-600">
                    {producto.unitMeasure
                      ? `${producto.unitMeasure.name || ''}${producto.unitMeasure.abbreviation ? ` (${producto.unitMeasure.abbreviation})` : ''}`.trim()
                      : 'No especificada'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Referencia:</span>
                  <span className="text-gray-600">{producto.reference}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informacion de precios</h3>
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
