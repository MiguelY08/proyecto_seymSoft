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
    <div className="mt-auto px-3 pb-3 pt-1.5 sm:px-3.5">
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
          gap-1
          overflow-hidden
          rounded-xl
          border-2
          px-2.5
          py-2.5
          text-[0.64rem]
          font-black
          uppercase
          tracking-[0.07em]
          transition-all
          duration-300
          sm:gap-1.5
          sm:px-3
          sm:text-[0.68rem]
          sm:tracking-[0.1em]
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
        <span className="relative z-10 flex min-w-0 items-center justify-center gap-1 sm:gap-1.5">
          {isAdding ? (
            <>
              <LoaderCircle
                size={15}
                strokeWidth={2.6}
                className="animate-spin"
              />

              <span className="sm:hidden">Añadiendo</span>
              <span className="hidden sm:inline">Añadiendo...</span>
            </>
          ) : available ? (
            <>
              <ShoppingCart
                size={15}
                strokeWidth={2.6}
              />

              <span className="sm:hidden">Añadir</span>
              <span className="hidden sm:inline">Añadir al carrito</span>
            </>
          ) : (
            <>
              <PackageX
                size={15}
                strokeWidth={2.6}
              />

              <span className="sm:hidden">Agotado</span>
              <span className="hidden sm:inline">Producto agotado</span>
            </>
          )}
        </span>
      </button>
    </div>
  );
}
