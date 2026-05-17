import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/clients';

const getAuthToken = () => {
  return localStorage.getItem('accessToken') || '';
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getAuthToken()}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Error en la petición';
    throw new Error(message);
  }
);

export const SYSTEM_CLIENT_ID = 0;

// ============================================
// VALIDACIÓN PARA numeric(10,2) DE POSTGRESQL
// ============================================
const MAX_NUMERIC_10_2 = 99999999.99;
const MIN_NUMERIC_10_2 = -99999999.99;

const validateAndFormatNumber = (value) => {
  if (!value && value !== 0) return '0';
  
  let num;
  if (typeof value === 'string') {
    // Limpiar la cadena: reemplazar coma por punto y eliminar caracteres no numéricos excepto punto y menos
    let cleaned = value.replace(/,/g, '.').replace(/[^0-9.-]/g, '');
    num = parseFloat(cleaned);
  } else {
    num = parseFloat(value);
  }
  
  if (isNaN(num)) return '0';
  
  // Redondear a 2 decimales
  num = Math.round(num * 100) / 100;
  
  // Limitar al máximo permitido por numeric(10,2)
  if (num > MAX_NUMERIC_10_2) {
    console.warn(`⚠️ Valor ${num} excede el máximo, limitando a ${MAX_NUMERIC_10_2}`);
    return MAX_NUMERIC_10_2.toString();
  }
  
  if (num < MIN_NUMERIC_10_2) {
    console.warn(`⚠️ Valor ${num} es menor que el mínimo, limitando a ${MIN_NUMERIC_10_2}`);
    return MIN_NUMERIC_10_2.toString();
  }
  
  // Validar dígitos enteros (máximo 8)
  const integerPart = Math.floor(Math.abs(num)).toString();
  if (integerPart.length > 8) {
    console.warn(`⚠️ Valor ${num} tiene ${integerPart.length} dígitos enteros, excede el límite de 8`);
    return MAX_NUMERIC_10_2.toString();
  }
  
  return num.toString();
};

export const clientsService = {
  getAll: async (params = {}) => {
    const { page = 1, limit = 13, search = '', personType = '', idStatus = '' } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (personType) queryParams.append('personType', personType);
    if (idStatus) queryParams.append('idStatus', idStatus);
    
    const response = await api.get(`?${queryParams.toString()}`);
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
      credit_balance: client.credit_balance,
      saldoFavor: client.credit_balance,
      rut: client.rut,
      ciuCode: client.ciuCode,
      active: client.active,
      personType: client.personType,
      clientSince: client.clientSince,
      isSystem: false
    }));
    
    return {
      data: clients,
      pagination: result.pagination
    };
  },

  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.data;
  },

  create: async (clientData) => {
    // Validar y formatear los campos numéricos ANTES de enviar
    const formattedClientCredit = validateAndFormatNumber(clientData.clientCredit);
    const formattedCreditBalance = validateAndFormatNumber(clientData.saldoFavor || clientData.credit_balance);
    
    console.log('📤 Enviando al backend:', {
      clientCredit: formattedClientCredit,
      credit_balance: formattedCreditBalance
    });
    
    const response = await api.post('', {
      personType: clientData.personType,
      documentType: clientData.documentType,
      document: clientData.document,
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      email: clientData.email,
      phone: clientData.phone,
      address: clientData.address,
      contactName: clientData.contactName,
      contactPhone: clientData.contactPhone,
      clientType: clientData.clientType,
      clientCredit: formattedClientCredit,
      credit_balance: formattedCreditBalance,
      rut: clientData.rut,
      ciuCode: clientData.ciuCode === 'No aplica' ? null : clientData.ciuCode
    });
    return response.data.data;
  },

  update: async (id, clientData) => {
    const payload = {};
    
    if (clientData.address !== undefined) payload.address = clientData.address;
    if (clientData.phone !== undefined) payload.phone = clientData.phone;
    if (clientData.email !== undefined) payload.email = clientData.email;
    if (clientData.contactName !== undefined) payload.contactName = clientData.contactName;
    if (clientData.contactPhone !== undefined) payload.contactPhone = clientData.contactPhone;
    if (clientData.clientType !== undefined) payload.clientType = clientData.clientType;
    
    // Validar y formatear campos numéricos
    if (clientData.clientCredit !== undefined) {
      payload.clientCredit = validateAndFormatNumber(clientData.clientCredit);
    }
    if (clientData.saldoFavor !== undefined) {
      payload.credit_balance = validateAndFormatNumber(clientData.saldoFavor);
    }
    if (clientData.credit_balance !== undefined) {
      payload.credit_balance = validateAndFormatNumber(clientData.credit_balance);
    }
    
    if (clientData.rut !== undefined) payload.rut = clientData.rut;
    if (clientData.ciuCode !== undefined) payload.ciuCode = clientData.ciuCode === 'No aplica' ? '' : clientData.ciuCode;
    
    const response = await api.put(`/${id}`, payload);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/${id}`);
    return true;
  },

  toggleActive: async (id) => {
    const response = await api.patch(`/${id}/status`);
    return response.data.data;
  }
};

// ============================================
// SERVICIOS COMPATIBLES CON LOCALSTORAGE
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
    // Validar el crédito inicial
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
    // Asegurar que el valor devuelto respete el límite
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