import React from 'react';
import { ShoppingCart } from 'lucide-react';

export function ProductCardActions({ onAddToCart }) {
  return (
    <button
      onClick={onAddToCart}
      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#004D77] text-white border-2 border-[#004D77] rounded-[10px] font-['Nunito'] text-[0.78rem] font-black tracking-wide cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-transparent hover:text-[#004D77] active:scale-96"
      aria-label="Añadir al carrito"
      type="button"
    >
      <ShoppingCart size={14} strokeWidth={2.5} />
      Añadir al carrito
    </button>
  );
}