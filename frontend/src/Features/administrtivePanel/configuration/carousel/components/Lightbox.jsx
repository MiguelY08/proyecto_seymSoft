import { X } from 'lucide-react';

// ─── Lightbox ─────────────────────────────────────────────────────────────────
// Modal de imagen ampliada para la sección de administración del carrusel.
//
// Props:
//   imageUrl  — URL de la imagen a mostrar
//   nombre    — Nombre del archivo (se muestra debajo de la imagen)
//   onClose   — Callback para cerrar el lightbox
// ─────────────────────────────────────────────────────────────────────────────
function Lightbox({ imageUrl, nombre, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs sm:max-w-2xl lg:max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-9 sm:-top-10 right-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
        </button>

        {/* Imagen ampliada */}
        <img
          src={imageUrl}
          alt="Vista ampliada"
          className="w-full h-auto rounded-xl shadow-2xl"
          draggable={false}
        />

        {/* Nombre del archivo */}
        {nombre && (
          <p className="mt-2 sm:mt-3 text-center text-[10px] sm:text-xs text-white/60 truncate px-4">
            {nombre}
          </p>
        )}
      </div>
    </div>
  );
}

export default Lightbox;