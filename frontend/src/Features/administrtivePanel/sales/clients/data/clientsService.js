// Clients Service - Local Storage CRUD operations

const STORAGE_KEYS = {
  CLIENTS: 'clients',
  CREDIT_ACCOUNTS: 'creditAccounts',
  PAYMENTS: 'payments'
};

// Initialize localStorage with sample data if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
    const sampleClients = [
      { 
        id: '1', 
        tipoPersona: 'natural',
        tipo: 'CC', 
        numero: '1094827365',  
        nombres: 'Carlos Ramírez', 
        apellidos: 'Gómez',
        nombreCompleto: 'Carlos Ramírez Gómez',
        correo: 'carlos.ramirez@gmail.com', 
        telefono: '3204568790', 
        tipoCliente: 'detal',     
        activo: true,
        direccion: 'Calle 45 #23-12',
        nombreContacto: 'Ana Ramírez',
        numeroContacto: '3204568791',
        creditoCliente: '5000000',
        rut: 'si',
        codigoCIU: '4669',
        clienteSince: '07/05/2023',
        createdAt: new Date().toISOString()
      },
      { 
        id: '2',  
        tipoPersona: 'natural',
        tipo: 'CE',  
        numero: '1029384756',  
        nombres: 'Ana Lucía', 
        apellidos: 'Torres',
        nombreCompleto: 'Ana Lucía Torres',
        correo: 'ana.torres@hotmail.com', 
        telefono: '3129087645', 
        tipoCliente: 'mayorista', 
        activo: true,
        direccion: 'Carrera 78 #34-56',
        nombreContacto: 'Pedro Torres',
        numeroContacto: '3129087646',
        creditoCliente: '10000000',
        rut: 'si',
        codigoCIU: '4670',
        clienteSince: '15/08/2023',
        createdAt: new Date().toISOString()
      },
      { 
        id: '3',  
        tipoPersona: 'juridica',
        tipo: 'NIT', 
        numero: '901457892-3', 
        nombres: 'Papelera El Punto', 
        apellidos: 'S.A.S',
        nombreCompleto: 'Papelera El Punto S.A.S',
        correo: 'contacto@papeleraelpunto.co', 
        telefono: '6013459876', 
        tipoCliente: 'mayorista', 
        activo: true,
        direccion: 'Av. El Dorado #45-67',
        nombreContacto: 'Luis Martínez',
        numeroContacto: '6013459877',
        creditoCliente: '20000000',
        rut: 'si',
        codigoCIU: '4689',
        clienteSince: '20/02/2023',
        createdAt: new Date().toISOString()
      },
      { 
        id: '4',  
        tipoPersona: 'natural',
        tipo: 'CC', 
        numero: '1002938475',  
        nombres: 'Jorge Enrique', 
        apellidos: 'Ríos',
        nombreCompleto: 'Jorge Enrique Ríos',
        correo: 'jorge.rios@yahoo.com', 
        telefono: '3115698234', 
        tipoCliente: 'detal',     
        activo: true,
        direccion: 'Calle 12 #34-56',
        nombreContacto: 'María Ríos',
        numeroContacto: '3115698235',
        creditoCliente: '3000000',
        rut: 'si',
        codigoCIU: '4669',
        clienteSince: '10/03/2023',
        createdAt: new Date().toISOString()
      },
      { 
        id: '5',  
        tipoPersona: 'natural',
        tipo: 'CC', 
        numero: '1109876543',  
        nombres: 'Natalia', 
        apellidos: 'Castaño López',
        nombreCompleto: 'Natalia Castaño López',
        correo: 'natalia.castano@gmail.com', 
        telefono: '3208796541', 
        tipoCliente: 'mayorista',     
        activo: true,
        direccion: 'Carrera 45 #67-89',
        nombreContacto: 'Andrés Castaño',
        numeroContacto: '3208796542',
        creditoCliente: '15000000',
        rut: 'si',
        codigoCIU: '4675',
        clienteSince: '05/06/2023',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(sampleClients));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CREDIT_ACCOUNTS)) {
    const sampleCreditAccounts = [
      {
        id: '1',
        clientId: '1',
        creditAmount: 5000000,
        balance: 3500000,
        interestRate: 1.5,
        payments: [],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        clientId: '2',
        creditAmount: 10000000,
        balance: 8200000,
        interestRate: 1.2,
        payments: [],
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        clientId: '3',
        creditAmount: 20000000,
        balance: 15000000,
        interestRate: 1.3,
        payments: [],
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(sampleCreditAccounts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  }
};

// Client CRUD operations
export const clientsService = {
  // Get all clients
  getAll: () => {
    initializeLocalStorage();
    const clients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return clients ? JSON.parse(clients) : [];
  },

  // Get client by ID
  getById: (id) => {
    const clients = clientsService.getAll();
    return clients.find(client => client.id === id) || null;
  },

  // Create new client - MODIFICADO: crédito opcional con valor por defecto 0
  create: (clientData) => {
    const clients = clientsService.getAll();
    const newId = (Math.max(...clients.map(c => parseInt(c.id)), 0) + 1).toString();
    
    const newClient = {
      id: newId,
      ...clientData,
      // ✅ Si no hay crédito o está vacío, poner '0'
      creditoCliente: clientData.creditoCliente || '0',
      nombreCompleto: `${clientData.nombres || ''} ${clientData.apellidos || ''}`.trim(),
      activo: true,
      clienteSince: new Date().toLocaleDateString('es-CO'),
      createdAt: new Date().toISOString()
    };

    const updatedClients = [...clients, newClient];
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updatedClients));
    
    // Create credit account for new client
    creditAccountService.createForClient(newClient.id, parseInt(newClient.creditoCliente) || 0);
    
    return newClient;
  },

  // Update client
  update: (id, clientData) => {
    const clients = clientsService.getAll();
    const index = clients.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    const updatedClient = {
      ...clients[index],
      ...clientData,
      // ✅ También aplicar la misma lógica en actualización
      creditoCliente: clientData.creditoCliente || clients[index].creditoCliente || '0',
      nombreCompleto: `${clientData.nombres || clients[index].nombres} ${clientData.apellidos || clients[index].apellidos}`.trim(),
      updatedAt: new Date().toISOString()
    };

    clients[index] = updatedClient;
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    
    return updatedClient;
  },

  // Delete client
  delete: (id) => {
    const clients = clientsService.getAll();
    const filteredClients = clients.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(filteredClients));
    
    // Also delete associated credit account and payments
    creditAccountService.deleteByClientId(id);
    paymentService.deleteByClientId(id);
    
    return true;
  },

  // Toggle client active status
  toggleActive: (id) => {
    const clients = clientsService.getAll();
    const index = clients.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    clients[index].activo = !clients[index].activo;
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    
    return clients[index];
  }
};

// Credit Account operations
export const creditAccountService = {
  getAll: () => {
    const accounts = localStorage.getItem(STORAGE_KEYS.CREDIT_ACCOUNTS);
    return accounts ? JSON.parse(accounts) : [];
  },

  getByClientId: (clientId) => {
    const accounts = creditAccountService.getAll();
    return accounts.find(acc => acc.clientId === clientId) || null;
  },

  createForClient: (clientId, initialCredit) => {
    const accounts = creditAccountService.getAll();
    const newAccount = {
      id: Date.now().toString(),
      clientId,
      creditAmount: initialCredit,
      balance: initialCredit,
      interestRate: 1.5,
      payments: [],
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify([...accounts, newAccount]));
    return newAccount;
  },

  updateBalance: (clientId, paymentAmount) => {
    const accounts = creditAccountService.getAll();
    const index = accounts.findIndex(acc => acc.clientId === clientId);
    
    if (index === -1) return null;

    accounts[index].balance = Math.max(0, accounts[index].balance - paymentAmount);
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(accounts));
    
    return accounts[index];
  },

  deleteByClientId: (clientId) => {
    const accounts = creditAccountService.getAll();
    const filteredAccounts = accounts.filter(acc => acc.clientId !== clientId);
    localStorage.setItem(STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(filteredAccounts));
  }
};

// Payment operations
export const paymentService = {
  getAll: () => {
    const payments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return payments ? JSON.parse(payments) : [];
  },

  getByClientId: (clientId) => {
    const payments = paymentService.getAll();
    return payments.filter(p => p.clientId === clientId);
  },

  create: (paymentData) => {
    const payments = paymentService.getAll();
    const newPayment = {
      id: Date.now().toString(),
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([...payments, newPayment]));
    
    // Update credit account balance
    creditAccountService.updateBalance(paymentData.clientId, paymentData.amount);
    
    return newPayment;
  },

  deleteByClientId: (clientId) => {
    const payments = paymentService.getAll();
    const filteredPayments = payments.filter(p => p.clientId !== clientId);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(filteredPayments));
  }
};

// Initialize on module load
initializeLocalStorage();