/* =============================================================================
   paymentsServices.js
   Servicios CRUD del módulo de Pagos y Abonos.
   Persiste los datos en localStorage bajo la clave "creditAccounts".
   Modelo: Cliente → facturas[] → abonos[]

   REGLA DE DISTRIBUCIÓN DE ABONOS (orden bancario):
     1° → cubre saldo de interés pendiente  (abono.tipo = "interes")
     2° → cubre saldo de capital pendiente  (abono.tipo = "capital")
     Si el monto cubre el interés completo, el resto va a capital.
============================================================================= */

import mockCreditAccounts from "./mockCreditAccounts";
import {
  calculateSaldoCapital,
  calculateSaldoInteres,
  calculateSaldoFactura,
} from "../utils/paymentHelpers";

const STORAGE_KEY = "creditAccounts";
const MOCK_VERSION_KEY = "creditAccounts_version";
const CURRENT_VERSION = "1.3"; // Incrementar cuando se actualicen los datos mock

/* -----------------------------------------------------------------------
   Carga los datos mock en localStorage solo si no existen o si la versión cambió.
----------------------------------------------------------------------- */
export const initializePayments = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  const currentVersion = localStorage.getItem(MOCK_VERSION_KEY);

  // Si no hay datos o la versión cambió, cargar datos mock
  if (!existing || currentVersion !== CURRENT_VERSION) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCreditAccounts));
    localStorage.setItem(MOCK_VERSION_KEY, CURRENT_VERSION);
    console.log(
      "Datos mock de pagos y abonos actualizados a versión",
      CURRENT_VERSION,
    );
  }
};

/* -----------------------------------------------------------------------
   Retorna el array completo de clientes desde localStorage.
----------------------------------------------------------------------- */
export const getAccounts = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/* -----------------------------------------------------------------------
   Retorna un cliente por su id, o undefined si no existe.
----------------------------------------------------------------------- */
export const getAccountById = (id) => {
  const accounts = getAccounts();
  return accounts.find((acc) => acc.id === id || acc.id === Number(id));
};

//Persiste el array completo de clientes en localStorage.

const saveAccounts = (accounts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

/* -----------------------------------------------------------------------
   Fuerza la recarga de datos mock (útil para desarrollo/testing)
----------------------------------------------------------------------- */
export const resetPaymentsData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCreditAccounts));
  localStorage.setItem(MOCK_VERSION_KEY, CURRENT_VERSION);

  // Notificar actualización
  window.dispatchEvent(new Event("paymentsUpdated"));

  console.log(
    "Datos mock de pagos y abonos reseteados a versión",
    CURRENT_VERSION,
  );
  return mockCreditAccounts;
};

// ── Función global para desarrollo ──────────────────────────────────────
if (typeof window !== "undefined") {
  window.resetPaymentsMock = resetPaymentsData;
}

/* -----------------------------------------------------------------------
   Registra uno o dos abonos en una factura aplicando la regla bancaria:
     1° cubre interés pendiente → abono.tipo = "interes"
     2° cubre capital pendiente → abono.tipo = "capital"

   Si el monto ingresado cubre el interés completo, el resto se aplica
   automáticamente al capital en un segundo abono del mismo movimiento.

   @param {string|number} clienteId   - id del cliente
   @param {string|number} facturaId   - id de la factura
   @param {Object}        paymentData - { monto, medioPago, observacion, fecha }

   @returns {Array} Array con los abonos creados (1 o 2 según distribución)
   @throws  {Error} Si cliente/factura no existen o el monto es inválido
----------------------------------------------------------------------- */
export const addPayment = (clienteId, facturaId, paymentData) => {
  const accounts = getAccounts();

  const clienteIndex = accounts.findIndex(
    (acc) => acc.id === clienteId || acc.id === Number(clienteId),
  );
  if (clienteIndex === -1) throw new Error("Cliente no encontrado.");

  const facturaIndex = accounts[clienteIndex].facturas.findIndex(
    (fac) => fac.id === facturaId || fac.id === Number(facturaId),
  );
  if (facturaIndex === -1) throw new Error("Factura no encontrada.");

  const factura = accounts[clienteIndex].facturas[facturaIndex];
  const saldoTotal = calculateSaldoFactura(factura);
  const montoIngreso = Number(paymentData.monto);

  // ── Validaciones ─────────────────────────────────────────────────────────
  if (montoIngreso <= 0) {
    throw new Error("El monto del abono debe ser mayor a cero.");
  }
  if (montoIngreso > saldoTotal) {
    throw new Error(
      `El monto (${montoIngreso.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}) ` +
        `supera el saldo pendiente (${saldoTotal.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}).`,
    );
  }

  const abonos = factura.abonos ?? [];
  const nextNro = abonos.length + 1;
  const createdAt = new Date().toISOString();
  const nuevosAbonos = [];

  const saldoInteres = calculateSaldoInteres(factura);
  const saldoCapital = calculateSaldoCapital(factura);

  let montoRestante = montoIngreso;

  // ── 1° Cubrir interés pendiente ───────────────────────────────────────────
  if (saldoInteres > 0 && montoRestante > 0) {
    const montoInteres = Math.min(montoRestante, saldoInteres);

    const abonoInteres = {
      id: Date.now(),
      nroAbono: nextNro,
      monto: montoInteres,
      medioPago: paymentData.medioPago || "Efectivo",
      observacion: paymentData.observacion
        ? `${paymentData.observacion} (interés)`
        : "Pago interés mora",
      fecha: paymentData.fecha,
      tipo: "interes",
      anulado: false,
      createdAt,
      cancelledAt: null,
      motivoCancelacion: null,
    };

    nuevosAbonos.push(abonoInteres);
    montoRestante -= montoInteres;
  }

  // ── 2° Cubrir capital pendiente ───────────────────────────────────────────
  if (saldoCapital > 0 && montoRestante > 0) {
    const montoCapital = Math.min(montoRestante, saldoCapital);

    const abonoCapital = {
      id: Date.now() + 1, // +1 para evitar colisión de id en el mismo ms
      nroAbono: nextNro + (nuevosAbonos.length > 0 ? 1 : 0),
      monto: montoCapital,
      medioPago: paymentData.medioPago || "Efectivo",
      observacion: paymentData.observacion || "Abono a capital",
      fecha: paymentData.fecha,
      tipo: "capital",
      anulado: false,
      createdAt,
      cancelledAt: null,
      motivoCancelacion: null,
    };

    nuevosAbonos.push(abonoCapital);
  }

  // ── Persistir ─────────────────────────────────────────────────────────────
  accounts[clienteIndex].facturas[facturaIndex].abonos.push(...nuevosAbonos);
  saveAccounts(accounts);

  return nuevosAbonos;
};

/* -----------------------------------------------------------------------
   Anula un abono de una factura específica.

   REGLAS DE NEGOCIO:
     1. Requiere contraseña del Administrador registrado en "users".
     2. Solo se puede anular dentro de las 48 horas desde createdAt.
     3. No se puede anular un abono ya anulado.

   @param {string|number} clienteId  - id del cliente
   @param {string|number} facturaId  - id de la factura
   @param {string|number} abonoId    - id del abono a anular
   @param {string}        reason     - motivo de la anulación
   @param {string}        password   - contraseña del administrador

   @returns {boolean} true si anuló correctamente
   @throws  {Error}   Si validación falla
----------------------------------------------------------------------- */
export const cancelPayment = (
  clienteId,
  facturaId,
  abonoId,
  reason,
  password,
) => {
  // Validar contraseña del administrador
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const admin = users.find((user) => user.role === "Administrador");

  if (!admin || admin.password !== password) {
    throw new Error("Contraseña del administrador incorrecta.");
  }

  const accounts = getAccounts();

  const clienteIndex = accounts.findIndex(
    (acc) => acc.id === clienteId || acc.id === Number(clienteId),
  );
  if (clienteIndex === -1) throw new Error("Cliente no encontrado.");

  const facturaIndex = accounts[clienteIndex].facturas.findIndex(
    (fac) => fac.id === facturaId || fac.id === Number(facturaId),
  );
  if (facturaIndex === -1) throw new Error("Factura no encontrada.");

  const abonoIndex = accounts[clienteIndex].facturas[
    facturaIndex
  ].abonos.findIndex((a) => a.id === abonoId);
  if (abonoIndex === -1) throw new Error("Abono no encontrado.");

  const abono =
    accounts[clienteIndex].facturas[facturaIndex].abonos[abonoIndex];

  if (abono.anulado) {
    throw new Error("Este abono ya fue anulado.");
  }

  if (abono.createdAt) {
    const diffHours =
      (new Date() - new Date(abono.createdAt)) / (1000 * 60 * 60);
    if (diffHours > 48) {
      throw new Error("No se puede anular un abono después de 48 horas.");
    }
  }

  abono.anulado = true;
  abono.motivoCancelacion = reason;
  abono.cancelledAt = new Date().toISOString();

  saveAccounts(accounts);
  return true;
};

/* -----------------------------------------------------------------------
   Aplica un porcentaje de interés sobre el saldo de capital pendiente
   de una factura específica.

   El interés se SUMA al campo factura.interes (no toca valorCredito),
   por lo que NO consume cupo del cliente.

   @param {string|number} clienteId  - id del cliente
   @param {string|number} facturaId  - id de la factura
   @param {number}        percentage - porcentaje (ej: 5 = 5%)

   @returns {Object|null} La factura actualizada, o null si no se encontró
----------------------------------------------------------------------- */
export const applyInterest = (clienteId, facturaId, percentage) => {
  const accounts = getAccounts();

  const clienteIndex = accounts.findIndex(
    (acc) => acc.id === clienteId || acc.id === Number(clienteId),
  );
  if (clienteIndex === -1) return null;

  const facturaIndex = accounts[clienteIndex].facturas.findIndex(
    (fac) => fac.id === facturaId || fac.id === Number(facturaId),
  );
  if (facturaIndex === -1) return null;

  const factura = accounts[clienteIndex].facturas[facturaIndex];
  const saldoCapital = calculateSaldoCapital(factura);

  // Interés se calcula sobre el saldo de CAPITAL (no sobre el interés previo)
  const nuevoInteres = Math.round((saldoCapital * percentage) / 100);

  // Se acumula sobre el interés existente
  factura.interes = (factura.interes ?? 0) + nuevoInteres;

  saveAccounts(accounts);
  return factura;
};

// ── Auto-inicializar al importar (igual que los demás módulos) ──
initializePayments();

/* =============================================================================
   INTEGRACIÓN CON VENTAS
   Las siguientes funciones conectan el módulo de Créditos con el de Ventas.
   Usan el campo "clienteUserId" (ID numérico de UsersDB) para identificar
   al cliente, sin alterar los IDs existentes del mock ("cliente-001", etc.).
============================================================================= */

/* -----------------------------------------------------------------------
   Busca la cuenta de crédito de un cliente por su ID numérico de UsersDB.
   Retorna null si el cliente no tiene cuenta de crédito registrada.

   @param {string|number} clienteId - ID numérico del cliente en UsersDB
   @returns {Object|null} La cuenta del cliente, o null
----------------------------------------------------------------------- */
export const findAccountByClienteId = (clienteId) => {
  const accounts = getAccounts();
  return (
    accounts.find((acc) => acc.clienteUserId === Number(clienteId)) ?? null
  );
};

/* -----------------------------------------------------------------------
   Retorna información del cupo de crédito de un cliente para validar
   antes de guardar una venta.

   @param {string|number} clienteId     - ID numérico del cliente en UsersDB
   @param {number}        creditoAsignado - Límite de crédito del cliente
   @returns {{ cupoDisponible, cupoOcupado, creditoAsignado, tieneCredito }}
----------------------------------------------------------------------- */
export const getCreditInfoForSale = (clienteId, creditoAsignado = 0) => {
  const account = findAccountByClienteId(clienteId);

  if (!account) {
    // El cliente no tiene cuenta aún — cupo disponible es el límite completo
    return {
      tieneCredito:    creditoAsignado > 0,
      creditoAsignado,
      cupoOcupado:     0,
      cupoDisponible:  creditoAsignado,
    };
  }

  // Calcular cupo ocupado solo con capital activo (igual que el módulo de pagos)
  const cupoOcupado = (account.facturas ?? []).reduce((total, factura) => {
    // Excluir facturas anuladas
    if (factura.anulada) return total;
    return total + calculateSaldoCapital(factura);
  }, 0);

  const cupoDisponible = Math.max(0, creditoAsignado - cupoOcupado);

  return {
    tieneCredito:    creditoAsignado > 0,
    creditoAsignado,
    cupoOcupado,
    cupoDisponible,
  };
};

/* -----------------------------------------------------------------------
   Crea una factura de crédito vinculada a una venta aprobada.
   Si el cliente no tiene cuenta de crédito, se crea una nueva entrada.

   SOLO se llama cuando:
     - La venta tiene método de pago "Crédito" (único método)
     - El estado de la venta es "Aprobada"

   @param {string|number} clienteId       - ID numérico del cliente en UsersDB
   @param {number}        creditoAsignado  - Límite de crédito del cliente
   @param {Object}        facturaData      - { nroFactura, valorCredito, fechaCredito }
   @returns {Object} La factura creada
----------------------------------------------------------------------- */
export const createFacturaForSale = (clienteId, creditoAsignado, facturaData) => {
  const accounts    = getAccounts();
  const numClienteId = Number(clienteId);

  // Buscar cuenta existente por clienteUserId
  let clienteIndex = accounts.findIndex(
    (acc) => acc.clienteUserId === numClienteId,
  );

  // Si no existe cuenta para este cliente, crear una nueva entrada
  if (clienteIndex === -1) {
    const newAccount = {
      id:             `sale-client-${numClienteId}`,
      clienteUserId:  numClienteId,
      creditoAsignado,
      facturas:       [],
    };
    accounts.push(newAccount);
    clienteIndex = accounts.length - 1;
  } else {
    // Actualizar creditoAsignado en caso de que haya cambiado
    accounts[clienteIndex].creditoAsignado = creditoAsignado;
  }

  const newFactura = {
    id:            `fac-sale-${facturaData.nroFactura}`,
    nroFactura:    facturaData.nroFactura,
    valorCredito:  facturaData.valorCredito,
    interes:       0,
    fechaCredito:  facturaData.fechaCredito,
    abonos:        [],
    // Campos de trazabilidad — identifican el origen en ventas
    fromSale:      true,
    saleFacturaNo: facturaData.nroFactura,
    anulada:       false,
  };

  accounts[clienteIndex].facturas.push(newFactura);
  saveAccounts(accounts);
  return newFactura;
};

/* -----------------------------------------------------------------------
   Anula la factura de crédito vinculada a una venta al momento de anularla.
   Marca la factura como anulada sin eliminarla (trazabilidad).

   @param {string|number} clienteId    - ID numérico del cliente en UsersDB
   @param {string}        saleFacturaNo - Número de factura de la venta
   @returns {boolean} true si anuló correctamente, false si no encontró
----------------------------------------------------------------------- */
export const voidFacturaFromSale = (clienteId, saleFacturaNo) => {
  const accounts     = getAccounts();
  const numClienteId = Number(clienteId);

  const clienteIndex = accounts.findIndex(
    (acc) => acc.clienteUserId === numClienteId,
  );
  if (clienteIndex === -1) return false;

  const facturaIndex = accounts[clienteIndex].facturas.findIndex(
    (fac) => fac.saleFacturaNo === saleFacturaNo,
  );
  if (facturaIndex === -1) return false;

  // Ya estaba anulada — no hacer nada
  if (accounts[clienteIndex].facturas[facturaIndex].anulada) return true;

  accounts[clienteIndex].facturas[facturaIndex].anulada       = true;
  accounts[clienteIndex].facturas[facturaIndex].fechaAnulacion =
    new Date().toLocaleDateString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  saveAccounts(accounts);
  return true;
};