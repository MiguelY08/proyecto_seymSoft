export default function AuthAnimatedBackground({ children }) {
  return (
    <div
      className="relative flex flex-1 flex-col overflow-hidden bg-white"
      style={{ backgroundImage: "radial-gradient(circle at 12% 12%, rgba(191, 219, 254, .48), transparent 27%), radial-gradient(circle at 86% 82%, rgba(147, 197, 253, .36), transparent 31%), linear-gradient(135deg, #fff 28%, #f4f9ff 62%, #eff6ff 100%)" }}
    >
      <style>{`
        @keyframes auth-wave-drift { 0%,100% { transform:translate3d(-24px,0,0) scaleY(1) } 50% { transform:translate3d(36px,-20px,0) scaleY(1.2) } }
        @keyframes auth-wave-rise { 0%,100% { transform:translate3d(26px,0,0) scaleY(1) } 50% { transform:translate3d(-40px,22px,0) scaleY(.82) } }
        @keyframes auth-float { 0%,100% { transform:translate3d(0,0,0) } 50% { transform:translate3d(0,-12px,0) } }
        @keyframes auth-dots-drift { 0%,100% { transform:translate3d(0,0,0);opacity:.85 } 50% { transform:translate3d(7px,-5px,0);opacity:.55 } }
        .auth-wave-top { animation:auth-wave-drift 6s ease-in-out infinite;transform-box:fill-box;transform-origin:center }.auth-wave-bottom { animation:auth-wave-rise 7s ease-in-out infinite;transform-box:fill-box;transform-origin:center }.auth-float { animation:auth-float 7s ease-in-out infinite }.auth-dots { animation:auth-dots-drift 9s ease-in-out infinite }
        @media (max-width:767px), (prefers-reduced-motion:reduce) { .auth-wave-top,.auth-wave-bottom,.auth-float,.auth-dots { animation:none } }
      `}</style>
      <div className="auth-float pointer-events-none absolute left-[13%] top-[53%] size-7 rounded-full bg-blue-100/80" />
      <div className="auth-float pointer-events-none absolute left-[63%] top-[26%] size-5 rounded-full bg-blue-300/60 [animation-delay:-3s]" />
      <div className="auth-float pointer-events-none absolute right-[7%] top-[7%] size-16 rounded-full bg-blue-100/50 [animation-delay:-5s]" />
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 1440 800" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="auth-wave-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#93c5fd" /><stop offset="52%" stopColor="#bfdbfe" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient></defs>
        <g className="auth-wave-top" fill="none" stroke="url(#auth-wave-gradient)" strokeWidth="1.35" opacity=".72">
          {[10, 24, 38, 52, 66, 80, 94, 108, 122, 136].map((offset) => <path key={offset} d={`M-100 ${offset} C${125 + (offset - 10) / 2} ${offset - 20} ${165 + (offset - 10) / 2} ${offset + 140} ${295 + (offset - 10) / 2} ${offset + 20} S${485 + (offset - 10) / 2} ${offset + 120} ${650 + (offset - 10) / 2} ${offset - 20} S${825 + (offset - 10) / 2} ${offset + 70} ${960 + (offset - 10) / 2} ${offset - 5} S${1130 + (offset - 10) / 2} ${offset - 90} ${1260 + (offset - 10) / 2} ${offset - 160}`} />)}
        </g>
        <g className="auth-wave-bottom" fill="none" stroke="url(#auth-wave-gradient)" strokeWidth="1.35" opacity=".72">
          {[0, 15, 30, 45, 60, 75, 90].map((offset) => <path key={offset} d={`M${410 + offset / 3} ${835 + offset} C${540 + offset / 3} ${655 + offset} ${695 + offset / 3} ${810 + offset} ${850 + offset / 3} ${680 + offset} S${1080 + offset / 3} ${780 + offset} ${1195 + offset / 3} ${610 + offset} S${1350 + offset / 3} ${710 + offset} ${1490 + offset / 3} ${470 + offset}`} />)}
        </g>
      </svg>
      <div className="auth-dots pointer-events-none absolute bottom-8 left-7 grid grid-cols-4 gap-2">{Array.from({ length: 9 }).map((_, index) => <span key={index} className="size-1 rounded-full bg-blue-400/80" />)}</div>
      <div className="auth-dots pointer-events-none absolute right-8 top-[39%] grid grid-cols-4 gap-2 [animation-delay:-4s]">{Array.from({ length: 12 }).map((_, index) => <span key={index} className="size-1 rounded-full bg-blue-400/80" />)}</div>
      <div className="relative z-10 flex flex-1">{children}</div>
    </div>
  )
}
