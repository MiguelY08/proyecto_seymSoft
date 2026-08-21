import { createElement } from "react";
import { X } from "lucide-react";

const PurchaseModalHeader = ({
  icon,
  eyebrow,
  title,
  onClose,
  titleId,
  closeLabel = "Cerrar",
}) => (
  <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-7 sm:py-6">
    <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
    <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
    <div className="relative flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
          {createElement(icon, { className: "h-6 w-6", strokeWidth: 2 })}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f9f9f9]">
            {eyebrow}
          </p>
          <h2 id={titleId} className="mt-0.5 break-words text-lg font-bold text-[#f9f9f9] sm:text-xl">
            {title}
          </h2>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  </header>
);

export default PurchaseModalHeader;
