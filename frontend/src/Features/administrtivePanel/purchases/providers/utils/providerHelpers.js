/**
 * Archivo: providerHelpers.js
 *
 * Conjunto de funciones auxiliares utilizadas por el módulo de proveedores.
 * Estas utilidades se encargan de formatear datos, validar entradas,
 * filtrar y paginar resultados, así como proporcionar textos y clases de
 * estilo basadas en el estado de un proveedor.
 *
 * Responsabilidades principales:
 * - Formateo de números de teléfono, tipos y categorías
 * - Validación de campos de formulario relacionados con proveedores
 * - Filtrado y paginación de listas de proveedores
 * - Proveer helpers de estado (activo/inactivo)
 */

// Provider Helper Functions

// Helper para convertir a string de forma segura
const toStr = (value) => (value !== undefined && value !== null) ? String(value).trim() : '';
const EMAIL_MAX_LENGTH = 100;
const ADDRESS_MAX_LENGTH = 120;
const CIU_CODE_LENGTH = 4;
const PROVIDER_NAME_MAX_LENGTH = 100;

// Formatea un número de teléfono a formato legible
export const formatPhoneNumber = (phone) => {
  if (!phone && phone !== 0) return 'N/A';
  const phoneStr = String(phone);
  const cleaned = phoneStr.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
  }
  return phoneStr;
};

// Valida que el correo tenga formato correcto
export const getEmailValidationError = (email) => {
  const value = String(email || '');
  const trimmed = value.trim();

  if (!trimmed) return 'El correo es obligatorio';
  if (trimmed.length > EMAIL_MAX_LENGTH) return `El correo no puede superar ${EMAIL_MAX_LENGTH} caracteres`;
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

// Verifica que el teléfono tenga entre 7 y 10 dígitos numéricos
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{7,10}$/;
  return phoneRegex.test(phone);
};

// Comprueba que una cadena contenga solo números (y guiones opcionales)
export const isOnlyNumbers = (value) => {
  const numbersRegex = /^[0-9-]+$/;
  return numbersRegex.test(value);
};

// Verifica que una cadena tenga únicamente letras y espacios
export const isOnlyLetters = (value) => {
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return lettersRegex.test(value);
};

// Devuelve la clase CSS para el badge de estado según activo/inactivo
export const getStatusBadgeClass = (isActive) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

// Retorna el texto 'Activo' o 'Inactivo' según el booleano
export const getStatusText = (isActive) => {
  return isActive ? 'Activo' : 'Inactivo';
};

// Convierte el valor de tipoPersona en texto legible
export const formatPersonType = (tipoPersona) => {
  if (tipoPersona === 'natural') return 'Natural';
  if (tipoPersona === 'juridica') return 'Jurídica';
  return 'N/A';
};

// Formatea la indicación de RUT a 'Sí' o 'No'
export const formatRut = (rut) => {
  if (rut === 'si') return 'Sí';
  if (rut === 'no') return 'No';
  return 'N/A';
};

// Convierte la lista de categorías a un array limpio
export const formatCategories = (categories) => {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;
  return categories.split(', ').filter(cat => cat.trim() !== '');
};

// Prepara las categorías para mostrar en la interfaz (string)
export const formatCategoriesDisplay = (categories) => {
  if (!categories) return 'N/A';
  if (Array.isArray(categories)) return categories.join(', ');
  return categories;
};

// Filtra la lista de proveedores según un término de búsqueda
export const filterProviders = (providers, searchTerm) => {
  if (!searchTerm) return providers;
  
  const term = searchTerm.toLowerCase();
  return providers.filter(provider => 
    provider.nombre?.toLowerCase().includes(term) ||
    provider.numero?.toLowerCase().includes(term) ||
    provider.tipo?.toLowerCase().includes(term) ||
    provider.pContacto?.toLowerCase().includes(term) ||
    provider.nuContacto?.toLowerCase().includes(term) ||
    provider.categorias?.toLowerCase().includes(term) ||
    (provider.activo ? 'activo' : 'inactivo').includes(term)
  );
};

// Devuelve un subconjunto de datos paginados
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

// Valida los campos del formulario de proveedor y devuelve errores
export const validateProviderForm = (formData) => {
  const errors = {};
  const isLegalPerson = formData.tipoPersona === 'juridica';

  // Validaciones básicas
  if (!formData.tipoPersona?.trim()) {
    errors.tipoPersona = 'Seleccione el tipo de persona';
  }

  if (!formData.tipo?.trim()) {
    errors.tipo = 'Seleccione el tipo de documento';
  } else if (formData.tipoPersona === 'juridica' && formData.tipo !== 'NIT') {
    errors.tipo = 'Una persona jurídica debe usar NIT';
  } else if (formData.tipoPersona === 'natural' && formData.tipo === 'NIT') {
    errors.tipo = 'Una persona natural no puede usar NIT';
  }

  if (!formData.numero?.trim()) {
    errors.numero = 'El número es obligatorio';
  } else if (!isOnlyNumbers(formData.numero)) {
    errors.numero = 'Solo se permiten números y guiones';
  } else if (formData.numero.length < 6) {
    errors.numero = 'Debe tener al menos 6 caracteres';
  } else if (formData.numero.length > 20) {
    errors.numero = 'No puede superar 20 caracteres';
  }

  if (!formData.nombres?.trim()) {
    errors.nombres = 'El nombre es obligatorio';
  } else if (formData.nombres.trim().length < 2) {
    errors.nombres = 'Debe tener al menos 2 caracteres';
  } else if (formData.nombres.trim().length > PROVIDER_NAME_MAX_LENGTH) {
    errors.nombres = `No puede superar ${PROVIDER_NAME_MAX_LENGTH} caracteres`;
  } else if (!isLegalPerson && !isOnlyLetters(formData.nombres)) {
    errors.nombres = 'Solo se permiten letras';
  }

  if (!isLegalPerson && !formData.apellidos?.trim()) {
    errors.apellidos = 'El apellido es obligatorio';
  } else if (!isLegalPerson && formData.apellidos.trim().length < 2) {
    errors.apellidos = 'Debe tener al menos 2 caracteres';
  } else if (!isLegalPerson && formData.apellidos.trim().length > PROVIDER_NAME_MAX_LENGTH) {
    errors.apellidos = `No puede superar ${PROVIDER_NAME_MAX_LENGTH} caracteres`;
  } else if (!isLegalPerson && !isOnlyLetters(formData.apellidos)) {
    errors.apellidos = 'Solo se permiten letras';
  }

  // Convertir teléfono a string antes de validar
  const telefonoStr = toStr(formData.telefono);
  if (!telefonoStr) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!isValidPhone(telefonoStr)) {
    errors.telefono = 'Debe tener entre 7 y 10 dígitos';
  }

  const emailError = getEmailValidationError(formData.correo);
  if (emailError) {
    errors.correo = emailError;
  }

  // Convertir número de contacto a string antes de validar
  const numeroContactoStr = toStr(formData.numeroContacto);
  if (numeroContactoStr && !isValidPhone(numeroContactoStr)) {
    errors.numeroContacto = 'Debe tener entre 7 y 10 dígitos';
  }

  if (!formData.direccion?.trim()) {
    errors.direccion = 'La dirección es obligatoria';
  } else if (formData.direccion.trim().length < 5) {
    errors.direccion = 'Debe tener al menos 5 caracteres';
  } else if (formData.direccion.trim().length > ADDRESS_MAX_LENGTH) {
    errors.direccion = `La direccion no puede superar ${ADDRESS_MAX_LENGTH} caracteres`;
  }

  // Convertir plazoDevoluciones a string antes de validar
  const plazoDevolucionesStr = toStr(formData.plazoDevoluciones);
  if (plazoDevolucionesStr && !isOnlyNumbers(plazoDevolucionesStr)) {
    errors.plazoDevoluciones = 'Solo números permitidos';
  } else if (plazoDevolucionesStr && Number(plazoDevolucionesStr) <= 0) {
    errors.plazoDevoluciones = 'El plazo debe ser mayor a 0 días';
  } else if (plazoDevolucionesStr && Number(plazoDevolucionesStr) > 3650) {
    errors.plazoDevoluciones = 'El plazo no puede superar 3650 días';
  }

  //  VALIDACIÓN CORREGIDA: Usar categoryIds en lugar de categorias
  if (!formData.categoryIds || formData.categoryIds.length === 0) {
    errors.categoryIds = 'Seleccione al menos una categoría';
  }

  if (!formData.rut?.trim()) {
    errors.rut = 'Indique si tiene RUT';
  }

  if (formData.rut === 'si') {
    if (!formData.codigoCIU?.trim()) {
      errors.codigoCIU = 'El código CIU es obligatorio cuando tiene RUT';
    } else if (!new RegExp(`^\\d{${CIU_CODE_LENGTH}}$`).test(formData.codigoCIU.trim())) {
      errors.codigoCIU = `El codigo CIU debe tener exactamente ${CIU_CODE_LENGTH} numeros`;
    }
  }

  if (formData.nombreContacto?.trim() && formData.nombreContacto.trim().length < 2) {
    errors.nombreContacto = 'Debe tener al menos 2 caracteres';
  } else if (formData.nombreContacto?.trim() && !isOnlyLetters(formData.nombreContacto)) {
    errors.nombreContacto = 'Solo se permiten letras';
  }

  return errors;
};
