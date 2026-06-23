import { useEffect, useState } from 'react';
import {
  ImageOff,
  X,
  Tag,
  Layers,
  Barcode,
  Package,
  Ruler,
  Hash,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';

function DetailRow({ icon: Icon, label, value, placeholder = 'No especificado', highlight = false }) {
  const hasValue = value !== null && value !== undefined && String(value).trim() !== '';

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div
        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
          hasValue ? 'bg-[#004D77]/10' : 'bg-gray-100'
        }`}
      >
        <Icon
          className={`w-3.5 h-3.5 ${hasValue ? 'text-[#004D77]' : 'text-gray-300'}`}
          strokeWidth={1.8}
        />
      </div>

      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
          {label}
        </span>
        <span
          className={`block text-sm truncate ${
            hasValue
              ? highlight
                ? 'text-[#004D77] font-semibold'
                : 'text-gray-800 font-medium'
              : 'text-gray-300 italic font-normal'
          }`}
        >
          {hasValue ? value : placeholder}
        </span>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px flex-1 bg-gray-100" />
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

function PriceCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-md bg-[#004D77]/10 flex items-center justify-center shrink-0">
          <DollarSign className="w-3.5 h-3.5 text-[#004D77]" strokeWidth={1.8} />
        </div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide truncate">
          {label}
        </p>
      </div>
      <p className="text-lg font-bold text-[#004D77] tabular-nums">
        ${value?.toLocaleString() || 0}
      </p>
    </div>
  );
}

function DetailProduct({ producto, isOpen, onClose }) {
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setImages(producto?.images || []);
    setSelectedImageIndex(0);
  }, [producto]);

  if (!isOpen || !producto) return null;

  const selectedImage = images[selectedImageIndex] || images[0];

  const unitMeasure = producto.unitMeasure
    ? `${producto.unitMeasure.name || ''}${
        producto.unitMeasure.abbreviation ? ` (${producto.unitMeasure.abbreviation})` : ''
      }`.trim()
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <h3 className="text-white font-semibold text-lg">
            Detalles del producto
          </h3>

          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Sección izquierda: imágenes + precios */}
            <div className="px-6 py-5">
              <SectionTitle>Imágenes</SectionTitle>

              {images.length > 0 ? (
                <div className="w-full">
                  <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
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
                          className={`relative overflow-hidden rounded-lg border-2 bg-white transition-all cursor-pointer ${
                            selectedImageIndex === idx
                              ? 'border-[#004D77] ring-2 ring-[#004D77]/20'
                              : 'border-gray-200 hover:border-[#004D77]/60'
                          }`}
                          title={`Ver imagen ${idx + 1}`}
                        >
                          <img
                            src={img.url}
                            alt={`${producto.name} ${idx + 1}`}
                            className="h-14 w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-300 text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-[#004D77]/10 flex items-center justify-center mb-3">
                    <ImageOff className="w-7 h-7 text-[#004D77]/40" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">
                    Sin imágenes registradas
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    Edita el producto para agregar imágenes al catálogo.
                  </p>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-gray-100">
                <SectionTitle>Información de precios</SectionTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PriceCard label="Precio detalle" value={producto.retailPrice} />
                  <PriceCard label="Precio mayorista" value={producto.wholesalePrice} />
                  <PriceCard label="Precio colegas" value={producto.partnerPrice} />
                  <PriceCard label="Precio x pacas" value={producto.bulkPrice} />
                </div>
              </div>
            </div>

            {/* Sección derecha: detalles */}
            <div className="px-6 py-5">
              <SectionTitle>Información general</SectionTitle>

              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#004D77]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-5 h-5 text-[#004D77]" strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {producto.name}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed mt-1">
                      {producto.description || 'Sin descripción disponible'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <DetailRow
                  icon={Package}
                  label="Stock general"
                  value={`${producto.totalStock ?? 0} unidades`}
                  highlight
                />
                <DetailRow
                  icon={Ruler}
                  label="Unidad"
                  value={unitMeasure}
                />
                <DetailRow
                  icon={Hash}
                  label="Referencia"
                  value={producto.reference}
                />
                <DetailRow
                  icon={ImageIcon}
                  label="Imágenes"
                  value={`${images.length} registrada${images.length === 1 ? '' : 's'}`}
                />
              </div>

              <div className="mt-5">
                <SectionTitle>Categorías</SectionTitle>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                      Categorías
                    </span>

                    {producto.categories && producto.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {producto.categories.map((cat) => (
                          <div
                            key={cat.id}
                            className="inline-flex items-center gap-1.5 bg-[#004D77]/10 border border-[#004D77]/20 rounded-full px-2.5 py-1 text-xs"
                          >
                            <Tag className="w-3 h-3 text-[#004D77]" strokeWidth={1.8} />
                            <span className="font-semibold text-[#004D77]">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No especificado</span>
                    )}
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                      Subcategorías
                    </span>

                    {producto.subcategories && producto.subcategories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {producto.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1 text-xs"
                          >
                            <Layers className="w-3 h-3 text-gray-500" strokeWidth={1.8} />
                            <span className="font-semibold text-gray-700">{sub.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No especificado</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <SectionTitle>Códigos de barras</SectionTitle>

                <div className="space-y-1.5">
                  {producto.barcodes && producto.barcodes.length > 0 ? (
                    producto.barcodes.map((barcode, i) => (
                      <div
                        key={barcode.id}
                        className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-[#004D77]/10 flex items-center justify-center shrink-0">
                            <Barcode className="w-3.5 h-3.5 text-[#004D77]" strokeWidth={1.8} />
                          </div>

                          <div className="min-w-0">
                            <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
                              {i === 0 ? 'Principal' : `Código #${i + 1}`}
                            </span>
                            <span className="block text-xs text-gray-700 font-mono truncate">
                              {barcode.barcode}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-[#004D77] bg-[#004D77]/10 border border-[#004D77]/20 rounded-full px-2 py-0.5 whitespace-nowrap">
                          {barcode.stock} und.
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-5 gap-2 rounded-lg border border-dashed border-gray-200">
                      <Barcode className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                      <p className="text-xs text-gray-400">Sin códigos de barras</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailProduct;