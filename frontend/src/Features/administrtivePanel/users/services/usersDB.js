// ─── Servicio de base de datos simulada para usuarios ──────────────────────────
/**
 * Este archivo simula una base de datos usando localStorage para persistir usuarios.
 * Incluye seed de datos iniciales, generación de contraseñas y operaciones CRUD.
 * En producción, reemplazar con API backend.
 */

const STORAGE_KEY = "users";
const SEED_VERSION = "users_v5";

// ─── Generador de contraseña automática ───────────────────────────
/**
 * Genera una contraseña aleatoria de 10 caracteres: 2 letras, 2 dígitos y 6 caracteres mixtos, mezclados.
 * @returns {string} Contraseña generada.
 */
const generatePassword = () => {

  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const all = letters + digits;

  let pwd = "";

  pwd += letters[Math.floor(Math.random() * letters.length)];
  pwd += letters[Math.floor(Math.random() * letters.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];

  for (let i = 0; i < 6; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  return pwd
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

};

// ─── Tipos de cliente ─────────────────────────────────────────────
/**
 * Lista de tipos de cliente disponibles en el sistema.
 */
export const CLIENT_TYPES = [
  "Detal",
  "Mayorista",
  "Colegas",
  "Por paca"
];

// ─── Usuarios iniciales del sistema ───────────────────────────────
/**
 * Datos seed para inicializar la base de datos con usuarios de ejemplo.
 * Incluye variedad de tipos de documento y estados.
 */
const SEED_USERS = [

  // ── Usuarios con rol administrativo ───────────────────────────
  {
    id: 1,
    documentType: "CC",
    document: "10245873",
    name: "Yorman Alirio Ocampo Giraldo",
    email: "yorman.ocampo@gmail.com",
    phone: "3204567890",
    role: 'Nulo',
    clientType: "Detal",
    active: true,
    createdAt: "2024-01-15T08:00:00.000Z",
    password: generatePassword()
  },

  {
    id: 2,
    documentType: "CC",
    document: "32156478",
    name: "Laura Milena Restrepo Cardona",
    email: "laura.restrepo@gmail.com",
    phone: "3112345678",
    role: 'Nulo',
    clientType: "Detal",
    active: true,
    createdAt: "2024-02-03T09:30:00.000Z",
    password: generatePassword()
  },

  // ── Vendedores ─────────────────────────────────────────────────
  {
    id: 3,
    documentType: "CC",
    document: "71389204",
    name: "Carlos Andrés Muñoz Zapata",
    email: "carlos.munoz@empresa.com",
    phone: "3015589234",
    role: 'Nulo',
    clientType: "Mayorista",
    active: true,
    createdAt: "2024-03-10T10:00:00.000Z",
    password: generatePassword()
  },

  {
    id: 4,
    documentType: "CC",
    document: "43872651",
    name: "Diana Patricia Herrera Ríos",
    email: "diana.herrera@hotmail.com",
    phone: "3187654321",
    role: 'Nulo',
    clientType: "Colegas",
    active: true,
    createdAt: "2024-03-22T14:15:00.000Z",
    password: generatePassword()
  },

  {
    id: 5,
    documentType: "CC",
    document: "98541236",
    name: "Sebastián Felipe Agudelo Torres",
    email: "sebas.agudelo@gmail.com",
    phone: "3009871234",
    role: 'Nulo',
    clientType: "Por paca",
    active: false,
    createdAt: "2024-04-05T11:45:00.000Z",
    password: generatePassword()
  },

  // ── Cajeros ────────────────────────────────────────────────────
  {
    id: 6,
    documentType: "CC",
    document: "25478963",
    name: "Marcela Johana Ospina Vélez",
    email: "marcela.ospina@outlook.com",
    phone: "3145678901",
    role: 'Nulo',
    clientType: "Detal",
    active: true,
    createdAt: "2024-05-18T08:30:00.000Z",
    password: generatePassword()
  },

  // ── Clientes sin rol (solo clientes) ──────────────────────────
  {
    id: 7,
    documentType: "CC",
    document: "15963748",
    name: "Jorge Iván Castillo Bermúdez",
    email: "jorge.castillo@gmail.com",
    phone: "3223456789",
    role: 'Nulo',
    clientType: "Mayorista",
    active: true,
    createdAt: "2024-06-01T09:00:00.000Z",
    password: generatePassword()
  },

  {
    id: 8,
    documentType: "CC",
    document: "52147836",
    name: "Natalia Andrea Gómez Salazar",
    email: "natalia.gomez@yahoo.com",
    phone: "3104567890",
    role: 'Nulo',
    clientType: "Por paca",
    active: true,
    createdAt: "2024-06-20T16:00:00.000Z",
    password: generatePassword()
  },

  {
    id: 9,
    documentType: "CC",
    document: "80234567",
    name: "Andrés Camilo Vargas Moreno",
    email: "andres.vargas@gmail.com",
    phone: "3167891234",
    role: 'Nulo',
    clientType: "Colegas",
    active: false,
    createdAt: "2024-07-14T13:20:00.000Z",
    password: generatePassword()
  },

  // ── Cédula de Extranjería ──────────────────────────────────────
  {
    id: 10,
    documentType: "CE",
    document: "847321",
    name: "Valentina Morales Fuentes",
    email: "vale.morales@gmail.com",
    phone: "3052345678",
    role: 'Nulo',
    clientType: "Detal",
    active: true,
    createdAt: "2024-08-08T10:10:00.000Z",
    password: generatePassword()
  },

  {
    id: 11,
    documentType: "CE",
    document: "963258",
    name: "Miguel Ángel Pérez Castañeda",
    email: "miguel.perez@empresa.co",
    phone: "3193456789",
    role: 'Nulo',
    clientType: "Mayorista",
    active: true,
    createdAt: "2024-09-03T08:45:00.000Z",
    password: generatePassword()
  },

  // ── NIT (empresas) ─────────────────────────────────────────────
  {
    id: 12,
    documentType: "NIT",
    document: "900123456",
    name: "Distribuidora El Éxito SAS",
    email: "compras@distribuidoraelexito.com",
    phone: "6042345678",
    role: 'Nulo',
    clientType: "Mayorista",
    active: true,
    createdAt: "2024-09-25T07:30:00.000Z",
    password: generatePassword()
  },

  {
    id: 13,
    documentType: "NIT",
    document: "860987654",
    name: "Comercializadora Andina Ltda",
    email: "info@comercializadoraandina.co",
    phone: "6013456789",
    role: 'Nulo',
    clientType: "Por paca",
    active: false,
    createdAt: "2024-10-10T11:00:00.000Z",
    password: generatePassword()
  },

  // ── Tarjeta de Identidad ───────────────────────────────────────
  {
    id: 14,
    documentType: "TI",
    document: "1023456789",
    name: "Santiago Alejandro Ruiz Patiño",
    email: "santiago.ruiz@gmail.com",
    phone: "3211234567",
    role: 'Nulo',
    clientType: "Detal",
    active: true,
    createdAt: "2024-11-02T15:00:00.000Z",
    password: generatePassword()
  },

  // ── Pasaporte ──────────────────────────────────────────────────
  {
    id: 15,
    documentType: "PP",
    document: "AB12345",
    name: "Isabella Chen Rodríguez",
    email: "isabella.chen@gmail.com",
    phone: "3178901234",
    role: 'Nulo',
    clientType: "Colegas",
    active: true,
    createdAt: "2024-12-01T09:20:00.000Z",
    password: generatePassword()
  },

];

// ─── Sembrar base de datos si está vacía ──────────────────────────
/**
 * Inicializa localStorage con datos seed si está vacío o la versión cambió.
 */
const seedUsers = () => {
  try {
    const currentVersion = localStorage.getItem(`${STORAGE_KEY}_seed_version`);
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0 || currentVersion !== SEED_VERSION) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(SEED_USERS)
      );
      localStorage.setItem(
        `${STORAGE_KEY}_seed_version`,
        SEED_VERSION
      );
    }
  } catch {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(SEED_USERS)
    );
  }
};

seedUsers();

// ─── Servicio de usuarios ─────────────────────────────────────────
/**
 * Objeto que simula operaciones de base de datos para usuarios.
 */
export const UsersDB = {
  /**
   * Obtiene la lista completa de usuarios desde localStorage.
   * @returns {Array} Lista de usuarios.
   */
  list() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Guarda la lista de usuarios en localStorage.
   * @param {Array} users - Lista de usuarios a guardar.
   */
  _save(users) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(users)
    );
  },

  /**
   * Crea un nuevo usuario con ID generado y contraseña automática.
   * @param {object} userData - Datos del usuario a crear.
   * @returns {object} Usuario creado.
   */
  create(userData) {
    const users = this.list();

    const newId =
      users.length > 0
        ? Math.max(...users.map((u) => u.id)) + 1
        : 1;

    const password = generatePassword();
    console.log(` Contraseña generada para "${userData.name}":`, password);

    const newUser = {
      id:           newId,
      name:         userData.name,
      documentType: userData.documentType,
      document:     userData.document,
      email:        userData.email.trim().toLowerCase(),
      phone:        userData.phone,
      role:         userData.role || null,
      clientType:   "Detal",
      active:       true,
      password,
      createdAt:    new Date().toISOString()
    };

    this._save([...users, newUser]);
    return newUser;
  },

  /**
   * Actualiza un usuario existente con los cambios proporcionados.
   * @param {number} id - ID del usuario a actualizar.
   * @param {object} changes - Cambios a aplicar.
   * @returns {Array} Lista actualizada de usuarios.
   */
  update(id, changes) {
    const users = this.list();
    const updated = users.map((u) =>
      u.id === id
        ? {
            ...u,
            ...changes,
            role: changes.role ?? u.role
          }
        : u
    );
    this._save(updated);
    return updated;
  },

  /**
   * Alterna el estado activo/inactivo de un usuario.
   * @param {number} id - ID del usuario.
   * @returns {Array} Lista actualizada de usuarios.
   */
  toggle(id) {
    const users = this.list();
    const updated = users.map((u) =>
      u.id === id
        ? { ...u, active: !u.active }
        : u
    );
    this._save(updated);
    return updated;
  },

  /**
   * Elimina un usuario de la lista.
   * @param {number} id - ID del usuario a eliminar.
   * @returns {Array} Lista actualizada de usuarios.
   */
  delete(id) {
    const users = this.list().filter(
      (u) => u.id !== id
    );
    this._save(users);
    return users;
  }
};

// ─── Exportaciones ────────────────────────────────────────────────
export { generatePassword };

export default UsersDB;