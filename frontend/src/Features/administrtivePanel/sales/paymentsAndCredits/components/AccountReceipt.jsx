import { calculateSaldo } from "../utils/paymentHelpers"

export default function AccountReceipt({ account }) {

  if (!account) return null

  const saldo = calculateSaldo(account)

  const totalAbonado = account.abonos
    ?.filter(a => !a.anulado)
    .reduce((sum, a) => sum + a.monto, 0) || 0

  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value)

  const today = new Date().toLocaleDateString("es-CO")

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        padding: "40px",
        fontFamily: "Lexend, sans-serif",
        fontSize: "14px",
        color: "#374151",
        width: "100%"
      }}
    >

      {/* ================= HEADER ================= */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "12px", color: "#6B7280" }}>
          Fecha de emisión
        </p>
        <p>{today}</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "600",
            color: "#004D77"
          }}
        >
          Comprobante de Abono
        </h2>
        <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "6px" }}>
          Sistema de Pagos y Abonos - Papelería Magic
        </p>
      </div>

      {/* ================= DATOS CLIENTE ================= */}
      <h3 style={sectionTitle}>Datos del Cliente</h3>

      <div style={cardStyle}>
        <Info label="Cliente" value={account.nombre} />
        <Info label="Documento" value={account.documento} />
        <Info label="Teléfono" value={account.telefono} />
        <Info label="Correo" value={account.correo || "-"} />
      </div>

      {/* ================= TABLA ================= */}
      <h3 style={{ ...sectionTitle, marginTop: "30px" }}>
        Detalles del Abono
      </h3>

      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: "#004D77", color: "#FFFFFF" }}>
            <th style={thStyle}>Nro Abono</th>
            <th style={thStyle}>Fecha</th>
            <th style={thStyle}>Monto</th>
            <th style={thStyle}>Observaciones</th>
            <th style={thStyle}>Estado</th>
          </tr>
        </thead>

        <tbody>
          {account.abonos && account.abonos.length > 0 ? (
            account.abonos.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                <td style={tdStyle}>{a.id}</td>
                <td style={tdStyle}>{a.fecha}</td>
                <td style={tdStyle}>{formatCOP(a.monto)}</td>
                <td style={tdStyle}>{a.observacion}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    backgroundColor: a.anulado ? "#FEE2E2" : "#DCFCE7",
                    color: a.anulado ? "#991B1B" : "#166534"
                  }}>
                    {a.anulado ? "Anulado" : "Pagado"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}>
                No existen abonos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================= RESUMEN ================= */}
      <h3 style={{ ...sectionTitle, marginTop: "30px" }}>
        Resumen del Estado de Cuenta
      </h3>

      <div style={cardStyle}>
        <SummaryRow label="Valor Crédito" value={formatCOP(account.valorCredito)} />
        <SummaryRow label="Monto Abonado" value={formatCOP(totalAbonado)} />

        <div style={totalRowStyle}>
          <span style={{ fontWeight: "600" }}>
            Saldo Actual:
          </span>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#004D77" }}>
            {formatCOP(saldo)}
          </span>
        </div>
      </div>

      {/* ================= NOTA LEGAL ================= */}
      <div style={footerStyle}>
        Este comprobante certifica que el cliente ha realizado un abono correspondiente al saldo pendiente de su cuenta.
        Documento generado automáticamente por el sistema SeymSoft.
      </div>

    </div>
  )
}

/* ================= ESTILOS ================= */

const sectionTitle = {
  color: "#004D77",
  fontWeight: "600",
  marginBottom: "12px"
}

const cardStyle = {
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  padding: "16px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px"
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: "10px"
}

const thStyle = {
  padding: "10px",
  textAlign: "left",
  fontWeight: "500"
}

const tdStyle = {
  padding: "10px"
}

const totalRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "40px",
  borderTop: "1px solid #E5E7EB",
  paddingTop: "12px",
  marginTop: "12px"
}

const footerStyle = {
  marginTop: "50px",
  paddingTop: "20px",
  borderTop: "1px solid #E5E7EB",
  fontSize: "12px",
  color: "#6B7280",
  textAlign: "center",
  lineHeight: "1.6"
}

function Info({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{label}</p>
      <p style={{ fontWeight: "500" }}>{value}</p>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "40px", padding: "4px 0" }}>
      <span style={{ color: "#6B7280" }}>{label}:</span>
      <span style={{ fontWeight: "500" }}>{value}</span>
    </div>
  )
}