// ─── Clave de localStorage ────────────────────────────────────────────────────
const STORAGE_KEY = 'pm_users';

// ─── Usuarios de ejemplo (semilla) ───────────────────────────────────────────
const SEED_USERS = [
  { id: 1,  tipo: 'CC', documento: '10245873',  nombre: 'Yorman Alirio Ocampo Giraldo',     correo: 'yorman.ocampo@gmail.com',      telefono: '3204567890', rol: 'Administrador', activo: true,  registradoDesde: '01/01/2025' },
  { id: 2,  tipo: 'CC', documento: '32156478',  nombre: 'Laura Milena Restrepo Cardona',    correo: 'laura.restrepo@gmail.com',     telefono: '3112345678', rol: 'Empleado',      activo: true,  registradoDesde: '03/01/2025' },
  { id: 3,  tipo: 'CC', documento: '98745612',  nombre: 'Andrés Felipe Martínez Salazar',   correo: 'andres.martinez@hotmail.com',  telefono: '3008765432', rol: 'Empleado',      activo: true,  registradoDesde: '05/01/2025' },
  { id: 4,  tipo: 'CC', documento: '45236781',  nombre: 'Marcela Alejandra Gómez Ríos',     correo: 'marcela.gomez@yahoo.com',      telefono: '3154321098', rol: 'Cliente',       activo: true,  registradoDesde: '08/01/2025' },
  { id: 5,  tipo: 'CC', documento: '71892345',  nombre: 'Carlos Eduardo Vargas Herrera',    correo: 'carlos.vargas@gmail.com',      telefono: '3209876543', rol: 'Cliente',       activo: true,  registradoDesde: '10/01/2025' },
  { id: 6,  tipo: 'CE', documento: '987654',    nombre: 'Valentina Sofía Morales Peña',     correo: 'valentina.morales@gmail.com',  telefono: '3187654321', rol: 'Empleado',      activo: true,  registradoDesde: '12/01/2025' },
  { id: 7,  tipo: 'CC', documento: '12345678',  nombre: 'Juan Sebastián Torres Mendoza',    correo: 'juan.torres@outlook.com',      telefono: '3002345678', rol: 'Cliente',       activo: true,  registradoDesde: '15/01/2025' },
  { id: 8,  tipo: 'CC', documento: '55678912',  nombre: 'Diana Carolina Ruiz Aguirre',      correo: 'diana.ruiz@gmail.com',         telefono: '3143456789', rol: 'Cliente',       activo: false, registradoDesde: '17/01/2025' },
  { id: 9,  tipo: 'CC', documento: '88123456',  nombre: 'Miguel Ángel Castillo Duque',      correo: 'miguel.castillo@hotmail.com',  telefono: '3056789012', rol: 'Empleado',      activo: true,  registradoDesde: '20/01/2025' },
  { id: 10, tipo: 'TI', documento: '1037456789',nombre: 'Salomé Arias Quintero',            correo: 'salome.arias@gmail.com',       telefono: '3168901234', rol: 'Cliente',       activo: true,  registradoDesde: '22/01/2025' },
  { id: 11, tipo: 'CC', documento: '43219876',  nombre: 'Alejandro José Patiño Londoño',    correo: 'alejandro.patino@gmail.com',   telefono: '3012345670', rol: 'Cliente',       activo: true,  registradoDesde: '25/01/2025' },
  { id: 12, tipo: 'CC', documento: '66543219',  nombre: 'Natalia Paola Ospina Cano',        correo: 'natalia.ospina@yahoo.com',     telefono: '3124567891', rol: 'Empleado',      activo: true,  registradoDesde: '27/01/2025' },
  { id: 13, tipo: 'CC', documento: '23456789',  nombre: 'Santiago Esteban Jiménez Mora',    correo: 'santiago.jimenez@gmail.com',   telefono: '3196543210', rol: 'Cliente',       activo: false, registradoDesde: '30/01/2025' },
  { id: 14, tipo: 'CE', documento: '543210',    nombre: 'Isabella Fernanda López Arango',   correo: 'isabella.lopez@outlook.com',   telefono: '3078901234', rol: 'Cliente',       activo: true,  registradoDesde: '02/02/2025' },
  { id: 15, tipo: 'CC', documento: '77890123',  nombre: 'Daniel Esteban Ramírez Posada',    correo: 'daniel.ramirez@gmail.com',     telefono: '3161234567', rol: 'Empleado',      activo: true,  registradoDesde: '05/02/2025' },
  { id: 16, tipo: 'CC', documento: '34567891',  nombre: 'Camila Andrea Sánchez Vélez',      correo: 'camila.sanchez@hotmail.com',   telefono: '3023456781', rol: 'Cliente',       activo: true,  registradoDesde: '07/02/2025' },
  { id: 17, tipo: 'CC', documento: '56789012',  nombre: 'Sebastián David Gutiérrez Mejía',  correo: 'sebastian.gutierrez@gmail.com',telefono: '3135678902', rol: 'Cliente',       activo: true,  registradoDesde: '10/02/2025' },
  { id: 18, tipo: 'CC', documento: '89012345',  nombre: 'Juliana Marcela Castro Betancur',  correo: 'juliana.castro@gmail.com',     telefono: '3184567890', rol: 'Cliente',       activo: false, registradoDesde: '12/02/2025' },
  { id: 19, tipo: 'CC', documento: '11234567',  nombre: 'Tomás Alejandro Herrera Zuluaga',  correo: 'tomas.herrera@outlook.com',    telefono: '3047890123', rol: 'Empleado',      activo: true,  registradoDesde: '14/02/2025' },
  { id: 20, tipo: 'CC', documento: '67891234',  nombre: 'Manuela Sofía Álvarez Montoya',    correo: 'manuela.alvarez@gmail.com',    telefono: '3172345678', rol: 'Cliente',       activo: true,  registradoDesde: '17/02/2025' },
];

// ─── Sembrar usuarios si la key no existe o está vacía ───────────────────────
const seedUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
    }
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
  }
};

seedUsers();

// ─── Servicio de Usuarios ─────────────────────────────────────────────────────
export const UsersDB = {

  // Leer todos los usuarios
  list() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  // Guardar la lista completa (reemplaza todo)
  _save(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },

  // Crear nuevo usuario
  create(userData) {
    const users = this.list();
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser = {
      ...userData,
      id: newId,
      activo: true,
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
    const updated = users.map((u) => u.id === id ? { ...u, ...changes } : u);
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

export default UsersDB;