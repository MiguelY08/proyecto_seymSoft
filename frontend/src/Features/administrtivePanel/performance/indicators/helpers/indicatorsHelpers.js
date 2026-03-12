// ─── Estilo base de tarjeta ───────────────────────────────────────────────────
export const chartCard = {
  background:   "#ffffff",
  borderRadius: "14px",
  boxShadow:    "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  padding:      "20px 22px",
  flex:          1,
  minWidth:     "0",
  boxSizing:    "border-box",
};

// ─── Título de sección dentro de tarjeta ─────────────────────────────────────
export const cardTitle = {
  margin:        "0 0 16px",
  fontSize:      "14px",
  fontWeight:    "600",
  color:         "#1e293b",
  letterSpacing: "0.01em",
};

// ─── Estilo de ticks de ejes ──────────────────────────────────────────────────
export const axTick = { fontSize: 12, fill: "#94a3b8" };

// ─── Estilo base del tooltip personalizado ────────────────────────────────────
// Usar junto con la animación CSS "@keyframes tooltipIn" inyectada en el DOM.
export const tooltipBox = {
  background:   "#1e293b",
  border:        "none",
  borderRadius:  "10px",
  padding:       "10px 14px",
  boxShadow:     "0 8px 24px rgba(0,0,0,0.18)",
  animation:     "tooltipIn 0.15s cubic-bezier(0.2, 0, 0, 1.2) both",
  pointerEvents: "none",
};

export const tooltipLabel = {
  margin:      "0 0 5px",
  fontSize:    "11px",
  fontWeight:  "600",
  color:       "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export const tooltipValue = {
  margin:     "2px 0",
  fontSize:   "13px",
  fontWeight: "600",
  color:      "#f1f5f9",
};

// Inyecta la keyframe una sola vez en el documento
if (typeof document !== "undefined" && !document.getElementById("__tooltip-anim")) {
  const s = document.createElement("style");
  s.id = "__tooltip-anim";
  s.textContent = `
    @keyframes tooltipIn {
      from { opacity: 0; transform: scale(0.92) translateY(4px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);   }
    }
  `;
  document.head.appendChild(s);
}