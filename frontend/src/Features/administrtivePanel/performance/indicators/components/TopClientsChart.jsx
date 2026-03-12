import { chartCard }       from "../helpers/indicatorsHelpers";
import useBarAnimation     from "../hooks/useBarAnimation";

const clients = [
  { name: "Comercial Express S.A.", value: 2.5, medal: "" },
  { name: "Librería El Estudiante", value: 2.2, medal: "" },
  { name: "Colegio San Martín",     value: 1.9, medal: null },
  { name: "Oficinas Corporativas",  value: 1.6, medal: null },
  { name: "Papelería Central",      value: 1.1, medal: null },
];

const CLI_COLORS = ["#1e3a5f", "#1e6091", "#2980b9", "#5dade2", "#a9cce3"];

const MAX_VALUE = clients[0].value;

function TopClientsChart() {
  const animated = useBarAnimation();

  return (
    <div style={{ ...chartCard, minWidth: "180px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
        <h3 style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "#1a1a2e" }}>
          Top 5 Clientes del Mes
        </h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {clients.map((c, i) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px", width: "130px", flexShrink: 0 }}>
              {c.medal && <span style={{ fontSize: "10px" }}>{c.medal}</span>}
              <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{c.name}</span>
            </div>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: "100px", height: "4px", overflow: "hidden" }}>
              <div style={{
                width: animated ? `${(c.value / MAX_VALUE) * 100}%` : "0%",
                height: "100%",
                background: CLI_COLORS[i],
                borderRadius: "100px",
                transition: `width 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${i * 80}ms`,
              }} />
            </div>
            <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", width: "32px", textAlign: "right", flexShrink: 0 }}>
              ${c.value}M
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopClientsChart;