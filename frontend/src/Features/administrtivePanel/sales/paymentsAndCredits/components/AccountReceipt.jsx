import {
  calculateSaldoFactura,
  getTotalAbonadoFactura,
  calculateSaldoCliente,
  getTotalCreditoCliente,
  getTotalAbonadoCliente
} from "../utils/paymentHelpers"

/*
  Comprobante PDF del estado de cuenta completo de un cliente.
  Muestra TODAS sus facturas, cada una con su tabla de abonos y resumen.
  Al final incluye un resumen global del cliente.

  Props:
    account → objeto cliente completo { nombre, documento, telefono, facturas[] }
*/
export default function AccountReceipt({ account }) {

  if (!account) return null

  const facturas      = account.facturas ?? []
  const saldoTotal    = calculateSaldoCliente(account)
  const totalCredito  = getTotalCreditoCliente(account)
  const totalAbonado  = getTotalAbonadoCliente(account)
  const today         = new Date().toLocaleDateString("es-CO")

  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value)

  return (
    <div style={wrapperStyle}>

      {/* ENCABEZADO */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "12px", color: "#6B7280" }}>Fecha de emisión</p>
        <p>{today}</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#004D77" }}>
          Estado de Cuenta — Comprobante
        </h2>
        <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "6px" }}>
          Sistema de Pagos y Abonos - Papelería Magic
        </p>
      </div>

      {/* DATOS DEL CLIENTE */}
      <h3 style={sectionTitle}>Datos del Cliente</h3>
      <div style={cardStyle}>
        <Info label="Cliente"    value={account.nombre} />
        <Info label="Documento"  value={account.documento} />
        <Info label="Teléfono"   value={account.telefono} />
        <Info label="Correo"     value={account.correo || "-"} />
      </div>

      {/* FACTURAS — una sección por cada factura */}
      {facturas.map((factura, fi) => {

        const saldoFac    = calculateSaldoFactura(factura)
        const abonadoFac  = getTotalAbonadoFactura(factura)

        // Fecha de vencimiento: 2 meses desde la fecha del crédito
        const dueDate = new Date(factura.fechaCredito)
        dueDate.setMonth(dueDate.getMonth() + 2)

        return (
          <div key={factura.id} style={{ marginTop: "36px" }}>

            {/* Título de la factura */}
            <h3 style={sectionTitle}>
              Factura {factura.nroFactura}
            </h3>

            {/* Resumen rápido de la factura */}
            <div style={{ ...cardStyle, marginBottom: "16px" }}>
              <Info label="Valor crédito"    value={formatCOP(factura.valorCredito)} />
              <Info label="Fecha crédito"    value={factura.fechaCredito} />
              <Info label="Fecha vencimiento" value={dueDate.toLocaleDateString("es-CO")} />
              <Info label="Saldo pendiente"  value={formatCOP(saldoFac)} />
            </div>

            {/* Tabla de abonos de esta factura */}
            <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: "#004D77", color: "#FFFFFF" }}>
                  <th style={thStyle}>Nro</th>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>Monto</th>
                  <th style={thStyle}>Medio de Pago</th>
                  <th style={thStyle}>Observación</th>
                  <th style={thStyle}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {factura.abonos && factura.abonos.length > 0 ? (
                  factura.abonos.map((a) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={tdStyle}>#{a.nroAbono}</td>
                      <td style={tdStyle}>{a.fecha}</td>
                      <td style={tdStyle}>{formatCOP(a.monto)}</td>
                      <td style={tdStyle}>{a.medioPago ?? "-"}</td>
                      <td style={tdStyle}>{a.observacion || "-"}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: a.anulado ? "#FEE2E2" : "#DCFCE7",
                          color:           a.anulado ? "#991B1B" : "#166534"
                        }}>
                          {a.anulado ? "Anulado" : "Activo"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: "16px", textAlign: "center", color: "#6B7280" }}>
                      Sin abonos registrados para esta factura.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Subtotal de la factura */}
            <div style={{ ...cardStyle, marginTop: "12px" }}>
              <SummaryRow label="Valor crédito"  value={formatCOP(factura.valorCredito)} />
              <SummaryRow label="Total abonado"  value={formatCOP(abonadoFac)} />
              <div style={totalRowStyle}>
                <span style={{ fontWeight: "600" }}>Saldo factura:</span>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#004D77" }}>
                  {formatCOP(saldoFac)}
                </span>
              </div>
            </div>

          </div>
        )
      })}

      {/* RESUMEN GLOBAL DEL CLIENTE */}
      <h3 style={{ ...sectionTitle, marginTop: "40px" }}>
        Resumen General del Cliente
      </h3>
      <div style={cardStyle}>
        <SummaryRow label="Total crédito otorgado" value={formatCOP(totalCredito)} />
        <SummaryRow label="Total abonado"           value={formatCOP(totalAbonado)} />
        <div style={totalRowStyle}>
          <span style={{ fontWeight: "600" }}>Saldo total pendiente:</span>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#004D77" }}>
            {formatCOP(saldoTotal)}
          </span>
        </div>
      </div>

      {/* NOTA LEGAL */}
      <div style={footerStyle}>
        Este comprobante certifica el estado de cuenta del cliente a la fecha de emisión.
        Los abonos anulados no se incluyen en el cálculo del saldo.
        Documento generado automáticamente por el sistema SeymSoft.
      </div>

    </div>
  )
}

/* ── Estilos ── */

const wrapperStyle = {
  backgroundColor: "#FFFFFF",
  padding: "40px",
  fontFamily: "Lexend, sans-serif",
  fontSize: "14px",
  color: "#374151",
  width: "100%"
}

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
  marginTop: "4px",
  gridColumn: "1 / -1"
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
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
      <span style={{ color: "#6B7280" }}>{label}:</span>
      <span style={{ fontWeight: "500" }}>{value}</span>
    </div>
  )
}