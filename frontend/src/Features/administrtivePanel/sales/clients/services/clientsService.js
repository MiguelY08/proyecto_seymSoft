// Clients Service
//
// Clients are Users with isClient: true plus extra fields.
// All client data lives in 'users' via UsersDB.
// Credit accounts (creditAccounts) and payments (payments)
// are kept as separate stores, referencing by userId (as string).

import UsersDB from '../../../users/services/usersDB';

// ─── Storage keys (credit & payments only) ────────────────────────────────────
const STORAGE_KEYS = {
  CREDIT_ACCOUNTS: 'creditAccounts',
  PAYMENTS:        'payments',
  BALANCE_FAVOR:   'client_balance_favor',  // ← NUEVO: Saldo a favor
};

// ─── System client ────────────────────────────────────────────────────────────
// "Cliente de Caja" — reserved for point-of-sale cash transactions.
// Kept in memory only — never written to localStorage.
// Always active. Cannot be edited, toggled or deleted.
export const SYSTEM_CLIENT_ID = 0;

const SYSTEM_CLIENT = {
  id:           SYSTEM_CLIENT_ID,
  isClient:     true,
  isSystem:     true,
  documentType: 'CC',
  document:     '0000000000',
  name:         'Cliente de Caja',
  firstName:    'Cliente',
  lastName:     'de Caja',
  fullName:     'Cliente de Caja',
  email:        'caja@sistema.local',
  phone:        '0000000000',
  role:         null,
  clientType:   'Detal',
  active:       true,
  personType:   'natural',
  address:      'Punto de venta',
  contactName:  '',
  contactPhone: '',
  clientCredit: '0',
  saldoFavor:   '0',  // ← Solo para la vista, no se guarda en UsersDB
  rut:          'no',
  ciuCode:      '',
  clientSince:  '01/01/2024',
  createdAt:    '2024-01-01T00:00:00.000Z',
};

// ─── Seed for credit accounts ─────────────────────────────────────────────────
const initializeCreditAndPayments = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CREDIT_ACCOUNTS)) {
    // Seed accounts linked to promoted client users (ids 7–13)
    const sampleCreditAccounts = [
      { id: '1', clientId: '7',  creditAmount: 2000000,  balance: 2000000,  interestRate: 1.5, payments: [], createdAt: new Date().toISOString() },
      { id: '2', clientId: '8',  creditAmount: 8000000,  balance: 6500000,  interestRate: 1.2, payments: [], createdAt: new Date().toISOString() },
      { id: '3', clientId: '10', creditAmount: 0,        balance: 0,        interestRate: 1.5, payments: [], createdAt: new Date().toISOString() },
      { id: '4', clientId: '11', creditAmount: 5000000,  balance: 3200000,  interestRate: 1.3, payments: [], createdAt: new Date().toISOString() },
      { id: '5', clientId: '12', creditAmount: 20000000, balance: 15000000, interestRate: 1.2, payments: [], createdAt: new Date().toISOString() },
      { id: '6', clientId: '13', creditAmount: 10000000, balance: 10000000, interestRate: 1.4, payments: [], createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(sampleCreditAccounts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  }

  // ← NUEVO: Inicializar saldos a favor
  if (!localStorage.getItem(STORAGE_KEYS.BALANCE_FAVOR)) {
    localStorage.setItem(STORAGE_KEYS.BALANCE_FAVOR, JSON.stringify({}));
  }
};

// ─── Helper: map User → Client view ──────────────────────────────────────────
// Adds `fullName` as an alias for `name` for compatibility with ClientsTable.
const toClientView = (user) => {
  const saldoFavor = saldoFavorService.getByClientId(user.id);
  return { 
    ...user, 
    fullName: user.name,
    saldoFavor: String(saldoFavor)
  };
};

// ============================================================================
// Saldo a favor operations (para conectar con otros módulos)
// ============================================================================
export const saldoFavorService = {
  /**
   * Obtiene el saldo a favor de un cliente
   * @param {string|number} clientId - ID del cliente
   * @returns {number} Saldo a favor en número
   */
  getByClientId: (clientId) => {
    const stored = localStorage.getItem(STORAGE_KEYS.BALANCE_FAVOR);
    const balances = stored ? JSON.parse(stored) : {};
    return balances[String(clientId)] || 0;
  },

  /**
   * Actualiza el saldo a favor de un cliente
   * @param {string|number} clientId - ID del cliente
   * @param {number} amount - Nuevo saldo a favor
   */
  setBalance: (clientId, amount) => {
    const stored = localStorage.getItem(STORAGE_KEYS.BALANCE_FAVOR);
    const balances = stored ? JSON.parse(stored) : {};
    balances[String(clientId)] = Math.max(0, amount);
    localStorage.setItem(STORAGE_KEYS.BALANCE_FAVOR, JSON.stringify(balances));
  },

  /**
   * Suma un monto al saldo a favor existente
   * @param {string|number} clientId - ID del cliente
   * @param {number} amount - Monto a sumar
   */
  addBalance: (clientId, amount) => {
    const current = saldoFavorService.getByClientId(clientId);
    saldoFavorService.setBalance(clientId, current + amount);
  },

  /**
   * Resta un monto del saldo a favor
   * @param {string|number} clientId - ID del cliente
   * @param {number} amount - Monto a restar
   */
  subtractBalance: (clientId, amount) => {
    const current = saldoFavorService.getByClientId(clientId);
    saldoFavorService.setBalance(clientId, current - amount);
  },

  /**
   * Reasigna saldos a favor al cliente de sistema cuando se elimina un cliente
   */
  reassignToSystem: (clientId) => {
    const balance = saldoFavorService.getByClientId(clientId);
    if (balance > 0) {
      saldoFavorService.addBalance(SYSTEM_CLIENT_ID, balance);
      const stored = localStorage.getItem(STORAGE_KEYS.BALANCE_FAVOR);
      const balances = stored ? JSON.parse(stored) : {};
      delete balances[String(clientId)];
      localStorage.setItem(STORAGE_KEYS.BALANCE_FAVOR, JSON.stringify(balances));
    }
  },
};

// ============================================================================
// Client CRUD operations
// ============================================================================
export const clientsService = {
  /**
   * Returns all clients (users with isClient: true), prepended by the
   * system client. Initializes credit/payment stores if needed.
   */
  getAll: () => {
    initializeCreditAndPayments();
    const clients = UsersDB.list()
      .filter(u => u.isClient && !u.isSystem)
      .map(toClientView);
    return [toClientView(SYSTEM_CLIENT), ...clients];
  },

  getById: (id) => {
    if (id === SYSTEM_CLIENT_ID || id === String(SYSTEM_CLIENT_ID)) return toClientView(SYSTEM_CLIENT);
    const user = UsersDB.findById(Number(id));
    return user && user.isClient ? toClientView(user) : null;
  },

  /**
   * Creates a new client user and its credit account.
   * firstName + lastName → name for the User record.
   * Role is always null when created from the Clients module.
   */
  create: (clientData) => {
    const name = `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim();

    const newUser = UsersDB.create({
      name,
      firstName:    clientData.firstName    || '',
      lastName:     clientData.lastName     || '',
      documentType: clientData.documentType,
      document:     clientData.document,
      email:        clientData.email,
      phone:        clientData.phone,
      role:         null,
      clientType:   clientData.clientType   || 'Detal',
      isClient:     true,
      personType:   clientData.personType   || 'natural',
      address:      clientData.address      || '',
      contactName:  clientData.contactName  || '',
      contactPhone: clientData.contactPhone || '',
      clientCredit: clientData.clientCredit || '0',
      // ⚠️ NOTA: saldoFavor NO se guarda en UsersDB, solo en el almacenamiento separado
      rut:          clientData.rut          || 'no',
      ciuCode:      clientData.ciuCode      || '',
      clientSince:  new Date().toLocaleDateString('es-CO'),
    });

    creditAccountService.createForClient(
      String(newUser.id),
      parseInt(newUser.clientCredit) || 0
    );

    // ← NUEVO: Inicializar saldo a favor en almacenamiento separado
    saldoFavorService.setBalance(String(newUser.id), parseInt(clientData.saldoFavor) || 0);

    return toClientView(newUser);
  },

  /**
   * Updates a client user and its credit/payment data.
   * System client is protected — returns null without changes.
   */
  update: (id, clientData) => {
    if (id === SYSTEM_CLIENT_ID || id === String(SYSTEM_CLIENT_ID)) return null;
    const numId = Number(id);

    const user = UsersDB.findById(numId);
    if (!user || !user.isClient) return null;

    const name = `${clientData.firstName || user.firstName || ''} ${clientData.lastName || user.lastName || ''}`.trim();

    // Actualizar UsersDB - SIN el campo saldoFavor
    UsersDB.update(numId, {
      name,
      firstName:    clientData.firstName    ?? user.firstName,
      lastName:     clientData.lastName     ?? user.lastName,
      documentType: clientData.documentType ?? user.documentType,
      document:     clientData.document     ?? user.document,
      email:        clientData.email        ?? user.email,
      phone:        clientData.phone        ?? user.phone,
      clientType:   clientData.clientType   ?? user.clientType,
      personType:   clientData.personType   ?? user.personType,
      address:      clientData.address      ?? user.address,
      contactName:  clientData.contactName  ?? user.contactName,
      contactPhone: clientData.contactPhone ?? user.contactPhone,
      clientCredit: clientData.clientCredit || user.clientCredit || '0',
      // ⚠️ saldoFavor NO va aquí
      rut:          clientData.rut          ?? user.rut,
      ciuCode:      clientData.ciuCode      ?? user.ciuCode,
    });

    // ← NUEVO: Actualizar saldo a favor en almacenamiento separado
    if (clientData.saldoFavor !== undefined) {
      saldoFavorService.setBalance(String(numId), parseInt(clientData.saldoFavor) || 0);
    }

    const updated = UsersDB.findById(numId);
    return updated ? toClientView(updated) : null;
  },

  /**
   * Deletes a client user and reassigns their credit accounts and payments
   * to the system client (Cliente de Caja) for legal compliance.
   * System client is protected — returns false without changes.
   */
  delete: (id) => {
    if (id === SYSTEM_CLIENT_ID || id === String(SYSTEM_CLIENT_ID)) return false;
    const numId = Number(id);

    const user = UsersDB.findById(numId);
    if (!user || !user.isClient) return false;

    // Reassign financial records to system client before removing the user
    creditAccountService.reassignToSystem(String(numId));
    paymentService.reassignToSystem(String(numId));
    saldoFavorService.reassignToSystem(String(numId));  // ← NUEVO

    UsersDB.delete(numId);
    return true;
  },

  /**
   * Toggles the active state of a client user.
   * System client is protected — returns null without changes.
   */
  toggleActive: (id) => {
    if (id === SYSTEM_CLIENT_ID || id === String(SYSTEM_CLIENT_ID)) return null;
    const numId = Number(id);

    const user = UsersDB.findById(numId);
    if (!user || !user.isClient) return null;

    UsersDB.toggle(numId);
    return toClientView(UsersDB.findById(numId));
  },

  /**
   * Aplica un saldo a favor al cliente, reduciendo el balance de su cuenta de crédito.
   * Si el cliente no tiene cuenta de crédito, se crea una con balance cero y luego se aplica.
   * Registra un pago especial (método 'Saldo a favor') en el historial de pagos del cliente.
   *
   * @param {number} clientId - ID del cliente.
   * @param {number} monto - Monto a favor (positivo).
   * @param {string} motivo - Descripción del origen del saldo.
   * @returns {Object} La cuenta de crédito actualizada.
   */
  aplicarSaldoFavor: (clientId, monto, motivo = 'Saldo a favor') => {
    if (monto <= 0) throw new Error('El monto debe ser mayor a cero.');

    const clientIdStr = String(clientId);
    let account = creditAccountService.getByClientId(clientIdStr);

    // Si no existe cuenta de crédito, crear una con balance 0
    if (!account) {
      account = creditAccountService.createForClient(clientIdStr, 0);
    }

    // Reducir el balance (puede quedar negativo = crédito a favor)
    const nuevoBalance = account.balance - monto;
    const accounts = creditAccountService.getAll();
    const index = accounts.findIndex(acc => acc.clientId === clientIdStr);
    if (index !== -1) {
      accounts[index].balance = nuevoBalance;
      localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(accounts));
    }

    // Registrar el pago especial en el historial
    paymentService.create({
      clientId: clientIdStr,
      amount: monto,
      method: 'Saldo a favor',
      description: motivo,
    });

    return creditAccountService.getByClientId(clientIdStr);
  },
};

// ============================================================================
// Credit account operations
// ============================================================================
export const creditAccountService = {
  getAll: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.CREDIT_ACCOUNTS);
    return stored ? JSON.parse(stored) : [];
  },

  getByClientId: (clientId) => {
    const accounts = creditAccountService.getAll();
    return accounts.find(acc => acc.clientId === String(clientId)) || null;
  },

  createForClient: (clientId, initialCredit) => {
    const accounts   = creditAccountService.getAll();
    const newAccount = {
      id:           Date.now().toString(),
      clientId:     String(clientId),
      creditAmount: initialCredit,
      balance:      initialCredit,
      interestRate: 1.5,
      payments:     [],
      createdAt:    new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify([...accounts, newAccount]));
    return newAccount;
  },

  updateBalance: (clientId, paymentAmount) => {
    const accounts = creditAccountService.getAll();
    const index    = accounts.findIndex(acc => acc.clientId === String(clientId));
    if (index === -1) return null;

    accounts[index].balance = Math.max(0, accounts[index].balance - paymentAmount);
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(accounts));
    return accounts[index];
  },

  deleteByClientId: (clientId) => {
    const accounts = creditAccountService.getAll();
    localStorage.setItem(
      STORAGE_KEYS.CREDIT_ACCOUNTS,
      JSON.stringify(accounts.filter(acc => acc.clientId !== String(clientId)))
    );
  },

  /**
   * Reassigns all credit accounts of a deleted client to the system client
   * (Cliente de Caja) so financial history is preserved for legal compliance.
   */
  reassignToSystem: (clientId) => {
    const accounts = creditAccountService.getAll();
    const updated  = accounts.map(acc =>
      acc.clientId === String(clientId)
        ? { ...acc, clientId: String(SYSTEM_CLIENT_ID) }
        : acc
    );
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(updated));
  },
};

// ============================================================================
// Payment operations
// ============================================================================
export const paymentService = {
  getAll: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return stored ? JSON.parse(stored) : [];
  },

  getByClientId: (clientId) => {
    const payments = paymentService.getAll();
    return payments.filter(p => p.clientId === String(clientId));
  },

  create: (paymentData) => {
    const payments   = paymentService.getAll();
    const newPayment = {
      id:        Date.now().toString(),
      ...paymentData,
      clientId:  String(paymentData.clientId),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([...payments, newPayment]));
    creditAccountService.updateBalance(paymentData.clientId, paymentData.amount);
    return newPayment;
  },

  deleteByClientId: (clientId) => {
    const payments = paymentService.getAll();
    localStorage.setItem(
      STORAGE_KEYS.PAYMENTS,
      JSON.stringify(payments.filter(p => p.clientId !== String(clientId)))
    );
  },

  /**
   * Reassigns all payments of a deleted client to the system client
   * (Cliente de Caja) so financial history is preserved for legal compliance.
   */
  reassignToSystem: (clientId) => {
    const payments = paymentService.getAll();
    const updated  = payments.map(p =>
      p.clientId === String(clientId)
        ? { ...p, clientId: String(SYSTEM_CLIENT_ID) }
        : p
    );
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updated));
  },
};

// Initialize credit/payment stores on module load
initializeCreditAndPayments();