// ProductCardBody.jsx

import React from 'react';

import {
  formatPrice,
  hasDiscount,
  getDiscountPercentage,
} from './helpers/productCard.helpers';

export function ProductCardBody({ product, available }) {
  const productHasDiscount = hasDiscount(product);
  const discountPercentage = getDiscountPercentage(product);

  return (
    <div className="flex flex-1 flex-col gap-2.5 px-3.5 pb-3 pt-3">
      {/* Categoría */}
      <div className="flex items-center justify-between gap-1.5">
        <span
          className="
            rounded-full
            bg-[#eef6fb]
            px-2
            py-0.5
            text-[0.52rem]
            font-extrabold
            uppercase
            tracking-[0.12em]
            text-[#004D77]
          "
        >
          {product.category}
        </span>

        {/* Estado */}
        <span
          className={`
            rounded-full
            px-2
            py-0.5
            text-[0.52rem]
            font-black
            uppercase
            tracking-[0.1em]
            ${
              available
                ? 'bg-[#edfdf3] text-[#12a150]'
                : 'bg-[#fff1f0] text-[#ff4d4f]'
            }
          `}
        >
          {available ? 'Disponible' : 'Agotado'}
        </span>
      </div>

      {/* Nombre */}
      <div className="min-h-[2.55rem]">
        <h3
          className="
            line-clamp-2
            text-[0.84rem]
            font-black
            leading-[1.35]
            text-[#0c2a3a]
            transition-colors
            duration-300
            group-hover:text-[#004D77]
          "
        >
          {product.name}
        </h3>
      </div>

      {/* Descripción corta */}
      {product.description && (
        <p
          className="
            line-clamp-2
            text-[0.66rem]
            leading-[1.45]
            text-[#6f8795]
          "
        >
          {product.description}
        </p>
      )}

      {/* Precios */}
      <div className="mt-auto flex flex-col gap-1">
        {product.priceLabel && (
          <span className="text-[0.58rem] font-extrabold uppercase tracking-[0.1em] text-[#6f8795]">
            {product.priceLabel}
          </span>
        )}

        {/* Precio anterior */}
        {productHasDiscount && (
          <div className="flex items-center gap-1.5">
            <span
              className="
                text-[0.72rem]
                font-bold
                text-[#9fb4c0]
                line-through
              "
            >
              ${formatPrice(product.originalPrice)}
            </span>

            <span
              className="
                rounded-full
                bg-[#e8fff1]
                px-1.5
                py-0.5
                text-[0.52rem]
                font-black
                text-[#00a650]
              "
            >
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* Precio actual */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-end gap-1">
            <span
              className="
                text-[1.28rem]
                font-black
                text-[#004D77]
              "
            >
              ${formatPrice(product.price)}
            </span>

            <span
              className="
                mb-1
                text-[0.52rem]
                font-extrabold
                uppercase
                tracking-[0.12em]
                text-[#8ca8b8]
              "
            >
              COP
            </span>
          </div>

          {/* Cantidad stock */}
          <div
            className="
              flex
              items-center
              gap-1
              rounded-full
              bg-[#f4f8fb]
              px-2
              py-0.5
            "
          >
            <span
              className="
                text-[0.5rem]
                font-black
                uppercase
                tracking-[0.08em]
                text-[#6f8795]
              "
            >
              Stock:
            </span>

            <span
              className="
                text-[0.56rem]
                font-black
                text-[#004D77]
              "
            >
              {product.stock}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
