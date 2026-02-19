import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, HeartCrack } from 'lucide-react';


function ProductCard({ image, name, category, price, productId, onAddToFavorites }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHoveringHeart, setIsHoveringHeart] = useState(false);

  const handleFavorite = (e) => {
  e.preventDefault();      // 🔥 evita navegación
  e.stopPropagation();     // 🔥 evita que el click suba al Link

  setIsFavorite(!isFavorite);
  onAddToFavorites?.();
};

  return (
<div className="bg-white rounded-2xl border-2 border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-gray-300 overflow-hidden active:scale-95 active:shadow-md cursor-pointer">      <Link
            to={`/${productId || 'shop/detail'}`}
            className="  duration-300  items-center justify-center gap-1 sm:gap-2 cursor-pointer"
        >  
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
        <p className="text-base sm:text-xl lg:text-2xl font-bold text-[#004D77] text-center mt-0.5 sm:mt-1 mb-1 sm:mb-2">
          ${price.toLocaleString('es-CO')}
        </p>

        {/* Botones */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Botón añadir al carrito */}
          <Link
            to={`/${productId || 'product000'}`}
            className="flex-1 py-1.5 sm:py-2 px-1 sm:px-3 bg-white border-2 border-[#004D77] text-[#004D77] rounded-lg font-semibold text-[9px] sm:text-xs hover:bg-[#004D77] hover:text-white transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline">Añadir al carrito</span>
            <span className="sm:hidden">Añadir</span>
          </Link>

          {/* Botón de favoritos */}
          <button
            onClick={(e) => handleFavorite(e)}
            onMouseEnter={() => setIsHoveringHeart(true)}
            onMouseLeave={() => setIsHoveringHeart(false)}
            className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center cursor-pointer shrink-0 relative"
          >
            {isFavorite ? (
              isHoveringHeart ? (
                <HeartCrack className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#004D77] transition-all duration-200" strokeWidth={2} />
              ) : (
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#004D77] fill-[#004D77] transition-all duration-200" strokeWidth={2} />
              )
            ) : (
              <Heart
                className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 fill-transparent transition-all duration-200 ${
                  isHoveringHeart ? 'text-[#004D77]' : 'text-gray-400'
                }`}
                strokeWidth={2}
              />
            )}
          </button>
        </div>
      </div>
      </Link>
    </div>
  );
}

export default ProductCard;