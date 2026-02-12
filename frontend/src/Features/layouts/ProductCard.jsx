import React, { useState } from 'react';
import { ShoppingCart, Heart, HeartCrack } from 'lucide-react';

function ProductCard({ image, name, category, price, onAddToCart, onAddToFavorites }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHoveringHeart, setIsHoveringHeart] = useState(false);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    onAddToFavorites?.();
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-gray-300 overflow-hidden">
      {/* Imagen del producto */}
      <div className="relative bg-white aspect-square flex items-center justify-center p-1 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Separador */}
      <div className="h-px bg-gray-300 mx-3 sm:mx-4" />

      {/* Información del producto */}
      <div className="p-2 sm:p-3 flex flex-col gap-1 sm:gap-1.5">
        {/* Nombre del producto */}
        <h3 className="text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-tight text-center leading-tight min-h-2rem line-clamp-2">
          {name}
        </h3>

        {/* Categoría */}
        <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-wide text-center line-clamp-1">
          {category}
        </p>

        {/* Precio */}
        <p className="text-base sm:text-xl lg:text-2xl font-bold text-blue-600 text-center mt-0.5 sm:mt-1 mb-1 sm:mb-2">
          ${price.toLocaleString('es-CO')}
        </p>

        {/* Botones */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Botón añadir al carrito */}
          <button
            onClick={onAddToCart}
            className="flex-1 py-1.5 sm:py-2 px-1 sm:px-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold text-[9px] sm:text-xs hover:bg-blue-600 hover:text-white transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline">Añadir al carrito</span>
            <span className="sm:hidden">Añadir</span>
          </button>

          {/* Botón de favoritos */}
          <button
            onClick={handleFavorite}
            onMouseEnter={() => setIsHoveringHeart(true)}
            onMouseLeave={() => setIsHoveringHeart(false)}
            className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center cursor-pointer shrink-0 relative"
          >
            {isFavorite ? (
              isHoveringHeart ? (
                <HeartCrack className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600 transition-all duration-200" strokeWidth={2} />
              ) : (
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600 fill-blue-600 transition-all duration-200" strokeWidth={2} />
              )
            ) : (
              <Heart
                className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 fill-transparent transition-all duration-200 ${
                  isHoveringHeart ? 'text-blue-600' : 'text-gray-400'
                }`}
                strokeWidth={2}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;