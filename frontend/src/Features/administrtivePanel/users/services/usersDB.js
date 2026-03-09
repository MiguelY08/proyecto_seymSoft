const STORAGE_KEY  = 'pm_users';
const SEED_VERSION = 'users_v3'; // Incrementar si se modifica SEED_USERS

// ─── Generador de contraseña automática (mín. 8 caracteres, letras + números) ─
const generatePassword = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits  = '0123456789';
  const all     = letters + digits;
  // Garantizar al menos 2 letras y 2 números en los primeros 4 caracteres
  let pwd = '';
  pwd += letters[Math.floor(Math.random() * letters.length)];
  pwd += letters[Math.floor(Math.random() * letters.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  // Completar hasta 10 caracteres
  for (let i = 0; i < 6; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  // Mezclar para que no sea predecible
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

// ─── Tipos de cliente disponibles ────────────────────────────────────────────
export const TIPOS_CLIENTE = ['Detal', 'Mayorista', 'Colegas', 'Por paca'];

// ─── Usuarios de ejemplo (rol: 'Nulo' — se asignará desde módulo de Roles) ───
const SEED_USERS = [
  { id: 1,  tipo: 'CC', documento: '10245873',   nombre: 'Yorman Alirio Ocampo Giraldo',     correo: 'yorman.ocampo@gmail.com',       telefono: '3204567890', rol: 'Nulo', tipoCliente: 'Detal', activo: true,  registradoDesde: '01/01/2025', password: generatePassword() },
  { id: 2,  tipo: 'CC', documento: '32156478',   nombre: 'Laura Milena Restrepo Cardona',    correo: 'laura.restrepo@gmail.com',      telefono: '3112345678', rol: 'Nulo', tipoCliente: 'Detal', activo: true,  registradoDesde: '03/01/2025', password: generatePassword() },
  { id: 3,  tipo: 'CC', documento: '98745612',   nombre: 'Andrés Felipe Martínez Salazar',   correo: 'andres.martinez@hotmail.com',   telefono: '3008765432', rol: 'Nulo', tipoCliente: 'Detal', activo: true,  registradoDesde: '05/01/2025', password: generatePassword() },
  { id: 4,  tipo: 'CC', documento: '45236781',   nombre: 'Marcela Alejandra Gómez Ríos',     correo: 'marcela.gomez@yahoo.com',       telefono: '3154321098', rol: 'Nulo', tipoCliente: 'Detal', activo: true,  registradoDesde: '08/01/2025', password: generatePassword() },
  { id: 5,  tipo: 'CC', documento: '71892345',   nombre: 'Carlos Eduardo Vargas Herrera',    correo: 'carlos.vargas@gmail.com',       telefono: '3209876543', rol: 'Nulo', tipoCliente: 'Detal', activo: true,  registradoDesde: '10/01/2025', password: generatePassword() },
  { id: 6,  tipo: 'CE', documento: '987654',     nombre: 'Valentina Sofía Morales Peña',     correo: 'valentina.morales@gmail.com',   telefono: '3187654321', rol: 'Nulo', tipoCliente: 'Detal', activo: true,  registradoDesde: '12/01/2025', password: generatePassword() },
  { id: 7,  tipo: 'CC', documento: '12345678',   nombre: 'Juan Sebastián Torres Mendoza',    correo: 'juan.torres@outlook.com',       telefono: '3002345678', rol: 'Nulo', tipoCliente: 'Detal', activo: true,  registradoDesde: '15/01/2025', password: generatePassword() },
  { id: 8,  tipo: 'CC', documento: '55678912',   nombre: 'Diana Carolina Ruiz Aguirre',      correo: 'diana.ruiz@gmail.com',          telefono: '3143456789', rol: 'Nulo', tipoCliente: 'Detal', activo: false, registradoDesde: '17/01/2025', password: generatePassword() },
  { id: 9,  tipo: 'CC', documento: '88123456',   nombre: 'Miguel Ángel Castillo Duque',      correo: 'miguel.castillo@hotmail.com',   telefono: '3056789012', rol: 'Nulo', tipoCliente: 'Detal', activo: true,  registradoDesde: '20/01/2025', password: generatePassword() },
  { id: 10, tipo: 'TI', documento: '1037456789', nombre: 'Salomé Arias Quintero',            correo: 'salome.arias@gmail.com',        telefono: '3168901234', rol: 'Nulo', tipoCliente: 'Detal', activo: true,  registradoDesde: '22/01/2025', password: generatePassword() },
];

// ─── Sembrar con control de versión ───────────────────────────────────────────
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
    localStorage.setItem(`${STORAGE_KEY}_seed_version`, SEED_VERSION);
  }
};

seedUsers();

// ─── Servicio de Usuarios ─────────────────────────────────────────────────────
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

  // Crear nuevo usuario — genera contraseña automática
  create(userData) {
    const users = this.list();
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser = {
      ...userData,
      id:       newId,
      rol:        userData.rol || 'Nulo',
      tipoCliente: 'Detal', // inmutable — se gestiona desde el módulo de clientes
      activo:   true,
      password: generatePassword(),
      registradoDesde: new Date().toLocaleDateString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }),
    };
    this._save([...users, newUser]);
    return newUser;
  },

  // Actualizar usuario existente
  update(id, changes) {
    const users   = this.list();
    const updated = users.map((u) =>
      u.id === id ? { ...u, ...changes, rol: changes.rol || 'Nulo' } : u
    );
    this._save(updated);
    return updated;
  },

  // Activar / desactivar
  toggle(id) {
    const users   = this.list();
    const updated = users.map((u) => u.id === id ? { ...u, activo: !u.activo } : u);
    this._save(updated);
    return updated;
  },

  // Eliminar usuario
  delete(id) {
    const users = this.list().filter((u) => u.id !== id);
    this._save(users);
    return users;
  },
};

export { generatePassword };
export default UsersDB;