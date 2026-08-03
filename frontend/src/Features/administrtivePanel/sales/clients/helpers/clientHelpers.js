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
export const getEmailValidationError = (email) => {
  const value = String(email || '');
  const trimmed = value.trim();

  if (!trimmed) return 'El correo es obligatorio';
  if (trimmed.length > 100) return 'El correo no puede superar 100 caracteres';
  if (value !== trimmed) return 'El correo no debe empezar ni terminar con espacios';
  if (/\s/.test(trimmed)) return 'El correo no debe contener espacios';

  const atMatches = trimmed.match(/@/g) || [];
  if (atMatches.length === 0) return 'Al correo le falta el signo @';
  if (atMatches.length > 1) return 'El correo solo debe tener un signo @';

  const [localPart, domainPart] = trimmed.split('@');
  if (!localPart) return 'Al correo le falta el usuario antes del @';
  if (!domainPart) return 'Al correo le falta el dominio después del @';

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'El usuario del correo no debe empezar ni terminar con punto';
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return 'El dominio no debe empezar ni terminar con punto';
  }

  if (trimmed.includes('..')) return 'El correo no debe tener puntos seguidos';
  if (!domainPart.includes('.')) return 'Al dominio le falta la extensión, por ejemplo .com';

  const domainParts = domainPart.split('.');
  if (domainParts.some((part) => !part)) return 'El dominio tiene puntos mal ubicados';

  const extension = domainParts[domainParts.length - 1];
  if (extension.length < 2) return 'La extensión del correo debe tener mínimo 2 letras';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(trimmed)) return 'El correo tiene caracteres o formato no permitido';

  return '';
};

export const isValidEmail = (email) => !getEmailValidationError(email);

export const normalizeDocumentKey = (document) =>
  String(document || '').replace(/\D/g, '');

export const getDocumentValidationError = (document, documentType = 'CC') => {
  const value = String(document || '');
  const trimmed = value.trim();
  const type = String(documentType || '').toUpperCase();
  const isNit = type === 'NIT';
  const label = isNit ? 'NIT' : 'documento';
  const digitCount = normalizeDocumentKey(trimmed).length;

  if (!trimmed) return `El ${label} es obligatorio`;
  if (value !== trimmed) return `El ${label} no debe empezar ni terminar con espacios`;
  if (/\s/.test(trimmed)) return `El ${label} no debe contener espacios`;

  if (isNit) {
    if (/[^0-9-]/.test(trimmed)) return 'El NIT solo debe contener números y guiones';
    if (trimmed.startsWith('-') || trimmed.endsWith('-')) return 'El NIT no debe empezar ni terminar con guion';
    if (trimmed.includes('--')) return 'El NIT no debe tener guiones seguidos';
  } else if (/\D/.test(trimmed)) {
    return 'El documento solo debe contener números';
  }

  if (digitCount < 6) return `El ${label} debe tener al menos 6 dígitos`;
  if (digitCount > (isNit ? 19 : 15)) {
    return isNit ? 'El NIT permite máximo 19 dígitos' : 'El documento permite máximo 15 dígitos';
  }

  return '';
};

// Verifica que el teléfono sea numérico entre 7 y 10 dígitos
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{7,10}$/;
  return phoneRegex.test(phone);
};

// Comprueba que una cadena contenga solo números (o guiones para NIT)
export const isOnlyNumbers = (value) => {
  const numbersRegex = /^[0-9]+$/;
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
  } else if (formData.personType === 'juridica' && formData.documentType !== 'NIT') {
    errors.documentType = 'Una persona jurídica debe usar NIT';
  } else if (formData.personType === 'natural' && formData.documentType === 'NIT') {
    errors.documentType = 'Una persona natural no puede usar NIT';
  }

  if (!formData.document || String(formData.document).trim() === '') {
    errors.document = 'El número es obligatorio';
  } else if (!isOnlyNumbers(String(formData.document))) {
    errors.document = 'El documento solo debe contener números.';
  } else if (String(formData.document).length < 6) {
    errors.document = 'Debe tener al menos 6 caracteres';
  } else if (String(formData.document).replace(/\D/g, '').length > 19) {
    errors.document = 'Máximo 19 dígitos permitidos';
  }

  const isLegalPerson = formData.personType === 'juridica';

  const normalizedDocumentError = getDocumentValidationError(formData.document, formData.documentType);
  if (normalizedDocumentError) {
    errors.document = normalizedDocumentError;
  } else {
    delete errors.document;
  }

  if (!formData.firstName?.trim()) {
    errors.firstName = isLegalPerson ? 'El nombre de la empresa es obligatorio' : 'El nombre es obligatorio';
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'Debe tener al menos 2 caracteres';
  } else if (!isLegalPerson && !isOnlyLetters(formData.firstName)) {
    errors.firstName = 'Solo se permiten letras';
  }

  if (!isLegalPerson && !formData.lastName?.trim()) {
    errors.lastName = 'El apellido es obligatorio';
  } else if (!isLegalPerson && formData.lastName.trim().length < 2) {
    errors.lastName = 'Debe tener al menos 2 caracteres';
  } else if (!isLegalPerson && !isOnlyLetters(formData.lastName)) {
    errors.lastName = 'Solo se permiten letras';
  }

  if (!formData.address?.trim()) {
    errors.address = 'La dirección es obligatoria';
  } else if (formData.address.trim().length < 5) {
    errors.address = 'Debe tener al menos 5 caracteres';
  } else if (formData.address.trim().length > 120) {
    errors.address = 'La dirección no puede superar 120 caracteres';
  }

  if (!formData.phone?.trim()) {
    errors.phone = 'El teléfono es obligatorio';
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'El teléfono debe contener entre 7 y 10 dígitos numéricos.';
  }

  const emailError = getEmailValidationError(formData.email);
  if (emailError) {
    errors.email = emailError;
  }

  if (formData.contactName && formData.contactName.trim().length < 3) {
    errors.contactName = 'Debe tener mínimo 3 caracteres';
  }

  if (formData.contactPhone && !isValidPhone(formData.contactPhone)) {
    errors.contactPhone = 'El teléfono debe contener entre 7 y 10 dígitos numéricos.';
  }

  if (formData.clientCredit?.trim() && !/^\d+([.,]\d{0,2})?$/.test(formData.clientCredit)) {
    errors.clientCredit = 'Ingrese un valor positivo con máximo 2 decimales';
  }

  if (formData.saldoFavor?.trim() && !/^\d+([.,]\d{0,2})?$/.test(formData.saldoFavor)) {
    errors.saldoFavor = 'Ingrese un valor positivo con máximo 2 decimales';
  }

  if (!formData.clientType?.trim()) {
    errors.clientType = 'Seleccione el tipo de cliente';
  }

  if (!formData.rut?.trim()) {
    errors.rut = 'Indique si tiene RUT';
  }

  if (formData.rut === 'si') {
    if (!formData.ciuCode?.trim()) {
      errors.ciuCode = 'El código CIU es obligatorio cuando tiene RUT';
    } else if (!/^\d{4}$/.test(formData.ciuCode.trim())) {
      errors.ciuCode = 'El código CIU debe tener exactamente 4 números';
    }
  }

  return errors;
};
