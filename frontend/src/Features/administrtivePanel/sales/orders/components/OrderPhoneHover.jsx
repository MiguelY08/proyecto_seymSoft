import React from 'react';
import { Phone } from 'lucide-react';

function OrderPhoneHover({
  phone,
  position = null,
  className = '',
}) {
  const opensAbove = position?.placement === 'top';

  const positionStyle = position
    ? {
        left: `${position.left}px`,
        ...(opensAbove
          ? { bottom: `${position.bottom}px` }
          : { top: `${position.top}px` }),
        ...(position.maxHeight
          ? { maxHeight: `${position.maxHeight}px` }
          : {}),
      }
    : {};

  const verticalMotionClass = opensAbove
    ? '-translate-y-1 group-hover/phone:translate-y-0'
    : 'translate-y-1 group-hover/phone:translate-y-0';

  return (
    <div
      className={`
        pointer-events-none
        fixed
        z-[9999]
        w-[230px]
        -translate-x-1/2
        ${verticalMotionClass}
        rounded-xl
        p-3
        opacity-0
        shadow-2xl
        transition-all
        duration-150
        group-hover/phone:opacity-100
        ${className}
      `}
      style={{
        background: '#1e293b',
        ...positionStyle,
      }}
    >
      <div className="mb-2 border-b border-slate-600/70 pb-2">
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: '#94a3b8' }}
        >
          Teléfono de contacto
        </p>
      </div>

      <div
        className="flex items-center gap-3 rounded-lg px-3 py-2"
        style={{ background: 'rgba(15, 23, 42, 0.72)' }}
      >
        <Phone
          size={18}
          className="shrink-0"
          style={{ color: '#60a5fa' }}
        />

        <span
          className="text-sm font-medium break-all"
          style={{ color: '#f8fafc' }}
        >
          {phone || 'Sin teléfono registrado'}
        </span>
      </div>
    </div>
  );
}

export default OrderPhoneHover;