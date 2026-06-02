// ProductCardImg.jsx

import React from 'react';
import {
  Heart,
  HeartCrack,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function ProductCardImage({
  product,
  favorited,
  available,

  heartPopping,
  isHoveringHeart,
  setIsHoveringHeart,

  isHoveringCard,
  activeImageIndex,
  hasMultipleImages,

  selectImage,
  prevImage,
  nextImage,

  onFavorite,
}) {
  const currentImage =
    product.images?.[activeImageIndex] ?? product.images?.[0];

  return (
    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#eef6fb] via-[#edf5fa] to-[#dfeef8]">
      {/* Overlay decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_38%)]" />

      {/* Imagen activa */}
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <img
          src={currentImage?.url}
          alt={currentImage?.alt ?? product.name}
          loading="lazy"
          className={`relative z-10 h-[78%] w-[78%] object-contain transition-all duration-500 ease-out ${
            isHoveringCard
              ? 'scale-[1.08] rotate-[1deg]'
              : 'scale-100 rotate-0'
          }`}
        />
      </div>

      {/* Gradiente inferior */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />

      {/* Categoría */}
      <div className="absolute left-2.5 top-2.5 z-20 flex items-center gap-1.5">
        <span className="rounded-full border border-[rgba(0,77,119,0.12)] bg-white/92 px-2.5 py-0.5 text-[0.54rem] font-extrabold uppercase tracking-[0.12em] text-[#004D77] shadow-sm backdrop-blur-md">
          {product.category}
        </span>

        {!available && (
          <span className="rounded-full bg-[#ff4d4f] px-2 py-0.5 text-[0.52rem] font-black uppercase tracking-wide text-white shadow-md">
            Agotado
          </span>
        )}
      </div>

      {/* Favoritos */}
      <button
        onClick={onFavorite}
        onMouseEnter={() => setIsHoveringHeart(true)}
        onMouseLeave={() => setIsHoveringHeart(false)}
        aria-label={
          favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'
        }
        type="button"
        className={`absolute right-2.5 top-2.5 z-30 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
          favorited
            ? 'border-[#004D77] bg-[#004D77]'
            : 'border-[rgba(0,77,119,0.12)] bg-white/92 backdrop-blur-md'
        } hover:scale-[1.12] active:scale-90`}
      >
        {favorited ? (
          isHoveringHeart ? (
            <HeartCrack
              size={16}
              strokeWidth={2.5}
              color="#ffffff"
              className={heartPopping ? 'animate-heart-pop' : ''}
            />
          ) : (
            <Heart
              size={16}
              strokeWidth={2.5}
              color="#ffffff"
              fill="#ffffff"
              className={heartPopping ? 'animate-heart-pop' : ''}
            />
          )
        ) : (
          <Heart
            size={16}
            strokeWidth={2.5}
            color="#004D77"
            fill="transparent"
            className={heartPopping ? 'animate-heart-pop' : ''}
          />
        )}
      </button>

      {/* Indicador de múltiples imágenes */}
      {hasMultipleImages && (
        <>
          {/* Indicadores inferiores */}
          <div className="absolute bottom-2.5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 backdrop-blur-md">
            {product.images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ver imagen ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  selectImage(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeImageIndex === index
                    ? 'w-4 bg-white'
                    : 'w-1.5 bg-white/55 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Flecha izquierda */}
          <div
            className={`absolute left-2 top-1/2 z-30 -translate-y-1/2 transition-all duration-300 ${
              isHoveringCard
                ? 'translate-x-0 opacity-100'
                : '-translate-x-2 opacity-0'
            }`}
          >
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={(event) => {
                event.stopPropagation();
                prevImage();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/88 text-[#004D77] shadow-md backdrop-blur-md transition-transform duration-200 hover:scale-[1.08] active:scale-95"
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>
          </div>

          {/* Flecha derecha */}
          <div
            className={`absolute right-2 top-1/2 z-30 -translate-y-1/2 transition-all duration-300 ${
              isHoveringCard
                ? 'translate-x-0 opacity-100'
                : 'translate-x-2 opacity-0'
            }`}
          >
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/88 text-[#004D77] shadow-md backdrop-blur-md transition-transform duration-200 hover:scale-[1.08] active:scale-95"
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>

          {/* Contador */}
          <div className="absolute bottom-2.5 right-2.5 z-30 rounded-full bg-black/22 px-2 py-0.5 text-[0.58rem] font-bold text-white backdrop-blur-md">
            {activeImageIndex + 1}/{product.images.length}
          </div>
        </>
      )}

      {/* Badge hover */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-8 transition-all duration-500 ${
          isHoveringCard
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="rounded-full border border-white/20 bg-white/16 px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#004D77] backdrop-blur-xl">
          Ver producto
        </div>
      </div>
    </div>
  );
}
