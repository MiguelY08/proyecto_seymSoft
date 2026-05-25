import React from 'react';

export function ProductCardBody({ name, price }) {
  return (
    <div className="px-3.5 py-3 flex flex-col gap-2.5 flex-1">
      {/* Nombre del producto */}
      <h3 className="text-[0.84rem] font-black text-[#0c2a3a] leading-[1.35] line-clamp-2 min-h-[2.25em]">
        {name}
      </h3>

      {/* Fila de precio */}
      <div className="flex items-baseline justify-between">
        <span className="text-[1.3rem] font-black text-[#004D77] tracking-tighter">
          ${price.toLocaleString('es-CO')}
        </span>
        <span className="text-[0.58rem] font-bold text-[#9abcce] uppercase tracking-widest">
          COP
        </span>
      </div>
    </div>
  );
}