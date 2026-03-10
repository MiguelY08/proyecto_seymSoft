// Provider Helper Functions

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{7,10}$/;
  return phoneRegex.test(phone);
};

// Validate numbers only (allow hyphen for NIT)
export const isOnlyNumbers = (value) => {
  const numbersRegex = /^[0-9-]+$/;
  return numbersRegex.test(value);
};

// Validate letters and spaces only
export const isOnlyLetters = (value) => {
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return lettersRegex.test(value);
};

// Get provider status badge class
export const getStatusBadgeClass = (isActive) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

// Get provider status text
export const getStatusText = (isActive) => {
  return isActive ? 'Activo' : 'Inactivo';
};

// Format person type
export const formatPersonType = (tipoPersona) => {
  if (tipoPersona === 'natural') return 'Natural';
  if (tipoPersona === 'juridica') return 'Jurídica';
  return 'N/A';
};

// Format client type
export const formatClientType = (tipoCliente) => {
  if (tipoCliente === 'mayorista') return 'Mayorista';
  if (tipoCliente === 'minorista') return 'Minorista';
  return 'N/A';
};

// Format RUT
export const formatRut = (rut) => {
  if (rut === 'si') return 'Sí';
  if (rut === 'no') return 'No';
  return 'N/A';
};

// Format categories (string to array)
export const formatCategories = (categories) => {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;
  return categories.split(', ').filter(cat => cat.trim() !== '');
};

// Format categories for display
export const formatCategoriesDisplay = (categories) => {
  if (!categories) return 'N/A';
  if (Array.isArray(categories)) return categories.join(', ');
  return categories;
};

// Filter providers by search term
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

// Paginate data
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

// Validate provider form
export const validateProviderForm = (formData) => {
  const errors = {};

  if (!formData.tipoPersona?.trim()) {
    errors.tipoPersona = 'Seleccione el tipo de persona';
  }

  if (!formData.tipo?.trim()) {
    errors.tipo = 'Seleccione el tipo de documento';
  }

  if (!formData.numero?.trim()) {
    errors.numero = 'El número es obligatorio';
  } else if (!isOnlyNumbers(formData.numero)) {
    errors.numero = 'Solo se permiten números y guiones';
  } else if (formData.numero.length < 6) {
    errors.numero = 'Debe tener al menos 6 caracteres';
  }

  if (!formData.nombres?.trim()) {
    errors.nombres = 'El nombre es obligatorio';
  } else if (formData.nombres.trim().length < 2) {
    errors.nombres = 'Debe tener al menos 2 caracteres';
  } else if (!isOnlyLetters(formData.nombres)) {
    errors.nombres = 'Solo se permiten letras';
  }

  if (!formData.apellidos?.trim()) {
    errors.apellidos = 'El apellido es obligatorio';
  } else if (formData.apellidos.trim().length < 2) {
    errors.apellidos = 'Debe tener al menos 2 caracteres';
  } else if (!isOnlyLetters(formData.apellidos)) {
    errors.apellidos = 'Solo se permiten letras';
  }

  if (!formData.telefono?.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!isValidPhone(formData.telefono)) {
    errors.telefono = 'Debe tener entre 7 y 10 dígitos';
  }

  if (!formData.correo?.trim()) {
    errors.correo = 'El correo es obligatorio';
  } else if (!isValidEmail(formData.correo)) {
    errors.correo = 'Formato de correo inválido';
  }

  if (formData.numeroContacto?.trim() && !isValidPhone(formData.numeroContacto)) {
    errors.numeroContacto = 'Debe tener entre 7 y 10 dígitos';
  }

  if (!formData.direccion?.trim()) {
    errors.direccion = 'La dirección es obligatoria';
  } else if (formData.direccion.trim().length < 5) {
    errors.direccion = 'Debe tener al menos 5 caracteres';
  }

  if (!formData.tipoCliente?.trim()) {
    errors.tipoCliente = 'Seleccione el tipo de cliente';
  }

  if (!formData.categorias || formData.categorias.length === 0) {
    errors.categorias = 'Seleccione al menos una categoría';
  }

  if (!formData.rut?.trim()) {
    errors.rut = 'Indique si tiene RUT';
  }

  if (formData.nombreContacto?.trim() && formData.nombreContacto.trim().length < 2) {
    errors.nombreContacto = 'Debe tener al menos 2 caracteres';
  } else if (formData.nombreContacto?.trim() && !isOnlyLetters(formData.nombreContacto)) {
    errors.nombreContacto = 'Solo se permiten letras';
  }

  return errors;
};