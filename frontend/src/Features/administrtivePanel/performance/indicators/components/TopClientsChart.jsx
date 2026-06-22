import { chartCard, cardTitle } from "../helpers/indicatorsHelpers";
import useBarAnimation from "../hooks/useBarAnimation";

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
  const maxValue = clients.length > 0 ? Number(clients[0].value) : 1;

  return (
    <div style={chartCard}>
      <h3 style={cardTitle}>Top 5 Clientes del Mes</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {clients.map((client, index) => (
          <div
            key={client.idClient}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
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
                width: "180px",
                flexShrink: 0,
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

            <div
              style={{
                flex: 1,
                background: "#f1f5f9",
                borderRadius: "100px",
                height: "8px",
                overflow: "hidden",
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

            <span
              style={{
                minWidth: "90px",
                textAlign: "right",
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "600",
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
