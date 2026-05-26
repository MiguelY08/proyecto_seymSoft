import React from 'react';
import { Heart, HeartCrack } from 'lucide-react';

export function ProductCardImage({
  image,
  name,
  category,
  favorited,
  heartPopping,
  isHoveringHeart,
  onMouseEnter,
  onMouseLeave,
  onFavorite,
}) {
  return (
    <div className="relative bg-linear-to-br from-[#eef6fb] to-[#e0eef7] aspect-square overflow-hidden flex items-center justify-center group">
      {/* Imagen del producto */}
      <img
        src={image}
        alt={name}
        className="w-[78%] h-[78%] object-contain transition-transform duration-420 cubic-bezier(0.25, 0.46, 0.45, 0.94) group-hover:scale-108"
        loading="lazy"
      />

      {/* Chip de categoría */}
      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md border border-[rgba(0,77,119,0.12)] rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[#004D77] z-20 pointer-events-none">
        {category}
      </span>

      {/* Botón favorito */}
      <button
        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center z-20 transition-all duration-200 shrink-0 ${
          favorited
            ? 'bg-[#004D77] border border-[#004D77]'
            : 'bg-white/90 backdrop-blur-md border border-[rgba(0,77,119,0.12)]'
        } hover:scale-112 active:scale-90`}
        onClick={onFavorite}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        type="button"
      >
        {favorited ? (
          isHoveringHeart ? (
            <HeartCrack
              size={15}
              color="#ffffff"
              strokeWidth={2.5}
              className={`${heartPopping ? 'animate-heart-pop' : ''}`}
            />
          ) : (
            <Heart
              size={15}
              color="#ffffff"
              fill="#ffffff"
              strokeWidth={2.5}
              className={`${heartPopping ? 'animate-heart-pop' : ''}`}
            />
          )
        ) : (
          <Heart
            size={15}
            color="#004D77"
            fill="transparent"
            strokeWidth={2.5}
            className={`${heartPopping ? 'animate-heart-pop' : ''}`}
          />
        )}
      </button>
    </div>
  );
}