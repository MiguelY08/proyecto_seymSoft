import { X } from 'lucide-react';

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ imageUrl, nombre, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92dvh] w-full max-w-[calc(100vw-24px)] flex-col items-center sm:max-w-2xl lg:max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar vista ampliada"
          className="absolute right-0 top-0 z-10 flex h-9 w-9 -translate-y-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 sm:h-10 sm:w-10 sm:-translate-y-12"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <img
          src={imageUrl}
          alt={nombre ?? 'Vista ampliada del banner'}
          className="max-h-[82dvh] w-full rounded-xl object-contain shadow-2xl"
          draggable={false}
        />

        {nombre && (
          <p className="mt-2 max-w-full truncate px-4 text-center text-[10px] text-white/60 sm:mt-3 sm:text-xs">
            {nombre}
          </p>
        )}
      </div>
    </div>
  );
}

export default Lightbox;
