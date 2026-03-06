import { mockCreditAccounts } from "./mockCreditAccounts"
import { calculateSaldo } from "../utils/paymentHelpers"

const STORAGE_KEY = "creditAccounts"

/* ===============================
   Inicializar datos (solo 1 vez)
================================= */
export const initializePayments = () => {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(mockCreditAccounts)
    )
  }
}

/* ===============================
   Obtener todas las cuentas
================================= */
export const getAccounts = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

/* ===============================
   Obtener una cuenta por ID
================================= */
export const getAccountById = (id) => {
  const accounts = getAccounts()
  return accounts.find(acc => acc.id === Number(id))
}

/* ===============================
   Guardar todas las cuentas
================================= */
export const saveAccounts = (accounts) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(accounts)
  )
}

/* ===============================
   Agregar abono (NUEVO FORMATO)
================================= */
export const addPayment = (accountId, paymentData) => {

  const accounts = getAccounts()

  const index = accounts.findIndex(
    acc => acc.id === Number(accountId)
  )

  if (index === -1) {
    console.log("Cuenta no encontrada")
    return
  }

  const newPayment = {
    id: Date.now(),
    monto: Number(paymentData.monto),
    medioPago: paymentData.medioPago || "Efectivo",
    observaciones: paymentData.observaciones || "",
    fecha: paymentData.fecha,
    createdAt: paymentData.createdAt,
    anulado: false
  }

  accounts[index].abonos.push(newPayment)

  saveAccounts(accounts)

  console.log("Abono guardado correctamente:", newPayment)

  return newPayment
}
/* ===============================
   Anular abono (REGLA 48 HORAS + PASSWORD)
================================= */
export const cancelPayment = (
  accountId,
  paymentId,
  reason,
  password
) => {

  // obtener usuarios del sistema
  const users = JSON.parse(localStorage.getItem("users")) || []

  // buscar administrador
  const admin = users.find(
    user => user.role === "Administrador"
  )

  if (!admin || admin.password !== password) {
    throw new Error("Contraseña del administrador incorrecta.")
  }

  const accounts = getAccounts()

  const accountIndex = accounts.findIndex(
    acc => acc.id === Number(accountId)
  )

  if (accountIndex === -1) {
    throw new Error("Cuenta no encontrada.")
  }

  const paymentIndex = accounts[accountIndex].abonos.findIndex(
    abono => abono.id === paymentId
  )

  if (paymentIndex === -1) {
    throw new Error("Abono no encontrado.")
  }

  const payment = accounts[accountIndex].abonos[paymentIndex]

  // regla de negocio 48 horas
  if (payment.createdAt) {

    const createdAt = new Date(payment.createdAt)
    const now = new Date()

    const diffHours =
      (now - createdAt) / (1000 * 60 * 60)

    if (diffHours > 48) {

      throw new Error(
        "No se puede anular un abono después de 48 horas."
      )

    }

  }

  if (payment.anulado) {
    throw new Error("Este abono ya fue anulado.")
  }

  // marcar como anulado
  payment.anulado = true
  payment.motivoCancelacion = reason
  payment.cancelledAt = new Date().toISOString()

  saveAccounts(accounts)

  return true
}

/* ===============================
   Aplicar interés
================================= */
export const applyInterest = (accountId, percentage) => {

  const accounts = getAccounts()

  const index = accounts.findIndex(
    acc => acc.id === Number(accountId)
  )

  if (index === -1) return null

  const account = accounts[index]

  const saldoActual = calculateSaldo(account)

  const interestAmount =
    (saldoActual * percentage) / 100

  account.valorCredito += interestAmount

  saveAccounts(accounts)

  return account
}


//  Recalcular saldo
const recalculateAccountBalance = (account) => {

  const totalAbonado = account.abonos
    .filter(abono => !abono.anulado)
    .reduce((acc, abono) => acc + Number(abono.valor), 0)

  account.totalAbonado = totalAbonado
  account.saldoPendiente =
    Number(account.valorCredito) - totalAbonado

  return account
}