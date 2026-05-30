// ProductCard.jsx

import React from 'react';

import { ProductCardImage } from './ProductCardImg';
import { ProductCardBody } from './ProductCardBody';
import { ProductCardActions } from './ProductCardActions';
import { useProductCard } from './hooks/useProductCard';

function ProductCard({ product: productData }) {
  const {
    product,

    favorited,
    available,

    heartPopping,
    isHoveringHeart,
    setIsHoveringHeart,

    isHoveringCard,
    activeImageIndex,
    hasMultipleImages,

    startImageCarousel,
    stopImageCarousel,
    selectImage,
    nextImage,
    prevImage,

    handleFavorite,
    handleAddToCart,
    goToDetail,
  } = useProductCard(productData);

  return (
    <article
      onClick={goToDetail}
      onMouseEnter={startImageCarousel}
      onMouseLeave={stopImageCarousel}
      className={`
        group
        relative
        flex
        h-full
        cursor-pointer
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-[#dcebf3]
        bg-white
        shadow-[0_3px_14px_rgba(0,77,119,0.07)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#a9cde2]
        hover:shadow-[0_12px_30px_rgba(0,77,119,0.13)]
        active:scale-[0.985]
      `}
      role="article"
      aria-label={`Producto: ${product.name}`}
    >
      <ProductCardImage
        product={product}
        favorited={favorited}
        available={available}
        heartPopping={heartPopping}
        isHoveringHeart={isHoveringHeart}
        setIsHoveringHeart={setIsHoveringHeart}
        isHoveringCard={isHoveringCard}
        activeImageIndex={activeImageIndex}
        hasMultipleImages={hasMultipleImages}
        selectImage={selectImage}
        nextImage={nextImage}
        prevImage={prevImage}
        onFavorite={handleFavorite}
      />

      <ProductCardBody
        product={product}
        available={available}
      />

      <ProductCardActions
        product={product}
        available={available}
        onAddToCart={handleAddToCart}
      />
    </article>
  );
}

export default ProductCard;
