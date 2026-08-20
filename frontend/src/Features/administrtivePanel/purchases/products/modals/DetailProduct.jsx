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
  Maximize2,
} from 'lucide-react';

function DetailRow({ icon, label, value, placeholder = 'No especificado', highlight = false }) {
  const IconComponent = icon;
  const hasValue = value !== null && value !== undefined && String(value).trim() !== '';

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div
        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
          hasValue ? 'bg-[#004D77]/10' : 'bg-gray-100'
        }`}
      >
        <IconComponent
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

function PriceCard({ label, value, discount }) {
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
      {discount !== undefined && (
        <p className="mt-1 text-xs text-gray-500">
          Descuento: {Number(discount || 0)}%
        </p>
      )}
    </div>
  );
}

function DetailProduct({ producto, isOpen, onClose }) {
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  useEffect(() => {
    // Reinicia el visor cuando el modal recibe otro producto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImages(producto?.images || []);
    setSelectedImageIndex(0);
    setIsImageExpanded(false);
  }, [producto]);

  if (!isOpen || !producto) return null;

  const selectedImage = images[selectedImageIndex] || images[0];

  const unitMeasure = producto.unitMeasure
    ? `${producto.unitMeasure.name || ''}${
        producto.unitMeasure.abbreviation ? ` (${producto.unitMeasure.abbreviation})` : ''
      }`.trim()
    : '';

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
                <Package className="h-5 w-5 text-white" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">
                  Detalles del producto
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar detalles del producto"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Sección izquierda: imágenes + precios */}
            <div className="px-6 py-5">
              <SectionTitle>Imágenes</SectionTitle>

              {images.length > 0 ? (
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => setIsImageExpanded(true)}
                    className="group relative block w-full cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm"
                    title="Ampliar imagen"
                  >
                    <img
                      src={selectedImage?.url}
                      alt={producto.name}
                      className="w-full aspect-square object-contain bg-white transition-transform duration-300 group-hover:scale-[1.02]"
                    />

                    <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
                      {selectedImageIndex + 1} / {images.length}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
                      <span className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#004D77] shadow-lg">
                        <Maximize2 className="h-4 w-4" />
                        Ampliar imagen
                      </span>
                    </span>
                  </button>

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
                  <PriceCard label="Precio proveedor" value={producto.supplierPrice} />
                  <PriceCard label="Precio detalle" value={producto.retailPrice} discount={producto.retailDiscountPct} />
                  <PriceCard label="Precio mayorista" value={producto.wholesalePrice} discount={producto.wholesaleDiscountPct} />
                  <PriceCard label="Precio colegas" value={producto.partnerPrice} discount={producto.partnerDiscountPct} />
                  <PriceCard label="Precio x pacas" value={producto.bulkPrice} discount={producto.bulkDiscountPct} />
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
                <DetailRow
                  icon={Package}
                  label="Cantidad por paca"
                  value={producto.quantityPerPack}
                />
                <DetailRow
                  icon={Tag}
                  label="IVA"
                  value={`${Number(producto.ivaPercentage || 0)}%`}
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

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
    {isImageExpanded && selectedImage?.url && (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
        onClick={() => setIsImageExpanded(false)}
      >
        <div className="relative max-h-[92vh] max-w-6xl" onClick={(event) => event.stopPropagation()}>
          <img
            src={selectedImage.url}
            alt={producto.name}
            className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setIsImageExpanded(false)}
            className="absolute -right-3 -top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100"
            title="Cerrar imagen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    )}
    </>
  );
}

export default DetailProduct;
