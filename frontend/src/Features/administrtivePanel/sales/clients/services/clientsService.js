import apiClient from '../../../../../setting/apiClient.js';

export const SYSTEM_CLIENT_ID = 999999999;

// ============================================
// VALIDACIÓN PARA numeric(10,2) DE POSTGRESQL
// ============================================
const MAX_NUMERIC_10_2 = 99999999.99;
const MIN_NUMERIC_10_2 = -99999999.99;

const validateAndFormatNumber = (value) => {
  if (!value && value !== 0) return '0';
  
  let num;
  if (typeof value === 'string') {
    let cleaned = value.replace(/,/g, '.').replace(/[^0-9.-]/g, '');
    num = parseFloat(cleaned);
  } else {
    num = parseFloat(value);
  }
  
  if (isNaN(num)) return '0';
  
  num = Math.round(num * 100) / 100;
  
  if (num > MAX_NUMERIC_10_2) {
    console.warn(` Valor ${num} excede el máximo, limitando a ${MAX_NUMERIC_10_2}`);
    return MAX_NUMERIC_10_2.toString();
  }
  
  if (num < MIN_NUMERIC_10_2) {
    console.warn(` Valor ${num} es menor que el mínimo, limitando a ${MIN_NUMERIC_10_2}`);
    return MIN_NUMERIC_10_2.toString();
  }
  
  const integerPart = Math.floor(Math.abs(num)).toString();
  if (integerPart.length > 8) {
    console.warn(` Valor ${num} tiene ${integerPart.length} dígitos enteros, excede el límite de 8`);
    return MAX_NUMERIC_10_2.toString();
  }
  
  return num.toString();
};

// ============================================
// SERVICIO PRINCIPAL DE CLIENTES
// ============================================
export const clientsService = {
  getAll: async (params = {}) => {
    const { page = 1, limit = 13, search = '', personType = '', idStatus = '' } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (personType) queryParams.append('personType', personType);
    if (idStatus) queryParams.append('idStatus', idStatus);
    
    const response = await apiClient.get(`/clients?${queryParams.toString()}`);
    const result = response.data;
    
    const clients = result.data.map(client => ({
      id: client.id,
      documentType: client.documentType,
      document: client.document,
      fullName: client.fullName,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      contactName: client.contactName,
      contactPhone: client.contactPhone,
      clientType: client.clientType,
      clientCredit: client.clientCredit,
      assignedCredit: client.assignedCredit ?? client.clientCredit,
      usedCredit: client.usedCredit,
      availableCredit: client.availableCredit,
      totalDebt: client.totalDebt,
      activeCredits: client.activeCredits,
      status: client.status,
      rut: client.rut,
      ciuCode: client.ciuCode,
      active: client.active,
      personType: client.personType,
      clientSince: client.clientSince,
      credit_balance: client.credit_balance,
      saldoFavor: client.credit_balance,
      isSystem: client.id === SYSTEM_CLIENT_ID
    }));
    
    return {
      data: clients,
      pagination: result.pagination
    };
  },

  getById: async (id) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data.data;
  },

  getClientPurchases: async (clientId) => {
    const response = await apiClient.get(`/clients/${clientId}/purchases`);
    return response.data.data;
  },

  getClientFinancialSummary: async (clientId) => {
    const response = await apiClient.get(`/clients/${clientId}/financial-summary`);
    return response.data.data;
  },

  getCreditBalanceEvents: async ({ clientId = null, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    params.append('limit', limit);
    const response = await apiClient.get(`/clients/credit-balance-events?${params.toString()}`);
    return response.data.data || [];
  },

  create: async (clientData) => {
    const formattedClientCredit = validateAndFormatNumber(clientData.clientCredit);
    
    const payload = {
      personType: clientData.personType || '',
      documentType: clientData.documentType || 'CC',
      document: clientData.document || '',
      firstName: clientData.firstName || '',
      lastName: clientData.lastName || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      address: clientData.address || '',
      contactName: clientData.contactName || null,
      contactPhone: clientData.contactPhone || null,
      clientType: clientData.clientType || '',
      clientCredit: formattedClientCredit,
      credit_balance: clientData.saldoFavor || '0', // ✅ Mapeado correctamente
      rut: clientData.rut || 'no',
      ciuCode: (clientData.ciuCode === 'No aplica' || !clientData.ciuCode) ? null : clientData.ciuCode
    };
    
    if (clientData.userId) {
      payload.userId = clientData.userId;
    }
    
    const response = await apiClient.post('/clients', payload);
    return response.data.data;
  },

  createOwnProfile: async (clientData) => {
    const response = await apiClient.post('/clients/me/profile', clientData);
    return response.data.data;
  },

  update: async (id, clientData) => {
    console.log('🔍 EDITANDO CLIENTE ID:', id);
    console.log('📦 Datos recibidos del formulario:', JSON.stringify(clientData, null, 2));
    
    const payload = {};
    
    if (clientData.address !== undefined) payload.address = clientData.address;
    if (clientData.phone !== undefined) payload.phone = clientData.phone;
    if (clientData.email !== undefined) payload.email = clientData.email;
    if (clientData.contactName !== undefined) payload.contactName = clientData.contactName;
    if (clientData.contactPhone !== undefined) payload.contactPhone = clientData.contactPhone;
    if (clientData.clientType !== undefined) payload.clientType = clientData.clientType;
    if (clientData.rut !== undefined) payload.rut = clientData.rut;
    
    if (clientData.clientCredit !== undefined) {
      payload.clientCredit = validateAndFormatNumber(clientData.clientCredit);
    }
    
    // ✅ Mapear saldoFavor → credit_balance
    if (clientData.saldoFavor !== undefined) {
      payload.credit_balance = validateAndFormatNumber(clientData.saldoFavor);
    }
    
    if (clientData.ciuCode !== undefined) {
      payload.ciuCode = (clientData.ciuCode === 'No aplica' || !clientData.ciuCode) ? null : clientData.ciuCode;
    }
    
    console.log('📤 Payload a enviar al backend:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await apiClient.put(`/clients/${id}`, payload);
      console.log('✅ Edición exitosa');
      return response.data.data;
    } catch (error) {
      if (error.response) {
        console.error('❌ ERROR DEL BACKEND:');
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      throw error;
    }
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },

  toggleActive: async (id) => {
    const response = await apiClient.patch(`/clients/${id}/status`);
    return response.data.data;
  }
};

// ============================================
// COMPATIBILIDAD CON OTROS MÓDULOS (NO ELIMINAR)
// ============================================
const STORAGE_KEYS = {
  CREDIT_ACCOUNTS: 'creditAccounts',
  PAYMENTS: 'payments',
};

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
    const accounts = creditAccountService.getAll();
    const validCredit = parseFloat(validateAndFormatNumber(initialCredit));
    const newAccount = {
      id: Date.now().toString(),
      clientId: String(clientId),
      creditAmount: validCredit,
      balance: validCredit,
      interestRate: 1.5,
      payments: [],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify([...accounts, newAccount]));
    return newAccount;
  },
  updateBalance: (clientId, paymentAmount) => {
    const accounts = creditAccountService.getAll();
    const index = accounts.findIndex(acc => acc.clientId === String(clientId));
    if (index === -1) return null;
    const validPayment = parseFloat(validateAndFormatNumber(paymentAmount));
    accounts[index].balance = Math.max(0, accounts[index].balance - validPayment);
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(accounts));
    return accounts[index];
  },
  reassignToSystem: (clientId) => {
    const accounts = creditAccountService.getAll();
    const updated = accounts.map(acc =>
      acc.clientId === String(clientId)
        ? { ...acc, clientId: String(SYSTEM_CLIENT_ID) }
        : acc
    );
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(updated));
  },
};

export const paymentService = {
  getAll: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return stored ? JSON.parse(stored) : [];
  },
  getByClientId: (clientId) => {
    return paymentService.getAll().filter(p => p.clientId === String(clientId));
  },
  reassignToSystem: (clientId) => {
    const payments = paymentService.getAll();
    const updated = payments.map(p =>
      p.clientId === String(clientId)
        ? { ...p, clientId: String(SYSTEM_CLIENT_ID) }
        : p
    );
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updated));
  },
};

export const saldoFavorService = {
  getByClientId: (clientId) => {
    const stored = localStorage.getItem('client_balance_favor');
    const balances = stored ? JSON.parse(stored) : {};
    const value = balances[String(clientId)] || 0;
    const num = parseFloat(value);
    if (num > MAX_NUMERIC_10_2) return MAX_NUMERIC_10_2;
    if (num < MIN_NUMERIC_10_2) return MIN_NUMERIC_10_2;
    return num;
  },
  setByClientId: (clientId, value) => {
    const stored = localStorage.getItem('client_balance_favor');
    const balances = stored ? JSON.parse(stored) : {};
    const validValue = parseFloat(validateAndFormatNumber(value));
    balances[String(clientId)] = validValue;
    localStorage.setItem('client_balance_favor', JSON.stringify(balances));
  }
};

export default clientsService;
