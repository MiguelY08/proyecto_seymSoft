import { useRef } from 'react';
import { GripVertical } from 'lucide-react';

// ─── CardOrder ────────────────────────────────────────────────────────────────
function CardOrder({ slide, imageUrl, index, onDragStart, onDragOver, onDrop, isDragging }) {

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, slide.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, slide.id);
      }}
      onDrop={(e) => onDrop?.(e, slide.id)}
      className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 cursor-grab active:cursor-grabbing select-none
        ${isDragging
          ? 'opacity-40 scale-95 border-[#004D77]/50 border-dashed'
          : 'border-transparent hover:border-[#004D77]/40 hover:shadow-lg'
        }`}
      style={{ width: '280px', aspectRatio: '16/9' }}
    >
      {/* ── Imagen ──────────────────────────────────────────────────────── */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={slide?.nombre ?? `Imagen ${index + 1}`}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <p className="text-xs text-gray-400">Sin imagen</p>
        </div>
      )}

      {/* ── Número de orden (top-left) ───────────────────────────────────── */}
      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#004D77] flex items-center justify-center shadow-md">
        <span className="text-white text-[10px] font-bold">{index + 1}</span>
      </div>

      {/* ── Indicador de arrastre (top-right) ───────────────────────────── */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <GripVertical className="w-3.5 h-3.5 text-white" strokeWidth={2} />
      </div>

      {/* ── Overlay inactiva ────────────────────────────────────────────── */}
      {!slide?.activo && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <span className="px-2 py-0.5 bg-black/50 text-white text-[9px] font-semibold rounded-full backdrop-blur-sm">
            Inactiva
          </span>
        </div>
      )}
    </div>
  );
}

export default CardOrder;