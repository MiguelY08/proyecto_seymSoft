// exportar excel 
import * as XLSX from "xlsx"

export const getPaymentStatus = (saldo, fechaCredito) => {

  if (saldo <= 0) return "al_dia"

  const today = new Date()
  const creditDate = new Date(fechaCredito)

  // Clonar fecha para no modificar la original
  const dueDate = new Date(creditDate)
  dueDate.setMonth(dueDate.getMonth() + 2)

  if (today > dueDate) return "vencido"

  return "pendiente"
}

export const calculateSaldo = (account) => {

  const totalAbonos = account.abonos
    .filter(abono => !abono.anulado)
    .reduce((acc, abono) => acc + abono.monto, 0)

  return account.valorCredito - totalAbonos
}

export const getLastPaymentDate = (abonos = []) => {

  const activePayments = abonos
    .filter(abono => !abono.anulado)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  return activePayments.length
    ? activePayments[0].fecha
    : null
}

export const getDaysLate = (fechaCredito) => {

  const today = new Date()
  const creditDate = new Date(fechaCredito)

  const dueDate = new Date(creditDate)
  dueDate.setMonth(dueDate.getMonth() + 2)

  if (today <= dueDate) return 0

  const diffTime = today - dueDate

  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}




export const exportAccountsToExcel = (accounts = []) => {

  if (!accounts.length) {
    return false
  }

  try {

    const data = accounts.map((acc, index) => {

      const saldo = calculateSaldo(acc)
      const estado = getPaymentStatus(saldo, acc.fechaCredito)

      const totalAbonos = acc.abonos
        .filter(a => !a.anulado)
        .reduce((sum, a) => sum + a.monto, 0)

      const creditDate = new Date(acc.fechaCredito)
      const dueDate = new Date(creditDate)
      dueDate.setMonth(dueDate.getMonth() + 2)

      return {
        "Nro venta": index + 1,
        "Tipo Documento": acc.tipoDocumento || "",
        "Documento": acc.documento,
        "Nombre Completo": acc.nombre,
        "Valor Crédito": acc.valorCredito,
        "Fecha Crédito": acc.fechaCredito,
        "Fin de crédito": dueDate.toISOString().split("T")[0],
        "Total Abono": totalAbonos,
        "Saldo": saldo,
        "Estado": estado
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const range = XLSX.utils.decode_range(worksheet["!ref"])

    for (let row = 1; row <= range.e.r; row++) {

      const valorCreditoCell = XLSX.utils.encode_cell({ r: row, c: 4 })
      const totalAbonoCell = XLSX.utils.encode_cell({ r: row, c: 7 })
      const saldoCell = XLSX.utils.encode_cell({ r: row, c: 8 })

      if (worksheet[valorCreditoCell]) worksheet[valorCreditoCell].z = '"$"#,##0'
      if (worksheet[totalAbonoCell]) worksheet[totalAbonoCell].z = '"$"#,##0'
      if (worksheet[saldoCell]) worksheet[saldoCell].z = '"$"#,##0'
    }

    const totalCredito = accounts.reduce(
      (sum, acc) => sum + acc.valorCredito,
      0
    )

    const totalAbonosGlobal = accounts.reduce((sum, acc) => {
      const pagos = acc.abonos
        .filter(a => !a.anulado)
        .reduce((s, a) => s + a.monto, 0)
      return sum + pagos
    }, 0)

    const totalSaldoGlobal = totalCredito - totalAbonosGlobal

    XLSX.utils.sheet_add_aoa(worksheet, [
      [],
      [
        "", "", "", "Totales:",
        totalCredito,
        "",
        "",
        totalAbonosGlobal,
        totalSaldoGlobal,
        ""
      ]
    ], { origin: -1 })

    const newRange = XLSX.utils.decode_range(worksheet["!ref"])
    const totalRowIndex = newRange.e.r

    const totalCreditoCell = XLSX.utils.encode_cell({ r: totalRowIndex, c: 4 })
    const totalAbonoCell = XLSX.utils.encode_cell({ r: totalRowIndex, c: 7 })
    const totalSaldoCell = XLSX.utils.encode_cell({ r: totalRowIndex, c: 8 })

    if (worksheet[totalCreditoCell]) worksheet[totalCreditoCell].z = '"$"#,##0'
    if (worksheet[totalAbonoCell]) worksheet[totalAbonoCell].z = '"$"#,##0'
    if (worksheet[totalSaldoCell]) worksheet[totalSaldoCell].z = '"$"#,##0'

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 22 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 }
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Créditos")

    const today = new Date()
      .toLocaleDateString("es-CO")
      .replaceAll("/", "-")

    XLSX.writeFile(
      workbook,
      `Listado_Creditos_${today}.xlsx`
    )

    return true

  } catch (error) {

    console.error("Error exportando Excel:", error)
    return false
  }
}