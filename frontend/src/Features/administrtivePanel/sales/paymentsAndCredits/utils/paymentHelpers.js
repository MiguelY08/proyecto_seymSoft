export const getPaymentStatus = (saldo, fechaVencimiento) => {
  const today = new Date()
  const dueDate = new Date(fechaVencimiento)

  if (saldo <= 0) return "al_dia"

  if (today > dueDate) return "vencido"

  return "pendiente"
}

export const calculateSaldo = (account) => {

  const totalAbonos = account.abonos
    .filter(abono => !abono.anulado)
    .reduce((acc, abono) => acc + abono.monto, 0)

  return account.valorCredito - totalAbonos
}