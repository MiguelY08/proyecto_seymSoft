import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';

// ─── CardOrder ────────────────────────────────────────────────────────────────
function CardOrder({
  slide,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
}) {
  const imageUrl = slide?.imageUrl;

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
        } w-[min(280px,calc(100vw-56px))] aspect-video sm:w-[280px]`}
    >
      {/* Imagen */}
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

      {/* Número de orden */}
      <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#004D77] shadow-md sm:h-6 sm:w-6">
        <span className="text-white text-[10px] font-bold">{index + 1}</span>
      </div>

      {/* Indicador de arrastre */}
      <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/40 backdrop-blur-sm sm:h-7 sm:w-7">
        <GripVertical className="h-4 w-4 text-white sm:h-3.5 sm:w-3.5" strokeWidth={2} />
      </div>

      {/* Controles tactiles para ordenar en movil */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveLeft?.();
          }}
          disabled={!canMoveLeft}
          title="Mover a la izquierda"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveRight?.();
          }}
          disabled={!canMoveRight}
          title="Mover a la derecha"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

export default CardOrder;
