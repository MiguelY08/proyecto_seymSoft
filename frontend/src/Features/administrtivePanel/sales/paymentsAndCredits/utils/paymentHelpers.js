import * as XLSX from "xlsx"

/* =============================================================================
   paymentHelpers.js
   REGLAS DE NEGOCIO CENTRALES:
     1. Un abono con anulado=true NUNCA se suma al total abonado.
     2. El plazo de una factura es de 2 meses desde fechaCredito.
     3. Si saldo <= 0 → "al_dia" (sin importar la fecha).
     4. Si saldo > 0 y fecha venció → "vencido".
     5. Si saldo > 0 y fecha vigente → "pendiente".
     6. El estado del cliente es el PEOR estado entre todas sus facturas:
        vencido > pendiente > al_dia
============================================================================= */


/* ── NIVEL ABONO ─────────────────────────────────────────────────────────── */

// Retorna "anulado" | "activo" para un abono individual
export const getAbonoStatus = (abono) => {
  return abono.anulado ? "anulado" : "activo"
}


/* ── NIVEL FACTURA ───────────────────────────────────────────────────────── */

// Saldo pendiente de UNA factura (ignora abonos anulados, mínimo 0)
export const calculateSaldoFactura = (factura) => {
  const abonos = factura.abonos ?? []
  const totalAbonado = abonos
    .filter(abono => !abono.anulado)
    .reduce((acc, abono) => acc + abono.monto, 0)
  return Math.max(0, factura.valorCredito - totalAbonado)
}

// Estado de UNA factura: "al_dia" | "pendiente" | "vencido"
export const getPaymentStatus = (saldo, fechaCredito) => {
  if (saldo <= 0) return "al_dia"
  const dueDate = new Date(fechaCredito)
  dueDate.setMonth(dueDate.getMonth() + 2)
  if (new Date() > dueDate) return "vencido"
  return "pendiente"
}

// Días de mora de una factura (0 si no está vencida)
export const getDaysLate = (fechaCredito) => {
  const dueDate = new Date(fechaCredito)
  dueDate.setMonth(dueDate.getMonth() + 2)
  if (new Date() <= dueDate) return 0
  return Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24))
}

// Total abonado activo de UNA factura (excluye anulados)
export const getTotalAbonadoFactura = (factura) => {
  const abonos = factura.abonos ?? []
  return abonos
    .filter(abono => !abono.anulado)
    .reduce((acc, abono) => acc + abono.monto, 0)
}

// Fecha del último abono activo de una factura, o null si no hay
export const getLastPaymentDate = (abonos = []) => {
  const active = abonos
    .filter(a => !a.anulado)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return active.length ? active[0].fecha : null
}


/* ── NIVEL CLIENTE ───────────────────────────────────────────────────────── */

// Saldo total pendiente del cliente (suma de todas sus facturas)
export const calculateSaldoCliente = (cliente) => {
  const facturas = cliente.facturas ?? []
  return facturas.reduce((total, factura) => total + calculateSaldoFactura(factura), 0)
}

// Estado general del cliente: peor estado entre todas sus facturas
export const getClienteStatus = (cliente) => {
  const facturas = cliente.facturas ?? []
  if (!facturas.length) return "al_dia"
  const estados = facturas.map(f => getPaymentStatus(calculateSaldoFactura(f), f.fechaCredito))
  if (estados.includes("vencido"))   return "vencido"
  if (estados.includes("pendiente")) return "pendiente"
  return "al_dia"
}

// Suma de valorCredito de todas las facturas del cliente
export const getTotalCreditoCliente = (cliente) => {
  const facturas = cliente.facturas ?? []
  return facturas.reduce((total, factura) => total + factura.valorCredito, 0)
}

// Suma de abonos activos de todas las facturas del cliente
export const getTotalAbonadoCliente = (cliente) => {
  const facturas = cliente.facturas ?? []
  return facturas.reduce((total, factura) => total + getTotalAbonadoFactura(factura), 0)
}


/* ── EXPORTACIÓN EXCEL ───────────────────────────────────────────────────── */

// Genera archivo .xlsx con una fila por factura y totales globales al final
export const exportAccountsToExcel = (accounts = []) => {

  if (!accounts.length) return false

  try {

    const data = []
    let rowNumber = 1

    accounts.forEach(cliente => {
      const facturas = cliente.facturas ?? []
      facturas.forEach(factura => {

        const saldo        = calculateSaldoFactura(factura)
        const totalAbonado = getTotalAbonadoFactura(factura)
        const estado       = getPaymentStatus(saldo, factura.fechaCredito)
        const dueDate      = new Date(factura.fechaCredito)
        dueDate.setMonth(dueDate.getMonth() + 2)

        data.push({
          "Nro":            rowNumber++,
          "Documento":      cliente.documento,
          "Nombre Cliente": cliente.nombre,
          "Nro Factura":    factura.nroFactura,
          "Valor Crédito":  factura.valorCredito,
          "Fecha Crédito":  factura.fechaCredito,
          "Fin de Crédito": dueDate.toISOString().split("T")[0],
          "Total Abonado":  totalAbonado,
          "Saldo":          saldo,
          "Estado":         estado
        })
      })
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const range     = XLSX.utils.decode_range(worksheet["!ref"])

    for (let row = 1; row <= range.e.r; row++) {
      const c4 = XLSX.utils.encode_cell({ r: row, c: 4 })
      const c7 = XLSX.utils.encode_cell({ r: row, c: 7 })
      const c8 = XLSX.utils.encode_cell({ r: row, c: 8 })
      if (worksheet[c4]) worksheet[c4].z = '"$"#,##0'
      if (worksheet[c7]) worksheet[c7].z = '"$"#,##0'
      if (worksheet[c8]) worksheet[c8].z = '"$"#,##0'
    }

    const totalCredito      = accounts.reduce((s, c) => s + getTotalCreditoCliente(c), 0)
    const totalAbonosGlobal = accounts.reduce((s, c) => s + getTotalAbonadoCliente(c), 0)
    const totalSaldoGlobal  = totalCredito - totalAbonosGlobal

    XLSX.utils.sheet_add_aoa(worksheet, [
      [],
      ["", "", "", "TOTALES:", totalCredito, "", "", totalAbonosGlobal, totalSaldoGlobal, ""]
    ], { origin: -1 })

    const newRange      = XLSX.utils.decode_range(worksheet["!ref"])
    const totalRowIndex = newRange.e.r

    const tc = XLSX.utils.encode_cell({ r: totalRowIndex, c: 4 })
    const ta = XLSX.utils.encode_cell({ r: totalRowIndex, c: 7 })
    const ts = XLSX.utils.encode_cell({ r: totalRowIndex, c: 8 })
    if (worksheet[tc]) worksheet[tc].z = '"$"#,##0'
    if (worksheet[ta]) worksheet[ta].z = '"$"#,##0'
    if (worksheet[ts]) worksheet[ts].z = '"$"#,##0'

    worksheet["!cols"] = [
      { wch: 6  },
      { wch: 15 },
      { wch: 22 },
      { wch: 12 },
      { wch: 15 },
      { wch: 14 },
      { wch: 14 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 }
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Créditos")

    const today = new Date().toLocaleDateString("es-CO").replaceAll("/", "-")
    XLSX.writeFile(workbook, `Listado_Creditos_${today}.xlsx`)

    return true

  } catch (error) {
    console.error("Error exportando Excel:", error)
    return false
  }
}