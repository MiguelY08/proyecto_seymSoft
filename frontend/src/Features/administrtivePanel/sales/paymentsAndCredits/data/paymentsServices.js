import { mockCreditAccounts } from "./mockCreditAccounts"

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
   Agregar abono
================================= */
export const addPayment = (accountId, amount) => {
  const accounts = getAccounts()

  const accountIndex = accounts.findIndex(
    acc => acc.id === Number(accountId)
  )

  if (accountIndex === -1) return

  const newPayment = {
    id: Date.now(),
    monto: Number(amount),
    fecha: new Date().toISOString().split("T")[0]
  }

  accounts[accountIndex].abonos.push(newPayment)

  saveAccounts(accounts)

  return newPayment
}

/* ===============================
   Anular abono
================================= */
export const cancelPayment = (accountId, paymentId) => {
  const accounts = getAccounts()

  const accountIndex = accounts.findIndex(
    acc => acc.id === Number(accountId)
  )

  if (accountIndex === -1) return

  const paymentIndex = accounts[accountIndex].abonos.findIndex(
    abono => abono.id === paymentId
  )

  if (paymentIndex === -1) return

  accounts[accountIndex].abonos[paymentIndex].anulado = true

  saveAccounts(accounts)
}

