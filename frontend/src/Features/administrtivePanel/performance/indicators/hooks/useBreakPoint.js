import { useState, useEffect } from "react";

// Breakpoints:
//   mobile  → < 640px
//   tablet  → 640px – 1023px
//   desktop → ≥ 1024px

function getBreakpoint(w) {
  if (w < 640)  return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function useBreakpoint() {
  const [bp, setBp] = useState(() =>
    typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "desktop"
  );

  useEffect(() => {
    const handler = () => setBp(getBreakpoint(window.innerWidth));
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return {
    bp,
    isMobile:  bp === "mobile",
    isTablet:  bp === "tablet",
    isDesktop: bp === "desktop",
  };
}

export default useBreakpoint;