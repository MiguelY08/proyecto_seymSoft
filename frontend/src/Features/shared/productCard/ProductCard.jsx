import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCardImage } from './ProductCardImg';
import { ProductCardBody } from './ProductCardBody';
import { ProductCardActions } from './ProductCardActions';
import { useProductCard } from './hooks/useProductCard';

function ProductCard({ image, name, category, price, productData }) {
  const navigate = useNavigate();
  const product = productData || { id: Math.random(), image, name, category, price };

  const {
    favorited,
    heartPopping,
    isHoveringHeart,
    setIsHoveringHeart,
    handleFavorite,
    handleAddToCart,
  } = useProductCard(product);

  const handleCardClick = () => navigate(`/shop/detail/${product.id}`);

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-[0_2px_10px_rgba(0,77,119,0.08)] border-[1.5px] border-[#e4eff6] flex flex-col transition-all duration-300 hover:shadow-[0_12px_36px_rgba(0,77,119,0.14)] hover:border-[#afd0e6] hover:-translate-y-1 active:scale-984 active:shadow-[0_3px_12px_rgba(0,77,119,0.1)]"
      role="article"
      aria-label={`Producto: ${name}`}
    >
      {/* Sección imagen */}
      <ProductCardImage
        image={image}
        name={name}
        category={category}
        favorited={favorited}
        heartPopping={heartPopping}
        isHoveringHeart={isHoveringHeart}
        onMouseEnter={() => setIsHoveringHeart(true)}
        onMouseLeave={() => setIsHoveringHeart(false)}
        onFavorite={handleFavorite}
      />

      {/* Sección cuerpo */}
      <ProductCardBody name={name} price={price} />

      {/* Sección acciones */}
      <ProductCardActions onAddToCart={handleAddToCart} />
    </div>
  );
}

export default ProductCard;