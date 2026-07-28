import { chartCard, cardTitle } from "../helpers/indicatorsHelpers";
import useBarAnimation from "../hooks/useBarAnimation";
import useBreakpoint from "../hooks/useBreakPoint";

const CLIENT_COLORS = ["#1e3a5f", "#1e6091", "#2980b9", "#5dade2", "#a9cce3"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

function TopClientsChart({ clients = [] }) {
  const animated = useBarAnimation();
  const { isMobile } = useBreakpoint();
  const maxValue = clients.length > 0 ? Number(clients[0].value) : 1;

  return (
    <div style={{ ...chartCard, minWidth: 0 }}>
      <h3 style={cardTitle}>Top 5 Clientes del Mes</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {clients.map((client, index) => (
          <div
            key={`${client.idClient ?? client.name}-${index}`}
            style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "12px", minWidth: 0 }}
          >
            <span
              style={{
                width: "18px",
                textAlign: "right",
                fontSize: "12px",
                fontWeight: "700",
                color: CLIENT_COLORS[index],
              }}
            >
              {index + 1}
            </span>

            <span
              title={client.name}
              style={{
                width: isMobile ? "auto" : "180px",
                flex: isMobile ? "1 1 auto" : "0 0 180px",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "13px",
                color: "#374151",
                fontWeight: "500",
              }}
            >
              {client.name}
            </span>

            {!isMobile && (
              <div
                style={{
                  flex: 1,
                  background: "#f1f5f9",
                  borderRadius: "100px",
                  height: "8px",
                  overflow: "hidden",
                  minWidth: "60px",
                }}
              >
                <div
                  style={{
                    width: animated ? `${(Number(client.value) / maxValue) * 100}%` : "0%",
                    height: "100%",
                    background: CLIENT_COLORS[index],
                    borderRadius: "100px",
                    transition: `width 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms`,
                  }}
                />
              </div>
            )}

            <span
              style={{
                minWidth: isMobile ? "72px" : "90px",
                maxWidth: isMobile ? "82px" : "none",
                textAlign: "right",
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(client.value)}
            </span>
          </div>
        ))}

        {clients.length === 0 && (
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
            No hay ventas aprobadas durante este mes.
          </p>
        )}
      </div>
    </div>
  );
}

export default TopClientsChart;
