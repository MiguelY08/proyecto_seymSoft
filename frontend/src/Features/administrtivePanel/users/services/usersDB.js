const STORAGE_KEY = "users";
const SEED_VERSION = "users_v4";


// ─── Generador de contraseña automática ───────────────────────────
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
export const CLIENT_TYPES = [
  "Detal",
  "Mayorista",
  "Colegas",
  "Por paca"
];


// ─── Usuarios iniciales del sistema ───────────────────────────────
const SEED_USERS = [

  {
    id: 1,
    documentType: "CC",
    document: "10245873",
    name: "Yorman Alirio Ocampo Giraldo",
    email: "yorman.ocampo@gmail.com",
    phone: "3204567890",
    role: null,
    clientType: "Detal",
    active: true,
    createdAt: new Date().toISOString(),
    password: generatePassword()
  },

  {
    id: 2,
    documentType: "CC",
    document: "32156478",
    name: "Laura Milena Restrepo Cardona",
    email: "laura.restrepo@gmail.com",
    phone: "3112345678",
    role: null,
    clientType: "Detal",
    active: true,
    createdAt: new Date().toISOString(),
    password: generatePassword()
  }

];


// ─── Sembrar base de datos si está vacía ──────────────────────────
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
export const UsersDB = {

  // Obtener usuarios
  list() {

    try {

      const stored = localStorage.getItem(STORAGE_KEY);

      return stored ? JSON.parse(stored) : [];

    } catch {

      return [];

    }

  },


  // Guardar
  _save(users) {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(users)
    );

  },


  // Crear usuario (panel administrativo)
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

  // Actualizar usuario
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


  // Activar / desactivar usuario
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


  // Eliminar usuario
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