import { useRef } from 'react';
import { Maximize2, Trash2 } from 'lucide-react';
import { MAX_FILE_SIZE } from '../helpers/carouselHelpers';

// ─── CardManagement ───────────────────────────────────────────────────────────
// Tarjeta dual: muestra una imagen existente con sus controles,
// o el botón "Agregar imagen" cuando isAddCard es true.
//
// Props (tarjeta de imagen):
//   slide     — Objeto de metadata del slide { id, nombre, orden, activo }
//   imageUrl  — URL object de la imagen (generada desde IndexedDB)
//   onDelete  — (id) => void
//   onToggle  — (id) => void
//   onExpand  — (id) => void
//
// Props (tarjeta de agregar):
//   isAddCard — true
//   onAdd     — (file: File) => void
// ─────────────────────────────────────────────────────────────────────────────
function CardManagement({ slide, imageUrl, onDelete, onToggle, onExpand, onAdd, isAddCard = false }) {
  const fileInputRef = useRef(null);

  // ─── Tarjeta para agregar imagen ─────────────────────────────────────────
  if (isAddCard) {
    return (
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#004D77] hover:bg-[#004D77]/5 transition-all duration-200 cursor-pointer flex items-center justify-center aspect-video group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = '';
            onAdd?.(file);
          }}
        />

        <div className="flex flex-col items-center gap-1.5 sm:gap-2 text-gray-400 group-hover:text-[#004D77] transition-colors duration-200">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 group-hover:bg-[#004D77]/10 flex items-center justify-center transition-colors duration-200">
            <span className="text-xl sm:text-2xl font-light leading-none">+</span>
          </div>
          <p className="text-[11px] sm:text-xs font-medium">Agregar imagen</p>
          <p className="text-[9px] sm:text-[10px] text-gray-400">
            Máx. {MAX_FILE_SIZE / (1024 * 1024)} MB
          </p>
        </div>
      </div>
    );
  }

  // ─── Tarjeta de imagen existente ─────────────────────────────────────────
  const isActive = slide?.activo ?? true;

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

      {/* Overlay de acciones (top-right) */}
      <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => onExpand?.(slide?.id)}
          title="Ampliar imagen"
          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all duration-200 cursor-pointer"
        >
          <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(slide?.id)}
          title="Eliminar imagen"
          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-black/40 hover:bg-red-500/80 text-white backdrop-blur-sm transition-all duration-200 cursor-pointer"
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Toggle activo/inactivo (bottom-right) */}
      <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2">
        <button
          type="button"
          onClick={() => onToggle?.(slide?.id)}
          title={isActive ? 'Desactivar imagen' : 'Activar imagen'}
          className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shadow-md ${
            isActive ? 'bg-green-500' : 'bg-red-400'
          }`}
        >
          <span className={`absolute top-1/2 -translate-y-1/2 text-white text-[9px] font-bold transition-all duration-300 ${
            isActive ? 'left-1.5' : 'right-1.5'
          }`}>
            {isActive ? 'A' : 'I'}
          </span>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
            isActive ? 'left-26px' : 'left-0.5'
          }`} />
        </button>
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