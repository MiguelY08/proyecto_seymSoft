/* =============================================================================
   paymentsServices.js
   Servicios CRUD del módulo de Pagos y Abonos.
   Persiste los datos en localStorage bajo la clave "creditAccounts".
   Modelo: Cliente → facturas[] → abonos[]
============================================================================= */

import { mockCreditAccounts } from "./mockCreditAccounts"
import { calculateSaldoFactura } from "../utils/paymentHelpers"

const STORAGE_KEY = "creditAccounts"


/* -----------------------------------------------------------------------
   Carga los datos mock en localStorage solo si no existen previamente.
   Llamar una vez al montar la app (ej: en App.jsx o el layout raíz).
----------------------------------------------------------------------- */
export const initializePayments = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCreditAccounts))
  }
}


/* -----------------------------------------------------------------------
   Retorna el array completo de clientes desde localStorage.
----------------------------------------------------------------------- */
export const getAccounts = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}


/* -----------------------------------------------------------------------
   Retorna un cliente por su id, o undefined si no existe.
----------------------------------------------------------------------- */
export const getAccountById = (id) => {
  const accounts = getAccounts()
  return accounts.find(acc => acc.id === Number(id))
}


/* -----------------------------------------------------------------------
   Persiste el array completo de clientes en localStorage.
----------------------------------------------------------------------- */
export const saveAccounts = (accounts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}


/* -----------------------------------------------------------------------
   Registra un nuevo abono en una factura específica de un cliente.

   @param {number} clienteId   - id del cliente
   @param {number} facturaId   - id de la factura dentro del cliente
   @param {Object} paymentData - { monto, medioPago, observacion, fecha }

   @returns {Object} El abono creado, o lanza Error si no encuentra
                     el cliente o la factura.

   El nroAbono se calcula automáticamente como el siguiente correlativo
   dentro de la factura (contando activos y anulados).
----------------------------------------------------------------------- */
export const addPayment = (clienteId, facturaId, paymentData) => {

  const accounts = getAccounts()

  const clienteIndex = accounts.findIndex(
    acc => acc.id === Number(clienteId)
  )

  if (clienteIndex === -1) {
    throw new Error("Cliente no encontrado.")
  }

  const facturaIndex = accounts[clienteIndex].facturas.findIndex(
    fac => fac.id === Number(facturaId)
  )

  if (facturaIndex === -1) {
    throw new Error("Factura no encontrada.")
  }

  const factura     = accounts[clienteIndex].facturas[facturaIndex]
  const abonos      = factura.abonos ?? []
  const saldoActual = calculateSaldoFactura(factura)

  // Validar que el monto no supere el saldo pendiente
  if (Number(paymentData.monto) > saldoActual) {
    throw new Error(
      `El monto ($${Number(paymentData.monto).toLocaleString("es-CO")}) ` +
      `supera el saldo pendiente ($${saldoActual.toLocaleString("es-CO")}).`
    )
  }

  // Validar que el monto sea mayor a cero
  if (Number(paymentData.monto) <= 0) {
    throw new Error("El monto del abono debe ser mayor a cero.")
  }

  const newPayment = {
    id:          Date.now(),
    nroAbono:    abonos.length + 1,          // Correlativo dentro de la factura
    monto:       Number(paymentData.monto),
    medioPago:   paymentData.medioPago   || "Efectivo",
    observacion: paymentData.observacion || "",
    fecha:       paymentData.fecha,
    createdAt:   new Date().toISOString(), // Timestamp real para regla de 48h
    anulado:     false
  }

  accounts[clienteIndex].facturas[facturaIndex].abonos.push(newPayment)

  saveAccounts(accounts)

  return newPayment
}


/* -----------------------------------------------------------------------
   Anula un abono de una factura específica.

   REGLAS DE NEGOCIO:
     1. Requiere la contraseña del Administrador registrado en "users".
     2. Solo se puede anular dentro de las 48 horas desde createdAt.
     3. No se puede anular un abono que ya fue anulado.

   @param {number} clienteId  - id del cliente
   @param {number} facturaId  - id de la factura
   @param {number} abonoId    - id del abono a anular
   @param {string} reason     - motivo de la anulación
   @param {string} password   - contraseña del administrador

   @returns {boolean} true si anuló correctamente, o lanza Error.
----------------------------------------------------------------------- */
export const cancelPayment = (clienteId, facturaId, abonoId, reason, password) => {

  // Validar contraseña del administrador
  const users = JSON.parse(localStorage.getItem("users")) || []
  const admin = users.find(user => user.role === "Administrador")

  if (!admin || admin.password !== password) {
    throw new Error("Contraseña del administrador incorrecta.")
  }

  const accounts = getAccounts()

  const clienteIndex = accounts.findIndex(
    acc => acc.id === Number(clienteId)
  )

  if (clienteIndex === -1) {
    throw new Error("Cliente no encontrado.")
  }

  const facturaIndex = accounts[clienteIndex].facturas.findIndex(
    fac => fac.id === Number(facturaId)
  )

  if (facturaIndex === -1) {
    throw new Error("Factura no encontrada.")
  }

  const abonoIndex = accounts[clienteIndex].facturas[facturaIndex].abonos.findIndex(
    abono => abono.id === abonoId
  )

  if (abonoIndex === -1) {
    throw new Error("Abono no encontrado.")
  }

  const abono = accounts[clienteIndex].facturas[facturaIndex].abonos[abonoIndex]

  // Validar que no esté ya anulado
  if (abono.anulado) {
    throw new Error("Este abono ya fue anulado.")
  }

  // Validar regla de 48 horas
  if (abono.createdAt) {
    const diffHours = (new Date() - new Date(abono.createdAt)) / (1000 * 60 * 60)
    if (diffHours > 48) {
      throw new Error("No se puede anular un abono después de 48 horas.")
    }
  }

  // Marcar como anulado y registrar metadatos
  abono.anulado            = true
  abono.motivoCancelacion  = reason
  abono.cancelledAt        = new Date().toISOString()

  saveAccounts(accounts)

  return true
}


/* -----------------------------------------------------------------------
   Aplica un porcentaje de interés al valorCredito de una factura.
   Aumenta el valorCredito original en el % indicado sobre el saldo actual.

   @param {number} clienteId   - id del cliente
   @param {number} facturaId   - id de la factura
   @param {number} percentage  - porcentaje de interés (ej: 5 = 5%)

   @returns {Object} La factura actualizada, o null si no se encontró.
----------------------------------------------------------------------- */
export const applyInterest = (clienteId, facturaId, percentage) => {

  const accounts = getAccounts()

  const clienteIndex = accounts.findIndex(
    acc => acc.id === Number(clienteId)
  )

  if (clienteIndex === -1) return null

  const facturaIndex = accounts[clienteIndex].facturas.findIndex(
    fac => fac.id === Number(facturaId)
  )

  if (facturaIndex === -1) return null

  const factura     = accounts[clienteIndex].facturas[facturaIndex]
  const saldoActual = calculateSaldoFactura(factura)

  // El interés se calcula sobre el saldo pendiente, no sobre el valor original
  const interestAmount = (saldoActual * percentage) / 100
  factura.valorCredito += interestAmount

  saveAccounts(accounts)

  return factura
}