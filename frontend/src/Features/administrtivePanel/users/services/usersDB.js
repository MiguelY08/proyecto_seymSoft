// ─── Users database service ───────────────────────────────────────────────────
// Simulates a database using localStorage for user persistence.
// Includes seed data, password generation and CRUD operations.
// In production, replace with a real backend API.

const STORAGE_KEY  = 'users';
const SEED_VERSION = 'users_v7';

// ─── Password generator ───────────────────────────────────────────────────────
// Generates a random 10-character password: 2 letters, 2 digits, 6 mixed.
const generatePassword = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits  = '0123456789';
  const all     = letters + digits;

  let pwd = '';
  pwd += letters[Math.floor(Math.random() * letters.length)];
  pwd += letters[Math.floor(Math.random() * letters.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 0; i < 6; i++) pwd += all[Math.floor(Math.random() * all.length)];

  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

// ─── Internal name splitter ───────────────────────────────────────────────────
// Mirrors the splitName logic in usersHelpers without creating a circular dep.
// Used to keep firstName/lastName in sync when a client user's name changes.
const splitFullName = (fullName = '') => {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const mid   = words.length >= 2 ? Math.ceil(words.length / 2) : words.length;
  return {
    firstName: words.slice(0, mid).join(' '),
    lastName:  words.slice(mid).join(' '),
  };
};
// null / 'Nulo' → 'Detal'   |   any other role → 'Mayorista'
const clientTypeFromRole = (role) =>
  role && role !== 'Nulo' ? 'Mayorista' : 'Detal';

// ─── Seed data ────────────────────────────────────────────────────────────────
// Users 7, 8, 10, 11, 12, 13 are promoted to clients (isClient: true)
// and carry the extra client-specific fields.
const SEED_USERS = [

  // ── Internal / staff users ────────────────────────────────────────────────
  {
    id: 1, isClient: false, isSystem: false,
    documentType: 'CC', document: '10245873',
    name: 'Yorman Alirio Ocampo Giraldo',
    email: 'yorman.ocampo@gmail.com', phone: '3204567890',
    role: 'Nulo', clientType: 'Detal', active: true,
    createdAt: '2024-01-15T08:00:00.000Z', password: generatePassword(),
  },
  {
    id: 2, isClient: false, isSystem: false,
    documentType: 'CC', document: '32156478',
    name: 'Laura Milena Restrepo Cardona',
    email: 'laura.restrepo@gmail.com', phone: '3112345678',
    role: 'Nulo', clientType: 'Detal', active: true,
    createdAt: '2024-02-03T09:30:00.000Z', password: generatePassword(),
  },
  {
    id: 3, isClient: false, isSystem: false,
    documentType: 'CC', document: '71389204',
    name: 'Carlos Andrés Muñoz Zapata',
    email: 'carlos.munoz@empresa.com', phone: '3015589234',
    role: 'Nulo', clientType: 'Detal', active: true,
    createdAt: '2024-03-10T10:00:00.000Z', password: generatePassword(),
  },
  {
    id: 4, isClient: false, isSystem: false,
    documentType: 'CC', document: '43872651',
    name: 'Diana Patricia Herrera Ríos',
    email: 'diana.herrera@hotmail.com', phone: '3187654321',
    role: 'Nulo', clientType: 'Detal', active: true,
    createdAt: '2024-03-22T14:15:00.000Z', password: generatePassword(),
  },
  {
    id: 5, isClient: false, isSystem: false,
    documentType: 'CC', document: '98541236',
    name: 'Sebastián Felipe Agudelo Torres',
    email: 'sebas.agudelo@gmail.com', phone: '3009871234',
    role: 'Nulo', clientType: 'Detal', active: false,
    createdAt: '2024-04-05T11:45:00.000Z', password: generatePassword(),
  },
  {
    id: 6, isClient: false, isSystem: false,
    documentType: 'CC', document: '25478963',
    name: 'Marcela Johana Ospina Vélez',
    email: 'marcela.ospina@outlook.com', phone: '3145678901',
    role: 'Nulo', clientType: 'Detal', active: true,
    createdAt: '2024-05-18T08:30:00.000Z', password: generatePassword(),
  },

  // ── Promoted clients (isClient: true) ─────────────────────────────────────
  {
    id: 7, isClient: true, isSystem: false,
    documentType: 'CC', document: '15963748',
    name: 'Jorge Iván Castillo Bermúdez',
    firstName: 'Jorge Iván', lastName: 'Castillo Bermúdez',
    email: 'jorge.castillo@gmail.com', phone: '3223456789',
    role: 'Nulo', clientType: 'Detal', active: true,
    createdAt: '2024-06-01T09:00:00.000Z', password: generatePassword(),
    // Client fields
    personType: 'natural', address: 'Calle 50 #30-20, Barrio Boston',
    contactName: 'María Castillo', contactPhone: '3223456790',
    clientCredit: '2000000', rut: 'no', ciuCode: '4669',
    clientSince: '01/03/2024',
  },
  {
    id: 8, isClient: true, isSystem: false,
    documentType: 'CC', document: '52147836',
    name: 'Natalia Andrea Gómez Salazar',
    firstName: 'Natalia Andrea', lastName: 'Gómez Salazar',
    email: 'natalia.gomez@yahoo.com', phone: '3104567890',
    role: 'Nulo', clientType: 'Mayorista', active: true,
    createdAt: '2024-06-20T16:00:00.000Z', password: generatePassword(),
    personType: 'natural', address: 'Carrera 80 #12-45, Barrio Laureles',
    contactName: 'Carlos Gómez', contactPhone: '3104567891',
    clientCredit: '8000000', rut: 'si', ciuCode: '4675',
    clientSince: '15/04/2024',
  },
  {
    id: 9, isClient: false, isSystem: false,
    documentType: 'CC', document: '80234567',
    name: 'Andrés Camilo Vargas Moreno',
    email: 'andres.vargas@gmail.com', phone: '3167891234',
    role: 'Nulo', clientType: 'Detal', active: false,
    createdAt: '2024-07-14T13:20:00.000Z', password: generatePassword(),
  },
  {
    id: 10, isClient: true, isSystem: false,
    documentType: 'CE', document: '847321',
    name: 'Valentina Morales Fuentes',
    firstName: 'Valentina', lastName: 'Morales Fuentes',
    email: 'vale.morales@gmail.com', phone: '3052345678',
    role: 'Nulo', clientType: 'Colegas', active: true,
    createdAt: '2024-08-08T10:10:00.000Z', password: generatePassword(),
    personType: 'natural', address: 'Av. 33 #65-40, Barrio Estadio',
    contactName: '', contactPhone: '',
    clientCredit: '0', rut: 'no', ciuCode: '',
    clientSince: '20/06/2024',
  },
  {
    id: 11, isClient: true, isSystem: false,
    documentType: 'CE', document: '963258',
    name: 'Miguel Ángel Pérez Castañeda',
    firstName: 'Miguel Ángel', lastName: 'Pérez Castañeda',
    email: 'miguel.perez@empresa.co', phone: '3193456789',
    role: 'Nulo', clientType: 'Mayorista', active: true,
    createdAt: '2024-09-03T08:45:00.000Z', password: generatePassword(),
    personType: 'natural', address: 'Transversal 51 #70-10, Barrio Belén',
    contactName: 'Ana Pérez', contactPhone: '3193456790',
    clientCredit: '5000000', rut: 'si', ciuCode: '4670',
    clientSince: '10/07/2024',
  },
  {
    id: 12, isClient: true, isSystem: false,
    documentType: 'NIT', document: '900123456',
    name: 'Distribuidora El Éxito SAS',
    firstName: 'Distribuidora El Éxito', lastName: 'SAS',
    email: 'compras@distribuidoraelexito.com', phone: '6042345678',
    role: 'Nulo', clientType: 'Mayorista', active: true,
    createdAt: '2024-09-25T07:30:00.000Z', password: generatePassword(),
    personType: 'juridica', address: 'Calle 10 #43-20, Zona Industrial',
    contactName: 'Luis Alberto Mora', contactPhone: '6042345679',
    clientCredit: '20000000', rut: 'si', ciuCode: '4689',
    clientSince: '05/02/2024',
  },
  {
    id: 13, isClient: true, isSystem: false,
    documentType: 'NIT', document: '860987654',
    name: 'Comercializadora Andina Ltda',
    firstName: 'Comercializadora Andina', lastName: 'Ltda',
    email: 'info@comercializadoraandina.co', phone: '6013456789',
    role: 'Nulo', clientType: 'Por paca', active: false,
    createdAt: '2024-10-10T11:00:00.000Z', password: generatePassword(),
    personType: 'juridica', address: 'Carrera 52 #18-30, Centro Comercial',
    contactName: 'Rosa Martínez', contactPhone: '6013456790',
    clientCredit: '10000000', rut: 'si', ciuCode: '4680',
    clientSince: '12/03/2024',
  },
  {
    id: 14, isClient: false, isSystem: false,
    documentType: 'TI', document: '1023456789',
    name: 'Santiago Alejandro Ruiz Patiño',
    email: 'santiago.ruiz@gmail.com', phone: '3211234567',
    role: 'Nulo', clientType: 'Detal', active: true,
    createdAt: '2024-11-02T15:00:00.000Z', password: generatePassword(),
  },
  {
    id: 15, isClient: false, isSystem: false,
    documentType: 'PP', document: 'AB12345',
    name: 'Isabella Chen Rodríguez',
    email: 'isabella.chen@gmail.com', phone: '3178901234',
    role: 'Nulo', clientType: 'Detal', active: true,
    createdAt: '2024-12-01T09:20:00.000Z', password: generatePassword(),
  },
];

// ─── Seed initialization ──────────────────────────────────────────────────────
const seedUsers = () => {
  try {
    const currentVersion = localStorage.getItem(`${STORAGE_KEY}_seed_version`);
    const stored         = localStorage.getItem(STORAGE_KEY);
    const parsed         = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0 || currentVersion !== SEED_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
      localStorage.setItem(`${STORAGE_KEY}_seed_version`, SEED_VERSION);
    }
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
  }
};

seedUsers();

// ─── UsersDB ──────────────────────────────────────────────────────────────────
export const UsersDB = {

  list() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  _save(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },

  /**
   * Creates a new user with auto-generated id and password.
   * When isClient is true, client-specific fields are also stored.
   * @param {object} userData
   * @returns {object} Created user
   */
  create(userData) {
    const users = this.list();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const password = generatePassword();

    const newUser = {
      id:           newId,
      isClient:     userData.isClient  ?? false,
      isSystem:     userData.isSystem  ?? false,
      documentType: userData.documentType,
      document:     userData.document,
      name:         userData.name,
      email:        userData.email.trim().toLowerCase(),
      phone:        userData.phone,
      role:         userData.role || null,
      clientType:   userData.clientType || clientTypeFromRole(userData.role),
      active:       true,
      password,
      createdAt:    new Date().toISOString(),
      // Client-specific fields — only included when isClient is true
      ...(userData.isClient ? {
        firstName:    userData.firstName    || '',
        lastName:     userData.lastName     || '',
        personType:   userData.personType   || 'natural',
        address:      userData.address      || '',
        contactName:  userData.contactName  || '',
        contactPhone: userData.contactPhone || '',
        clientCredit: userData.clientCredit || '0',
        rut:          userData.rut          || 'no',
        ciuCode:      userData.ciuCode      || '',
        clientSince:  userData.clientSince  || new Date().toLocaleDateString('es-CO'),
      } : {}),
    };

    this._save([...users, newUser]);
    return newUser;
  },

  /**
   * Updates an existing user. Recalculates clientType when role changes.
   * Client-specific fields are updated via spread if present in changes.
   * @param {number} id
   * @param {object} changes
   * @returns {Array} Updated user list
   */
  update(id, changes) {
    const users   = this.list();
    const updated = users.map(u => {
      if (u.id !== id) return u;

      // When name changes on a client user, keep firstName/lastName in sync
      const nameSync = (changes.name !== undefined && u.isClient)
        ? splitFullName(changes.name)
        : {};

      return {
        ...u,
        ...changes,
        ...nameSync,
        role:       changes.role ?? u.role,
        clientType: changes.role !== undefined
          ? clientTypeFromRole(changes.role)
          : (changes.clientType ?? u.clientType),
      };
    });
    this._save(updated);
    return updated;
  },

  toggle(id) {
    const users   = this.list();
    const updated = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    this._save(updated);
    return updated;
  },

  delete(id) {
    const users = this.list().filter(u => u.id !== id);
    this._save(users);
    return users;
  },

  findById(id) {
    return this.list().find(u => u.id === id) || null;
  },
};

export { generatePassword };
export default UsersDB;