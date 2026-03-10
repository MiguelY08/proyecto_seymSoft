// Providers Service - Local Storage CRUD operations

const STORAGE_KEYS = {
  PROVIDERS: 'providers'
};

// Initialize localStorage with sample data if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PROVIDERS)) {
    const sampleProviders = [
      { id: 1,  tipo: 'CC',  numero: '1094827365',  nombre: 'Carlos Ramírez Gómez',        pContacto: 'Sebastian Bedoy',  nuContacto: '3204568790', categorias: 'Útiles escolares, Oficina', activo: true, tipoPersona: 'natural', nombres: 'Carlos', apellidos: 'Ramírez Gómez', telefono: '3204568790', correo: 'carlos@email.com', direccion: 'Calle 45 #23-12', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4669' },
      { id: 2,  tipo: 'CE',  numero: '1029384756',  nombre: 'Ana Lucía Torres',            pContacto: 'Santiago Espinoz', nuContacto: '3129087645', categorias: 'Papelería',                activo: true, tipoPersona: 'natural', nombres: 'Ana Lucía', apellidos: 'Torres', telefono: '3129087645', correo: 'ana@email.com', direccion: 'Carrera 78 #34-56', tipoCliente: 'minorista', rut: 'si', codigoCIU: '4670' },
      { id: 3,  tipo: 'NIT', numero: '901457892-3', nombre: 'Papelera El Punto S.A.S',     pContacto: 'Kelly Valencia',   nuContacto: '6013459876', categorias: 'Arte y manualidades',      activo: true, tipoPersona: 'juridica', nombres: 'Papelera El Punto', apellidos: 'S.A.S', telefono: '6013459876', correo: 'contacto@papelera.co', direccion: 'Av. El Dorado #45-67', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4689' },
      { id: 4,  tipo: 'CC',  numero: '1002938475',  nombre: 'Jorge Enrique Ríos',          pContacto: 'Emmanuel O',       nuContacto: '3115698234', categorias: 'Impresión y copiado',      activo: true, tipoPersona: 'natural', nombres: 'Jorge Enrique', apellidos: 'Ríos', telefono: '3115698234', correo: 'jorge@email.com', direccion: 'Calle 12 #34-56', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4669' },
      { id: 5,  tipo: 'CC',  numero: '1109876543',  nombre: 'Natalia Castaño López',       pContacto: 'Yorman A',         nuContacto: '3208796541', categorias: 'Tecnología y accesorios', activo: true, tipoPersona: 'natural', nombres: 'Natalia', apellidos: 'Castaño López', telefono: '3208796541', correo: 'natalia@email.com', direccion: 'Carrera 45 #67-89', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4675' },
      { id: 6,  tipo: 'NIT', numero: '901237845-9', nombre: 'Distribuciones Andina Ltda.', pContacto: 'Magnolia P',       nuContacto: '6043218790', categorias: 'Etiquetas adhesivas',      activo: true, tipoPersona: 'juridica', nombres: 'Distribuciones Andina', apellidos: 'Ltda.', telefono: '6043218790', correo: 'ventas@andina.co', direccion: 'Calle 50 #23-45', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4680' },
      { id: 7,  tipo: 'CE',  numero: '1039847265',  nombre: 'Pedro Alvarado Mendoza',      pContacto: 'Ana María',        nuContacto: '3117659870', categorias: 'Oficina',                  activo: true, tipoPersona: 'natural', nombres: 'Pedro', apellidos: 'Alvarado Mendoza', telefono: '3117659870', correo: 'pedro@email.com', direccion: 'Carrera 32 #45-67', tipoCliente: 'minorista', rut: 'si', codigoCIU: '4669' },
      { id: 8,  tipo: 'CC',  numero: '1092736452',  nombre: 'Laura Restrepo Ortiz',        pContacto: 'Ivan Bedoya',      nuContacto: '3149087234', categorias: 'Arte',                     activo: false, tipoPersona: 'natural', nombres: 'Laura', apellidos: 'Restrepo Ortiz', telefono: '3149087234', correo: 'laura@email.com', direccion: 'Calle 23 #45-67', tipoCliente: 'minorista', rut: 'si', codigoCIU: '4672' },
      { id: 9,  tipo: 'NIT', numero: '901984563-2', nombre: 'Industrias Bolívar S.A.',     pContacto: 'Marcela Ríos',     nuContacto: '6019087654', categorias: 'Industrial',               activo: true, tipoPersona: 'juridica', nombres: 'Industrias Bolívar', apellidos: 'S.A.', telefono: '6019087654', correo: 'contacto@bolivar.co', direccion: 'Av. Industrial #12-34', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4690' },
      { id: 10, tipo: 'CC',  numero: '1087654321',  nombre: 'Ricardo Peña Salazar',        pContacto: 'Claudia Torres',   nuContacto: '3008765432', categorias: 'Papelería, Arte',          activo: false, tipoPersona: 'natural', nombres: 'Ricardo', apellidos: 'Peña Salazar', telefono: '3008765432', correo: 'ricardo@email.com', direccion: 'Carrera 15 #78-90', tipoCliente: 'minorista', rut: 'no', codigoCIU: '4669' },
      { id: 11, tipo: 'CE',  numero: '1023984712',  nombre: 'Daniel Martínez Salazar',     pContacto: 'Sofía Vargas',     nuContacto: '3148650920', categorias: 'Útiles escolares',         activo: true, tipoPersona: 'natural', nombres: 'Daniel', apellidos: 'Martínez Salazar', telefono: '3148650920', correo: 'daniel@email.com', direccion: 'Calle 67 #89-12', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4678' },
      { id: 12, tipo: 'CC',  numero: '1089456721',  nombre: 'Natalia García Pardo',        pContacto: 'Felipe Mora',      nuContacto: '3156428790', categorias: 'Tecnología',               activo: true, tipoPersona: 'natural', nombres: 'Natalia', apellidos: 'García Pardo', telefono: '3156428790', correo: 'natalia.g@email.com', direccion: 'Carrera 23 #45-67', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4685' },
      { id: 13, tipo: 'CC',  numero: '1089456722',  nombre: 'Juan Pérez López',            pContacto: 'María Silva',      nuContacto: '3156428791', categorias: 'Tecnología',               activo: true, tipoPersona: 'natural', nombres: 'Juan', apellidos: 'Pérez López', telefono: '3156428791', correo: 'juan@email.com', direccion: 'Calle 34 #56-78', tipoCliente: 'minorista', rut: 'si', codigoCIU: '4685' },
      { id: 14, tipo: 'CC',  numero: '1089456723',  nombre: 'Andrea Martínez',             pContacto: 'Pedro García',     nuContacto: '3156428792', categorias: 'Tecnología',               activo: true, tipoPersona: 'natural', nombres: 'Andrea', apellidos: 'Martínez', telefono: '3156428792', correo: 'andrea@email.com', direccion: 'Carrera 45 #67-89', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4685' },
      { id: 15, tipo: 'CC',  numero: '1089456724',  nombre: 'Luis Fernando Ruiz',          pContacto: 'Carmen López',     nuContacto: '3156428793', categorias: 'Tecnología',               activo: true, tipoPersona: 'natural', nombres: 'Luis Fernando', apellidos: 'Ruiz', telefono: '3156428793', correo: 'luis@email.com', direccion: 'Calle 56 #78-90', tipoCliente: 'mayorista', rut: 'si', codigoCIU: '4685' }
    ];
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(sampleProviders));
  }
};

// Provider CRUD operations
export const providersService = {
  // Get all providers
  getAll: () => {
    initializeLocalStorage();
    const providers = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
    return providers ? JSON.parse(providers) : [];
  },

  // Get provider by ID
  getById: (id) => {
    const providers = providersService.getAll();
    return providers.find(provider => provider.id === id) || null;
  },

  // Create new provider
  create: (providerData) => {
    const providers = providersService.getAll();
    const newId = Math.max(...providers.map(p => p.id), 0) + 1;
    
    const newProvider = {
      id: newId,
      ...providerData,
      nombre: `${providerData.nombres || ''} ${providerData.apellidos || ''}`.trim(),
      pContacto: providerData.nombreContacto || '',
      nuContacto: providerData.numeroContacto || '',
      activo: true,
      createdAt: new Date().toISOString()
    };

    const updatedProviders = [...providers, newProvider];
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(updatedProviders));
    
    return newProvider;
  },

  // Update provider
  update: (id, providerData) => {
    const providers = providersService.getAll();
    const index = providers.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    const updatedProvider = {
      ...providers[index],
      ...providerData,
      nombre: `${providerData.nombres || providers[index].nombres} ${providerData.apellidos || providers[index].apellidos}`.trim(),
      pContacto: providerData.nombreContacto || providers[index].pContacto,
      nuContacto: providerData.numeroContacto || providers[index].nuContacto,
      updatedAt: new Date().toISOString()
    };

    providers[index] = updatedProvider;
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
    
    return updatedProvider;
  },

  // Delete provider
  delete: (id) => {
    const providers = providersService.getAll();
    const filteredProviders = providers.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(filteredProviders));
    return true;
  },

  // Toggle provider active status
  toggleActive: (id) => {
    const providers = providersService.getAll();
    const index = providers.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    providers[index].activo = !providers[index].activo;
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
    
    return providers[index];
  }
};

// Initialize on module load
initializeLocalStorage();