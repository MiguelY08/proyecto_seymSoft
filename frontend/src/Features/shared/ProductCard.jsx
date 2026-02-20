import React, { useState } from "react";
import { ShoppingCart, Heart, HeartCrack } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductCard({
  image,
  name,
  category,
  price,
  productId,
  onAddToCart,
  onAddToFavorites,
}) {
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isHoveringHeart, setIsHoveringHeart] = useState(false);

  const handleFavorite = (e) => {
    e.stopPropagation(); // 🔥 evita que navegue
    const adding = !isFavorite;
    setIsFavorite(adding);
    if (adding) onAddToFavorites?.();
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // 🔥 evita que navegue
    onAddToCart?.();
  };

  const goToDetail = () => {
    navigate(`/shop/detail`);
  };

  return (
    <div
      onClick={goToDetail}
      className="cursor-pointer bg-white rounded-2xl border-2 border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-gray-300 overflow-hidden active:scale-95 active:shadow-md"
    >
      {/* Imagen */}
      <div className="relative bg-white aspect-square flex items-center justify-center p-2 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="h-px bg-gray-200 mx-3" />

      {/* Información */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-tight text-center leading-tight line-clamp-2">
          {name}
        </h3>

        <p className="text-[10px] text-gray-500 uppercase tracking-wide text-center line-clamp-1">
          {category}
        </p>

        <p className="text-xl font-bold text-[#004D77] text-center mt-1 mb-2">
          ${price.toLocaleString("es-CO")}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 px-3 bg-white border-2 border-[#004D77] text-[#004D77] rounded-lg font-semibold text-xs hover:bg-[#004D77] hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={2} />
            Añadir
          </button>

          <button
            onClick={handleFavorite}
            onMouseEnter={() => setIsHoveringHeart(true)}
            onMouseLeave={() => setIsHoveringHeart(false)}
            className="w-9 h-9 flex items-center justify-center"
          >
            {isFavorite ? (
              isHoveringHeart ? (
                <HeartCrack
                  className="w-6 h-6 text-[#004D77]"
                  strokeWidth={2}
                />
              ) : (
                <Heart
                  className="w-6 h-6 text-[#004D77] fill-[#004D77]"
                  strokeWidth={2}
                />
              )
            ) : (
              <Heart
                className={`w-6 h-6 fill-transparent ${
                  isHoveringHeart ? "text-[#004D77]" : "text-gray-400"
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
