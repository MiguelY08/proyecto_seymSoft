// ProductCardActions.jsx

import React, { useEffect, useRef, useState } from 'react';
import { ShoppingCart, LoaderCircle, PackageX } from 'lucide-react';

export function ProductCardActions({
  product,
  available,
  onAddToCart,
}) {
  /**
   * Estado visual temporal del botón.
   * Permite mostrar "Añadiendo..." durante unos milisegundos.
   */
  const [isAdding, setIsAdding] = useState(false);

  /**
   * Referencia del timeout para poder limpiarlo
   * si el componente se desmonta antes de terminar.
   */
  const addingTimeoutRef = useRef(null);

  /**
   * Maneja el click del botón "Añadir al carrito".
   */
  const handleClick = async (event) => {
    event.stopPropagation();

    if (!available || isAdding) return;

    try {
      setIsAdding(true);

      /**
       * onAddToCart puede ser síncrono o asíncrono.
       * Promise.resolve permite soportar ambos casos.
       */
      await Promise.resolve(onAddToCart(event));

      addingTimeoutRef.current = setTimeout(() => {
        setIsAdding(false);
      }, 450);
    } catch (error) {
      setIsAdding(false);
      console.error('Error adding product to cart:', error);
    }
  };

  /**
   * Limpieza del timeout al desmontar el componente.
   * Evita actualizar estado sobre un componente desmontado.
   */
  useEffect(() => {
    return () => {
      if (addingTimeoutRef.current) {
        clearTimeout(addingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="px-4 pb-4 pt-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={!available || isAdding}
        aria-label={
          available
            ? `Añadir ${product.name} al carrito`
            : `${product.name} no disponible`
        }
        className={`
          relative
          flex
          w-full
          items-center
          justify-center
          gap-2
          overflow-hidden
          rounded-2xl
          border-2
          px-4
          py-3
          text-[0.78rem]
          font-black
          uppercase
          tracking-[0.14em]
          transition-all
          duration-300
          ${
            available
              ? `
                border-[#004D77]
                bg-[#004D77]
                text-white
                hover:bg-transparent
                hover:text-[#004D77]
                hover:shadow-[0_10px_24px_rgba(0,77,119,0.18)]
                active:scale-[0.97]
              `
              : `
                cursor-not-allowed
                border-[#d7e3ea]
                bg-[#eef4f7]
                text-[#89a2b2]
              `
          }
        `}
      >
        {/* Glow decorativo */}
        {available && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute left-[-20%] top-0 h-full w-[40%] rotate-[18deg] bg-white/10 blur-xl" />
          </div>
        )}

        {/* Contenido dinámico */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isAdding ? (
            <>
              <LoaderCircle
                size={17}
                strokeWidth={2.8}
                className="animate-spin"
              />

              <span>Añadiendo...</span>
            </>
          ) : available ? (
            <>
              <ShoppingCart
                size={17}
                strokeWidth={2.8}
              />

              <span>Añadir al carrito</span>
            </>
          ) : (
            <>
              <PackageX
                size={17}
                strokeWidth={2.8}
              />

              <span>Producto agotado</span>
            </>
          )}
        </span>
      </button>
    </div>
  );
}