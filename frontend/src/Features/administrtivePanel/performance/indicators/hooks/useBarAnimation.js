import { useState, useEffect } from "react";

// ─── useBarAnimation ──────────────────────────────────────────────────────────
// Dispara la animación de entrada de las barras de progreso tras un breve delay.
// Antes: el mismo useState + useEffect estaba copiado en TopClientsChart
//        y TopProductsChart.
//
// Uso:
//   const animated = useBarAnimation();
//   <div style={{ width: animated ? `${pct}%` : "0%", transition: "width 0.7s ..." }} />
// ─────────────────────────────────────────────────────────────────────────────
function useBarAnimation(delay = 100) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return animated;
}

export default useBarAnimation;