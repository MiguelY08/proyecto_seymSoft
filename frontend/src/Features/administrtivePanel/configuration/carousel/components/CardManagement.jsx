import { useRef } from 'react';
import { Maximize2, Trash2 } from 'lucide-react';
import { MAX_FILE_SIZE } from '../helpers/bannerHelper';
import Permission from '../../../configuration/roles/components/Permission';

// ─── CardManagement ───────────────────────────────────────────────────────────
function CardManagement({
  slide,
  onDelete,
  onToggle,
  onExpand,
  onAdd,
  isAddCard = false,
}) {
  const fileInputRef = useRef(null);

  // ─── Tarjeta para agregar imagen ─────────────────────────────────────────
  if (isAddCard) {
    return (
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex aspect-video cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-all duration-200 hover:border-[#004D77] hover:bg-[#004D77]/5"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            e.target.value = '';
            onAdd?.(file);
          }}
        />

        <div className="flex max-w-full flex-col items-center gap-1.5 text-center text-gray-400 transition-colors duration-200 group-hover:text-[#004D77] sm:gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 transition-colors duration-200 group-hover:bg-[#004D77]/10 sm:h-12 sm:w-12">
            <span className="text-xl sm:text-2xl font-light leading-none">+</span>
          </div>
          <p className="text-xs font-medium leading-tight">Agregar imagen</p>
          <p className="text-[10px] leading-tight text-gray-400">
            Máx. {MAX_FILE_SIZE / (1024 * 1024)} MB
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = slide?.imageUrl;
  const isActive = slide?.activo ?? false;

  return (
    <div
      className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all duration-300 ${
        isActive
          ? 'border-green-400 shadow-md shadow-green-100'
          : 'border-red-300 shadow-md shadow-red-50'
      }`}
    >
      {/* Imagen */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={slide?.nombre ?? 'Imagen carrusel'}
          className={`w-full h-full object-cover transition-all duration-300 ${
            !isActive ? 'opacity-50 grayscale' : ''
          }`}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <p className="text-xs text-gray-400">Sin imagen</p>
        </div>
      )}

      {/* Acciones */}
      <div className="absolute right-2 top-2 flex items-center gap-1.5">
        <Permission permission="banners.ampliar_imagen">
          <button
            type="button"
            onClick={() => onExpand?.(slide?.id)}
            title="Ampliar imagen"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-black/45 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/65 sm:h-7 sm:w-7"
          >
            <Maximize2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={2} />
          </button>
        </Permission>

        <Permission permission="banners.eliminar">
          <button
            type="button"
            onClick={() => onDelete?.(slide?.id)}
            title="Eliminar imagen"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-black/45 text-white backdrop-blur-sm transition-all duration-200 hover:bg-red-500/80 sm:h-7 sm:w-7"
          >
            <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={2} />
          </button>
        </Permission>
      </div>

      {/* Toggle activo/inactivo */}
      <div className="absolute bottom-2 right-2">
        <Permission permission="banners.activar_desactivar">
          <button
            type="button"
            onClick={() => onToggle?.(slide?.id)}
            title={isActive ? 'Desactivar imagen' : 'Activar imagen'}
            className={`relative h-7 w-14 cursor-pointer rounded-full shadow-md transition-colors duration-300 sm:h-6 sm:w-12 ${
              isActive ? 'bg-green-500' : 'bg-red-400'
            }`}
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-white transition-all duration-300 sm:text-[9px] ${
                isActive ? 'left-2 sm:left-1.5' : 'right-2 sm:right-1.5'
              }`}
            >
              {isActive ? 'A' : 'I'}
            </span>

            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all duration-300 sm:h-5 sm:w-5 ${
                isActive ? 'left-7 sm:left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </Permission>
      </div>

      {/* Overlay inactivo */}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-black/50 text-white text-[9px] sm:text-[10px] font-semibold rounded-full backdrop-blur-sm">
            Inactiva
          </span>
        </div>
      )}
    </div>
  );
}

export default CardManagement;
