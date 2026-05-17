// Client Helper Functions
//
// Colección de utilidades para formateo, validación, filtrado y paginación
// usadas por los componentes de clientes. Mantiene la lógica reutilizable fuera
// de las vistas para facilitar el mantenimiento.

// Formatea un número como moneda COP sin decimales.
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Formatea teléfono con paréntesis y espacio (10 dígitos)
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

// Formatea teléfono de contacto sin paréntesis
export const formatContactPhone = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

// Verifica que el correo tenga formato válido
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Verifica que el teléfono sea numérico entre 7 y 10 dígitos
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{7,10}$/;
  return phoneRegex.test(phone);
};

// Comprueba que una cadena contenga solo números (o guiones para NIT)
export const isOnlyNumbers = (value) => {
  const numbersRegex = /^[0-9-]+$/;
  return numbersRegex.test(value);
};

// Comprueba que solo haya letras y espacios en la cadena
export const isOnlyLetters = (value) => {
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return lettersRegex.test(value);
};

// Calcula saldo restante restando pagos al crédito total
export const calculateBalance = (creditAmount, payments = []) => {
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  return Math.max(0, creditAmount - totalPayments);
};

// Calcula interés simple según balance, tasa y días
export const calculateInterest = (balance, rate, days = 30) => {
  return (balance * (rate / 100) * days) / 360;
};

// Devuelve clases de CSS para el badge de estado según activo
export const getStatusBadgeClass = (isActive) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

// Devuelve texto 'Activo'/'Inactivo' según banderilla
export const getStatusText = (isActive) => {
  return isActive ? 'Activo' : 'Inactivo';
};

// Formatea una fecha ISO a formato local colombiano
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO');
};

// Convierte la primera letra de una palabra a mayúscula
export const capitalizeFirst = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Transforma el tipo de persona a texto legible
export const formatPersonType = (tipoPersona) => {
  if (tipoPersona === 'natural') return 'Natural';
  if (tipoPersona === 'juridica') return 'Jurídica';
  return 'N/A';
};

// Transforma el tipo de cliente a texto legible
export const formatClientType = (clientType) => {
  const val = (clientType || '').toLowerCase();
  if (val === 'detal')                       return 'Detal';
  if (val === 'mayorista')                   return 'Mayorista';
  if (val === 'colegas')                     return 'Colegas';
  if (val === 'por paca' || val === 'pacas') return 'Por paca';
  return 'N/A';
};

// Convierte el valor de RUT a Sí/No o N/A
export const formatRut = (rut) => {
  if (rut === 'si') return 'Sí';
  if (rut === 'no') return 'No';
  return 'N/A';
};

// Filtra clientes en función del término de búsqueda (nombre, doc, etc.)
// Soporta búsqueda combinada "CC 123456" o "cc 123456" para Tipo y Documento.
export const filterClients = (clients, searchTerm) => {
  if (!searchTerm) return clients;

  const term   = searchTerm.toLowerCase().trim();
  const parts  = term.split(/\s+/);
  const TIPOS  = ['cc', 'ce', 'nit', 'ti', 'pp'];

  // Detectar búsqueda combinada: primera parte es un tipo de documento
  const isCombined = parts.length >= 2 && TIPOS.includes(parts[0]);
  const tipoTerm   = isCombined ? parts[0] : null;
  const numTerm    = isCombined ? parts.slice(1).join(' ') : null;

  return clients.filter(client => {
    // Búsqueda combinada: tipo Y número deben coincidir
    if (isCombined) {
      return (
        client.documentType?.toLowerCase() === tipoTerm &&
        client.document?.toLowerCase().includes(numTerm)
      );
    }

    // Búsqueda normal en todos los campos
    return (
      client.fullName?.toLowerCase().includes(term)      ||
      client.document?.toLowerCase().includes(term)      ||
      client.documentType?.toLowerCase().includes(term)  ||
      client.email?.toLowerCase().includes(term)         ||
      client.clientType?.toLowerCase().includes(term)    ||
      client.phone?.toLowerCase().includes(term)
    );
  });
};

// Pagina un arreglo devolviendo datos de la página actual y metadatos
export const paginateData = (data, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return {
    currentData: data.slice(startIndex, endIndex),
    totalPages: Math.max(1, Math.ceil(data.length / itemsPerPage)),
    startIndex,
    endIndex: Math.min(endIndex, data.length)
  };
};

// Realiza validación de todos los campos del formulario de cliente
export const validateClientForm = (formData) => {
  const errors = {};

  if (!formData.personType?.trim()) {
    errors.personType = 'Seleccione el tipo de persona';
  }

  if (!formData.documentType?.trim()) {
    errors.documentType = 'Seleccione el tipo de documento';
  }

  if (!formData.document || String(formData.document).trim() === '') {
    errors.document = 'El número es obligatorio';
  } else if (!isOnlyNumbers(String(formData.document))) {
    errors.document = 'Solo números permitidos';
  } else if (String(formData.document).replace(/\D/g, '').length > 19) {
    errors.document = 'Máximo 19 dígitos permitidos';
  }

  if (!formData.firstName?.trim()) {
    errors.firstName = 'El nombre es obligatorio';
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'Debe tener al menos 2 caracteres';
  } else if (!isOnlyLetters(formData.firstName)) {
    errors.firstName = 'Solo se permiten letras';
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = 'El apellido es obligatorio';
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = 'Debe tener al menos 2 caracteres';
  } else if (!isOnlyLetters(formData.lastName)) {
    errors.lastName = 'Solo se permiten letras';
  }

  if (!formData.address?.trim()) {
    errors.address = 'La dirección es obligatoria';
  }

  if (!formData.phone?.trim()) {
    errors.phone = 'El teléfono es obligatorio';
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'Teléfono inválido (7-10 dígitos)';
  }

  if (!formData.email?.trim()) {
    errors.email = 'El correo es obligatorio';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Correo inválido';
  }

  if (formData.contactName && formData.contactName.trim().length < 3) {
    errors.contactName = 'Debe tener mínimo 3 caracteres';
  }

  if (formData.contactPhone && !isOnlyNumbers(formData.contactPhone)) {
    errors.contactPhone = 'Solo números permitidos';
  }

  if (formData.clientCredit?.trim() && !isOnlyNumbers(formData.clientCredit)) {
    errors.clientCredit = 'Solo números permitidos';
  }

  if (formData.saldoFavor?.trim() && !isOnlyNumbers(formData.saldoFavor)) {
    errors.saldoFavor = 'Solo números permitidos';
  }

  if (!formData.clientType?.trim()) {
    errors.clientType = 'Seleccione el tipo de cliente';
  }

  if (!formData.rut?.trim()) {
    errors.rut = 'Indique si tiene RUT';
  }

  return errors;
};